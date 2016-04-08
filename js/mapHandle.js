/**
 * Created by Luoqi on 3/19/2016.
 */
/**
 * unitegallery 12193 playbutton mode setting
 */
$.support.cors = true;


var imageList = [];
var urls = [];

function getImageFromServer() {
    for (var i = 0; i < mapDataArray.length; i++) {
        var url = "http://192.168.1.103:8080/gs-robot/data/map_png?map_name=" + mapDataArray[i].title;
        console.log(url);
        urls.push(url);
    }


    //$.ajax({
    //    url: "http://192.168.1.103:8080/gs-robot/data/map_png?map_name="+"ssc6",
    //    type: "GET",
    //    //headers: {
    //    //    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    //    //},
    //    success: function(data){
    //        localStorage["ssc6"] = data;
    //        console.log(data);
    //        document.getElementById("test").src = "data:image/png;base64,"+data;
    //    }
    //});
}
var initPoints = [];
function getInitPoints() {
    for (var i = 0; i < mapDataArray.length; i++) {
        $.ajax({
            url: "http://192.168.1.103:8080/gs-robot/data/init_points?map_name=" + mapDataArray[i].title,
            type: "GET",
            async: false,
            dataType: "json",
            success: function (data) {
                if (data.successed) {
                    initPoints.push(data.data);
                }
            }
        });
    }
    localStorage.setItem("initPoints", JSON.stringify(initPoints));
}

var positionPoints = [];
function getPositionPoints() {
    for (var i = 0; i < mapDataArray.length; i++) {
        $.ajax({
            url: "http://192.168.1.103:8080/gs-robot/data/positions?map_name=" + mapDataArray[i].title,
            type: "GET",
            dataType: "json",
            async: false,
            success: function (data) {
                if (data.successed) {
                    positionPoints.push(data.data);
                }
            }
        });
    }
    localStorage.setItem("positionPoints", JSON.stringify(positionPoints));
}

var obstacle = [];
function getObstacle() {
    for (var i = 0; i < mapDataArray.length; i++) {
        $.ajax({
            url: "http://192.168.1.103:8080/gs-robot/data/virtual_obstacles?map_name=" + mapDataArray[i].title,
            type: "GET",
            dataType: "json",
            async: false,
            success: function (data) {
                if (data.successed) {
                    //alert("obstacle success");
                    obstacle.push(data.data);
                }
            }
        });
    }
}

function getImageList() {
    $.ajax({
        url: "http://192.168.1.103:8080/gs-robot/data/maps",
        type: "GET",
        dataType: "json",
        async: false,
        success: function (data) {
            localStorage["mapList"] = JSON.stringify(data);
        }
    });
}

var mapDataArray = [];

function parseMapList() {
    //readTextFile("./asset/json/mapList.json", function(text){
    //    localStorage["mapList"] = text;
    //});
    var jsonText = localStorage["mapList"];
    //console.log(jsonText);
    var obj = JSON.parse(jsonText);
    var tempArray = obj.data;
    for (var i = 0; i < tempArray.length; i++) {
        var data = tempArray[i];
        var map = new _map(data.name,
            "",
            "",
            data.name + " " + "height:" + data.mapInfo.gridHeight + " widthL " + data.mapInfo.gridWidth +
            " create time: " + data.createdAt,
            data.mapInfo.gridHeight,
            data.mapInfo.gridWidth,
            data.createdAt,
            data.id
        );
        mapDataArray.push(map);
    }
}

function _map(name, src, dataImage, dataDescription, height, width, time, id) {
    this.title = name;
    this.src = src;
    this.dataImage = src;
    this.dataDescription = dataDescription;
    this.gridHeight = height;
    this.gridWidth = width;
    this.createdAt = time;
    this.id = id;
}

function setImageArray() {
    //var len = 12;
    ////Image Array lenghth, how many maps
    //var title = 'Map1 XXXAirport T2 Level2';
    var src = 'res/images/thumbs/thumb1.jpg';
    //var src = 'res/images/big/image1.jpg';
    var dataImage = 'res/images/big/image1.jpg';
    //var dataDescription = 'XXXAirport is..., area: XXX  obstacles: XXX';

    for (var i = 0; i < mapDataArray.length; i++) {
        var imgHtml = document.createElement("img");
        imgHtml.setAttribute("alt", mapDataArray[i].title);
        imgHtml.setAttribute("src", base64Images[i]);
        imgHtml.setAttribute("data-image", base64Images[i]);
        imgHtml.setAttribute("data-description", mapDataArray[i].dataDescription);
        $("#gallery").append(imgHtml);
    }
}

var imageData = {
    width:0,
    height: 0
};

//设置缩略图路径
function setThumbImg(img){
    //直接设置缩略图元素的image-url
}

function setImage() {
    var imgUrl = $(".ug-thumb-selected img").get(0).src;

    console.log(imgUrl);

    //切字符,个位数和非个位数
    var wordArray = imgUrl.split("/");
    var num = wordArray[wordArray.length - 1].charAt(5);
    var num2 = wordArray[wordArray.length - 1].charAt(6);
    num = parseInt(num);
    num2 = parseInt(num2);
    if(typeof num2 ==='number' && !isNaN(num2)) {
        num = num * 10 + num2;
        //console.log(num);
    }

    localStorage["bgUrl"] = imgUrl;

    //console.log(num);
    //跨文件传参常用方法
    //if(num < 99) {
    //localStorage["bgUrl"] = "./res/images/big/image" + num + ".jpg";
    //}


    console.log(localStorage["bgUrl"]);

    ////usage:
    //readTextFile("./asset/json/map.json", function (text) {
    //    localStorage["obstacle"] = text;
    //    //console.log(text);
    //});

    window.open('editorTest3.html', '_self', false);
    //console.log("setImage  "+imgUrl+ wordArray[7] + "  "+num);
}

var base64Images = [];
var imgs = [];

function saveImgLocal() {
    //console.log("saveImgLocal "+mapDataArray.length);
    var canvas = document.getElementById("transCanvas");
    var ctx = canvas.getContext('2d');


    for (var j = 0; j < urls.length; j++) {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = urls[j];
        imgs.push(image);
    }

    for (var i = 0; i < urls.length; i++) {
        var img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        //localStorage[mapName] = "";
        console.log(urls[i]);
        img.src = urls[i];

        img.onload = (function (value) {
            //ctx.translate(img.width-1,img.height-1);
            return function () {
                canvas.width = imgs[value].width;
                canvas.height = imgs[value].height;
                ctx.drawImage(imgs[value], 0, 0);
                redrawLocationArray(ctx, 0, tempInitPointArray[value], 1);
                redrawLocationArray(ctx, 1, tempPositionPointArray[value], 1);
                if (obstacle[value].obstacles != null) {
                    var obs = JSON.parse(obstacle[value]);
                    if (obs.obstacles) {
                        drawCircleObstacle(obstacle[value].data.obstacles.circles, ctx);
                        console.log("ob");
                    }
                }
                //console.log(value);
                localStorage[mapDataArray[value].title] = canvas.toDataURL('image/png');
                //console.log(mapDataArray[value].title + " " + sessionStorage[mapDataArray[value].title]);
            };
            //console.log("get base 64 image "+getBase64Image(img));
            //console.log("get base 64 image "+getBase64Image(img));
        })(i);
        base64Images.push(localStorage[mapDataArray[i].title]);
        //ctx.clearRect(0,0,img.width,img.height);
    }

    //console.log(base64Images.length);


    //console.log(mapName + " " + localStorage[mapName]);
    //ctx.clearRect(0,0,img.width,img.height);
    //}
    //console.log(localStorage[mapDataArray[3].title]);
    //localStorage["bgUrl"] = localStorage[mapDataArray[3].title];
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL;
}


var tempInitPointArray = [];
var tempPositionPointArray = [];
function transPointArray() {
    var tempArray = localStorage.getItem("initPoints");
    tempArray = JSON.parse(tempArray);

    var t;
    var i, j, t;
    for (i = 0; i < tempArray.length; i++) {
        var tt = tempArray[i];
        t = [];
        for (j = 0; j < tt.length; j++) {
            var temp = tt[j];
            var len = 15;
            var toX = temp.gridX + len * Math.cos(temp.angle);
            var toY = temp.gridY + len * Math.sin(temp.angle);
            var startPoint = {
                angle: temp.angle,
                startPot: {
                    x: temp.gridX,
                    y: temp.gridY
                },
                endPot: {
                    x: toX,
                    y: toY
                }
            };
            t.push(startPoint);
        }
        tempInitPointArray.push(t);
    }


    tempArray = localStorage.getItem("positionPoints");
    tempArray = JSON.parse(tempArray);

    console.log(tempArray);

    for (i = 0; i < tempArray.length; i++) {
        var tt = tempArray[i];
        t = [];
        for (j = 0; j < tt.length; j++) {
            var temp = tt[j];
            var len = 15;
            var toX = temp.gridX + len * Math.cos(temp.angle);
            var toY = temp.gridY + len * Math.sin(temp.angle);
            var endPoint = {
                angle: temp.angle,
                startPot: {
                    x: temp.gridX,
                    y: temp.gridY
                },
                endPot: {
                    x: toX,
                    y: toY
                }
            };
            t.push(endPoint);
        }
        tempPositionPointArray.push(t);
    }

    console.log(tempPositionPointArray);
}

//function readTextFile(file, callback) {
//    var rawFile = new XMLHttpRequest();
//    rawFile.overrideMimeType("application/json");
//    rawFile.open("GET", file, true);
//    rawFile.onreadystatechange = function() {
//        if (rawFile.readyState === 4 && rawFile.status == "200") {
//            callback(rawFile.responseText);

//        }
//    }
//    rawFile.send(null);
//}

function change() {
    $(".ug-thumb-image").css("top", "0px");
}


/**
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 * ========================================================================
 */
var name, url, description;

function drawNewImage() {
    var data = localStorage['obstacle'];
    var obj = JSON.parse(data);

    name = obj.mapName;
    url = obj.url;
    description = obj.description;
    console.log(name + " " + url + " " + description);

    var tempArray;

    /**
     * parse lines
     */
    var lines = [];
    tempArray = obj.obstacles.lines;
    for (var i = 0; i < tempArray.length; i++) {
        //console.log(tempArray[i].start.x+" "+tempArray[i].start.y)
        var startPot = {"x": 0, "y": 0};
        startPot.x = tempArray[i].start.x;
        startPot.y = tempArray[i].start.y;
        var endPot = {"x": 0, "y": 0};
        endPot.x = tempArray[i].end.x;
        endPot.y = tempArray[i].end.y;
        var line = {
            "start": startPot,
            "end": endPot
        };
        line.start = startPot;
        line.end = endPot;

        lines.push(line);
    }

    //for(var i = 0;i<lines.length;i++) {
    //    console.log(lines[i].start.x+ " " + lines[i].start.y);
    //    console.log(lines[i].end.x+ " " + lines[i].end.y);
    //}

    drawLineObstacle(lines, context);

    /**
     * parse rectangle
     */
    var rectangles = [];
    tempArray = obj.obstacles.rectangles;
    for (var i = 0; i < tempArray.length; i++) {
        //console.log(tempArray[i].start.x+" "+tempArray[i].start.y)
        var startPot = {"x": 0, "y": 0};
        startPot.x = tempArray[i].start.x;
        startPot.y = tempArray[i].start.y;
        var endPot = {"x": 0, "y": 0};
        endPot.x = tempArray[i].end.x;
        endPot.y = tempArray[i].end.y;
        var rectangle = {
            "start": startPot,
            "end": endPot
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

    drawRectangleObstacle(rectangles, context);

    /**
     * parse polygon
     */
    var polygons = [];
    tempArray = obj.obstacles.polygons;
    var array;
    for (var j = 0; j < tempArray.length; j++) {
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

    drawPolygonObstacle(polygons, context);

    /**
     * parse circle
     */
    var circles = [];
    tempArray = obj.obstacles.circles;
    var array;
    for (var i = 0; i < tempArray.length; i++) {
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
    drawLineObstacle(lines, context);
    drawRectangleObstacle(rectangles, context);
    drawPolygonObstacle(polygons, context);
    drawCircleObstacle(circles, context);
    redrawLocationArray(pointContext, 0, startPoints, 1);
    redrawLocationArray(pointContext, 1, locationPoints, 1);
}

function drawLineObstacle(lines, contextT) {
    for (var i = 0; i < lines.length; i++) {
        if (lines[i]) {
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

function drawRectangleObstacle(rectangles, contextT) {
    for (var i = 0; i < rectangles.length; i++) {
        if (rectangles[i]) {
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

function drawPolygonObstacle(polygons, contextT) {
    for (var i = 0; i < polygons.length; i++) {
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

function drawCircleObstacle(circles, contextT) {
    for (var i = 0; i < circles.length; i++) {
        if (circles[i]) {
            contextT.beginPath();
            contextT.strokeStyle = $colorItem.css("background-color");
            contextT.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
            contextT.stroke();
        }
    }
}