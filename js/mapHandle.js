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
    console.log("hehehehe");
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

function getImageList() {
    $.ajax({
        url: "http://192.168.1.103:8080/gs-robot/data/maps",
        type: "GET",
        dataType: "json",
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
        imgHtml.setAttribute("src", urls[i]);
        imgHtml.setAttribute("data-image", urls[i]);
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

    //usage:
    readTextFile("./asset/json/map.json", function (text) {
        localStorage["obstacle"] = text;
        //console.log(text);
    });

    window.open('editorTest3.html', '_self', false);
    //console.log("setImage  "+imgUrl+ wordArray[7] + "  "+num);
}


function saveImgLocal() {
    var canvas = document.getElementById("transCanvas");
    var context = canvas.getContext('2d');

    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = urls[3];
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        //context.translate(img.width-1,img.height-1);
        context.drawImage(img, 0, 0, img.width, img.height);
        localStorage[mapDataArray[3].title] = canvas.toDataURL("image/png");
    }

    //console.log(localStorage[mapDataArray[3].title]);
    //localStorage["bgUrl"] = localStorage[mapDataArray[3].title];
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function change() {
    $(".ug-thumb-image").css("top", "0px");
}