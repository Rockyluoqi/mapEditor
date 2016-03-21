/**
 * Created by Luoqi on 3/14/2016.
 * 这里是主Js文件，实现toolbar的动态选择，以及Canvas中的绘图
 * 需要实现的功能单子
 * 2、读图出图网络接口
 * 3、坐标的网络交互
 */
;(function (window) {
    var $modalIndicator = $(".modal-indicator");
    var $subMenuItem = $(".sub-menu").find(".menu-item");
    var $fileInput = $("#fileInput");
    var imgObjArr = [];
    var startDraw = true;
    var eraserTag = false;
    var imgScale = 1;
    var widthScale = 1;
    var heightScale = 1;
    var mouseX,mouseY;
    /**
     * 0-free line(curve)
     * 1-straight line
     * 2-rectangle
     * 3-circle
     */
    var shapePattern = 0;

    //undo and redo
    var history = new Array();
    var cStep = -1;

    var bg_image = new Image();
    //bg_image.src = 'js/map.jpg';
    var curWidth, curHeight, tempWidth, tempHeight;

    bg_image.src = localStorage["bgUrl"];

    //canvas part
    var canvas = document.getElementById("canvas");
    var netherCanvas = document.getElementById("netherCanvas"); //底层Canvas
    var tempCanvas = document.getElementById("tempCanvas");
    var context = null;
    var context2 = null;
    var context3 = null;
    //netherCanvas.setAttribute('zIndex',-1);

    setDefaultSize(bg_image);

    var position = {x: tempWidth / 2, y: tempHeight / 2};
    var mouse = {x: 0, y: 0, down: false};
    document.body.classList.add('pointer');



    if (canvas.getContext) {
        context = canvas.getContext("2d");
        context2 = netherCanvas.getContext("2d");
        context3 = tempCanvas.getContext("2d");

        resizeImage();

        setCanvasSize(tempHeight, tempWidth);

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
                    if(eraserTag === true) {
                        //实现擦除效果，
                        context.globalCompositeOperation = "destination-out";
                        context.strokeStyle = "rgba(0,0,0,1.0)";
                    } else {
                        context.globalCompositeOperation = thisgl;
                        context.strokeStyle = $colorItem.css("background-color");
                    }
                    context.lineWidth = chosenWidth;
                    context.moveTo(position.x + moveLeft, position.y + moveTop);
                    context.lineTo(mouse.x + moveLeft, mouse.y + moveTop);
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
        $("#tempCanvas").css({left: -(window.innerWidth), top: 0});

        function drawStraightLine(toX, toY, contextT) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.moveTo(startX, startY);
            contextT.lineTo(toX, toY);
            contextT.stroke();
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

        function drawRectangle(toX,toY,contextT) {
            contextT.beginPath();
            context.lineCap = "round";
            contextT.strokeStyle = $colorItem.css("background-color");
            //is fill color rect
            //contextT.fillRect(startX,startY,toX-startX,toY-startY);
            contextT.strokeRect(startX,startY,toX-startX,toY-startY);
        }

        //var points = [];
        var needFirstPoint = true;
        function drawNextLine(toX,toY,contextT) {
            if(needFirstPoint) {
                contextT.beginPath();
                contextT.strokeStyle = $colorItem.css("background-color");
                contextT.moveTo(startX,startY);
                needFirstPoint = false;
            } else {
                contextT.lineTo(toX,toY);
                contextT.stroke();
            }
        }

        function mousedown(event) {
            if (shapePattern === 0) {
                mouse.down = true;
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
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                //update to tempCanvas at the same time, the function is OK
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                //move temp canvas over main canvas
                $("#tempCanvas").css({left: 0, top: 0});
                mouse.down = true;
            }
            if(shapePattern === 2) {
                event.preventDefault();
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $("#tempCanvas").css({left: 0, top: 0});
                mouse.down = true;
            }
            if(shapePattern === 3) {

                mouse.down = true;
            }
            if(shapePattern === 4) {
                event.preventDefault();
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                startX = mouseX;
                startY = mouseY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $("#tempCanvas").css({left: 0, top: 0});
                mouse.down = true;
            }
        }

        function mousemove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            if (shapePattern === 0) {
                drawFreeLine();
            }
            if (shapePattern === 1) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                drawStraightLine(mouseX, mouseY, context3);
            }
            if(shapePattern === 2) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                context3.clearRect(0,0,tempCanvas.width,tempCanvas.height);
                drawRectangle(mouseX,mouseY,context3);
            }
            if(shapePattern === 3) {
                event.preventDefault();
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                chosenWidth = $chosenSvg.getBoundingClientRect().width;
                context3.lineWidth = chosenWidth;
                context.lineWidth = chosenWidth;
                context3.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                $("#tempCanvas").css({left: 0, top: 0});
                drawStraightLine(mouseX,mouseY,context3);
            }
            if(shapePattern === 4) {
                event.preventDefault();
                if (!mouse.down) {
                    return;
                }
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                context3.clearRect(0,0,tempCanvas.width,tempCanvas.height);
                drawStraightLine(mouseX,mouseY,context3);
            }
        }

        function mouseup(event) {
            event.preventDefault();
            if (!mouse.down) {
                return;
            }
            if (shapePattern === 1) {
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                $("#tempCanvas").css({left: -window.innerWidth, top: 0});
                drawStraightLine(mouseX, mouseY, context);
            }
            if(shapePattern === 2) {
                mouseX = event.clientX -offsetX;
                mouseY = event.clientY - offsetY;
                $("#tempCanvas").css({left: -window.innerWidth, top: 0});
                drawRectangle(mouseX,mouseY,context);
            }
            if(shapePattern === 3) {
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                $("#tempCanvas").css({left: -window.innerWidth, top: 0});
                //set color draw on canvas
                context.strokeStyle = $colorItem.css("background-color");
                drawNextLine(mouseX,mouseY,context);
                //update the end coords
                startX = mouseX;
                startY = mouseY;
                //drawLinkedLine(mouseX,mouseY,context3);
            }
            if(shapePattern === 4) {
                mouseX = event.clientX - offsetX;
                mouseY = event.clientY - offsetY;
                $("#tempCanvas").css({left: -window.innerWidth, top: 0});
                context.strokeStyle = $colorItem.css("background-color");
                drawNextLine(mouseX,mouseY,context);
                startX = mouseX;
                startY = mouseY;
            }
            historyPush();
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
    function  historyPush() {
        cStep++;
        if(cStep < history.length) {
            history.length = cStep;
        }
        history.push($("#canvas").get(0).toDataURL());
    }

    function undo() {
        if(cStep >= 0 ) {
            clearCanvas();
            cStep--;
            var tempImage = new Image();
            tempImage.src = history[cStep];
            tempImage.onload = function() {context.drawImage(tempImage,0,0);};
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

    function clearCanvas() {
        context.clearRect(0,0,canvas.width,canvas.height);
        context3.clearRect(0,0,tempCanvas.width,tempCanvas.height);
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
            console.log("第几个元素：" + that.index());
            var toolsIndex = that.index();
            if (toolsIndex < 6) {
                $MenuItem.children("div:first-child").html(that.html());
            }
            switch (toolsIndex) {
                case 0:
                    //pen
                    eraserTag = false;
                    document.body.classList.add('pointer');
                    canvas.addEventListener("mousedown", mousedown, false);
                    canvas.addEventListener("mousemove", mousemove, false);
                    canvas.addEventListener("mouseup", mouseup, false);
                    startDraw = true;
                    break;
                case 1:
                    //eraser
                    eraserTag = true;
                    shapePattern = 0;
                    $(".shapes").children("div:first-child").html(that.html()); //待改进，这里需要更新shape工具栏为曲线？
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
            switch (toolsIndex) {
                case 0:
                    //curve
                    shapePattern = 0;
                    break;
                case 1:
                    //straight line
                    shapePattern = 1;
                    break;
                case 2:
                    //rectangle
                    shapePattern = 2;
                    break;
                case 3:
                    //polygon
                    shapePattern = 3;
                    break;
                case 4:
                    //broken line 折线
                    console.log("broken line is selected");
                    shapePattern = 4;
                    break;
                case 5:
                    //circle
                    shapePattern = 5;
                    break;
                default:
                    break;
            }
        }
        $MenuItem.removeClass("menu-open");
    });
})(window);