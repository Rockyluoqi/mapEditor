/**
 * Created by Luoqi on 3/14/2016.
 * function List
 * 1.zoom in and zoom out
 * 2.drag the map using mouse
 * 3.touchable
 */
//;(function (window) {
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

var $startPointInput = $("#startPointInput");
var $startOkBtn = $("#startOkBtn");
var $startCancelBtn = $("#startCancelBtn");
var $startPointName = $("#startPointName");

var $endPointInput = $("#endPointInput");
var $endOkBtn = $("#endOkBtn");
var $endCancelBtn = $("#endCancelBtn");
var $endPointName = $("#endPointName");

var deleteButton = document.getElementById('deleteButton');
var backButton = document.getElementById('backBtn');

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
var drawing = false;

var startPointColor = "#00FF7F";
var locationPointColor = "#FFA500";
var selectedColor = "#0000FF"; //mouse down color
var selectingColor = "#FFFFFF"; //mouse hover color


/**
 * layer1 :including draw canvas
 * Layer2 :excluding draw canvas
 */
document.getElementById('layer1').addEventListener('click', layer1Recover);
document.getElementById('layer2').addEventListener('click', clearCanvas);

/**
 * test some submit function
 */
document.getElementById('successBtn').addEventListener('click', sendImageInfo);

//deleteButton.addEventListener('click', deleteLocationPoint);
//deleteButton.addEventListener('click', drawLayer);
deleteButton.addEventListener('click', deleteBtnHandler);
backButton.addEventListener('click', backBtnHandler);


$startOkBtn.click(setStartPointName);
$startCancelBtn.click(startInputCancel);

$endOkBtn.click(setEndPointName);
$endCancelBtn.click(endInputCancel);


function backBtnHandler() {
    window.open('mapGallery.html', '_self', false);
}
/**
 * cancel and delete the point
 */
function startInputCancel() {
    $startPointInput.css("top", -3000 + "px");
    $startPointInput.css("left", -3000 + "px");
    var length = startPointArray.length;
    startPointArray[length - 1] = null;
    startPoints[length - 1] = null;

    deleteNullInArray(startPointArray);
    startPointArray = noneNullArray;

    deleteNullInArray(startPoints);
    startPoints = noneNullArray;

    pointContext.clearRect(0, 0, canvas.width, canvas.height);
    redrawLocationArray(pointContext, 0, startPoints, 1);
    redrawLocationArray(pointContext, 1, locationPoints, 1);
}

function setStartPointName() {
    alert($startPointName.val());
    startPointName = $startPointName.val();

    //this is the request formation data
    var startPointData = {
        "angle": startPoints[startPoints.length - 1].angle,
        "gridX": startPoints[startPoints.length - 1].startPot.x,
        "gridY": startPoints[startPoints.length - 1].startPot.y,
        "mapName": sessionStorage.getItem("mapName"),
        "name": startPointName,
        "type": 0
    };

    startPointDatas.push(startPointData);
    $startPointInput.css("top", -3000 + "px");
    $startPointInput.css("left", -3000 + "px");

    sendInitPosition();
}

/**
 * cancel and delete the point
 */
function endInputCancel() {
    $endPointInput.css("top", -3000 + "px");
    $endPointInput.css("left", -3000 + "px");
    var length = locationPointArray.length;
    locationPointArray[length - 1] = null;
    locationPoints[length - 1] = null;

    deleteNullInArray(locationPointArray);
    locationPointArray = noneNullArray;

    deleteNullInArray(locationPoints);
    locationPoints = noneNullArray;

    pointContext.clearRect(0, 0, canvas.width, canvas.height);
    redrawLocationArray(pointContext, 0, startPoints, 1);
    redrawLocationArray(pointContext, 1, locationPoints, 1);
}

function setEndPointName() {
    alert($endPointName.val());
    endPointName = $endPointName.val();

    //this is the request formation data
    var endPointData = {
        "angle": locationPoints[locationPoints.length - 1].angle,
        "gridX": locationPoints[locationPoints.length - 1].startPot.x,
        "gridY": locationPoints[locationPoints.length - 1].startPot.y,
        "mapName": sessionStorage.getItem("mapName"),
        "name": endPointName,
        "type": 0
    };

    endPointDatas.push(endPointData);
    $endPointInput.css("top", -3000 + "px");
    $endPointInput.css("left", -3000 + "px");

    sendPosition();
}


/**
 * 0-straight line
 * 1-rectangle
 * 2-polygon
 *
 */
var shapePattern;

//undo and redo
var contextHistory = [];
var pointHistory = [];
var cStep = -1;

var bg_image = new Image();
var curWidth, curHeight, tempWidth, tempHeight;



$container.css({width: bg_image.width, height: bg_image.height});
$content.css({width: bg_image.width, height: bg_image.height});

//canvas part
var canvas = document.getElementById("canvas");
var netherCanvas = document.getElementById("netherCanvas"); //底层Canvas
var tempCanvas = document.getElementById("tempCanvas");
var pointCanvas = document.getElementById("pointCanvas");

var context = null;
var context2 = netherCanvas.getContext('2d');
var context3 = null;
var pointContext = null;

context = canvas.getContext("2d");
context3 = tempCanvas.getContext("2d");
pointContext = pointCanvas.getContext("2d");
//netherCanvas.setAttribute('zIndex',"-1");


/**
 * source
 * @type {string}
 */
//bg_image.src = "./image1.jpg";
//console.log(bg_image.src);
//console.log(bg_image.length);
bg_image.src = localStorage["bgUrl"];
bg_image.onload = function () {
    //console.log(bg_image.width + " " + bg_image.height);
    setDefaultSize(bg_image);
    setCanvasSize(curHeight, curWidth);
    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height);
    //startPointDatas = [];
    //startPointArray = [];
    //startPoints = [];
    //locationPointArray = [];
    //endPointDatas = [];
    //locationPoints = [];
    getDataFromGallery();
    //console.log(startPointDatas.length);
    console.log(startPoints);
    //startPoints = [];
    //locationPoints = [];
    drawLayerFirst();
    //drawLayer();
    //console.log(startPointDatas.length);
    //console.log(startPoints.length);
    console.log(startPointDatas);
};



//console.log(bg_image.src);
//console.log(bg_image.src);
//bg_image.src = 'js/map.jpg';


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
$(window).scroll(function () {
    topScrollDistance = window.pageYOffset;
    leftScrollDistance = window.pageXOffset;
});

if (canvas.getContext) {
    /**
     *local testing
     */
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

    if (!context.setLineDash) {
        context.setLineDash = function () {
        }
    }

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


    /**
     * I know the code in if statement is redundant.What my think is reduce coupling.Is it better? Sense of trap.
     * OK...I will optimize it later.
     */
    var backBtnHtml = $(".zoomInAndOut").html();

    function mousedown(event) {
        mouse.down = true;
        if (dragging === true) {
            $canvasWrapper.css({cursor: "url('asset/cursor/dragHand.cur'),crosshair"});
            position.x = (event.clientX - barWidth);
            position.y = event.clientY;
            //console.log("start position: " +position.x+"  "+ position.y);
            //locate at the last time drag
            window.scrollTo(curScrollX, curScrollY);
        }
        /**
         * mouse down the point color change to blue
         */
        if (pointing === true) {
            mouseX = leftScrollDistance + event.clientX - offsetX;
            mouseY = topScrollDistance + event.clientY - offsetY;

            /**
             * the locaitonPoint logic is different with the shapePattern, it has historical reason, I'll fix it.(timeless...
             */
            if (locationPattern === 0) {
                currentPointArray = startPointArray;
                currentRealPointArray = startPoints;
                for (var i = startPointArray.length - 1; i >= 0; i--) {
                    var circle = startPointArray[i];
                    if (circle != null) {
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius) {
                            //save previousCircle and set its isSelected to false
                            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
                            previousSelectedCircle = circle;
                            currentLocationPoint = circle;
                            circle.isSelected = true;
                            //console.log("select OK");
                            startX = circle.x;
                            startY = circle.y;
                            drawLocationPoint(circle.radius, pointContext, selectedColor, 0, locationPattern);

                            deleteFlag = 5;

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
                }

                //for (var i = startPointArray.length - 1; i >= 0; i--) {
                //    var circle = startPointArray[i];
                //    if(circle != null) {
                //        if (!circle.isSelected) {
                //            startX = circle.x;
                //            startY = circle.y;
                //            drawLocationPoint(circle.radius, pointContext, startPointColor, 0, locationPattern);
                //        }
                //    }
                //    //console.log("circle"+i+" "+circle.isSelected +" Index:"+circle.index);
                //}
            }

            if (locationPattern === 1) {
                currentPointArray = locationPointArray;
                currentRealPointArray = locationPoints;
                for (var i = locationPointArray.length - 1; i >= 0; i--) {
                    var circle = locationPointArray[i];
                    if (circle != null) {
                        var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                        if (distanceFromCenter <= circle.radius) {
                            //save previousCircle and set its isSelected to false
                            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
                            previousSelectedCircle = circle;
                            currentLocationPoint = circle;
                            circle.isSelected = true;
                            //console.log("select OK");
                            startX = circle.x;
                            startY = circle.y;
                            drawLocationPoint(circle.radius, pointContext, selectedColor, 0, locationPattern);

                            deleteFlag = 5;

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
                }

                //for (var i = startPointArray.length - 1; i >= 0; i--) {
                //    var circle = startPointArray[i];
                //    if (circle != null) {
                //        console.log(circle.isSelected);
                //        if (!circle.isSelected) {
                //            startX = circle.x;
                //            startY = circle.y;
                //            drawLocationPoint(circle.radius, pointContext, locationPointColor, 0, locationPattern);
                //        }
                //    }
                //}
            }
            //guarantee switch pattern last pattern's Array will restore, some redundancy ... I'll fix it.
            redrawArray(pointContext);

            /*for(var i =0;i<startPointArray.length;i++) {
             console.log("starts "+startPointArray[i].isSelected);
             }

             for(var i =0;i<locationPointArray.length;i++) {
             console.log("locations "+locationPointArray[i].isSelected);
             }*/

            if (shapePattern === 1) {
                //delete line
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i] != null) {
                        context.beginPath();
                        context.lineCap = "round";
                        context.moveTo(lines[i].start.x, lines[i].start.y);
                        context.lineTo(lines[i].end.x, lines[i].end.y);
                        if (context.isPointInStroke(mouseX, mouseY)) {
                            canvas.style.cursor = 'pointer';
                            context.strokeStyle = "red";
                            context.stroke();
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");
                            lineIndex = i;
                            deleteFlag = 1;
                            break;
                        } else {
                            canvas.style.cursor = 'default';
                            context.strokeStyle = "black";
                            context.stroke();
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                }
            }

            if (shapePattern === 2) {
                //delete rectangle
                for (var i = 0; i < rectangles.length; i++) {
                    if (rectangles[i] != null) {
                        context.beginPath();
                        context.lineCap = "round";
                        context.rect(rectangles[i].start.x, rectangles[i].start.y, rectangles[i].end.x - rectangles[i].start.x, rectangles[i].end.y - rectangles[i].start.y);
                        if (context.isPointInPath(mouseX, mouseY)) {
                            canvas.style.cursor = 'pointer';
                            context.strokeStyle = "red";
                            context.stroke();
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");

                            rectangleIndex = i;
                            deleteFlag = 2;

                            break;
                        } else {
                            canvas.style.cursor = 'default';
                            context.strokeStyle = "black";
                            context.stroke();
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                }
            }

            if (shapePattern === 3) {
                //delete polygon
                for (var i = 0; i < polygons.length; i++) {
                    if (polygons[i]) {
                        var polygon = polygons[i];
                        context.beginPath();
                        context.strokeStyle = "red";
                        context.moveTo(polygon[0].x, polygon[0].y);
                        console.log(polygon.length);
                        for (var j = 1; j < polygon.length; j++) {
                            context.lineTo(polygon[j].x, polygon[j].y);
                            //console.log(polygon[j].x + " "+polygon[j].y);
                        }
                        if (context.isPointInPath(mouseX, mouseY)) {
                            canvas.style.cursor = 'pointer';
                            context.strokeStyle = "red";
                            context.closePath();
                            context.stroke();
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");

                            polygonIndex = i;
                            deleteFlag = 3;
                            break;
                        } else {
                            canvas.style.cursor = 'default';
                            context.strokeStyle = "black";
                            context.closePath();
                            context.stroke();
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                }
            }

            if (shapePattern === 4) {
                //delete circle
                for (var i = 0; i < circles.length; i++) {
                    if (circles[i] != null) {
                        context.beginPath();
                        context.lineCap = "round";
                        context.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
                        if (context.isPointInPath(mouseX, mouseY)) {
                            canvas.style.cursor = 'pointer';
                            context.strokeStyle = "red";
                            context.stroke();
                            $pointItem.css("width", "50px");
                            $pointItem.css("top", (event.clientY + 15) + "px");
                            $pointItem.css("left", (event.clientX + 15) + "px");

                            circleIndex = i;
                            deleteFlag = 4;

                            break;
                        } else {
                            canvas.style.cursor = 'default';
                            context.strokeStyle = "black";
                            context.stroke();
                            $pointItem.css("top", -(event.clientY + 15) + "px");
                            $pointItem.css("left", -(event.clientX + 15) + "px");
                        }
                    }
                }
            }
        }
        if (drawing_location_point === true) {
            if (locationPattern === 0) {
                console.log("start point");
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                pointContext.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                drawLocationPoint(10, pointContext, startPointColor, 1, locationPattern);
                $tempCanvas.css({left: 0, top: 0});
            }
            if (locationPattern === 1) {
                event.preventDefault();
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                pointContext.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                drawLocationPoint(10, pointContext, locationPointColor, 1, locationPattern);
                $tempCanvas.css({left: 0, top: 0});
            }
        }
        if (drawing) {
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
            if (shapePattern === 5) {
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
    }

    function mousemove(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        if (dragging === true) {
            var distanceX, distanceY;
            event.preventDefault();
            if (!mouse.down) return;
            mouseX = (event.clientX - barWidth);
            mouseY = event.clientY;
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
        if (pointing === true) {
            mouseX = leftScrollDistance + event.clientX - offsetX;
            mouseY = topScrollDistance + event.clientY - offsetY;
            //console.log("startPointArray.length "+startPointArray.length);
            //console.log("locationPointArray.length "+locationPointArray.length);
            for (var i = startPointArray.length - 1; i >= 0; i--) {
                var circle = startPointArray[i];
                if (circle != null) {
                    var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                    if (distanceFromCenter <= circle.radius && !circle.isSelected) {
                        startX = circle.x;
                        startY = circle.y;
                        circle.selecting = true;
                        console.log("circle    " + i);
                        locationPattern = 0;
                        shapePattern = -1;
                        drawLocationPoint(circle.radius, pointContext, selectingColor, 0, locationPattern);
                        return;
                    } else {
                        if (circle.selecting) {
                            if (!circle.isSelected) {
                                drawLocationPoint(circle.radius, pointContext, startPointColor, 0, locationPattern);
                            }
                            circle.selecting = false;
                        }
                    }
                }
            }

            for (var i = locationPointArray.length - 1; i >= 0; i--) {
                var circle = locationPointArray[i];
                if (circle != null) {
                    var distanceFromCenter = Math.sqrt(Math.pow(circle.x - mouseX, 2) + Math.pow(circle.y - mouseY, 2));
                    if (distanceFromCenter <= circle.radius && !circle.isSelected) {
                        startX = circle.x;
                        startY = circle.y;
                        circle.selecting = true;
                        console.log("circle" + i);
                        locationPattern = 1;
                        shapePattern = -1;
                        drawLocationPoint(circle.radius, pointContext, selectingColor, 0, locationPattern);
                    } else {
                        if (circle.selecting) {
                            if (!circle.isSelected) {
                                drawLocationPoint(circle.radius, pointContext, locationPointColor, 0, locationPattern);
                            }
                            circle.selecting = false;
                        }
                    }
                }
            }

            /**
             * isPointInStroke chrome Firefox Opera is supported, IE and Safari is not supported.
             * Detect the mouse whether on the straight line. It's convenient.
             */
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] != null) {
                    context.beginPath();
                    context.lineCap = "round";
                    context.moveTo(lines[i].start.x, lines[i].start.y);
                    context.lineTo(lines[i].end.x, lines[i].end.y);
                    if (context.isPointInStroke(mouseX, mouseY)) {
                        canvas.style.cursor = 'pointer';
                        context.strokeStyle = "red";
                        context.stroke();
                        shapePattern = 1;
                        break;
                    } else {
                        canvas.style.cursor = 'default';
                        context.strokeStyle = "black";
                        context.stroke();
                    }
                }
            }

            /**
             * detect rectangle and update the shapePattern, keep mutex.
             */
            for (var i = 0; i < rectangles.length; i++) {
                if (rectangles[i] != null) {
                    context.beginPath();
                    context.lineCap = "round";
                    context.rect(rectangles[i].start.x, rectangles[i].start.y, rectangles[i].end.x - rectangles[i].start.x, rectangles[i].end.y - rectangles[i].start.y);
                    if (context.isPointInPath(mouseX, mouseY)) {
                        console.log("In path");
                        canvas.style.cursor = 'pointer';
                        context.strokeStyle = "red";
                        context.stroke();
                        shapePattern = 2;
                        break;
                    } else {
                        canvas.style.cursor = 'default';
                        context.strokeStyle = "black";
                        context.stroke();
                    }
                }
            }

            for (var i = 0; i < polygons.length; i++) {
                if (polygons[i]) {
                    var polygon = polygons[i];
                    context.beginPath();
                    context.strokeStyle = "red";
                    context.moveTo(polygon[0].x, polygon[0].y);
                    for (var j = 1; j < polygon.length; j++) {
                        context.lineTo(polygon[j].x, polygon[j].y);
                        //console.log(polygon[j].x + " "+polygon[j].y);
                    }
                    if (context.isPointInPath(mouseX, mouseY)) {
                        console.log("in path");
                        canvas.style.cursor = 'pointer';
                        context.strokeStyle = "red";
                        context.closePath();
                        context.stroke();
                        shapePattern = 3;
                        break;
                    } else {
                        canvas.style.cursor = 'default';
                        context.strokeStyle = "black";
                        context.closePath();
                        context.stroke();
                    }
                }
            }

            for (var i = 0; i < circles.length; i++) {
                if (circles[i]) {
                    context.beginPath();
                    context.strokeStyle = $colorItem.css("background-color");
                    context.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
                    if (context.isPointInPath(mouseX, mouseY)) {
                        canvas.style.cursor = 'pointer';
                        context.strokeStyle = "red";
                        context.stroke();
                        shapePattern = 4;
                        break;
                    } else {
                        canvas.style.cursor = 'default';
                        context.strokeStyle = "black";
                        context.stroke();
                    }
                }
            }
        }

        if (drawing_location_point) {
            if (locationPattern === 0) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                //last context3
                drawLocationLine(mouseX, mouseY, context3, startPointColor, 0, locationPattern);
            }
            if (locationPattern === 1) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawLocationLine(mouseX, mouseY, context3, locationPointColor, 0, locationPattern);
            }
        }

        //keep mutual with pointing and drawing locationPoint
        if (drawing) {
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
                drawStraightLine(mouseX, mouseY, context3, 0);
            }
            if (shapePattern === 2) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawRectangle(mouseX, mouseY, context3, 0);
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
                    drawStraightLine(mouseX, mouseY, context3, 0);
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
                drawStraightLine(mouseX, mouseY, context3, 0);
            }
            if (shapePattern === 5) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                mouse.x = mouseX;
                mouse.y = mouseY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                r = distance(point, mouse);
                drawCircle(r, context3, 0);
            }
            if (shapePattern === 6) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawDashedLine(mouseX, mouseY, context3, 0);
            }
        }
    }

    function mouseup(event) {
        event.preventDefault();
        if (!mouse.down) {
            return;
        }
        if (dragging === true) {
            //update
            curScrollX = leftScrollDistance;
            curScrollY = topScrollDistance;
            $canvasWrapper.css({cursor: "url('asset/cursor/handCursor.cur'),crosshair"});
        }
        if (pointing === true) {

        }
        if (drawing_location_point === true) {
            mouseX = leftScrollDistance + event.clientX - offsetX;
            mouseY = topScrollDistance + event.clientY - offsetY;
            $tempCanvas.css({left: -window.innerWidth, top: 0});
            if (locationPattern === 0) {
                drawLocationLine(mouseX, mouseY, pointContext, startPointColor, 1, locationPattern);

                //$startPointInput.css("width", 200 + "px");
                $startPointInput.css("top", (event.clientY + 200) + "px");
                $startPointInput.css("left", (event.clientX) + "px");
                $startPointInput.css("width", (400) + "px");
                $(".row").css("width", 400 + "px");
                $(".col").css("width", 300 + "px");
                $(".input-field").css("width", 250 + "px");
            }
            if (locationPattern === 1) {
                drawLocationLine(mouseX, mouseY, pointContext, locationPointColor, 1, locationPattern);
                $endPointInput.css("top", (event.clientY + 200) + "px");
                $endPointInput.css("left", (event.clientX) + "px");
                $endPointInput.css("width", (400) + "px");
                $(".row").css("width", 400 + "px");
                $(".col").css("width", 300 + "px");
                $(".input-field").css("width", 250 + "px");
            }
            //console.log(startPoints.length);
        }
        if (drawing) {
            if (shapePattern === 1) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawStraightLine(mouseX, mouseY, context, 1);
            }
            if (shapePattern === 2) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawRectangle(mouseX, mouseY, context, 1);
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
            if (shapePattern === 5) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                context.strokeStyle = $colorItem.css("background-color");
                drawCircle(r, context, 1);
            }
            if (shapePattern === 6) {
                mouseX = leftScrollDistance + event.clientX - offsetX;
                mouseY = topScrollDistance + event.clientY - offsetY;
                $tempCanvas.css({left: -window.innerWidth, top: 0});
                drawDashedLine(mouseX, mouseY, context, 1);
            }
        }
        //if (!dragging) {
        //    historyPush();
        //}
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
    pointCanvas.width = w;
    pointCanvas.height = h;
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
    if (cStep < contextHistory.length) {
        contextHistory.length = cStep;
        pointHistory.length = cStep;
    }
    contextHistory.push($("#canvas").get(0).toDataURL());
    pointHistory.push($("#pointCanvas").get(0).toDataURL());
}

/**
 *  This function and redo function is deprecated, because the logic has problems that should not use image.
 */
var tempSaveLine;
var tempSaveRectangle;
var tempSaveCircle;
var tempSavePolygon;
function undo() {
    clearCanvas();

    console.log(shapePattern);
    switch(shapePattern) {
        case 1:
            tempSaveLine = lines.pop();
            break;
        case 2:
            tempSaveRectangle = rectangles.pop();
            break;
        case 3:
            tempSavePolygon = polygons.pop();
            break;
        case 5:
            tempSaveCircle = circles.pop();
        default:
            break;
    }

    drawLayer();

    //if (cStep >= 0) {
    //    clearCanvas();
    //    cStep--;
    //    var tempImage = new Image();
    //    tempImage.src = contextHistory[cStep];
    //    tempImage.onload = function () {
    //        context.drawImage(tempImage, 0, 0);
    //    };
    //    //tempImage.src = pointHistory[cStep];
    //    //tempImage.onload = function () {
    //    //    pointContext.drawImage(tempImage, 0, 0);
    //    //};
    //}
}

function redo() {
    clearCanvas();
    lines.push(tempSaveLine);
    rectangles.push(tempSaveRectangle);
    polygons.push(tempSavePolygon);
    circles.push(tempSaveCircle);

    drawLayer();
    /**
     * new point image cover the context image, need to take them to a image
     */
    //if (cStep < contextHistory.length) {
    //    clearCanvas();
    //    ++cStep;
    //    var tempImage = new Image();
    //    tempImage.src = contextHistory[cStep];
    //    tempImage.onload = function () {
    //        context.drawImage(tempImage, 0, 0);
    //    };
    //
    //    /*var pointImage = new Image();
    //     tempImage.src = pointHistory[cStep];
    //     tempImage.onload = function () {
    //     pointContext.drawImage(tempImage, 0, 0);
    //     };*/
    //}
}

var times = 0;

function layer1Recover() {
    console.log(contextHistory.length);

    clearCanvas();

    //transToJson();
    //localStorage["obstacle"] = mapJson;
    //drawNewImage();
    drawLayer();
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    pointContext.clearRect(0, 0, pointCanvas.width, pointCanvas.height);
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


var tempPattern = 1;
var tempHtml = $shapeFirst.html();
var penHtml = $pen.html();
var toolHtml = $toolsFirst.html();
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
        if (toolsIndex < 2) {
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
                drawing = false;
                $shapeFirst.html(tempHtml);
                $positionsFirst.html(positionsFirst);
                $canvasWrapper.css({cursor: "url('asset/cursor/handCursor.cur'),crosshair"});
                break;
            //case 1:
            //    //eraser
            //    eraserTag = true;
            //    tempPattern = shapePattern;
            //    shapePattern = 0;
            //    $canvasWrapper.css({cursor:"url('asset/cursor/eraser.cur'),crosshair"});

            //pen
            //dragging = false;
            //eraserTag = false;
            //drawing_location_point = false;
            //document.body.classList.add('pointer');
            //change the cursor
            //$canvasWrapper.css({cursor:"url('asset/cursor/pen.cur'),crosshair"});
            //recover the current pattern to last pattern
            //shapePattern = tempPattern;
            //console.log(shapePattern);
            //context.globalCompositeOperation = thisgl;
            //context.strokeStyle = $colorItem.css("background-color");
            //$shapeFirst.html($("#straight").html());
            //canvas.addEventListener("mousedown", mousedown, false);
            //canvas.addEventListener("mousemove", mousemove, false);
            //canvas.addEventListener("mouseup", mouseup, false);
            //startDraw = true;
            //break;
            case 1:
                /**
                 *  3.30 change to pointer to select the obstacle to delete
                 */
                pointing = true;
                dragging = false;
                drawing_location_point = false;
                drawing = false;
                shapePattern = -1;
                tempPattern = shapePattern;
                $canvasWrapper.css({cursor: "url('asset/cursor/mouse-pointer.cur'),crosshair"});
                $shapeFirst.html(tempHtml);
                $positionsFirst.html(positionsFirst);
                ////eraser
                //eraserTag = true;
                //tempPattern = shapePattern;
                //shapePattern = 0;
                //$canvasWrapper.css({cursor:"url('asset/cursor/eraser.cur'),crosshair"});
                //$(".shapes").children("div:first-child").html(that.html()); //待改进，这里需要更新shape工具栏为曲线？
                break;
            case 2:
                //撤销 undo and redo 还有问题，速度比较慢，在使用了橡皮擦后失效
                undo();
                break;
            case 3:
                //恢复
                redo();
                break;
            case 4:
                //photo
                console.log("click photo");
                $fileInput.click();
                break;
            case 5:
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
        if (toolsIndex < 6) {
            $MenuItem.children("div:first-child").html(that.html());
        }
        dragging = false;
        eraserTag = false;
        drawing_location_point = false;
        drawing = true;
        //shapePattern = tempPattern;
        context.strokeStyle = $colorItem.css("background-color");
        context.globalCompositeOperation = thisgl;
        $canvasWrapper.css({cursor: "url('asset/cursor/pen.cur'),crosshair"});
        $toolsFirst.html(toolHtml);
        switch (toolsIndex) {
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
            case 4:
                //broken line 折线
                setDashedLine(0);
                shapePattern = 4;
                break;
            case 3:
                //circle
                setDashedLine(0);
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
    } else if ($MenuItem.hasClass("positions")) {
        var toolsIndex = that.index();
        //just update valuable icon
        if (toolsIndex < 2) {
            $MenuItem.children("div:first-child").html(that.html());
        }
        dragging = false;
        drawing_location_point = true;
        pointing = false;
        drawing = false;
        shapePattern = -2;
        $canvasWrapper.css({cursor: "url('asset/cursor/locate.cur'),crosshair"});

        switch (toolsIndex) {
            case 0:
                locationPattern = 0;
                $toolsFirst.html(tempHtml);
                $shapeFirst.html(tempHtml);
                break;
            case 1:
                locationPattern = 1;
                $toolsFirst.html(tempHtml);
                $shapeFirst.html(tempHtml);
                break;
            default:
                break;
        }
    }
    $MenuItem.removeClass("menu-open");
});