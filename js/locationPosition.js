/**
 * Created by Luoqi on 4/5/2016.
 */
/**
 *  A circle represent an abstract point
 */
function CirclePoint(x, y, radius, index) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "";
    this.isSelected = false;
    this.index = index;
    //redundant
    //this.clickTimes = 0;
    //this.selecting = false;
}

//store movePoints
var startPointArray = [];
var locationPointArray = [];

//record the point's index in the startPointArray for reducing a loop
var startIndex = 0;
var locationIndex = 0;
/**
 *
 * @param radius
 * @param contextT
 * @param color
 * @param index
 * @param i avoid click same point and add to Array many times
 */
function drawLocationPoint(radius,contextT,color,index,locationPattern) {
    contextT.beginPath();
    contextT.strokeStyle = "#000000";
    contextT.lineWidth = 1.5;
    contextT.arc(startX,startY,radius,0,2*Math.PI);
    contextT.fillStyle = color;
    contextT.fill();
    contextT.stroke();
    if(index === 1) {
        if(locationPattern === 0) {
            var circle = new CirclePoint(startX, startY, radius, startIndex);
            startIndex += 1;
            startPointArray.push(circle);
        }
        if(locationPattern === 1) {
            var circle = new CirclePoint(startX, startY, radius, locationIndex);
            locationIndex += 1;
            locationPointArray.push(circle);
        }
    }
}

function drawPointCircle(x,y,radius,fillColor,contextT) {
    contextT.beginPath();
    contextT.strokeStyle = "#000000";
    contextT.lineWidth = 1.5;
    contextT.arc(x, y, radius, 0, 2 * Math.PI);
    contextT.fillStyle = fillColor;
    contextT.fill();
    contextT.stroke();
    contextT.closePath();
}

function redrawArray(contextT) {
    for(var i=0;i<startPointArray.length;i++) {
        if(startPointArray[i] != null) {

            if (!startPointArray[i].isSelected) {
                drawPointCircle(startPointArray[i].x, startPointArray[i].y, startPointArray[i].radius, startPointColor, contextT);
            } else {
                drawPointCircle(startPointArray[i].x, startPointArray[i].y, startPointArray[i].radius, selectedColor, contextT);
            }
        }
    }
    for(var i=0;i<locationPointArray.length;i++) {
        if(locationPointArray[i] != null) {
            if (!locationPointArray[i].isSelected) {
                drawPointCircle(locationPointArray[i].x,locationPointArray[i].y,locationPointArray[i].radius,locationPointColor,contextT);
            } else {
                drawPointCircle(locationPointArray[i].x,locationPointArray[i].y,locationPointArray[i].radius,selectedColor,contextT);
            }
        }
    }
}

/**
 * @param contextT
 * @param pattern
 * @param pointArray
 * @param realOrFake use real Array or a copy array
 */
function redrawLocationArray(contextT, pattern, pointArray,realOrFake) {
    for(var i=0;i<pointArray.length;i++) {
        if(pointArray[i] != null) {
            if (pattern === 0) {
                if(realOrFake === 1) {
                    startX = pointArray[i].startPot.x;
                    //console.log(startX);
                    startY = pointArray[i].startPot.y;
                    drawLocationLine(pointArray[i].endPot.x, pointArray[i].endPot.y, contextT, "#00FF7F", 0, pattern);
                    drawLocationPoint(10, contextT, "#00FF7F", 0, pattern);
                }
                if(realOrFake === 0) {
                    drawLocationPoint(pointArray[i].radius, contextT, "#00FF7F", 0, pattern);
                }
            }
            if (pattern === 1) {
                if(realOrFake === 1) {
                    startX = pointArray[i].startPot.x;
                    startY = pointArray[i].startPot.y;
                    drawLocationLine(pointArray[i].endPot.x, pointArray[i].endPot.y, contextT, "#FFA500", 0, pattern);
                    drawLocationPoint(10, contextT, "#FFA500", 0, pattern);
                }
                if(realOrFake === 0) {
                    drawLocationPoint(pointArray[i].radius, contextT, "#FFA500", 0, pattern);
                }
            }
        }
    }
}

var previousSelectedCircle;
var currentLocationPoint;
var currentPointArray;
var currentRealPointArray;
function deleteLocationPoint() {
    //console.log("delete");
    var index = currentLocationPoint.index;
    //console.log(index);

    //prepare delete json data send to server
    if (currentPointArray === startPointArray) {
        deleteInitPosition(index);
    }

    if (currentPointArray === locationPointArray) {
        deletePosition(index);
    }

    currentPointArray[index] = null;
    currentRealPointArray[index] = null;

    //occur some index problems, so give up tentatively
    //currentPointArray.splice(index,index);
    //currentRealPointArray.splice(index,index);

    pointContext.clearRect(0, 0, canvas.width, canvas.height);
    redrawLocationArray(pointContext,0,startPoints,1);
    redrawLocationArray(pointContext,1,locationPoints,1);

    console.log("currentLocationPoint length: "+ currentPointArray.length);
    console.log("currentRealPointArray length: "+ currentRealPointArray.length);
    //for(var i = 0;i<currentRealPointArray.length;i++) {
    //    console.log("currentRealPointArray: "+i+ " coord: "+currentRealPointArray[i].pot.x+" "+currentRealPointArray[i].pot.y);
    //}
    $pointItem.css("top","-2000px");
    $pointItem.css("left", "-2000px");


}

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
//
var angle;
//use for limited length straight line
var sin, cos, a, b, c;
var orientationLength = 40;
/**
 *
 request:
 {
   "angle":-55,
   "gridX":468,
   "gridY":512,
   "mapName":"office",
   "name":"origin",
   "type":1
 }
 */
function drawLocationLine(toX,toY,contextT,color,index,pointPattern) {
    //use for arrow creation
    angle = Math.atan2(toY-startY,toX-startX);

    //startPoint
    if(index === 1 && pointPattern === 0) {
        var startPoint = {
            angle: 0, //PI/2 = 90 degree anticlockwise
            startPot:{x:0,y:0},
            endPot: {x: 0, y: 0}
        };

        startPoint.startPot.x = startX;
        startPoint.startPot.y = startY;
        startPoint.endPot.x = toX;
        startPoint.endPot.y = toY;
        startPoint.angle = -(angle/Math.PI * 180);
        startPoints.push(startPoint);

        //this is the request formation data
        var endPointData = {
            "angle": startPoint.angle,
            "gridX": startX,
            "gridY": startY,
            "mapName": "",
            "name": startPointName,
            "type": 0
        };

        startPointDatas.push(endPointData);
    }
    //locationPoint
    if(index === 1 && pointPattern === 1) {
        var locationPoint = {
            startPot:{x:0,y:0},
            endPot:{x:0,y:0},
            direction:0 //PI/2 = 90 degree anticlockwise
        };

        locationPoint.startPot.x = startX;
        locationPoint.startPot.y = startY;
        locationPoint.endPot.x = toX;
        locationPoint.endPot.y = toY;
        locationPoint.angle = -(angle/Math.PI * 180);
        locationPoints.push(locationPoint);

        //this is the request formation data
        var endPointData = {
            "angle": locationPoint.angle,
            "gridX": startX,
            "gridY": startY,
            "mapName": "",
            "name": startPointName,
            "type": 0
        };

        endPointDatas.push(endPointData);
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

function drawInitPoint(angle, startX, startY, contextT, index) {
    var endX, endY;


    angle = -angle * Math.PI * 180;
}