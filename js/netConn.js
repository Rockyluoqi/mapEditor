/**
 * Created by Luoqi on 3/18/2016.
 * This js is designed for net communication and data transmission.
 */
function loadImage(filename) {
    var xmlhttp;
    if(window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("documentHolder").src = "data:image/png;base64," + xmlhttp.responseText;
        }
    };

    //xmlhttp.open("GET",''LoadImg='+filename');
    xmlhttp.send(null);

    $.ajax({

    }).done(function(recd){

    });
}

function sendDataToServer() {
}


var imageArray = [];
function getImage() {
    for(var i = 0;i<imageArray;i++) {
        var img = new Image();
        img.src = "http://";
    }
    var img = new Image();
}

/**
 * get map name and description... infomation
 * from json
 */
function getImageInfo() {

}


function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        }
        list.push(img);
        img.src = array[i];
    }
}


/*$(document).ready(function() {
    var scriptUrl1 = 'your_server_side_script_path';
    var scriptUrl2 = 'other_server_side_script_path';

    jQuery.ajax({
        type:"GET",
        url: url + "?command=GetRegsiterJsonData",
        dataType:"json",
        global:false,
        success: function(data){
            var jsonData = "1. 用统一的ajax方法<br/>";
            var personList = data.personList;
            for(var i=0; i<personList.length; i++){
                var name = personList[i].name;
                var age = personList[i].age;
                jsonData += "name: " + name + ", age: " + age + "<br/>";
            }
            $("#dataArea").html(jsonData + "<br/>");
        }
    });
});*/

/**
 * example
 */
var form;

/*form.onsubmit = function (e) {
    // stop the regular form submission
    e.preventDefault();

    // collect the form data while iterating over the inputs
    var data = {};
    for (var i = 0, ii = form.length; i < ii; ++i) {
        var input = form[i];
        if (input.name) {
            data[input.name] = input.value;
        }
    }

    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open(form.method, form.action, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(JSON.stringify(data));

    xhr.onloadend = function () {
        // done
    };
};*/

/**
 * <head>
 <title>Test</title>
 <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
 <script type="text/javascript" src="http://www.json.org/json2.js"></script>
 <script type="text/javascript">
 $(function() {
       var frm = $(document.myform);
       var dat = JSON.stringify(frm.serializeArray());

       alert("I am about to POST this:\n\n" + dat);

       $.post(
         frm.attr("action"),
         dat,
         function(data) {
           alert("Response: " + data);
         }
       );
     });
 </script>
 </head>
 */