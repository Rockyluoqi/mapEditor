define(['mod/point'],function(point){
	function Line(svg,x1,y1,x2,y2){
		var self = this;
		self.g = svg.append('g').attr('class','g-line');
		self.startP = point(self.g,x1,y1);
		self.line = self.g.append('line')
			.attr({
				'x1':x1,
				'y1':y1,
				'x2':x2,
				'y2':y2,
				'class':'line'
			});
		self.endP = point(self.g,x2,y2);
	}
	Line.prototype.reDraw = function(x,y){
		var self = this;
		self.line.attr({
			'x2':x,
			'y2':y
		});
		self.endP.attr({
			'cx':x,
			'cy':y
		})
	}

	return function(svg,x1,y1,x2,y2){
		var line = new Line(svg,x1,y1,x2,y2);
		svg.selectAll('.line').on('mouseenter',function(){
					console.log(11)
					console.log(this)
			this.setAttribute('stroke-width',4);
		}).on('mouseout',function(){
			this.setAttribute('stroke-width',2);
		});

		return line;
	}
});

