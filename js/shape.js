/**
 * Created by Luoqi on 4/5/2016.
 */
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
