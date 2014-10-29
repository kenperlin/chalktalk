function XY() {
   this.labels = "xy".split(' ');
   this.mxy = [-1,-1];
   this.mouseDown = function(x,y) {
      this.mouseDrag(x,y);
   }
   this.mouseDrag = function(x,y) {
      this.mxy = m.transform([x,y]);
      for (var i = 0 ; i < 2 ; i++)
         this.mxy[i] = max(-1, min(1, this.mxy[i]));
   }
   this.mouseUp = function() { }
   this.render = function(elapsed) {
      mLine([-1,-1], [1,-1]);
      mLine([-1,-1], [-1,1]);
      this.afterSketch(function() {
         for (var j = 0 ; j < 2 ; j++)
            if (isDef(this.inValues[j]))
	       this.mxy[j] = max(0, min(1, this.inValues[j] * 2 - 1));
         var x = this.mxy[0];
         var y = this.mxy[1];
	 lineWidth(.5);
	 mLine([-1,y],[1,y]);
	 mLine([x,-1],[x,1]);
      });
      this.outValue[0] = [ (this.mxy[0] + 1) / 2, (this.mxy[1] + 1) / 2 ];
   }
}
XY.prototype = new Sketch;
addSketchType("XY");

