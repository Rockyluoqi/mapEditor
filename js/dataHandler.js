/**
 * Created by Luoqi on 4/5/2016.
 */

/**
 * It's OK, parse obj to json
 */
var mapJson;
var map = {
    name : "",
    description : "",
    ID : "",
    createDate : "",
    obstacles:obstacles,
    movePoints: movePoints
}

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

    deleteNullInArray(startPoints);
    movePoints.startPoints = noneNullArray;
    deleteNullInArray(locationPoints);
    movePoints.locationPoints = noneNullArray;

    mapJson = JSON.stringify(map);
    //console.log(map);
}


/**
 * =========================================================================
 *
 * =========================================================================
 */

function sendImageInfo() {
    transToJson();

    $.ajax({
        url:"",
        type:"POST",
        data:obstaclesJson,
        success:function(data) {
            alert("send success");
        }
    });
}

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
}

function drawLineObstacle(lines,contextT) {
    for(var i = 0;i<lines.length;i++) {
        contextT.beginPath();
        contextT.lineCap = "round";
        //contextT.lineCap = chosenWidth;
        contextT.strokeStyle = $colorItem.css("background-color");
        contextT.moveTo(lines[i].start.x, lines[i].start.y);
        contextT.lineTo(lines[i].end.x, lines[i].end.y);
        contextT.stroke();
    }
}

function drawRectangleObstacle(rectangles,contextT) {
    for(var i = 0;i<rectangles.length;i++) {
        contextT.beginPath();
        context.lineCap = "round";
        contextT.strokeStyle = $colorItem.css("background-color");
        //is fill color rect
        //contextT.fillRect(startX,startY,toX-startX,toY-startY);
        contextT.strokeRect(rectangles[i].start.x,rectangles[i].start.y ,
            rectangles[i].end.x- rectangles[i].start.x,
            rectangles[i].end.y- rectangles[i].start.y);
    }
}

function drawPolygonObstacle(polygons,contextT) {
    for(var i = 0;i < polygons.length;i++) {
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

function drawCircleObstacle(circles,contextT) {
    for(var i = 0;i<circles.length;i++) {
        contextT.beginPath();
        contextT.strokeStyle = $colorItem.css("background-color");
        contextT.arc(startX,startY,radius,0,2*Math.PI);
        contextT.stroke();
    }
}