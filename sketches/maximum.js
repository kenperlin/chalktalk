function() {
   this.label = 'maximum';
   var eps = 0.01;

   var P = [.7, .2, .4], A = [0,0,0];

   function func(x) {
      return - (A[0] * x * x + A[1] * x + A[2]);
   }

   this.render = function() {
      for (var i = 0 ; i < 3 ; i++)
         if (this.inValues.length > i)
	    P[i] = this.inValues[i];

      valuesToQuadratic(P, A);

      mLine([-1.5, 0], [1.5, 0]);

      this.afterSketch(function() {
	 for (var x = -1 ; x <= 1 ; x++) {
	    color('gray');
	    mLine([x, -1], [x, 0]);
         }
      });

      mLine([0,0],[0,-1]);

      var curve = [];
      for (var x = -1 ; x <= 1 ; x += eps)
         curve.push([x, func(x)]);
      mCurve(curve);

      this.afterSketch(function() {
         lineWidth(4);

	 color('cyan');
	 for (var x = -1 ; x <= 1 ; x++)
	    mArrow([x,0], [x,func(x)], 0.1);

// Show where derivative is zero:  2 * A0 * t + A1 = 0   -->   t = A1 / (-2 * A0)

         var t = A[1] / (-2 * A[0]);
	 var y = func(t);
         color('red');
	 mArrow([t, y + .5], [t, y], 0.1);
      });
   }
}
