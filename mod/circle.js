/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-04-21 16:45:20
 * @version $Id$
 */

define(['mod/point'],function(point){
	function Circle (svg,cx,cy,r){
		var self = this;
		self.g = svg.append('g').attr('class','g-circle');
		self.center = point(self.g,cx,cy,4);
		self.circle = self.g.append('circle')
			.attr({
				'cx':cx,
				'cy':cy,
				'r':r,
				'class':'circle'
			});
	}
	Circle.prototype.reDraw = function(r){
		var self = this;
		self.circle.attr('r',r);
	}
	return function(svg,cx,cy,r){
		var circle = new Circle(svg,cx,cy,r);

		svg.selectAll('.circle').on('mouseenter',function(){
			this.setAttribute('stroke-width',4);
		}).on('mouseout',function(){
			this.setAttribute('stroke-width',2);
		});

		return circle;		
	}
});