function() {
   this.label = 'spline';
   this.is3D = true;
   this.N = -1;
   this.showKeys = true;
   this.isLoop = false;
   var r = .1;

   // ALLOW USER TO DECIDE WHETHER TO DISPLAY KEY POINTS.

   this.onCmdClick = function() { this.showKeys = ! this.showKeys; }

   this.onCmdSwipe = function(dx,dy) {
      var dir = pieMenuIndex(dx, dy, 8);
      switch (dir) {
      case 6:
         this.isLoop = ! this.isLoop;
         break;
      }
   }

   this.onPress = function(pt) {
      this.travel = 0;

      // FIND PROJECTION OF CURSOR ONTO SCREEN.

      if (this.pix === undefined)
         this.pix = newVec3();
      pointToPixel(pt, this.pix);

      // FIND PROJECTIONS OF SPLINE KEYS ONTO SCREEN.

      if (this.Pix === undefined)
         this.Pix = [];
      for (var n = 0 ; n < this.P.length ; n++) {
         if (this.Pix[n] === undefined)
            this.Pix[n] = newVec3();
         pointToPixel(this.P[n], this.Pix[n]);
      }

      // CHECK FOR MOUSE DOWN ON A KEY.

      this.N = this.P.length;
      while (--this.N >= 0 && this.Pix[this.N].distanceTo(this.pix) > clickSize())
         ;

      // IF NOT...

      if (this.isNewPoint = this.N == -1) {

         // CHECK FOR MOUSE DOWN HALF WAY BETWEEN TWO KEYS.

         if (this.p === undefined)
	    this.p = newVec3();
         while (++this.N < this.P.length - 1)
            if (this.p.copy(this.Pix[this.N]).lerp(this.Pix[this.N+1], 0.5).distanceTo(this.pix) <= clickSize()) {
               this.P.splice(++this.N, 0, newVec3().copy(pt)); // IF SO, INSERT A NEW KEY THERE.
               return;
            }
         if (this.isLoop)
            if (this.p.copy(this.Pix[this.N-1]).lerp(this.Pix[0], 0.5).distanceTo(this.pix) <= clickSize()) {
               this.P.splice(++this.N, 0, newVec3().copy(pt)); // IF SO, INSERT A NEW KEY THERE.
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

      if (this.P === undefined)
         this.P = [newVec3( .5,  1),
                   newVec3(-.5, .3),
                   newVec3( .5,-.3),
                   newVec3(-.5, -1)];

      // JAGGED 'S' GLYPH ONLY APPEARS WHEN USER FIRST DRAWS THE SHAPE.

      this.duringSketch(function() {
         for (var n = 0 ; n < this.P.length - 1 ; n++)
            mLine(this.P[n], this.P[n+1]);
      });

      this.afterSketch(function() {
         if (this.isLoop)
	    this.P.push(this.P[0]);
         var curve = makeSpline(this.P);
         if (this.isLoop)
	    this.P.pop();

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

