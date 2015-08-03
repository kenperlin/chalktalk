function() {
   this.label = 'spline';
   this.is3D = true;
   this.N = -1;
   this.Pix = [];
   this.showKeys = true;
   var r = .1;

   // ALLOW USER TO DECIDE WHETHER TO DISPLAY KEY POINTS.

   this.onCmdClick = function() { this.showKeys = ! this.showKeys; }

   this.onPress = function(pt) {
      this.travel = 0;

      // FIND PROJECTION OF CURSOR ONTO SCREEN.

      this.pix.copy(pt).applyMatrix4(pointToPixelMatrix);
      this.pix.z = 0;

      // FIND PROJECTIONS OF SPLINE KEYS ONTO SCREEN.

      for (var n = 0 ; n < this.P.length ; n++) {
         if (this.Pix[n] === undefined)
            this.Pix[n] = newVec3();
         this.Pix[n].copy(this.P[n]).applyMatrix4(pointToPixelMatrix);
	 this.Pix[n].z = 0;
      }

      // CHECK FOR MOUSE DOWN ON A KEY.

      this.N = this.P.length;
      while (--this.N >= 0 && this.Pix[this.N].distanceTo(this.pix) > clickSize())
         ;

      // IF NOT...

      if (this.isNewPoint = this.N == -1) {

         // CHECK FOR MOUSE DOWN HALF WAY BETWEEN TWO KEYS.

         while (++this.N < this.P.length - 1)
            if (this.p.copy(this.Pix[this.N]).lerp(this.Pix[this.N+1], 0.5).distanceTo(this.pix) <= clickSize()) {

               // IF SO, INSERT A NEW KEY THERE.

               this.P.splice(++this.N, 0, newVec3().copy(pt));
               return;
            }

         // ELSE, ADD NEW KEY ONTO FIRST OR LAST KEY (WHICHEVER IS NEARER).

         if (this.Pix[0].distanceTo(this.pix) < this.Pix[this.P.length-1].distanceTo(this.pix)) {
            this.N = 0;
            this.P.unshift(newVec3().copy(pt));
         }
         else {
            this.N = this.P.length;
            this.P.push(newVec3().copy(pt));
         }
      }
   }
   this.onDrag = function(pt) {

      // DRAGGING MOVES THE CURRENTLY SELECTED KEY.

      if (this.N >= 0) {
         this.travel += this.Pix[this.N].distanceTo(pt);
         this.P[this.N].copy(pt);
      }
   }
   this.onRelease = function(pt) {

      // IF THIS WAS NOT A NEWLY ADDED KEY, AND IT WAS NOT DRAGGED, THEN DELETE IT.

      if (this.N >= 0 && ! this.isNewPoint && this.travel < r)
         this.P.splice(this.N, 1);
   }
   this.render = function() {

      // THE FIRST TIME THROUGH, INITIALIZE EVERYTHING THAT DEPENDS ON THREE.JS.

      if (this.P === undefined) {
         this.P = [newVec3( .5,  1),
                   newVec3(-.5, .3),
                   newVec3( .5,-.3),
                   newVec3(-.5, -1)];
         this.p = newVec3();
         this.pix = newVec3();
      }

      // JAGGED 'S' GLYPH ONLY APPEARS WHEN USER FIRST DRAWS THE SHAPE.

      this.duringSketch(function() {
         for (var n = 0 ; n < this.P.length - 1 ; n++)
            mLine(this.P[n], this.P[n+1]);
      });

      this.afterSketch(function() {
         var curve = makeSpline(this.P);

	 // EITHER SHOW THIN CURVE WITH KEYS AS DOTS, OR SHOW JUST A THICK CURVE.

         lineWidth(this.showKeys ? 2 : 4);
         mCurve(curve);
	 if (this.showKeys)
            for (var n = 0 ; n < this.P.length ; n++)
               mDot(this.P[n], 2*r);

         // IF THERE WAS INPUT, THEN OUTPUT A SPECIFIC VALUE.

         if (this.inValues[0] !== undefined) {
	    var p = getPointOnCurve(curve, this.inValues[0] % 1);
            this.setOutPortValue(p);
	    if (! this.showKeys)
               mDot(p, 2*r);
	 }

         // IF THERE WAS NO INPUT, THEN OUTPUT A DEFINING FUNCTION.

	 else
            this.setOutPortValue(function(t) { return getPointOnCurve(curve, t % 1); });
      });
   }
}
