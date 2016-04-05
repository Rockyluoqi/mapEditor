/**
 * Created by Luoqi on 4/5/2016.
 */
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


