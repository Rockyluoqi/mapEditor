/**
 * Created by Luoqi on 3/14/2016.
 * 这里是主Js文件，实现toolbar的动态选择，以及Canvas中的绘图
 * 需要实现的功能单子
 * 1、橡皮擦 KO
 * 2、直线、矩形绘图
 * 3、读图出图网络接口
 * 4、坐标的网络交互
 */
;(function (window) {
    var $modalIndicator = $(".modal-indicator");
    var $subMenuItem = $(".sub-menu").find(".menu-item");
    var $fileInput = $("#fileInput");
    var imgObjArr = [];
    var startDraw = true;
    var eraserTag = false;
    var isLargeImg = false;
    var command = 1;
    var x1, y1, a = 30;
    var imgScale = 1;
    var widthScale = 1;
    var heightScale = 1;
    var resized = false;

    //undo and redo
    var history = new Array();
    var cStep = -1;

    var bg_image = new Image();
    bg_image.src = "./js/map.jpg";
    var curWidth, curHeight, tempWidth, tempHeight;

    //canvas part
    var canvas = document.getElementById("canvas");
    var netherCanvas = document.getElementById("netherCanvas"); //底层Canvas
    var context = null;
    var context2 = null;
    netherCanvas.setAttribute('zIndex',-1);

    setDefaultSize(bg_image);

    var position = {x: curWidth / 2, y: curHeight / 2};
    var mouse = {x: 0, y: 0, down: false};
    document.body.classList.add('pointer');

    if (canvas.getContext) {
        context = canvas.getContext("2d");
        context2 = netherCanvas.getContext("2d");

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
        var chosenWidth = 0;                                          // 选中的画笔大小
        var $offest = $(canvas).offset();                             // canvas 偏移值
        var docScrollLeft = document.documentElement.scrollLeft;
        var docScrollTop = document.documentElement.scrollTop;
        var moveLeft = docScrollLeft - $offest.left;                  // 最终偏移x
        var moveTop = docScrollTop - $offest.top;                     // 最终偏移y
        var thisgl = context.globalCompositeOperation;

        function draw() {
            window.xscroll
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

        function mousemove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            draw();
        }

        function mousedown(event) {
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

        function mouseup() {
            historyPush();
            mouse.down = false;
        }
    }

    function getImage(url) {

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
            return true;
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
            } else if (heightScale < widthScale) {
                imgScale = 1 / widthScale;
                tempWidth = window.innerWidth;
                tempHeight = curHeight * imgScale;
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
            } else {
                imgScale = 1 / widthScale;
                tempWidth = curWidth * imgScale;
                tempHeight = curHeight * imgScale;
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
            }
        } else {
            heightScale = window.innerHeight / curHeight;
            widthScale = window.innerWidth / curWidth;

            if (heightScale < widthScale) {
                tempHeight = window.innerHeight;
                tempWidth = curWidth * heightScale;
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
            } else if (heightScale > widthScale) {
                tempWidth = window.innerWidth;
                tempHeight = curHeight * widthScale;
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
            } else {
                bg_image.onload = function () {
                    context2.drawImage(bg_image, 0, 0, bg_image.width, bg_image.height, 0, 0, tempWidth, tempHeight);
                }
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

    //3.16 Clear the canvas
    function clearCanvas() {
        context.clearRect(0,0,canvas.width,canvas.height);
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
        else {
            console.log("第几个元素：" + that.index());
            var toolsIndex = that.index();
            if (toolsIndex < 4) {
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
                    //eraserTag = true;
                    tapClip();
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
        }

        $MenuItem.removeClass("menu-open");
    });
})(window);