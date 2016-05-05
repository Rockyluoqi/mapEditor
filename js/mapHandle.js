/**
 * Created by Luoqi on 3/19/2016.
 */
/**
 * unitegallery 12193 playbutton mode setting
 */

$("#mapLoadProgress").css("visibility", "visible");

jQuery(document).ready(function () {

    $.support.cors = true;
    //document.getElementsByClassName("fixed-action-btn").addEventListener("onclick",setImage());

    var imageList = [];
    var urls = [];
    //var urlStart = "http://192.168.1.105:8080";
    var ip = localStorage.getItem('ip');
    var urlStart = "http://" + ip + ":8080";

    var initPoints = [];
    var positionPoints = [];
    var obstacle = [];
    var mapDataArray = [];

    var tempInitPointArray = [];
    var tempPositionPointArray = [];

    var base64Images = [];
    var base64SmallImages = [];
    var imgs = [];

    document.getElementById("refreshBtn").addEventListener('click', refresh);
    document.getElementById("editBtn").addEventListener('click', setImage);

    function initArray() {
        imageList = [];
        urls = [];
        initPoints = [];
        positionPoints = [];
        obstacle = [];
        mapDataArray = [];
        tempInitPointArray = [];
        tempPositionPointArray = [];
        base64Images = [];
        base64SmallImages = [];
        imgs = [];
    }

    var hasDataImagesNum = 0;

    function getImageFromServer() {
        hasDataImagesNum = mapDataArray.length;
        for (var i = 0; i < mapDataArray.length; i++) {
            var url = urlStart + "/gs-robot/data/map_png?map_name=" + mapDataArray[i].title;
            console.log(url);
            urls.push(url);
            $.ajax({
                url: url,
                type: "GET",
                async: false,
                //headers: {
                //    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                //},
                success: function (data) {
                    if (data.length < 100) {
                        hasDataImagesNum = mapDataArray.length - 1;
                    }
                }
            });
        }
    }


    function getInitPoints() {
        for (var i = 0; i < mapDataArray.length; i++) {
            $.ajax({
                url: urlStart + "/gs-robot/data/init_points?map_name=" + mapDataArray[i].title,
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


    function getPositionPoints() {
        for (var i = 0; i < mapDataArray.length; i++) {
            $.ajax({
                url: urlStart + "/gs-robot/data/positions?map_name=" + mapDataArray[i].title,
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


    function getObstacle() {
        for (var i = 0; i < mapDataArray.length; i++) {
            $.ajax({
                url: urlStart + "/gs-robot/data/virtual_obstacles?map_name=" + mapDataArray[i].title,
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
        localStorage.setItem("obstacle", JSON.stringify(obstacle));
    }

    function getImageList() {
        $.ajax({
            url: urlStart + "/gs-robot/data/maps",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (data) {
                console.log(data);
                localStorage["mapList"] = JSON.stringify(data);
            }
        });
    }

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
                "height: " + data.mapInfo.gridHeight + "px width: " + data.mapInfo.gridWidth +
                "px create-time: " + data.createdAt,
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
        console.log(base64Images);
        console.log(base64SmallImages);

        for (var i = 0; i < mapDataArray.length; i++) {
            var imgHtml = document.createElement("img");
            imgHtml.setAttribute("alt", mapDataArray[i].title);
            imgHtml.setAttribute("src", "");
            imgHtml.setAttribute("data-image", "");


            for (var j = 0; j < base64SmallImages.length; j++) {
                if (mapDataArray[i].title === base64SmallImages[j].mapName) {
                    imgHtml.setAttribute("src", base64SmallImages[j].data);
                }
            }

            for (var j = 0; j < base64Images.length; j++) {
                if (mapDataArray[i].title === base64Images[j].mapName) {
                    imgHtml.setAttribute("data-image", base64Images[j].data);

                }
            }

            imgHtml.setAttribute("data-description", mapDataArray[i].dataDescription);
            $("#gallery").append(imgHtml);
            if (i === mapDataArray.length - 1) {
                $("#mapLoadProgress").css("visibility", "hidden");
                jQuery("#gallery").unitegallery({
                    theme_panel_position: "left"
                });
            }
        }


    }

    function refresh() {
        location.reload();
    }

    function setImage() {
        var imgUrl = $(".ug-thumb-selected img").get(0).src;
        var mapName = $(".ug-thumb-selected img").get(0).alt;
        sessionStorage.setItem("mapName", mapName);

        //console.log(imgUrl);

        //切字符,个位数和非个位数
        //var wordArray = imgUrl.split("/");
        //var num = wordArray[wordArray.length - 1].charAt(5);
        //var num2 = wordArray[wordArray.length - 1].charAt(6);
        //num = parseInt(num);
        //num2 = parseInt(num2);
        //if (typeof num2 === 'number' && !isNaN(num2)) {
        //    num = num * 10 + num2;
        //    //console.log(num);
        //}

        for (var i = 0; i < mapDataArray.length; i++) {
            if (mapName === mapDataArray[i].title) {
                localStorage["bgUrl"] = urls[i];
                //console.log(localStorage["bgUrl"]);
            }
        }

        //console.log(num);]
        //跨文件传参常用方法
        //if(num < 99) {
        //localStorage["bgUrl"] = "./res/images/big/image" + num + ".jpg";
        //}


        ////usage:
        //readTextFile("./asset/json/map.json", function (text) {
        //    localStorage["obstacle"] = text;
        //    //console.log(text);
        //});

        //window.open('editorTest3.html', '_self', false);
        location.href = "editorTest3.html";
        //console.log("setImage  "+imgUrl+ wordArray[7] + "  "+num);
    }

    function transObstaclesCoord() {
        var ob = JSON.parse(localStorage.getItem("obstacle"));

        var obs = [];
        console.log(ob);
        //console.log("length："+ob[1].length);
        for (var k = 0; k < mapDataArray.length; k++) {
            if (ob[k].length != 0) {
                console.log(ob[k]);
                var oba = JSON.parse(ob[k]);
                console.log(oba);
                //console.log(k);
                //if(ob[k].lines)
                console.log(oba.mapName);
                for (var j = 0; j < mapDataArray.length; j++) {
                    if (oba.mapName === mapDataArray[j].title) {
                        for (var i = 0; i < oba.obstacles.lines.length; i++) {
                            oba.obstacles.lines[i].start.y = mapDataArray[j].gridHeight - oba.obstacles.lines[i].start.y;
                            oba.obstacles.lines[i].end.y = mapDataArray[j].gridHeight - oba.obstacles.lines[i].end.y;
                        }

                        for (var i = 0; i < oba.obstacles.rectangles.length; i++) {
                            oba.obstacles.rectangles[i].start.y = mapDataArray[j].gridHeight - oba.obstacles.rectangles[i].start.y;
                            oba.obstacles.rectangles[i].end.y = mapDataArray[j].gridHeight - oba.obstacles.rectangles[i].end.y;
                        }

                        for (var i = 0; i < oba.obstacles.circles.length; i++) {
                            oba.obstacles.circles[i].center.y = mapDataArray[j].gridHeight - oba.obstacles.circles[i].center.y;
                        }

                        for (var i = 0; i < oba.obstacles.polygons.length; i++) {
                            var temp = oba.obstacles.polygons[i];
                            for (var j = 0; j < temp.length; j++) {
                                temp[j].y = mapDataArray[j].gridHeight - temp[j].y;
                            }
                        }
                    }
                }
                obs.push(oba);
            } else {
                obs.push("");
            }
        }

        localStorage.setItem("obstacle", JSON.stringify(obs));
        console.log(obs);
    }

    var index = 0;
    var values = [];

    function saveImgLocal() {
        //console.log("saveImgLocal "+mapDataArray.length);
        var canvas = document.getElementById("transCanvas");
        var ctx = canvas.getContext('2d');
        for (var j = 0; j < urls.length; j++) {
            var image = new Image();
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = urls[j];
            imgs.push(image);
            values.push(0);
        }

        var t = JSON.parse(localStorage.getItem("obstacle"));

        //console.log(t);
        var te = [];
        //Handle a problem of some data in the array has no obstacle.
        for (var i = 0; i < t.length; i++) {
            var temp = t[i];
            if (temp === "") {
                te.push("");
            } else {
                //temp = JSON.parse(temp);
                te.push(temp);
            }
        }

        localStorage["obstacle"] = JSON.stringify(te);

        for (var i = 0; i < urls.length; i++) {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.src = urls[i];
            img.onload = (function (value) {
                return function () {
                    canvas.width = imgs[value].width;
                    canvas.height = imgs[value].height;
                    ctx.drawImage(imgs[value], 0, 0);
                    redrawLocationArray(ctx, 0, tempInitPointArray[value], 1);
                    redrawLocationArray(ctx, 1, tempPositionPointArray[value], 1);
                    if (te[value] != "") {
                        drawLineObstacle(te[value].obstacles.lines, ctx);
                        drawRectangleObstacle(te[value].obstacles.rectangles, ctx);
                        drawCircleObstacle(te[value].obstacles.circles, ctx);
                        drawPolygonObstacle(te[value].obstacles.polygons, ctx);
                    }
                    localStorage[mapDataArray[value].title] = canvas.toDataURL('image/png');
                    /**
                     * 这里主要用到name,因为push进入base64中的顺序每次随机变化，暂时还不知道这种变化的原因，所以加入mapName作为唯一标识符
                     * mapName as atom ID
                     * @type {{mapName: *, data: *}}
                     */
                    var t1 = {
                        mapName: mapDataArray[value].title,
                        data: localStorage[mapDataArray[value].title]
                    };
                    console.log(t1);
                    base64Images.push(t1);
                    //values[index] = 1;
                    //index += 1;
                    //console.log("big image:" + mapDataArray[value].title);

                    // 100*56 scalable
                    canvas.width = 400;
                    canvas.height = 224;

                    var image = new Image();
                    image.src = localStorage[mapDataArray[value].title];

                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    localStorage["small" + mapDataArray[value].title] = canvas.toDataURL('image/png');

                    /**
                     * 这里主要用到name,因为push进入base64中的顺序每次随机变化，暂时还不知道这种变化的原因，所以加入mapName作为唯一标识符
                     * mapName as atom ID
                     * @type {{mapName: *, data: *}}
                     */
                    var t2 = {
                        mapName: mapDataArray[value].title,
                        data: localStorage["small" + mapDataArray[value].title]
                    };
                    base64SmallImages.push(t2);
                    //console.log("small image:" + mapDataArray[value].title);
                    //console.log(mapDataArray[value].title + " " + sessionStorage[mapDataArray[value].title]);

                    /**
                     * Because javascript is single threaded, so put the last functions on this place.
                     * It's ugly, but it works.
                     */
                    if (img.hasContent) {
                        console.log("empty");
                    }
                    console.log(base64Images.length);
                    if (img.complete) {
                        console.log(hasDataImagesNum);
                        if (base64Images.length === hasDataImagesNum) {
                            setImageArray();
                        }
                    }
                };
            })(i);

            //ctx.clearRect(0,0,img.width,img.height);
        }

        //for (var i = 0; i < urls.length; i++) {
        //    base64Images.push(localStorage[mapDataArray[i].title]);
        //    base64SmallImages.push(localStorage["small" + mapDataArray[i].title]);
        //}
        //
        //console.log(base64Images.length);
        //console.log(base64SmallImages.length);

        //console.log(base64Images.length);


        //console.log(mapName + " " + localStorage[mapName]);
        //ctx.clearRect(0,0,img.width,img.height);
        //}
        //console.log(localStorage[mapDataArray[3].title]);
        //localStorage["bgUrl"] = localStorage[mapDataArray[3].title];
    }

    // scales the canvas by (float) scale < 1
    // returns a new canvas containing the scaled image.
    function downScaleCanvas(cv, scale) {
        if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
        var sqScale = scale * scale; // square scale = area of source pixel within target
        var sw = cv.width; // source image width
        var sh = cv.height; // source image height
        var tw = Math.floor(sw * scale); // target image width
        var th = Math.floor(sh * scale); // target image height
        var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
        var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
        var tX = 0, tY = 0; // rounded tx, ty
        var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
        // weight is weight of current source point within target.
        // next weight is weight of current source point within next target's point.
        var crossX = false; // does scaled px cross its current px right border ?
        var crossY = false; // does scaled px cross its current px bottom border ?
        var sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
        var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
        var sR = 0, sG = 0, sB = 0; // source's current point r,g,b
        /* untested !
         var sA = 0;  //source alpha  */

        for (sy = 0; sy < sh; sy++) {
            ty = sy * scale; // y src position within target
            tY = 0 | ty;     // rounded : target pixel's y
            yIndex = 3 * tY * tw;  // line index within target array
            crossY = (tY != (0 | ty + scale));
            if (crossY) { // if pixel is crossing botton target pixel
                wy = (tY + 1 - ty); // weight of point within target pixel
                nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
            }
            for (sx = 0; sx < sw; sx++, sIndex += 4) {
                tx = sx * scale; // x src position within target
                tX = 0 | tx;    // rounded : target pixel's x
                tIndex = yIndex + tX * 3; // target pixel index within target array
                crossX = (tX != (0 | tx + scale));
                if (crossX) { // if pixel is crossing target pixel's right
                    wx = (tX + 1 - tx); // weight of point within target pixel
                    nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
                }
                sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 1];
                sB = sBuffer[sIndex + 2];

                /* !! untested : handling alpha !!
                 sA = sBuffer[sIndex + 3];
                 if (!sA) continue;
                 if (sA != 0xFF) {
                 sR = (sR * sA) >> 8;  // or use /256 instead ??
                 sG = (sG * sA) >> 8;
                 sB = (sB * sA) >> 8;
                 }
                 */
                if (!crossX && !crossY) { // pixel does not cross
                    // just add components weighted by squared scale.
                    tBuffer[tIndex] += sR * sqScale;
                    tBuffer[tIndex + 1] += sG * sqScale;
                    tBuffer[tIndex + 2] += sB * sqScale;
                } else if (crossX && !crossY) { // cross on X only
                    w = wx * scale;
                    // add weighted component for current px
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tX+1) px
                    nw = nwx * scale
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                } else if (crossY && !crossX) { // cross on Y only
                    w = wy * scale;
                    // add weighted component for current px
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tY+1) px
                    nw = nwy * scale
                    tBuffer[tIndex + 3 * tw] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                } else { // crosses both x and y : four target points involved
                    // add weighted component for current px
                    w = wx * wy;
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // for tX + 1; tY px
                    nw = nwx * wy;
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                    // for tX ; tY + 1 px
                    nw = wx * nwy;
                    tBuffer[tIndex + 3 * tw] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                    // for tX + 1 ; tY +1 px
                    nw = nwx * nwy;
                    tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                }
            } // end for sx
        } // end for sy

        // create result canvas
        var resCV = document.createElement('canvas');
        resCV.width = tw;
        resCV.height = th;
        var resCtx = resCV.getContext('2d');
        var imgRes = resCtx.getImageData(0, 0, tw, th);
        var tByteBuffer = imgRes.data;
        // convert float32 array into a UInt8Clamped Array
        var pxIndex = 0; //
        for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
            tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
            tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
            tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
            tByteBuffer[tIndex + 3] = 255;
        }
        // writing result to canvas.
        resCtx.putImageData(imgRes, 0, 0);
        return resCV;
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

    function transPointArray() {
        var tempArray = localStorage.getItem("initPoints");
        tempArray = JSON.parse(tempArray);

        var i, j, t;
        for (i = 0; i < tempArray.length; i++) {
            var tt = tempArray[i];
            t = [];
            for (j = 0; j < tt.length; j++) {
                var temp = tt[j];
                var len = 15;
                /**
                 * angle bug fixed
                 * radians = -(angle*PI/180)
                 */
                temp.gridY = mapDataArray[i].gridHeight - temp.gridY;
                var toX = temp.gridX + len * Math.cos(-temp.angle * (Math.PI / 180));
                var toY = temp.gridY + len * Math.sin(-temp.angle * (Math.PI / 180));
                var startPoint = {
                    angle: temp.angle,
                    startPot: {
                        x: temp.gridX,
                        y: temp.gridY
                    },
                    endPot: {
                        x: toX,
                        y: toY
                    },
                    mapName: temp.mapName,
                    name: temp.name
                };
                t.push(startPoint);
            }
            tempInitPointArray.push(t);
        }

        sessionStorage.setItem("initPoints", JSON.stringify(tempInitPointArray));

        //console.log("session " + sessionStorage["initPoints"]);

        tempArray = localStorage.getItem("positionPoints");
        tempArray = JSON.parse(tempArray);

        //console.log(tempArray);

        for (i = 0; i < tempArray.length; i++) {
            var tt = tempArray[i];
            t = [];
            for (j = 0; j < tt.length; j++) {
                var temp = tt[j];
                var len = 15;
                temp.gridY = mapDataArray[i].gridHeight - temp.gridY;
                var toX = temp.gridX + len * Math.cos(-temp.angle * (Math.PI / 180));
                var toY = temp.gridY + len * Math.sin(-temp.angle * (Math.PI / 180));
                var endPoint = {
                    angle: temp.angle,
                    startPot: {
                        x: temp.gridX,
                        y: temp.gridY
                    },
                    endPot: {
                        x: toX,
                        y: toY
                    },
                    mapName: temp.mapName,
                    name: temp.name
                };
                t.push(endPoint);
            }
            tempPositionPointArray.push(t);
        }

        sessionStorage.setItem("positionPoints", JSON.stringify(tempPositionPointArray));
        //console.log(sessionStorage.getItem("positionPoints"));
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
    //function drawLayer() {
    //    drawLineObstacle(lines, context);
    //    drawRectangleObstacle(rectangles, context);
    //    drawPolygonObstacle(polygons, context);
    //    drawCircleObstacle(circles, context);
    //    redrawLocationArray(pointContext, 0, startPoints, 1);
    //    redrawLocationArray(pointContext, 1, locationPoints, 1);
    //}

    function drawLineObstacle(lines, contextT) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i]) {
                contextT.beginPath();
                contextT.lineCap = "round";
                contextT.lineWidth = 1;
                //contextT.lineCap = chosenWidth;
                contextT.strokeStyle = "#000000";
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
                contextT.lineCap = "round";
                contextT.strokeStyle = "#000000";
                contextT.lineWidth = 1;
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
                contextT.lineWidth = 1;
                contextT.strokeStyle = "#000000";
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
                contextT.strokeStyle = "#000000";
                contextT.lineWidth = 1;
                contextT.arc(circles[i].center.x, circles[i].center.y, circles[i].radius, 0, 2 * Math.PI);
                contextT.stroke();
                //console.log(circles[i].center.x + " " + circles[i].center.y);
            }
        }
    }

    function preRun() {
        //init
        sessionStorage.clear();
        initArray();
        //function chain
        getImageList();
        parseMapList();
        getImageFromServer();
        getInitPoints();
        getPositionPoints();
        getObstacle();
        transPointArray();
        transObstaclesCoord();
        //go to image.onload
        saveImgLocal();
    }

    preRun();
});







