document.ondragstart=function()//禁止ie拖拽
{
    return false;
}
var bdrawed = 0;
//绘图层
var canvas = document.getElementById("canvas");
//橡皮层
var canvasTop = document.getElementById("canvasTop");
//画笔颜色
var colorValue = "#000000";
//画笔粗细
var size = 10;
//0 pen 1 eraser
var state = 0;
//0 false 1 true
var beMouseDown = 0;
//设置canvas属性
canvas.width=window.innerWidth;
canvas.height=window.innerHeight-50;
canvasTop.width=window.innerWidth;
canvasTop.height=window.innerHeight-50;

//上一次触摸点
var lastX;
var lastY;

//获取画笔
var ctx =canvas.getContext("2d");
var ctx1 =canvasTop.getContext("2d");

//透明度
ctx.globalAlpha = 1/2;
ctx1.globalAlpha = 1/2;

//设置画笔属性
ctx.lineWidth=size;//画笔粗细
ctx.strokeStyle=colorValue;//画笔颜色

window.onload=function(){
    //reurl();
    bdrawed = 0;
    //是否支持触摸
    var touchable = 'createTouch' in document;
    if (touchable) {
        //触屏事件
        canvas.addEventListener('touchstart', onTouchStart, false);
        canvas.addEventListener('touchmove', onTouchMove, false);
        canvas.addEventListener('touchend', onTouchEnd, false);

        canvasTop.addEventListener('touchstart', onTouchStart, false);
        canvasTop.addEventListener('touchmove', onTouchMove, false);
        canvasTop.addEventListener('touchend', onTouchEnd, false);
    }
    else
    {
        //浏览器鼠标事件
        canvasTop.addEventListener('mousemove', onMouseMove, false);
        canvasTop.addEventListener('mouseup', onMouseUp, false);
        canvasTop.addEventListener('mousedown', onMouseDown, false);
    }

}

function reurl(){//刷新页面一次
    url = location.href; //把当前页面的地址赋给变量 url
    var times = url.split("&"); //分切变量 url 分隔符号为 "?"
    if(times[1] != 1){ //如果?后的值不等于1表示没有刷新
        url += "&1"; //把变量 url 的值加入 ?1

        //alert(url);
        self.location.replace(url); //刷新页面
    }
}

//鼠标按下事件
function onMouseDown(event){
    event.preventDefault();
    bdrawed =1;
    beMouseDown = 1;
    lastX=event.clientX;
    lastY=event.clientY;
    ctx.strokeStyle=colorValue;//画笔颜色
    ctx.lineWidth=size;

    if(state>0)
    {
        clean(lastX,lastY);
        //橡皮绘制，在canvasTop层
        drawEreser(lastX,lastY);
    }
    else
    {
        drawRound(lastX,lastY);//橡皮
    }
}

//鼠标抬起事件
function onMouseUp(event){
    beMouseDown = 0;
    if(state>0)
    {
        //清理canvasTop层
        ctx1.clearRect(0,0,canvasTop.width,canvasTop.height);
    }
}

//鼠标滑动事件
function onMouseMove(event){
    if(beMouseDown<1){return;}
    try
    {
        event.preventDefault();
        if(state>0)
        {
            clean(lastX,lastY);
            drawEreser(lastX,lastY,size,size);
            //drawEreser(event.clientX,event.clientY);
        }
        else
        {
            drawLine(lastX,lastY,event.clientX,event.clientY);
        }
        lastX=event.clientX;
        lastY=event.clientY;

    }
    catch(err){
        alert( err.description);
    }
}

//触摸开始事件
function onTouchStart(event) {
    //alert('touch');
    bdrawed =1;
    event.preventDefault();
    lastX=event.touches[0].clientX;
    lastY=event.touches[0].clientY;
    ctx.strokeStyle=colorValue;//画笔颜色
    ctx.lineWidth=size;

    if(state>0)
    {
        clean(lastX,lastY);
        drawEreser(lastX,lastY);
    }
    else
    {
        drawRound(lastX,lastY);//橡皮
    }
}


//触摸滑动事件
function onTouchMove(event) {
    try
    {
        event.preventDefault();
        if(state>0)
        {
            clean(lastX,lastY);
            drawEreser(lastX,lastY,size,size);
        }
        else
        {
            drawLine(lastX,lastY,event.touches[0].clientX,event.touches[0].clientY);
        }

        lastX=event.touches[0].clientX;
        lastY=event.touches[0].clientY;

    }
    catch(err){
        alert( err.description);
    }

}

function onTouchEnd(event) {

    if(state>0)
    {
        //清理canvasTop层
        ctx1.clearRect(0,0,canvasTop.width,canvasTop.height);
    }
}

//橡皮擦除指定区域
function clean(x,y)
{
    var len = size/2;
    ctx.clearRect(x-len,y-len,size,size);
}

//画橡皮（画框）
function drawEreser(x,y)
{
    ctx1.clearRect(0,0,canvasTop.width,canvasTop.height);
    ctx1.beginPath();
    ctx1.lineWidth="2";
    ctx1.strokeStyle="red";
    var len = size/2;
    ctx1.rect(x-len,y-len,size,size);
    ctx1.stroke();
}


//画圆
function drawRound(x,y)
{
    ctx.fillStyle=colorValue;
    ctx.beginPath();
    ctx.arc(x,y,size/2,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}

//画线
function drawLine(startX,startY,endX,endY)
{
    ctx.beginPath();
    ctx.lineCap="round";
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
}



/*//调色板----------------------------------------------------------------------------------


function colorSelect(page,e){
    if(document.getElementById("colorBoard")){
        return;
    }
    //关于出现位置
    e=e||event;
    var scrollpos = getScrollPos();
    var l = scrollpos.l + e.clientX;
    var t = scrollpos.t + e.clientY + 10-255;
    if (l > getBody().clientWidth-253){
        l = getBody().clientWidth-253;
    }
    //创建DOM
    //var colorValue="#FF0000";//画笔颜色
    //var nowColor = document.getElementById(now);
    var pageColorViews = document.getElementById(page);
    var ColorHex=new Array('00','33','66','99','CC','FF');
    var SpColorHex=new Array('FF0000','00FF00','0000FF','FFFF00','00FFFF','FF00FF');

    var colorBank = document.createElement("div");
    colorBank.setAttribute("id","colorBank");

    var colorViews = document.createElement("div");
    colorViews.setAttribute("id","colorViews");

    var colorInput = document.createElement("input");
    colorInput.setAttribute("id","colorInput");
    colorInput.setAttribute("type","text");
    colorInput.setAttribute("disabled","disabled");

    var colorClose = document.createElement("input");
    colorClose.setAttribute("id","colorClose");
    colorClose.setAttribute("value","close");
    colorClose.setAttribute("type","button");
    colorClose.onclick=function(){document.body.removeChild(colorBoard)};

    var colorBoard =document.createElement("div");
    colorBoard.id="colorBoard";
    colorBoard.style.left = l+"px";
    colorBoard.style.top = t+ "px";
    colorBoard.appendChild(colorViews);
    colorBoard.appendChild(colorInput);
    colorBoard.appendChild(colorClose);
    colorBoard.appendChild(colorBank);
    document.body.appendChild(colorBoard);

    //循环出调色板
    for(b=0;b<6;b++){
        for(a=0;a<3;a++){
            for(i=0;i<6;i++){
                colorItem = document.createElement("div");
                colorItem.style.backgroundColor="#"+ColorHex[a]+ColorHex[i]+ColorHex[b];
                colorBank.appendChild(colorItem);
            }
        }
    }

    for(b=0;b<6;b++){
        for(a=3;a<6;a++){
            for(i=0;i<6;i++){
                colorItem = document.createElement("div");
                colorItem.style.backgroundColor="#"+ColorHex[a]+ColorHex[i]+ColorHex[b];
                colorBank.appendChild(colorItem);
            }
        }
    }

    for(i=0;i<6;i++){
        colorItem = document.createElement("div");
        colorItem.style.backgroundColor="#"+ColorHex[0]+ColorHex[0]+ColorHex[0];
        colorBank.appendChild(colorItem);
    }

    for(i=0;i<6;i++){
        colorItem = document.createElement("div");
        colorItem.style.backgroundColor="#"+ColorHex[i]+ColorHex[i]+ColorHex[i];
        colorBank.appendChild(colorItem);
    }

    for(i=0;i<6;i++){
        colorItem = document.createElement("div");
        colorItem.style.backgroundColor="#"+SpColorHex[i];
        colorBank.appendChild(colorItem);
    }

    var colorItems = colorBank.getElementsByTagName("div");
    for(i=0; i<colorItems.length;i++){
        colorItems[i].onmouseover = function(){
            a = this.style.backgroundColor;
            if(a.length>7){
                a = formatRgb(a);//
            }
            colorViews.style.background = a.toUpperCase();
            colorInput.value = a.toUpperCase();
        }
        colorItems[i].onclick = function(){
            a = this.style.backgroundColor;
            if(a.length>7){
                a = formatRgb(a);//
            }
            colorValue = a.toUpperCase();
            ctx.strokeStyl = colorValue;
            pageColorViews.style.background = a.toUpperCase();
            document.body.removeChild(colorBoard);
        }
    }
}

//格式化函数
function formatRgb(rgb){
    rgb = rgb.replace("rgb","");rgb = rgb.replace("(","");rgb = rgb.replace(")","");
    format = rgb.split(",");
    a = eval(format[0]).toString(16);
    b = eval(format[1]).toString(16);
    c = eval(format[2]).toString(16);
    rgb = "#"+checkFF(a)+checkFF(b)+checkFF(c);
    function checkFF(str){
        if(str.length == 1){
            str = str+""+str;
            return str;
        }else{
            return str;
        }
    }
    return rgb;
}
//getBody()
function getBody(){
    var Body;
    if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
        Body = document.documentElement;
    }
    else if (typeof document.body != 'undefined') {
        Body = document.body;
    }
    return Body;
}

//scrollPos
function getScrollPos(){
    var t,l;
    if (typeof window.pageYOffset != 'undefined'){
        t = window.pageYOffset;
        l = window.pageXOffset;
    }
    else{
        t = getBody().scrollTop;
        l = getBody().scrollLeft;
    }
    return {t:t,l:l};
}*/

//选择列表触发事件
function changeForm(val){
    size = val;
}

//铅笔事件
function penEvent(){
    state = 0;
}

//橡皮事件
function erEvent(){
    state =1;
}


