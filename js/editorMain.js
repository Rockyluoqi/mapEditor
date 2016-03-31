/**
 * Created by Luoqi on 3/14/2016.
 * function List
 * 1.zoom in and zoom out
 * 2.drag the map using mouse
 * 3.touchable
 */
;(function (window) {
    //selectors
    var $modalIndicator = $(".modal-indicator");
    var $subMenuItem = $(".sub-menu").find(".menu-item");
    var $fileInput = $("#fileInput");
    var $container = $(".container");
    var $content = $("#content");
    var $toolsFirst = $("#toolsFirst");
    var $canvasWrapper = $(".canvas-wrapper");
    var $shapeFirst = $("#shapesFirst");
    var $pen = $("#pen");
    var $positionsFirst = $("#positionsFirst");
    var $tempCanvas = $("#tempCanvas");
    var $pointItem = $("#pointItem");

    //flags and some
    var imgObjArr = [];
    var startDraw = true;
    var eraserTag = false;
    var imgScale = 1;
    var widthScale = 1;
    var heightScale = 1;
    var mouseX, mouseY;
    var dragging = true;
    var barWidth = 76;
    var curScrollX = 0;
    var curScrollY = 0;
    var pointing = false;
    var locationPattern;
    var drawing_location_point = false;

    var startPointColor = "#00FF7F";
    var locationPointColor = "#FFA500";
    var selectedColor = "#00CED1"; //mouse down color
    var selectingColor = "#FFFFFF"; //mouse hover color

    //use for limited length straight line
    var sin,cos,a, b,c;
    var orientationLength = 40;
    /**
     * 0-straight line
     * 1-rectangle
     * 2-polygon
     *
     */
    var shapePattern;

    //undo and redo
    var history = new Array();
    var cStep = -1;

    var bg_image = new Image();
    var curWidth, curHeight, tempWidth, tempHeight;

    /**
     * source
     * @type {string}
     */
    bg_image.src = localStorage["bgUrl"];
    //bg_image.src = 'js/map.jpg';

    $container.css({width:bg_image.width,height:bg_image.height});
    $content.css({width:bg_image.width,height:bg_image.height});

    //canvas part
    var canvas = document.getElementById("canvas");
    //var netherCanvas = document.getElementById("netherCanvas"); //底层Canvas
    var tempCanvas = document.getElementById("tempCanvas");
    var context = null;
    var context2 = null;
    var context3 = null;
    //netherCanvas.setAttribute('zIndex',"-1");

    setDefaultSize(bg_image);

    var position = {x: tempWidth / 2, y: tempHeight / 2};
    var mouse = {x: 0, y: 0, down: false};
    document.body.classList.add('pointer');


    /**
     * 拿到滚动条的距离就可以实时更新画线的坐标，就可以做到在大屏上进行绘制了，方法很简洁，大屏问题完美解决
     * get scroll distance to update the line(rectangle pot etc.) data, then you can draw line a very large image
     * a little bit stuck...
     * @type {number}
     */
    var topScrollDistance = 0;
    var leftScrollDistance = 0;
    $(window).scroll(function(){
        topScrollDistance = window.pageYOffset;
        leftScrollDistance = window.pageXOffset;
    });

    if (canvas.getContext) {
        context = canvas.getContext("2d");
        context2 = netherCanvas.getContext("2d");
        context3 = tempCanvas.getContext("2d");

        console.log(bg_image.width+" "+bg_image.height);

        /**
         * resize
         */
        //resizeImage();
        setCanvasSize(curHeight, curWidth);

        /**
         *local testing
         */
        bg_image.onload = function () {
            context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height);
        }

        canvas.addEventListener("mousedown", mousedown, false);
        canvas.addEventListener("mousemove", mousemove, false);
        canvas.addEventListener("mouseup", mouseup, false);

        ////监听可视窗口尺寸
        //    window.onresize = function (event) {
        //        console.log(window.innerWidth+" "+window.innerHeight)
        //        canvas.width = window.innerWidth;
        //        canvas.height = window.innerHeight;
        //    };

        function distance(pt, pt2) {
            var xs = 0;
            var ys = 0;
            xs = pt2.x - pt.x;
            ys = pt2.y - pt.y;
            xs = xs * xs;
            ys = ys * ys;
            return Math.sqrt(xs + ys);
        }

        // 可能不需要 scroll 的偏移，元素的位置区别！！！
        var $colorItem = $(".modal-indicator.colors");
        var $chosenSvg = $(".sizes").find("svg").get(0);              // 选中的画笔
        var chosenWidth = 0;                                          // 选中的画笔大小                                          // 选中的画笔大小
        var $offset = $(canvas).offset();                             // canvas 偏移值
        var docScrollLeft = document.documentElement.scrollLeft;
        var docScrollTop = document.documentElement.scrollTop;
        var moveLeft = docScrollLeft - $offset.left;                  // 最终偏移x
        var moveTop = docScrollTop - $offset.top;                     // 最终偏移y
        var thisgl = context.globalCompositeOperation;

        var offsetX = $offset.left;
        var offsetY = $offset.top;
        var startX;
        var startY;

        function drawFreeLine() {
            if (mouse.down) {
                var d = distance(position, mouse);
                if (d >= 1) {
                    context.beginPath();
                    context.lineCap = "round";
                    if (eraserTag === true) {
                        //实现擦除效果，
                        context.globalCompositeOperation = "destination-out";
                        context.strokeStyle = "rgba(0,0,0,1.0)";
                    }
                    context.lineWidth = chosenWidth;
                    context.moveTo(leftScrollDistance + position.x + moveLeft, topScrollDistance + position.y + moveTop);
                    context.lineTo(leftScrollDistance + mouse.x + moveLeft, topScrollDistance + mouse.y + moveTop);
                    context.stroke();
                    context.closePath();
                    position.x = mouse.x;
                    position.y = mouse.y;
                }
            }
        }

        /**
         * The solution is use for reference from markE(http://stackoverflow.com/users/411591/marke)
         *   You can use a second temporary canvas to let the user drag-draw your line.

         An outline of how to do it:

         Create a second temporary offscreen canvas which is exactly the same size as the onscreen canvas.

         -On mousedown:
         Move the temp canvas exactly on top of the regular canvas
         Save the starting drag XY
         Set a flag indicating that dragging has started

         -On mousemove:
         clear the temp canvas
         on temp canvas: draw a line from the starting drag XY to the current mouse XY

         -On mouseup or mouseout:
         dragging is over so clear the dragging flag
         move the temp canvas offscreen
         on main canvas: draw a line from the starting dragXY to the ending mouse XY
         *
         */
        $tempCanvas.css({left: -(window.innerWidth), top: 0});

        var lines = [];
        var rectangles = [];
        var polygons = [];
        var circles = [];
        var startPoints = [];
        var locationPoints = [];
        var obstacles = {
            lines:lines,
            rectangles:rectangles,
            polygons:polygons,
            circles:circles
        }
        var movePoints = {
            startPoints : startPoints,
            locationPoints : locationPoints
        }

        /**
         *
         * @param toX
         * @param toY
         * @param contextT
         * @param index  如果是1则是真是画线，是0则是虚拟画线，不存储数据，下面的用法相同
         */
        function drawStraightLine(toX, toY, contextT,index) {

            if(index === 1) {
                var startPot = {"x": 0, "y": 0};
                var endPot = {"x": 0, "y": 0};
                var line = {
                    "start": startPot,
                    "end": endPot
                };

                startPot.x = startX;
                startPot.y = startY;
                endPot.x = toX;
                endPot.y = toY;

                line.start = startPot;
                line.end = endPot;
                lines.push(line);
            }

            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.moveTo(startX, startY);
            contextT.lineTo(toX, toY);
            contextT.stroke();
        }

        /*if (!context.setLineDash) {
            context.setLineDash = function () {}
        }*/

        function drawDashedLine(toX, toY, contextT,index) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.moveTo(startX, startY);
            contextT.lineTo(toX, toY);
            contextT.stroke();
        }

        function setDashedLine(index) {
            var array;
            if(index === 1) {
                array = [8];
                context.setLineDash(array);
                context3.setLineDash(array);
            } else {
                array = [0];
                context.setLineDash(array);
                context3.setLineDash(array);
            }
        }
        

        function drawLinkedLine(toX, toY, contextT) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.moveTo(startX, startY);
            contextT.lineTo(toX, toY);
            contextT.stroke();
        }

        function drawRectangle(toX, toY, contextT,index) {

            if(index === 1) {
                var startPot = {"x": 0, "y": 0};
                var endPot = {"x": 0, "y": 0};
                var rectangle = {
                    "start": startPot,
                    "end": endPot
                };

                startPot.x = startX;
                startPot.y = startY;
                endPot.x = toX;
                endPot.y = toY;

                rectangle.start = startPot;
                rectangle.end = endPot;
                rectangles.push(rectangle);
            }

            //draw
            contextT.beginPath();
            context.lineCap = "round";
            contextT.strokeStyle = $colorItem.css("background-color");
            //is fill color rect
            //contextT.fillRect(startX,startY,toX-startX,toY-startY);
            contextT.strokeRect(startX, startY, toX - startX, toY - startY);
        }

        //点对象包括了坐标和范围，这是用来自动汇合所用
        var point = {
            x: 0,
            y: 0,
            scope: 1,
            closed2: false
        };

        /**
         * If clicks are less than 4, you can't draw polygon
         */
        var num_of_click = 0;
        //var points = [];
        var needFirstPoint = true;

        var polygon = [];

        function drawNextLine(toX, toY, contextT) {
            var pot = {"x": 0, "y": 0};
            pot.x = startX;
            pot.y = startY;
            polygon.push(pot);

            //console.log("Start point: "+point.x +" "+point.y);
            //console.log(needFirstPoint);
            if (needFirstPoint) {
                contextT.beginPath();
                contextT.strokeStyle = $colorItem.css("background-color");
                contextT.moveTo(startX, startY);
                contextT.lineTo(toX, toY);
                contextT.stroke();
                point.x = startX;
                point.y = startY;
                needFirstPoint = false;
            } else {
                contextT.lineTo(toX, toY);
                if (point.closed2 === true) {
                    //console.log("point ready to close");
                    contextT.closePath();
                    contextT.stroke();
                    needFirstPoint = true;

                    //delete the last pot, because it's redundant...oPs
                    polygon.pop();
                    //new array to store polygon each pot value
                    var temppolygon = new Array();
                    for(var i = 0;i < polygon.length; i++) {
                        temppolygon.push(polygon[i]);
                    }

                    //clear polygon
                    polygon.splice(0,polygon.length);

                    polygons.push(temppolygon);

                    /**
                     * Test
                     * console.log("polygons :"+polygons.length);

                       for(var i = 0;i<polygons.length;i++) {
                            var poly = polygons[i];
                            for (var j = 0; j < poly.length; j++) {
                                console.log(poly[j].x + " " + poly[j].y);
                                //console.log(polygon[i].x + " " + polygon[i].end.y);
                            }
                        }
                     */
                }
                contextT.stroke();
            }
        }

        var brokenFirstFlag = true;
        function drawBrokenLine(toX, toY, contextT) {
            if (brokenFirstFlag) {
                contextT.beginPath();
                contextT.strokeStyle = $colorItem.css("background-color");
                contextT.moveTo(startX, startY);
                contextT.lineTo(toX, toY);
                contextT.stroke();
                brokenFirstFlag = false;
            } else {
                contextT.lineTo(toX, toY);
                contextT.stroke();
            }
        }

        /**
         * Let's have a fun with circle.
         */
        var r;
        function drawCircle(radius,contextT,index) {
            if(index === 1) {
                var circle = {
                    "center": {
                        "x": 0,
                        "y": 0
                    },
                    "radius": 0
                }
                circle.radius = radius;
                circle.center.x = startX;
                circle.center.y = startY;

                circles.push(circle);
            }
            contextT.beginPath();
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.arc(startX,startY,radius,0,2*Math.PI);
            contextT.stroke();
        }

        /**
         *  A circle represent an abstract point
         */
        function CirclePoint(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.isSelected = false;
            this.clickTimes = 0;
            //this.selecting = false;
        }

        //store movePoints
        var movePointsArray = [];

        var previousSelectedCircle;

        /**
         *
         * @param radius
         * @param contextT
         * @param color
         * @param index
         * @param i avoid click same point and add to Array many times
         */
        function drawLocationPoint(radius,contextT,color,index) {
            contextT.beginPath();
            contextT.strokeStyle = "#000000";
            contextT.lineWidth = 1.5;
            contextT.arc(startX,startY,radius,0,2*Math.PI);
            contextT.fillStyle = color;
            contextT.fill();
            contextT.stroke();
            if(index === 1) {
                var circle = new CirclePoint(startX, startY, radius);
                movePointsArray.push(circle);
            }
        }

        function deleteLocationPoint() {

        }

        document.getElementById('deleteButton').addEventListener('click',deleteLocationPoint);

        /**
         * draw arrows which have directional information
         * @param toX finish X
         * @param toY finish Y
         * @param contextT which context you will draw
         * @param color point color, orange:locationPoint green:startPoint
         * @param index 0:drawing on the context2 don't save
         *              1:drawing on the context, save it
         * @param pointPattern 0 startPoint and 1 locationPoint
         */
        var headlen = 15;// length of head in pixels
        var angle;
        function drawLocationLine(toX,toY,contextT,color,index,pointPattern) {
            //use for arrow creation
            angle = Math.atan2(toY-startY,toX-startX);

            //startPoint
            if(index === 1 && pointPattern === 0) {
                var startPoint = {
                    pot:{x:0,y:0},
                    direction:0 //PI/2 = 90 degree anticlockwise
                }

                startPoint.pot.x = startX;
                startPoint.pot.y = startY;
                startPoint.angle = -(angle/Math.PI * 180);
                startPoints.push(startPoint);
            }
            //locationPoint
            if(index === 1 && pointPattern === 1) {
                var locationPoint = {
                    pot:{x:0,y:0},
                    direction:0 //PI/2 = 90 degree anticlockwise
                }

                locationPoint.pot.x = startX;
                locationPoint.pot.y = startY;
                locationPoint.angle = -(angle/Math.PI * 180);
                locationPoints.push(locationPoint);
            }

            contextT.beginPath();
            contextT.lineCap = "round";
            contextT.lineWidth = 2;
            contextT.strokeStyle = color;


            //vertical distance
            a = toY - startY;
            //horizontal distance
            b = toX - startX;

            //triangle
            c = a*a + b*b;
            c = Math.sqrt(c);
            sin = a/c;
            cos = b/c;

            //new distance using orientationLength as a base
            a = orientationLength * sin;
            b = orientationLength * cos;

            //new destination
            toX = startX + b;
            toY = startY + a;

            contextT.moveTo(startX, startY);
            contextT.lineTo(toX, toY);
            //right arrow
            contextT.lineTo(toX-headlen*Math.cos(angle-Math.PI/6),toY-headlen*Math.sin(angle-Math.PI/6));
            contextT.lineTo(toX, toY);
            //left arrow
            contextT.lineTo(toX-headlen*Math.cos(angle+Math.PI/6),toY-headlen*Math.sin(angle+Math.PI/6));
            contextT.stroke();
        }

        /**
         * It's OK, parse obj to json
         */
        var mapJson;
        var map = {
            name : "",
            description : "",
            ID : "",
            createDate : "",
            obstacles:obstacles,
            movePoints: movePoints
        }

        function transToJson() {
            obstacles.lines = lines;
            obstacles.rectangles = rectangles;
            obstacles.polygons = polygons;
            obstacles.circles = circles;
            movePoints.startPoints = startPoints;
            movePoints.locationPoints = locationPoints;

            mapJson = JSON.stringify(map);

            console.log(obstaclesJson);
        }

        /**
         * I know the code in if statement is redundant.What my think is reduce coupling.Is it better? Sense of trap.
         * OK...I will optimize it later.
         */
        var backBtnHtml = $(".zoomInAndOut").html();

        function mousedown(event) {
            mouse.down = true;
            if(dragging === true) {
                $canvasWrapper.css({cursor:"url('asset/cursor/dragHand.cur'),crosshair"});
                position.x = (event.clientX - barWidth);
                position.y = event.clientY;
                //console.log("start position: " +position.x+"  "+ position.y);
                //locate at the last time drag
                window.scrollTo(curScrollX,curScrollY);
            }
            /**
             * mouse down the point color change to blue
             */
            if(pointing === true) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                /**
                 * loop to sign the selected button and change color
                 */
                if(locationPattern === 0) {
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius) {
                            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
                            previousSelectedCircle = circle; //save the circle selected
                            circle.isSelected = true;
                            circle.clickTimes += 1;
                            //console.log("select OK");
                            startX = circle.x;
                            startY = circle.y;
                            if (circle.clickTimes < 1) {
                                drawLocationPoint(circle.radius, context, selectedColor, 1);
                            }
                            drawLocationPoint(circle.radius, context, selectedColor, 0);
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");
                            break;
                        }
                        else {
                            circle.isSelected = false;
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        if(!circle.isSelected) {
                            startX = circle.x;
                            startY = circle.y;
                            drawLocationPoint(circle.radius,context,startPointColor,0);
                        }
                        console.log("circle"+i+" "+circle.isSelected);
                    }
                }
                if(locationPattern === 1) {
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius) {
                            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
                            previousSelectedCircle = circle; //save the circle selected
                            circle.isSelected = true;
                            circle.clickTimes += 1;
                            //console.log("select OK");
                            startX = circle.x;
                            startY = circle.y;
                            if (circle.clickTimes < 1) {
                                drawLocationPoint(circle.radius, context, selectedColor, 1);
                            }
                            drawLocationPoint(circle.radius, context, selectedColor, 0);
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");
                            break;
                        }
                        else {
                            circle.isSelected = false;
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        if(!circle.isSelected) {
                            startX = circle.x;
                            startY = circle.y;
                            drawLocationPoint(circle.radius,context,locationPointColor,0);
                        }
                        console.log("circle"+i+" "+circle.isSelected);
                    }
                }
            }
            if(drawing_location_point === true) {
                if(locationPattern === 0) {
                    console.log("start point");
                    event.preventDefault();
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    chosenWidth = $chosenSvg.getBoundingClientRect().width;
                    context3.lineWidth = chosenWidth;
                    context.lineWidth = chosenWidth;
                    startX = mouseX;
                    startY = mouseY;
                    drawLocationPoint(10,context,startPointColor,1);
                    $tempCanvas.css({left: 0, top: 0});
                }
                if(locationPattern === 1) {
                    event.preventDefault();
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    chosenWidth = $chosenSvg.getBoundingClientRect().width;
                    context3.lineWidth = chosenWidth;
                    context.lineWidth = chosenWidth;
                    startX = mouseX;
                    startY = mouseY;
                    drawLocationPoint(10,context,locationPointColor,1);
                    $tempCanvas.css({left: 0, top: 0});
                }
            }
            if (shapePattern === 0) {
                position.x = event.clientX;
                position.y = event.clientY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context.beginPath();
                context.fillStyle = $colorItem.css("background-color"); //合并
                context.arc(position.x + moveLeft, position.y + moveTop, chosenWidth / 2, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
            }
            if (shapePattern === 1) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                //update to tempCanvas at the same time, the function is OK
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                //context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                //move temp canvas over main canvas
                $tempCanvas.css({left: 0, top: 0});
            }
            if (shapePattern === 2) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                //context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $tempCanvas.css({left: 0, top: 0});
            }

            if (shapePattern === 3) {

                /**
                 * 算法思考：Alg thinking
                 * 1、如何让多变形自动闭合，是在让最后一条线碰到初始点一定范围时直接连接闭合
                 * 2、闭合后让draw停止
                 * 3.21 20:18 solved
                 * 解决思路就是判断当前鼠标坐标在初始点坐标附近时设置为可以闭合，再次点击将会闭合
                 * 判断距离以及needFirst的控制完成了最后的工作
                 * Start pot and end pot is joined.Just judge the distance closing to start pot then click you can make the
                 * start and end closed.Then you can draw a new polygon.
                 * Something better will be done later.
                 * Thinking...
                 */
            }
            if (shapePattern === 4) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                //context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $tempCanvas.css({left: 0, top: 0});
            }
            if(shapePattern === 5) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                point.x = startX;
                point.y = startY;
                //context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $tempCanvas.css({left: 0, top: 0});
            }
            if (shapePattern === 6) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                //update to tempCanvas at the same time, the function is OK
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                //context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                //move temp canvas over main canvas
                $tempCanvas.css({left: 0, top: 0});
            }
        }

        function mousemove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            if(dragging === true) {
                var distanceX,distanceY;
                event.preventDefault();
                if(!mouse.down) return;
                mouseX  = (event.clientX - barWidth);
                mouseY  = event.clientY;
                distanceX = mouseX - position.x;
                distanceY = mouseY - position.y;
                //console.log(distanceX+" "+distanceY);
                /**
                 * this line if for drag as the natural hand drag, aha...
                 */
                window.scrollTo(curScrollX - distanceX, curScrollY - distanceY);
            }

            /**
             * If you move the cursor hovering on the point, the point will change color.
             */
            if(pointing === true) {
                if(locationPattern === 0) {
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius && !circle.isSelected) {
                            startX = circle.x;
                            startY = circle.y;
                            circle.selecting = true;
                            console.log("circle" + i);
                            drawLocationPoint(circle.radius, context, selectingColor, 0);
                            //return;
                        } else {
                            if (circle.selecting) {
                                drawLocationPoint(circle.radius, context, startPointColor, 0);
                                circle.selecting = false;
                            }
                        }
                    }
                }
                if(locationPattern === 1) {
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    for (var i = movePointsArray.length - 1; i >= 0; i--) {
                        var circle = movePointsArray[i];
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius && !circle.isSelected) {
                            startX = circle.x;
                            startY = circle.y;
                            circle.selecting = true;
                            console.log("circle" + i);
                            drawLocationPoint(circle.radius, context, selectingColor, 0);
                            //return;
                        } else {
                            if (circle.selecting) {
                                drawLocationPoint(circle.radius, context, locationPointColor, 0);
                                circle.selecting = false;
                            }
                        }
                    }
                }
            }

            if(drawing_location_point) {
                if(locationPattern === 0) {
                    event.preventDefault();
                    if (!mouse.down) {
                        return;
                    }
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    drawLocationLine(mouseX, mouseY, context3,startPointColor,0);
                }
                if(locationPattern === 1) {
                    event.preventDefault();
                    if (!mouse.down) {
                        return;
                    }
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    drawLocationLine(mouseX, mouseY, context3,locationPointColor,0);
                }
            }
            if (shapePattern === 0) {
                drawFreeLine();
            }
            if (shapePattern === 1) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawStraightLine(mouseX, mouseY, context3,0);
            }
            if (shapePattern === 2) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawRectangle(mouseX, mouseY, context3,0);
            }
            if (shapePattern === 3) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $tempCanvas.css({left: 0, top: 0});
                //console.log(mouseX + " "+ mouseY);
                if (!needFirstPoint) {
                    mouse.x = mouseX;
                    mouse.y = mouseY;
                    drawStraightLine(mouseX, mouseY, context3,0);
                }

                //console.log(num_of_click);s
                if (distance(point, mouse) < 15 && num_of_click > 2) {
                    //console.log("closed is true");
                    point.closed2 = true;
                } else {
                    point.closed2 = false;
                }
            }
            if (shapePattern === 4) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                //console.log(mouseX + " "+ mouseY);
                drawStraightLine(mouseX, mouseY, context3,0);
            }
            if(shapePattern === 5) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                mouse.x = mouseX;
                mouse.y = mouseY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                r = distance(point,mouse);
                drawCircle(r,context3,0);
            }
            if (shapePattern === 6) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawDashedLine(mouseX, mouseY, context3,0);
            }
        }

        function mouseup(event) {
            event.preventDefault();
            if (!mouse.down) {
                return;
            }
            if(dragging === true) {
                //update
                curScrollX = leftScrollDistance;
                curScrollY = topScrollDistance;
                $canvasWrapper.css({cursor:"url('asset/cursor/handCursor.cur'),crosshair"});
            }
            if(pointing === true) {

            }
            if(drawing_location_point) {
                if(locationPattern === 0) {
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    $tempCanvas.css({left: -window.innerWidth, top: 0});
                    drawLocationLine(mouseX, mouseY, context,startPointColor,1,0);
                }
                if(locationPattern === 1) {
                    mouseX = leftScrollDistance + event.clientX - offsetX;
                    mouseY = topScrollDistance + event.clientY - offsetY;
                    $tempCanvas.css({left: -window.innerWidth, top: 0});
                    drawLocationLine(mouseX, mouseY, context,locationPointColor,1,1);
                }
            }
            if (shapePattern === 1) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawStraightLine(mouseX, mouseY, context,1);
            }
            if (shapePattern === 2) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawRectangle(mouseX, mouseY, context,1);
            }
            if (shapePattern === 3) {
                //polygon = new Array();
                num_of_click += 1;
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                //set color draw on canvas
                context.strokeStyle = $colorItem.css("background-color");
                //update the end coords
                startX = mouseX;
                startY = mouseY;
                if (needFirstPoint) {
                    point.x = startX;
                    point.y = startY;
                }
                drawNextLine(mouseX, mouseY, context);
            }
            if (shapePattern === 4) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                //set color draw on canvas
                context.strokeStyle = $colorItem.css("background-color");
                //update the end coords
                drawBrokenLine(mouseX, mouseY, context);
                brokenFirstFlag = false;
            }
            if(shapePattern === 5) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                context.strokeStyle = $colorItem.css("background-color");
                drawCircle(r,context,1);
            }
            if (shapePattern === 6) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawDashedLine(mouseX, mouseY, context,1);
            }
            if(!dragging) {
                historyPush();
            }
            mouse.down = false;
        }
    }

    function setDefaultSize(img) {
        curHeight = img.height;
        curWidth = img.width;
        tempHeight = img.height;
        tempWidth = img.width;
    }

    function setCanvasSize(h, w) {
        canvas.width = w;
        canvas.height = h;
        netherCanvas.width = w;
        netherCanvas.height = h;
        tempCanvas.width = w;
        tempCanvas.height = h;
    }

    function setContextSize(h, w) {
        context.width = w;
        context.height = h;
        context2.width = w;
        context2.height = h;
        context3.width = w;
        context3.height = h;
    }

    /**
     * 解决地图太大太小的问题，也方便在小屏幕机器上进行的绘制，由于后面求坐标的精确需要不能够改变图片的比例
     * 方案：按照比例缩小图片
     */
    function resizeImage() {
        if (curHeight > window.innerHeight && curWidth < window.innerWidth) {
            imgScale = window.innerHeight / curHeight;
            tempHeight = window.innerHeight;
            tempWidth = curWidth * imgScale;
            bg_image.onload = function () {
                context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            }
        } else if (curHeight < window.innerHeight && curWidth > window.innerWidth) {
            imgScale = window.innerWidth / curWidth;
            tempWidth = curWidth;
            tempHeight = curHeight * imgScale;
            bg_image.onload = function () {
                context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            }
        } else if (curHeight > window.innerHeight && curWidth > window.innerWidth) {

            heightScale = curHeight / window.innerHeight;
            widthScale = curWidth / window.innerWidth;

            if (heightScale > widthScale) {
                imgScale = 1 / heightScale;
                tempWidth = curWidth * imgScale;
                tempHeight = window.innerHeight;
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
            }
            //    } else if (heightScale < widthScale) {
            //        imgScale = 1 / widthScale;
            //        tempWidth = window.innerWidth;
            //        tempHeight = curHeight * imgScale;
            //        bg_image.onload = function () {
            //            context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            //        }
            //    } else {
            //        imgScale = 1 / widthScale;
            //        tempWidth = curWidth * imgScale;
            //        tempHeight = curHeight * imgScale;
            //        bg_image.onload = function () {
            //            context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            //        }
            //    }
            //} else {
            //    heightScale = window.innerHeight / curHeight;
            //    widthScale = window.innerWidth / curWidth;
            //
            //    if (heightScale < widthScale) {
            //        tempHeight = window.innerHeight;
            //        tempWidth = curWidth * heightScale;
            //        bg_image.onload = function () {
            //            context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            //        }
            //    } else if (heightScale > widthScale) {
            //        tempWidth = window.innerWidth;
            //        tempHeight = curHeight * widthScale;
            //        bg_image.onload = function () {
            //            context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            //        }
        } else {
            bg_image.onload = function () {
                context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
            }
        }
    }

    //put current canvas to cache
    function historyPush() {
        cStep++;
        if (cStep < history.length) {
            history.length = cStep;
        }
        history.push($("#canvas").get(0).toDataURL());
    }

    function undo() {
        if (cStep >= 0) {
            clearCanvas();
            cStep--;
            var tempImage = new Image();
            tempImage.src = history[cStep];
            tempImage.onload = function () {
                context.drawImage(tempImage, 0, 0);
            };
        }
    }

    function redo() {
        if (cStep < history.length) {
            clearCanvas();
            ++cStep;
            var tempImage = new Image();
            tempImage.src = history[cStep];
            tempImage.onload = function () {
                context.drawImage(tempImage, 0, 0);
            };
        }
    }

    /**
     * merge many canvas to a image
     * loading...
     */
    function createNewImage() {
        historyPush();
        context.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height);


    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    function clearAndSave() {
        historyPush();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    /**
     * layer1 :including draw canvas
     * Layer2 :excluding draw canvas
     */
    document.getElementById('layer1').addEventListener('click',layer1Recover);
    document.getElementById('layer2').addEventListener('click',clearAndSave);

    var times = 0;
    function layer1Recover() {
        //times += 1;
        console.log(times);
        clearCanvas();
        var tempImage = new Image();
        var len = history.length;
        tempImage.src = history[len - 1];
        tempImage.onload = function () {
            context.drawImage(tempImage, 0, 0);
        }
    }

    fileInput.addEventListener('change', onFileInputChange, false);

    $modalIndicator.fastClick(function () {
        var that = $(this);
        that.toggleClass("menu-open");
        that.siblings(".menu-open").removeClass("menu-open");
    });

    function getImage(file, callback) {
        if (!window.FileReader) {
            alert('当前浏览器不支持 FileReader 对象，请升级到最新浏览器。');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (ev) {
            var img = new Image();
            img.onload = function () {
                if (typeof callback === 'function') callback.call(this, img);
            };

            img.src = ev.target.result;
            canvas.width = img.width;
            canvas.height = img.height;
        };
        reader.readAsDataURL(file);
    }

    //product new Image
    function createImgObj(file) {
        var obj = {};
        obj.image = null;
        obj.left = obj.top = obj.width = obj.height = 0;
        obj.data = null;
        obj.zIndex = 0;

        obj.drawFromFile = function (mouseX, mouseY, callback) {
            getImage(file, function (img) {
                var _left = mouseX - img.width / 2;
                var _top = mouseY - img.height / 2;

                obj.image = img;
                obj.left = _left;
                obj.top = _top;
                obj.width = img.width;
                obj.height = img.height;

                obj.updateData(_left, top);
                context.drawImage(img, _left, _top, obj.width, obj.height);
                obj.zIndex = imgObjArr.length;

                if (typeof callback === 'function')callback.call(obj, obj);

            });
        };

        obj.updateData = function () {
            this.data = context.getImageData(this.left, this.top, this.width + 2, this.height + 2);
        };

        obj.drawFromData = function (left, top) {
            if (!this.image) return;

            //?
            this.left = left || this.left;
            this.top = top || this.top;

            this.updateData();
            context.drawImage(this.image, this.left, this.top, this.width, this.height);
        };

        obj.move = function (left, top) {
            this.drawFromData(left, top);
            this.focus(false);
        };

        obj.focused = false;

        obj.focus = function (changeState) {
            var oL = this.left, oT = this.top, oR = this.left + this.width, oB = this.top + this.height;

            if (this.focused) return;

            if (changeState) this.focused = true;

            this.updateLineDatas();

            context.save();
            context.strokeStyle = 'rgb(0, 255, 0)';
            context.beginPath();
            context.moveTo(oL, 0);
            context.lineTo(oL, boardHeight);
            context.moveTo(oR, 0);
            context.lineTo(oR, boardHeight);
            context.moveTo(0, oT);
            context.lineTo(boardWidth, oT);
            context.moveTo(0, oB);
            context.lineTo(boardWidth, oB);
            context.stroke();
            context.restore();
        };

        obj.blur = function () {
            if (!this.focused || this.linesData === undefined) return;
            this.focused = false;
            var data = this.linesData;
            context.putImageData(data.oL.data, data.oL.left, data.oL.top);
            context.putImageData(data.oT.data, data.oT.left, data.oT.top);
            context.putImageData(data.oR.data, data.oR.left, data.oR.top);
            context.putImageData(data.oB.data, data.oB.left, data.oB.top);

            delete this.linesData;
        };

        obj.updateLineDatas = function () {
            var oL = this.left, oT = this.top, oR = this.left + this.width, oB = this.top + this.height;

            this.linesData = {
                oL: {
                    left: oL - 1,
                    top: 0,
                    data: context.getImageData(oL - 1, 0, 2, boardHeight)
                },
                oT: {
                    left: 0,
                    top: oT - 1,
                    data: context.getImageData(0, oT - 1, boardWidth, 2)
                },
                oR: {
                    left: oR - 1,
                    top: 0,
                    data: context.getImageData(oR - 1, 0, 2, boardHeight)
                },
                oB: {
                    left: 0,
                    top: oB - 1,
                    data: context.getImageData(0, oB - 1, boardWidth, 2)
                }
            };
        };

        obj.remove = function (isRemoveData) {
            context.putImageData(this.data, this.left, this.top);
            if (isRemoveData) {
                console.log(imgObjArr.indexOf(this));
                imgObjArr.splice(imgObjArr.indexOf(this), 1);
            }
        };

        return obj;
    }

    function fileUpload(files) {
        console.log(files);
        var fileList = files;
        if (fileList.length === 0) return false;

        if (startDraw) {
            startDraw = false;
            document.body.classList.remove('pointer');
            canvas.removeEventListener("mousedown", mousedown, false);
            canvas.removeEventListener("mousemove", mousemove, false);
            canvas.removeEventListener("mouseup", mouseup, false);
        }

        var left = position.x;
        var top = position.y;
        var exitLastObj = imgObjArr[imgObjArr.length - 1];

        Array.prototype.slice.call(fileList).forEach(function (file, i) {
            console.log(file.type.match(/^image/));
            if (file.type.search(/^image/) === -1) {
                alert("您上传的不是图片文件");
                return false;
            }

            var obj = createImgObj(file);

            if (exitLastObj) exitLastObj.blur();

            obj.drawFromFile(left + i * 20, top + i * 20, function (imgObj) {
                imgObjArr.push(imgObj);
            });
        });
    }

    function onFileInputChange() {
        console.log("enter");
        console.log($fileInput.files);
        fileUpload($fileInput.get(0).files)
    }

    var tempPattern = 1;
    var tempHtml = $shapeFirst.html();
    var penHtml = $pen.html();
    var positionsFirst = $positionsFirst.html();
    $subMenuItem.fastClick(function () {
        var that = $(this);
        var $MenuItem = that.parents(".modal-indicator");
        if ($MenuItem.hasClass("colors")) {
            //更改颜色为子菜单选中颜色
            $MenuItem.css("background-color", that.children().css("background-color"));
            //size部分也可以只改变类名，不复制全部的html
        } else if ($MenuItem.hasClass("sizes")) {
            $MenuItem.children("div:first-child")
                .attr("class", "")
                .addClass(that.find("div:first-child").attr("class"));
        }
        else if ($MenuItem.hasClass("tools")) {
            var toolsIndex = that.index();
            if (toolsIndex < 3) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            switch (toolsIndex) {
                case 0:
                    //drag map
                    shapePattern = -1;
                    //mutex with pointing
                    dragging = true;
                    pointing = false;
                    drawing_location_point = false;
                    $shapeFirst.html(tempHtml);
                    $positionsFirst.html(positionsFirst);
                    $canvasWrapper.css({cursor:"url('asset/cursor/handCursor.cur'),crosshair"});
                    break;
                case 1:
                    //pen
                    dragging = false;
                    eraserTag = false;
                    drawing_location_point = false;
                    document.body.classList.add('pointer');
                    //change the cursor
                    $canvasWrapper.css({cursor:"url('asset/cursor/pen.cur'),crosshair"});
                    //recover the current pattern to last pattern
                    shapePattern = tempPattern;
                    //console.log(shapePattern);
                    context.globalCompositeOperation = thisgl;
                    context.strokeStyle = $colorItem.css("background-color");
                    $shapeFirst.html($("#straight").html());
                    canvas.addEventListener("mousedown", mousedown, false);
                    canvas.addEventListener("mousemove", mousemove, false);
                    canvas.addEventListener("mouseup", mouseup, false);
                    startDraw = true;
                    break;
                case 2:
                    /**
                     *  3.30 change to pointer to select the obstacle to delete
                     */
                    pointing = true;
                    dragging = false;
                    drawing_location_point = false;
                    shapePattern = -1;
                    tempPattern = shapePattern;
                    $canvasWrapper.css({cursor:"url('asset/cursor/mouse-pointer.cur'),crosshair"});
                    $shapeFirst.html(tempHtml);
                    $positionsFirst.html(positionsFirst);
                    ////eraser
                    //eraserTag = true;
                    //tempPattern = shapePattern;
                    //shapePattern = 0;
                    //$canvasWrapper.css({cursor:"url('asset/cursor/eraser.cur'),crosshair"});
                    //$(".shapes").children("div:first-child").html(that.html()); //待改进，这里需要更新shape工具栏为曲线？
                    break;
                case 3:
                    //撤销 undo and redo 还有问题，速度比较慢，在使用了橡皮擦后失效
                    undo();
                    break;
                case 4:
                    //恢复
                    redo();
                    break;
                case 5:
                    //photo
                    console.log("click photo");
                    $fileInput.click();
                    break;
                case 6:
                    //删除
                    console.log("Delete");
                    clearCanvas();
                    break;
                default:
                    break;
            }
        } else if ($MenuItem.hasClass("shapes")) {
            var toolsIndex = that.index();
            //just update valuable icon
            if (toolsIndex < 4) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            dragging = false;
            $toolsFirst.html(penHtml);
            $canvasWrapper.css({cursor:"url('asset/cursor/pen.cur'),crosshair"});

            switch (toolsIndex) {
                //case 0:
                //    //curve
                //    setDashedLine(0);
                //    shapePattern = 0;
                //    break;
                case 0:
                    //straight line
                    setDashedLine(0);
                    shapePattern = 1;
                    break;
                case 1:
                    //rectangle
                    setDashedLine(0);
                    shapePattern = 2;
                    break;
                case 2:
                    //polygon
                    setDashedLine(0);
                    shapePattern = 3;
                    break;
                case 3:
                    //broken line 折线
                    setDashedLine(0);
                    shapePattern = 4;
                    break;
                case 4:
                    //circle
                    setDashedLine(0);setDashedLine(0);setDashedLine(0);
                    shapePattern = 5;
                    break;
                case 5:
                    //dashed line
                    setDashedLine(1);
                    shapePattern = 6;
                    break;
                default:
                    break;
            }
        } else if($MenuItem.hasClass("positions")) {
            var toolsIndex = that.index();
            //just update valuable icon
            if (toolsIndex < 2) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            dragging = false;
            $toolsFirst.html(penHtml);
            drawing_location_point = true;
            $canvasWrapper.css({cursor:"url('asset/cursor/locate.cur'),crosshair"});
            switch (toolsIndex) {
                case 0:
                    locationPattern = 0;
                    $toolsFirst.html(penHtml);
                    break;
                case 1:
                    locationPattern = 1;
                    $toolsFirst.html(penHtml);
                    break;
                default:
                    break;
            }
        }
        $MenuItem.removeClass("menu-open");
    });

    /**
     * test some submit function
     */
    document.getElementById('successBtn').addEventListener('click',sendImageInfo);

    function sendImageInfo() {
        transToJson();

        $.ajax({
            url:"",
            type:"POST",
            data:obstaclesJson,
            success:function(data) {
                alert("send success");
            }
        });
    }

    var name,url,description;

    function drawNewImage(){
        var data = localStorage['obstacle'];
        var obj = JSON.parse(data);

        name = obj.mapName;
        url = obj.url;
        description = obj.description;
        console.log(name +" "+url+" "+description);

        var tempArray;

        /**
         * parse lines
         */
        var lines = [];
         tempArray = obj.obstacles.lines;
        for(var i = 0;i<tempArray.length;i++) {
            //console.log(tempArray[i].start.x+" "+tempArray[i].start.y)
            var startPot = {"x":0,"y":0};
            startPot.x = tempArray[i].start.x;
            startPot.y = tempArray[i].start.y;
            var endPot = {"x":0,"y":0};
            endPot.x = tempArray[i].end.x;
            endPot.y = tempArray[i].end.y;
            var line = {
                "start":startPot,
                "end":endPot
            };
            line.start = startPot;
            line.end = endPot;

            lines.push(line);
        }

        //for(var i = 0;i<lines.length;i++) {
        //    console.log(lines[i].start.x+ " " + lines[i].start.y);
        //    console.log(lines[i].end.x+ " " + lines[i].end.y);
        //}

        drawLineObstacle(lines,context);

        /**
         * parse rectangle
         */
        var rectangles = [];
        tempArray = obj.obstacles.rectangles;
        for(var i = 0;i<tempArray.length;i++) {
            //console.log(tempArray[i].start.x+" "+tempArray[i].start.y)
            var startPot = {"x":0,"y":0};
            startPot.x = tempArray[i].start.x;
            startPot.y = tempArray[i].start.y;
            var endPot = {"x":0,"y":0};
            endPot.x = tempArray[i].end.x;
            endPot.y = tempArray[i].end.y;
            var rectangle = {
                "start":startPot,
                "end":endPot
            };
            rectangle.start = startPot;
            rectangle.end = endPot;

            rectangles.push(rectangle);
        }

        //console.log(rectangles.length);
        //
        //
        //for(var i = 0;i<rectangles.length;i++) {
        //    console.log(rectangles[i].start.x+ " " + rectangles[i].start.y);
        //    console.log(rectangles[i].end.x+ " " + rectangles[i].end.y);
        //}

        drawRectangleObstacle(rectangles,context);

        /**
         * parse polygon
         */
        var polygons = [];
        tempArray = obj.obstacles.polygons;
        var array;
        for(var j = 0;j<tempArray.length;j++) {
            var polygon = [];
            for (var i = 0; i < tempArray[j].length; i++) {
                array = tempArray[j];
                var pot = {"x": 0, "y": 0};
                pot.x = array[i].x;
                pot.y = array[i].y;

                polygon.push(pot);
            }
            polygons.push(polygon);
        }

        drawPolygonObstacle(polygons,context);
    }

    function drawLineObstacle(lines,contextT) {
        for(var i = 0;i<lines.length;i++) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.moveTo(lines[i].start.x, lines[i].start.y);
            contextT.lineTo(lines[i].end.x, lines[i].end.y);
            contextT.stroke();
        }
    }

    function drawRectangleObstacle(rectangles,contextT) {
        for(var i = 0;i<rectangles.length;i++) {
            contextT.beginPath();
            context.lineCap = "round";
            contextT.strokeStyle = $colorItem.css("background-color");
            //is fill color rect
            //contextT.fillRect(startX,startY,toX-startX,toY-startY);
            contextT.strokeRect(rectangles[i].start.x,rectangles[i].start.y ,
                rectangles[i].end.x- rectangles[i].start.x,
                rectangles[i].end.y- rectangles[i].start.y);
        }
    }

    function drawPolygonObstacle(polygons,contextT) {
        for(var i = 0;i < polygons.length;i++) {
            var polygon = polygons[i];
            contextT.beginPath();
            contextT.strokeStyle = $colorItem.css("background-color");
            for (var j = 0; j < polygon.length; j++) {
                if (j + 1 === polygon.length) {
                    contextT.moveTo(polygon[j].x, polygon[j].y);
                    contextT.lineTo(polygon[0].x, polygon[0].y);
                    contextT.stroke();
                } else {
                    contextT.moveTo(polygon[j].x, polygon[j].y);
                    //console.log(polygon[j].x + " " + polygon[j].y)
                    contextT.lineTo(polygon[j + 1].x, polygon[j + 1].y);
                    //console.log(polygon[j + 1].x + " " + polygon[j + 1].y)
                    contextT.stroke();
                }
            }
        }
    }
})(window);