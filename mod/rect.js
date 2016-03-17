/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-04-21 16:31:12
 * @version $Id$
 */

define([],function  () {
	return function(canvas,arr,color){
        var ctx = canvas.getContext("2d");
        if(typeof color === 'undefined'){
			color = '#ff0';
        }
        ctx.fillStyle = color;
        ctx.fillRect(arr[0],arr[1],arr[2],arr[3]);
	}
})