define([],function(){
	return function(e){
		var target = e.target;
		$(target).addClass('current').siblings().removeClass('current');
	}
});