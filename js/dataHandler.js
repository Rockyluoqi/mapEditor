/**
 * Created by Luoqi on 4/5/2016.
 */
/**
 * =========================================================================
 *                            wrap data to json
 * =========================================================================
 */
/**
 * It's OK, parse obj to json
 */
var mapJson;
var init_position_data;
var position_data;
var deleteFlag = 0;
var lineIndex = 0;
var rectangleIndex = 0;
var circleIndex = 0;
var polygonIndex = 0;
var urlStart = "http://192.168.1.88:8080";

var map = {
    mapName: "",
    description : "",
    ID : "",
    createDate : "",
    obstacles: obstacles
}

/**
 * deleteBtn onClick function, use the deleteFlag to judge which pattern to delete
 */
function deleteBtnHandler() {
    //delete straight line
    if (deleteFlag === 1) {
        lines[lineIndex] = null;
        deleteNullInArray(lines);
        lines = noneNullArray;
        clearCanvas();
        drawLayer();
        $pointItem.css("top", "-2000px");
        $pointItem.css("left", "-2000px");
    }

    //delete rectangle
    if (deleteFlag === 2) {
        rectangles[rectangleIndex] = null;
        deleteNullInArray(rectangles);
        rectangles = noneNullArray;
        clearCanvas();
        drawLayer();
        $pointItem.css("top", "-2000px");
        $pointItem.css("left", "-2000px");
    }

    //delete polygon
    if (deleteFlag === 3) {
        polygons[polygonIndex] = null;
        deleteNullInArray(polygons);
        polygons = noneNullArray;
        clearCanvas();
        drawLayer();
        $pointItem.css("top", "-2000px");
        $pointItem.css("left", "-2000px");
    }

    //delete circle
    if (deleteFlag === 4) {
        circles[circleIndex] = null;
        deleteNullInArray(circles);
        circles = noneNullArray;
        clearCanvas();
        drawLayer();
        $pointItem.css("top", "-2000px");
        $pointItem.css("left", "-2000px");
    }

    //delete startPoint
    if (deleteFlag === 5) {
        deleteLocationPoint();
    }
}

/**
 * delete null in the array
 */
var noneNullArray;
function deleteNullInArray(array) {
    noneNullArray = [];
    for(var i=0;i<array.length;i++) {
        if(array[i] != null) {
            noneNullArray.push(array[i]);
        }
    }
}

function transToJson() {
    console.log(circles);
    //console.log(canvas.length);
    /**
     * coordination transform
     */

    for (var i = 0; i < lines.length; i++) {
        if (!lines[i].isTrans) {
            lines[i].start.y = canvas.height - lines[i].start.y;
            lines[i].end.y = canvas.height - lines[i].end.y;
            lines[i].isTrans = true;
        }
    }

    for (var i = 0; i < rectangles.length; i++) {
        if (!rectangles[i].isTrans) {
            rectangles[i].start.y = canvas.height - rectangles[i].start.y;
            rectangles[i].end.y = canvas.height - rectangles[i].end.y;
            rectangles[i].isTrans = true;
        }
    }

    for (var i = 0; i < circles.length; i++) {
        if (!circles[i].isTrans) {
            circles[i].center.y = canvas.height - circles[i].center.y;
            circles[i].isTrans = true;
        }
    }

    for (var i = 0; i < polygons.length; i++) {
        var temp = polygons[i];
        for (var j = 0; j < temp.length; j++) {
            if (!temp[j].isTrans) {
                temp[j].y = canvas.height - temp[j].y;
                temp[j].isTrans = true;
            }
        }
    }

    obstacles.lines = lines;
    obstacles.rectangles = rectangles;
    obstacles.polygons = polygons;
    obstacles.circles = circles;
    map.mapName = sessionStorage.getItem("mapName");

    //deleteNullInArray(startPointDatas);
    //startPointDatas = noneNullArray;
    //deleteNullInArray(endPointDatas);
    //endPointDatas = noneNullArray;
    mapJson = JSON.stringify(map);
    //init_position_data = JSON.stringify(startPointDatas);
    //position_data = JSON.stringify(endPointDatas);
    //console.log(map);
}

function sendInitPosition() {
    //deleteNullInArray(startPointDatas);
    //startPointDatas = noneNullArray;

    var pointData = startPointDatas[startPointDatas.length - 1];
    pointData.gridY = canvas.height - pointData.gridY;
    pointData = JSON.stringify(pointData);
    //console.log(pointData);

    $.ajax({
        url: urlStart + "/gs-robot/cmd/init_point/add_init_point",
        type: "POST",
        dataType: "json",
        data: pointData,
        success: function (data) {
            if (data.successed) {
                alert("init_position post successfully!");
            } else {
                alert(data.msg);
            }
        }
    });
}

function sendPosition() {
    //deleteNullInArray(endPointDatas);
    //endPointDatas = noneNullArray;

    var pointData = endPointDatas[endPointDatas.length - 1];
    pointData.gridY = canvas.height - pointData.gridY;
    //console.log(pointData);
    pointData = JSON.stringify(pointData);
    //console.log(pointData);
    $.ajax({
        url: urlStart + "/gs-robot/cmd/position/add_position",
        type: "POST",
        dataType: "json",
        data: pointData,
        success: function (data) {
            if (data.successed) {
                alert("position post successfully!");
            } else {
                alert(data.msg);
            }
        }
    });
}

function deleteInitPosition(index) {
    var pointData = startPointDatas[index - sessionStorage.getItem("originStartLen")];
    //pointData = JSON.stringify(pointData);
    console.log(startPointDatas);
    console.log(index);
    console.log(pointData);
    console.log("delete init point:" + pointData);
    $.ajax({
        url: urlStart + "/gs-robot/cmd/delete_init_point?map_name=" + pointData.mapName + "&init_point_name=" + pointData.name,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.successed) {
                alert("delete init position successfully!");
            }
        }
    });
}

function deletePosition(index) {
    var pointData = endPointDatas[index - sessionStorage.getItem("originLocationLen")];
    //pointData = JSON.stringify(pointData);
    console.log(pointData);
    console.log("delete position point:" + pointData);
    $.ajax({
        url: urlStart + "/gs-robot/cmd/delete_position?map_name=" + pointData.mapName + "&position_name=" + pointData.name,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.successed) {
                alert("delete position successfully!");
            }
        }
    });
}

function sendImageInfo() {
    transToJson();
    console.log(mapJson);

    $.ajax({
        url: urlStart + "/gs-robot/cmd/update_virtual_obstacles",
        type: "POST",
        dataType: "json",
        data: mapJson,
        success: function (data) {
            if (data.successed) {
                alert("obstacle post successfully!");
            }
        }
    });
}

/**
 * =========================================================================
 *   get json and parse to obstacle and draw
 * =========================================================================
 */



var name,url,description;

function drawNewImage(obstacle) {
    //var data = localStorage['obstacle'];
    //var obj = JSON.parse(data);

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

    /**
     * parse circle
     */
    var circles = [];
    tempArray = obj.obstacles.circles;
    var array;
    for(var i=0;i<tempArray.length;i++) {
        var circle = {
            "center": {
                "x": 0,
                "y": 0
            },
            "radius": 0
        }

        circle.center.x = tempArray[i].center.x;
        circle.center.y = tempArray[i].center.y;
        circle.radius = tempArray[i].radius;
        circles.push(circle);
    }
}

function getDataFromGallery() {
    var obstacle = JSON.parse(localStorage["obstacle"]);
    for (var i = 0; i < obstacle.length; i++) {
        if (obstacle[i] != "") {
            if (obstacle[i].mapName === sessionStorage["mapName"]) {
                for (var j = 0; j < obstacle[i].obstacles.lines.length; j++) {
                    lines.push(obstacle[i].obstacles.lines[j]);
                }

                for (var j = 0; j < obstacle[i].obstacles.rectangles.length; j++) {
                    rectangles.push(obstacle[i].obstacles.rectangles[j]);
                }

                for (var j = 0; j < obstacle[i].obstacles.circles.length; j++) {
                    circles.push(obstacle[i].obstacles.circles[j]);
                }

                for (var j = 0; j < obstacle[i].obstacles.polygons.length; j++) {
                    polygons.push(obstacle[i].obstacles.polygons[j]);
                }
            }
        }
    }

    var initPoints = JSON.parse(sessionStorage.getItem("initPoints"));
    ////console.log("initPoints length" + sessionStorage.getItem("initPoints"));
    var positionPoints = JSON.parse(sessionStorage.getItem("positionPoints"));

    for (var i = 0; i < initPoints.length; i++) {
        var temp = initPoints[i];
        for (var j = 0; j < temp.length; j++) {
            if (temp[j].mapName === sessionStorage["mapName"]) {
                startPoints.push(temp[j]);
            }
        }
    }

    for (var i = 0; i < positionPoints.length; i++) {
        var temp = positionPoints[i];
        for (var j = 0; j < temp.length; j++) {
            if (temp[j].mapName === sessionStorage["mapName"]) {
                locationPoints.push(temp[j]);
            }
        }
    }
}

/**
 * you can use drawNewImage, but it adds many loops, so please use this
 */
var defaultColor = "#000000";
function drawLayer() {
    drawLineObstacle(lines,context);
    drawRectangleObstacle(rectangles,context);
    drawPolygonObstacle(polygons, context);
    drawCircleObstacle(circles, context);
    redrawLocationArray(pointContext, 0, startPoints, 1);
    redrawLocationArray(pointContext, 1, locationPoints, 1);
}

function drawLayerFirst() {
    startIndex = startPoints.length;
    sessionStorage.setItem("originStartLen", startIndex);
    locationIndex = locationPoints.length;
    sessionStorage.setItem("originLocationLen", locationIndex);
    drawLineObstacle(lines, context);
    drawRectangleObstacle(rectangles, context);
    drawPolygonObstacle(polygons, context);
    drawCircleObstacle(circles, context);
    redrawLocationArrayFirst(pointContext, 0, startPoints, 1);
    redrawLocationArrayFirst(pointContext, 1, locationPoints, 1);
}

function drawLineObstacle(lines,contextT) {
    for(var i = 0;i<lines.length;i++) {
        if(lines[i]) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            //contextT.strokeStyle = $colorItem.css("background-color");
            contextT.strokeStyle = defaultColor;
            contextT.moveTo(lines[i].start.x, lines[i].start.y);
            contextT.lineTo(lines[i].end.x, lines[i].end.y);
            contextT.stroke();
        }
    }
}

function drawRectangleObstacle(rectangles,contextT) {
    for(var i = 0;i<rectangles.length;i++) {
        if(rectangles[i]) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.strokeStyle = $colorItem.css("background-color");
            contextT.strokeStyle = defaultColor;

            //is fill color rect
            //contextT.fillRect(startX,startY,toX-startX,toY-startY);
            contextT.strokeRect(rectangles[i].start.x, rectangles[i].start.y,
                rectangles[i].end.x - rectangles[i].start.x,
                rectangles[i].end.y - rectangles[i].start.y);
        }
    }
}

function drawPolygonObstacle(polygons,contextT) {
    for(var i = 0;i < polygons.length;i++) {
        if (polygons[i]) {
            var polygon = polygons[i];
            contextT.beginPath();
            //contextT.strokeStyle = $colorItem.css("background-color");
            contextT.strokeStyle = defaultColor;

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
}

function drawCircleObstacle(circles,contextT) {
    for(var i = 0;i<circles.length;i++) {
        if(circles[i]) {
            contextT.beginPath();
            //contextT.strokeStyle = $colorItem.css("background-color");
            contextT.strokeStyle = defaultColor;
            contextT.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
            contextT.stroke();
        }
    }
}