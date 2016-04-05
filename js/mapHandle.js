/**
 * Created by Luoqi on 3/19/2016.
 */
/**
 * unitegallery 12193 playbutton mode setting
 */
/*//$(document).ready(drawNewImage);
//按比例放大缩小图片
function drawNewImage(obj,w,h) {

    var image = new Image();
    obj.src = "plugin/images/big/image1.jpg"
    image.src = obj.src;
    console.log(image.width);

    if(image.width > 0 &&　image.height > 0) {
        if(image.width/image.height >= w/h) {
            if(image.width > w) {
                obj.width = w;
                obj.height = (image.height * w)/image.width;
            }
            else {
                obj.height = image.height;
                obj.width = image.width;
            }
        }
        else {
            if(image.height > h) {
                obj.height = h;
                obj.width = (image.width * h)/image.height;
            }
            else {
                obj.height = image.height;
                obj.width = image.width;
            }
        }
    }
    console.log(obj.width);
}*/

function getImageArray() {}

function setImageArray() {
    var len = 12;
    //Image Array lenghth, how many maps
    var title = 'Map1 XXXAirport T2 Level2';
    var src = 'res/images/thumbs/thumb1.jpg';
    var dataImage = 'res/images/big/image1.jpg';
    var dataDescription = 'XXXAirport is..., area: XXX  obstacles: XXX';

    for (var i = 0; i < len; i++) {
        var imgHtml = document.createElement("img");
        imgHtml.setAttribute("alt",title+" "+(i+1).toString());
        imgHtml.setAttribute("src",src);
        imgHtml.setAttribute("data-image",dataImage);
        imgHtml.setAttribute("data-description",dataDescription);
        $("#gallery").append(imgHtml);
    }

}

var imageData = {
    width:0,
    height:0,
};

//设置缩略图路径
function setThumbImg(img){
    //直接设置缩略图元素的image-url
}

function setImage() {
    var imgUrl = $(".ug-thumb-selected img").get(0).src;

    //切字符,个位数和非个位数
    var wordArray = imgUrl.split("/");
    var num = wordArray[7].charAt(5);
    var num2 = wordArray[7].charAt(6);
    num = parseInt(num);
    num2 = parseInt(num2);
    if(typeof num2 ==='number' && !isNaN(num2)) {
        num = num * 10 + num2;
        //console.log(num);
    }

    //跨文件传参常用方法
    if(num < 99) {
        localStorage["bgUrl"] = "/mapEditor/res/images/big/image" + num + ".jpg";
    }

    //usage:
    readTextFile("/mapEditor/asset/json/map.json", function(text){
        localStorage["obstacle"] = text;
        //console.log(text);
    });

    window.open('editorTest3.html','_self',false);
    //console.log("setImage  "+imgUrl+ wordArray[7] + "  "+num);
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