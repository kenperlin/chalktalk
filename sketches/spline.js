function() {
   this.label = 'Spline';
   this.is3D = true;
   this.N = -1;
   this.Pix = [];
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
   this._projectPoints = function(pt, unadjust) {

      // FIND PROJECTIONS ONTO SCREEN.

      if (this.pix === undefined)
         this.pix = newVec3();
      this.pointToPixel(pt, this.pix);
      if (unadjust) {
         this.pix.x = this.unadjustX(this.pix.x);
         this.pix.y = this.unadjustY(this.pix.y);
      }

      for (var n = 0 ; n < this.P.length ; n++) {
         if (this.Pix[n] === undefined)
            this.Pix[n] = newVec3();
         this.pointToPixel(this.P[n], this.Pix[n]);
      }
   }
   this.onMove = function(pt) {

      this._projectPoints(pt, true);

      // CHECK FOR MOUSE DOWN ON A KEY.

      this.N = this.P.length;
      while (--this.N >= 0 && this.Pix[this.N].distanceTo(this.pix) > 10)
         ;

      // IF NOT...

      this.isNewPoint = false;

      if (this.N == -1) {

         // CHECK FOR MOUSE DOWN HALF WAY BETWEEN TWO KEYS.

         if (this.q === undefined)
            this.q = newVec3();
         if (this.qix === undefined)
            this.qix = newVec3();

         if (this.isLoop)
            this.P.push(this.P[0]);
         while (++this.N < this.P.length - 1) {
            var t = (this.N + 0.5) / (this.P.length - 1);
            var p = getPointOnCurve(this.splineCurve, t);
            this.q.set(p[0], p[1], p[2]);
            this.pointToPixel(this.q, this.qix);
            if (this.qix.distanceTo(this.pix) <= 10) {
               this.isNewPoint = true;
               break;
            }
         }
         if (this.isLoop)
            this.P.pop();

         if (! this.isLoop && this.N == this.P.length - 1)
            this.N = -1;
      }
   }
   this.onPress = function(pt) {
      this._projectPoints(pt);

      this.travel = 0;

      if (this.isNewPoint) {
         if (this.N < this.P.length)
            this.P.splice(++this.N, 0, newVec3().copy(pt)); // IF SO, INSERT A NEW KEY THERE.
         else
            this.P.push(newVec3().copy(pt));
         this.isNewPoint = false;
      }
   }
   this.onDrag = function(pt) {
      this._projectPoints(pt);

      // DRAGGING MOVES THE CURRENTLY SELECTED KEY.

      if (this.N >= 0) {
         this.travel += this.Pix[this.N].distanceTo(pt);
         this.P[this.N].copy(pt);
      }
   }
   this.onRelease = function(pt) {

      // IF THIS WAS NOT A NEWLY ADDED KEY, AND IT WAS NOT DRAGGED, THEN DELETE IT.

      if (this.N >= 0 && ! this.isNewPoint && this.travel < r) {
         this.P.splice(this.N, 1);
         this.N = -1;
      }
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
         this.splineCurve = makeSpline(this.P);
         var splineCurve = this.splineCurve;
         if (this.isLoop)
            this.P.pop();

         // EITHER SHOW THIN CURVE WITH KEYS AS DOTS, OR SHOW JUST A THICK CURVE.

         lineWidth(this.showKeys ? 2 : 4);
         mCurve(splineCurve);
         if (this.showKeys) {
            for (var n = 0 ; n < this.P.length ; n++) {
               color(n == this.N && ! this.isNewPoint ? 'cyan' : defaultPenColor);
               mDot(this.P[n], 2*r);
            }
            if (this.isNewPoint) {
               color('blue');
               var t = (this.N + 0.5) / (this.P.length - (this.isLoop ? 0 : 1));
               mDot(getPointOnCurve(splineCurve, t), 2*r);
            }
         }

         // IF THERE WAS INPUT, THEN OUTPUT A SPECIFIC VALUE.

         if (this.inValues[0] !== undefined) {
            var p = getPointOnCurve(splineCurve, this.inValues[0] % 1);
            this.setOutPortValue(p);
            if (! this.showKeys)
               mDot(p, 2*r);
         }

         // IF THERE WAS NO INPUT, THEN OUTPUT A DEFINING FUNCTION.

         else
            this.setOutPortValue(function(t) { return getPointOnCurve(splineCurve, t % 1); });
      });
   }
}

