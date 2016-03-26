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

    //xmlhttp.open("GET",''load.php?LoadImg='+filename');
    xmlhttp.send(null);

    $.ajax({

    }).done(function(recd){

    });
}

function sendDataToServer() {

}s


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