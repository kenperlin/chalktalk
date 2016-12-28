function() {
   this.label = "video";
   this.value = videoBrightness;
   this.mouseDown = function() { }
   this.mouseDrag = function(x,y) {
      var t = (this.yhi - y) / (this.yhi - this.ylo);
      this.value = max(0.5, min(1, t));
      videoBrightness = this.value;
   }
   this.mouseUp = function() { }
   this.render = function(elapsed) {
      var v = this.value;
      mCurve([ [-.5,1], [0,-1], [.5,1] ]);
      mCurve([ [-.5*v,lerp(v,-1,1)], [.5*v,lerp(v,-1,1)] ]);
   }
}
