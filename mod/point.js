define([],function  () {
	return function(svg,cx,cy){
		var point = svg.append('g').attr('class','g-point').append('circle')
			.attr({
				'cx':cx,
				'cy':cy,
				'r' :4,
				'class' : 'point',
				'obj' : 'gh'
			});
		svg.selectAll('.point').on('mouseenter',function(){
	
			this.setAttribute('r',6);
		}).on('mouseout',function(){
			this.setAttribute('r',4)
		});

		return point;		
	}
});