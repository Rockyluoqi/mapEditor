/**
 * Created by Luoqi on 3/12/2016.
 */
showCanvas("./js/map.jpg");
function showCanvas(dataUrl) {
    console.info(dataUrl);
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    //加载图片
    var img = new Image();
    img.src = dataUrl;
    canvas.width = img.width;
    canvas.height = img.height;

    //set arrtibutes first then drawImage
    img.onload = function () {
        ctx.drawImage(img, 0, 0, img.width, img.height);
    }

    // document.body.appendChild(img);
}