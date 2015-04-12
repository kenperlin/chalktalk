function() {
   this.label = 'linetest';
   this.keys = [[-1,-1,0],[0,1,0],[0,-1,0],[1,1,0]];
   this.spline = newArray(splineSize(this.keys), 2);
   this.renderStrokeInit();
/*
   this.drawing.add(
      new DRAWING.Curve(
         new DRAWING.SplinePath(
            this.keys)));
*/
   this.render = function() {
      this.duringSketch(function() {
         for (var i = 0 ; i < this.keys.length - 1 ; i++)
	    mLine(this.keys[i], this.keys[i+1]);
      });
      this.afterSketch(function() {
         this.keys[0][1] = .9 * sin(PI * time);
         this.keys[1][0] = .2 * cos(PI * time * 2);
         this.keys[2][0] = .5 * cos(PI * time);
         this.keys[2][1] = .5 * sin(PI * time) - .5;
         this.keys[3][0] = .2 * sin(PI * time * 2) + 1;

         makeSpline(this.keys, this.spline);

         var i0 = floor(this.spline.length/3);
         var i1 = floor(this.spline.length/3*2);
         for (var i = 0 ; i < this.spline.length ; i++)
            this.spline[i][2] = i >= i0 && i < i1 ? 0 : 1;

         this.renderStroke(this.spline);
      });
   }
}
