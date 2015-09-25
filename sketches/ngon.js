function() {
   this.labels = "triangle diamond pentagon hexagon".split(' ');
   this.is3D = true;

   var jNext = function(j, P) { return (j + 1) % P.length; }
   var jPrev = function(j, P) { return (j - 1 + P.length) % P.length; }

   this.fillMode = 0;
   this.P = null;
   this.mF = new M4();
   this.mI = new M4();

   this.swipe[0] = ['fill'  , function() { this.fillMode = (this.fillMode + 2) % 3; }];
   this.swipe[4] = ['unfill', function() { this.fillMode = (this.fillMode + 1) % 3; }];

   this.mouseDown = function(x, y) {

      this.standardView(this.mF);
      this.standardViewInverse(this.mI);

      // GRAB ANY VERTEX THAT IS WITHIN CLICK-DISTANCE FROM THE CURSOR.

      this.jP = -1;
      for (var i = 0 ; i < this.P.length ; i++) {
         var p = this.mF.transform(this.P[i]);
         if (len(p[0] - x, p[1] - y) <= clickSize()) {
            this.jP = i;
            break;
         }
      }

      // INSERT NEW VERTEX IF WITHIN CLICK-DISTANCE OF AN EDGE MIDPOINT.

      if (this.jP == -1)
         for (var i = 0 ; i < this.P.length ; i++) {
            var j = (i + 1) % this.P.length;
            var p = this.mF.transform(this.P[i]);
            var q = this.mF.transform(this.P[j]);
            var a = [ (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 ];
            if (len(a[0] - x, a[1] - y) <= clickSize()) {
               this.P.splice(j, 0, this.mI.transform([ x, y ]));
               this.jP = j;
               break;
            }
         }

      if (this.jP >= 0)
         this.suppressSwipe = true;
   }
   this.mouseDrag = function(x, y) {
      if (this.jP >= 0)
         this.P[this.jP] = this.mI.transform([ x, y ]);
   }
   this.mouseUp = function(x, y) {

      // DELETE VERTEX IF IT HAS MOVED TO WITHIN CLICK-DISTANCE OF EDGE CONNECTING ITS NEIGHBORS.

      if (this.jP >= 0) {
         var j = this.jP;
         var i = jPrev(j, this.P);
         var k = jNext(j, this.P);

         var p = this.mF.transform(this.P[i]);
         var q = this.mF.transform(this.P[j]);
         var r = this.mF.transform(this.P[k]);
         var a = [ (p[0] + r[0]) / 2, (p[1] + r[1]) / 2 ];
         if (len(a[0] - q[0], a[1] - q[1]) <= clickSize() / 2)
            this.P.splice(j, 1);
      }
   }
   this.render = function() {
      function makeNgon(n) { return makeOval(-1,-1,2,2, n, TAU/4, TAU/4 - TAU * (n-1) / n); }
      if (! isNumeric(this.xlo) || this.P == null) {
         switch (this.labels[this.selection]) {
         case 'triangle': this.P = makeNgon(3); break;
         case 'diamond' : this.P = makeNgon(4); break;
         case 'pentagon': this.P = makeNgon(5); break;
         case 'hexagon' : this.P = makeNgon(6); break;
         }
      }
      switch (this.fillMode) {
      case 0:
         mClosedCurve(this.P);
         break;
      case 1:
         var c = _g.strokeStyle;
         color(scrimColor(0.25, this.colorId));
         mFillCurve(this.P);
         color(c);
         mClosedCurve(this.P);
         break;
      case 2:
         mFillCurve(this.P);
         break;
      }
   }
   this.output = function() {
      this.P.color = palette.color[this.colorId];
      if (! this.P.edges || this.P.edges.length != this.P.length) {
         this.P.edges = [];
         for (var i = 0 ; i < this.P.length ; i++)
	    this.P.edges.push([i, (i + 1) % this.P.length]);
      }
      return this.P;
   }
}

