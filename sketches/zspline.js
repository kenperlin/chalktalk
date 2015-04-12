function() {
   this.label = 'spline';

   this.P = [[-.5,  1, 0],
             [ .5, .3, 0],
             [-.5,-.3, 0],
             [ .5, -1, 0]];

   this.onPress = function(pt) {
      if (this.p === undefined)
         this.p = newVec3();

      this.N = -1;
      var D = 1000;
      for (var n = 0 ; n < this.P.length ; n++) {
         this.p.set(this.P[n][0],this.P[n][1],this.P[n][2]);
         var d = this.p.distanceTo(pt);
	 if (d < .1) {
	    this.N = n;
	    D = d;
	 }
      }
      if (this.N == -1) {
         this.P.push([pt.x,pt.y,0]);
	 this.N = this.P.length - 1;
      }
   }
   this.onDrag = function(pt) {
      if (this.N >= 0) {
         this.P[this.N][0] = pt.x;
         this.P[this.N][1] = pt.y;
         this.P[this.N][2] = pt.z;
      }
   }
   this.onRelease = function(pt) {
      this.N = -1;
   }
   this.render = function() {
      this.duringSketch(function() {
         for (var i = 0 ; i < this.P.length - 1 ; i++)
	    mLine(this.P[i], this.P[i+1]);
      });

      this.afterSketch(function() {
         mCurve(makeSpline(this.P));
         for (var n = 0 ; n < this.P.length ; n++)
            mDot(this.P[n], .15);
      });
   }
   this.N = -1;
}
