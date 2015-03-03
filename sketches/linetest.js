function() {
   this.label = 'linetest';
   this.keys = [[-1,-1],[0,1],[0,-1],[1,1]];
   this.spline = newArray(splineSize(this.keys), 2);
   this.renderStrokeEnable();

   this.drawing.add(
      new DRAWING.Curve(
         new DRAWING.SplinePath(
	    this.keys)));

   this.render = function() {
      this.afterSketch(function() {
         this.keys[0][1] = .9 * sin(PI * time);
         this.keys[1][0] = .2 * cos(PI * time * 2);
         this.keys[2][0] = .5 * cos(PI * time);
         this.keys[2][1] = .5 * sin(PI * time) - .5;
         this.keys[3][0] = .2 * sin(PI * time * 2) + 1;

	 makeSpline(this.keys, this.spline);
	 this.renderStroke(this.spline);
      });
   }
}
