/**
 * Created by Luoqi on 3/19/2016.
 */
//按比例放大缩小图片
function drawNewImage(img,w,h) {
    var flag = false;
    var image = new Image();
    image.src = img.src;
    if(image.width > 0 &&　image.height > 0) {
        flag = true;
        if(image.width/image.height >= w/h) {
            if(image.width > w) {
                image.width = w;
                image.height = (image.height*w)/image.width;
            }
            else {
                image.width = image.width;
                image.height = image.height;
            }
        }
        else {
            if(image.height > h) {
                image.height = h;
                image.width = (image.width * h)/image.height;
            }
            else {
                image.width = image.width;
                image.height = image.height;
            }
        }
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
        localStorage["bgUrl"] = "/mapEditor/plugin/images/big/image" + num + ".jpg";
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




