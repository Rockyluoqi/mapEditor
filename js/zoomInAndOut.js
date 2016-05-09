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
var defaultSize = 1;
function zoomIn() {
    updateZoom(0.1);
}

function zoomOut() {
    updateZoom(-0.1);
}

var zoomLevel = 1;

var updateZoom = function(zoom) {
    zoomLevel += zoom;
    var webFrame = require('electron').webFrame;
    webFrame.setZoomFactor(zoomLevel);
};