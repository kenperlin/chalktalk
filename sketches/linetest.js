function() {
   this.label = 'linetest';
   this.is3D = true;
   this.keys = [[-1,-1,0],[0,1,0],[0,-1,0],[1,1,0]];
   this.spline = newArray(splineSize(this.keys), 3);

   this.createMesh = function() {
      this.renderedStroke = new RenderedStroke(gl());
      return this.renderedStroke.mesh;
   }

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
	 for (var i = 0 ; i < this.spline.length ; i++)
	    this.spline[i][2] = 0;

         var C = paletteRGB[this.colorId];
         this.renderedStroke.render(this.spline, [C[0]/255, C[1]/255, C[2]/255, this.fade()]);
      });
   }
}
