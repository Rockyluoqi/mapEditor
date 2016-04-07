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

var map = {
    name : "",
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
    obstacles.lines = lines;
    obstacles.rectangles = rectangles;
    obstacles.polygons = polygons;
    obstacles.circles = circles;

    deleteNullInArray(startPointDatas);
    startPointDatas = noneNullArray;
    deleteNullInArray(endPointDatas);
    endPointDatas = noneNullArray;

    mapJson = JSON.stringify(map);
    init_position_data = JSON.stringify(startPointDatas);
    position_data = JSON.stringify(endPointDatas);
    //console.log(map);
}

function sendInitPosition() {
    deleteNullInArray(startPointDatas);
    startPointDatas = noneNullArray;

    var pointData = startPointDatas[startPointDatas.length - 1];
    pointData = JSON.stringify(pointData);

    $.ajax({
        url: "http://192.168.1.103:8080/gs-robot/cmd/init_point/add_init_point",
        type: "POST",
        dataType: "json",
        data: pointData,
        success: function (data) {
            if (data.status === "success") {
                alert("init_position post successfully!");
            }
        }
    });
}

function sendPosition() {
    deleteNullInArray(endPointDatas);
    endPointDatas = noneNullArray;

    var pointData = endPointDatas[endPointDatas.length - 1];
    pointData = JSON.stringify(pointData);
    console.log(pointData);
    $.ajax({
        url: "http://192.168.1.103:8080/gs-robot/cmd/position/add_position",
        type: "POST",
        dataType: "json",
        data: pointData,
        success: function (data) {
            if (data.status === "success") {
                alert("position post successfully!");
            }
        }
    });
}

function deleteInitPosition() {
    deleteNullInArray(startPointDatas);
    startPointDatas = noneNullArray;
}

function deletePosition() {

}

function sendImageInfo() {
    transToJson();

    $.ajax({
        url: "/gs-robot/cmd/init_point/add_init_point",
        type: "POST",
        dataType: "json",
        data: init_position_data,
        success: function (data) {
            if (data.status === "success") {
                alert("init_position post successfully!");
            }
        }
    });

    $.ajax({
        url: "/gs-robot/cmd/position/add_position",
        type: "POST",
        dataType: "json",
        data: position_data,
        success: function (data) {
            if (data.status === "success") {
                alert("init_position post successfully!");
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

/**
 * you can use drawNewImage, but it adds many loops, so please use this
 */
function drawLayer() {
    drawLineObstacle(lines,context);
    drawRectangleObstacle(rectangles,context);
    drawPolygonObstacle(polygons, context);
    drawCircleObstacle(circles, context);
    redrawLocationArray(pointContext, 0, startPoints, 1);
    redrawLocationArray(pointContext, 1, locationPoints, 1);
}

function drawLineObstacle(lines,contextT) {
    for(var i = 0;i<lines.length;i++) {
        if(lines[i]) {
            contextT.beginPath();
            contextT.lineCap = "round";
            //contextT.lineCap = chosenWidth;
            contextT.strokeStyle = $colorItem.css("background-color");
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
            context.lineCap = "round";
            contextT.strokeStyle = $colorItem.css("background-color");
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
}

function drawCircleObstacle(circles,contextT) {
    for(var i = 0;i<circles.length;i++) {
        if(circles[i]) {
            contextT.beginPath();
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
            contextT.stroke();
        }
    }
}