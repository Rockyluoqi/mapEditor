/**
 * Created by Luoqi on 4/9/2016.
 */
var zoomInScale = 1.05;
var zoomOutScale = 1;
var Scales = [];
var outScales = [];

var zoomInTimes = 0;
var zoomOutTimes = 0;
var flag1 = false, flag2 = false;
function zoomIn() {
    if (zoomInScale >= 1 && zoomInScale < 1.5) {
        zoomInTimes += 1;
        zoomInScale *= zoomInScale;
        Scales.push(zoomInScale);
        console.log(zoomInScale);
        //canvas.width = canvas.width * zoomInScale;
        //netherCanvas.width = netherCanvas.width * zoomInScale;
        //tempCanvas.width = tempCanvas.width * zoomInScale;
        //pointCanvas.width = pointCanvas.width * zoomInScale;
        //
        //canvas.height = canvas.height * zoomInScale;
        //netherCanvas.height = netherCanvas.height * zoomInScale;
        //tempCanvas.height = tempCanvas.height * zoomInScale;
        //pointCanvas.height = pointCanvas.height * zoomInScale;

        context.scale(zoomInScale, zoomInScale);
        context2.scale(zoomInScale, zoomInScale);
        context3.scale(zoomInScale, zoomInScale);
        pointContext.scale(zoomInScale, zoomInScale);

        context2.drawImage(bg_image, 0, 0, canvas.width, canvas.height);

        clearCanvas();

        drawLayer();
    }
}

function zoomOut() {
    if (zoomInTimes >= 1) {
        zoomInTimes -= 1;
        zoomOutScale = 1 / Scales.pop();

        console.log(zoomOutScale);
        //canvas.width = canvas.width * scale;
        //netherCanvas.width = netherCanvas.width * scale;
        //tempCanvas.width = tempCanvas.width * scale;
        //pointCanvas.width = pointCanvas.width * scale;
        //
        //canvas.height = canvas.height * scale;
        //netherCanvas.height = netherCanvas.height * scale;
        //tempCanvas.height = tempCanvas.height * scale;
        //pointCanvas.height = pointCanvas.height * scale;

        context.scale(zoomOutScale, zoomOutScale);
        context2.scale(zoomOutScale, zoomOutScale);
        context3.scale(zoomOutScale, zoomOutScale);
        pointContext.scale(zoomOutScale, zoomOutScale);

        context2.drawImage(bg_image, 0, 0, canvas.width, canvas.height);

        clearCanvas();
        //context2.drawImage(bg_image, 0, 0, canvas.width, canvas.height);

        drawLayer();
    }
}