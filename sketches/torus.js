function() {
   this.label = 'torus';
   this._isSolid = true;
   this.nSteps = 16;
   this.onCmdClick = [ 'toggle wireframe' , function(p) { this._isSolid = ! this._isSolid; } ];
   this.mouseDrag = function(x, y) {
      if (this.y0 === undefined)
         this.y0 = y;
      var i0 = floor(this.y0 / 20);
      var i1 = floor(     y  / 20);
      if (i1 != i0) {
         this.nSteps = max(3, this.nSteps + (i1 < i0 ? 1 : -1));
         this.y0 = y;
      }
   }
   this.mouseUp = function(x, y) {
      delete this.y0;
   }

   this.render = function() {
      var r = this.stretch('thickness', (S(0).height - S(2).height) * 4) / 2;
      r = max(.01, min(.99, r));
      m.scale(1 / (1+r/2));
      this.duringSketch(function() {
         mCurve(makeOval(-1-r,-1-r, 2+2*r,2+2*r, 20, -PI/2,   PI/2));
	 mCurve(makeOval(-1-r,-1-r, 2+2*r,2+2*r, 20,  PI/2, 3*PI/2));
         mCurve(makeOval(-1+r,-1+r, 2-2*r,2-2*r, 20, -PI/2, 3*PI/2));
      });
      this.afterSketch(function() {
	 var n = this.nSteps;
         if (this._isSolid)
            mTorus(n, n, r);
	 else {
	    var n = this.nSteps, u, v, du = 1 / n, dv = 1 / n;
	    function f(u, v) {
	       return [ cos(TAU * u) * (1 + r * cos(TAU * v)),
	                sin(TAU * u) * (1 + r * cos(TAU * v)),
			                    r * sin(TAU * v) ];
	    }
	    lineWidth(1);
	    for (u = 0 ; u < 1.0001 ; u += du)
	    for (v = 0 ; v < 1.0001 ; v += dv)
	       mCurve([ f(u + du, v), f(u, v), f(u, v + dv) ]);
         }
      });
   }
}

