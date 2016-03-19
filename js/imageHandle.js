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

//设置缩略图路径
function setThumbImg(img){
    //直接设置缩略图元素的image-url
}

function setImage() {
    var imgUrl = $(".ug-thumb-selected img").get(0).src;

    //切字符,机智
    var wordArray = imgUrl.split("/");
    var num = wordArray[7].charAt(5);
    //跨文件传参常用方法
    localStorage["bgUrl"] = "/mapEditor/plugin/images/big/image"+num+".jpg";
    window.open('editorTest3.html','_self',false);
    console.log("setImage  "+imgUrl+ wordArray[7] + "  "+num);
}


