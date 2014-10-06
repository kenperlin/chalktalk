
   function Reflect() {
      this.labels = "reflect".split(' ');
      this.rx = .707;
      this.ry = .707;
      this.code = [["", "R = 2 * N * dot(N,L) - L"]];

      this.mouseDrag = function(x, y) {
         if (y > this.cy)
	    return;
         var xx = 2 * (x - this.xlo + x - this.xhi) / this.wide;
         var rx = -xx;
	 if (xx * xx < 1) {
	    this.rx = rx;
            this.ry = sqrt(1 - xx * xx);
	 }
      }

      this.render = function(elapsed) {
         m.save();
         this.duringSketch(function() {
	    mLine([-1,0],[1,0]);
	    mLine([0,0],[  0,  1]);
	    mLine([0,0],[-this.rx,this.ry]);
	    mLine([0,0],[ this.rx,this.ry]);
         });
         this.afterSketch(function() {
	    if (this.wide === undefined && isNumeric(this.xlo))
	       this.wide = this.xhi - this.xlo;

	    mLine([-1,0],[1,0]);
	    mArrow([0,0],[  0,  1]);
	    mArrow([0,0],[-this.rx,this.ry]);
	    mArrow([0,0],[ this.rx,this.ry]);

	    mText("N", [0, 1 * 1.1]);
	    mText("L", [-this.rx * 1.1, this.ry * 1.1]);
	    mText("R", [ this.rx * 1.1, this.ry * 1.1]);

	    if (isCodeWidget && this == codeSketch) {
	       _g.save();
	       color('rgba(128,192,255,0.5)');
	       mLine([-this.rx,this.ry],[0,this.ry]);
	       mLine([-this.rx,this.ry],[0,2*this.ry]);
	       color('rgb(128,192,255)');
	       mArrow([0,0],[0,this.ry]);
	       mArrow([0,this.ry],[0,2*this.ry]);
	       mArrow([0,2*this.ry],[this.rx,this.ry]);
	       mText("N.L", [0.025, this.ry / 2]);
	       _g.restore();
	    }
         });
         m.restore();
      }
   }
   Reflect.prototype = new Sketch;

   function NGon() {
      this.isFilled = false;
      this.P = null;
      this.mF = new M4();
      this.mI = new M4();
      this.labels = "triangle diamond pentagon hexagon".split(' ');
      this.onSwipe = function(dx, dy) {
         if (this.jP != -1)
	    return;
         switch (pieMenuIndex(dx, dy)) {
	 case 0:
	    break;
	 case 1:
	    break;
	 case 2:
	    break;
	 case 3:
	    this.isFilled = ! this.isFilled;
	    break;
	 }
      }
      this.mouseDown = function(x, y) {
	 this.standardView(this.mF);
	 this.standardViewInverse(this.mI);

	 // GRAB ANY VERTEX THAT IS WITHIN CLICK-DISTANCE FROM THE CURSOR.

         this.jP = -1;
	 for (var i = 0 ; i < this.P.length ; i++) {
	    var p = this.mF.transform(this.P[i]);
	    if (len(p[0] - x, p[1] - y) <= clickSize) {
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
	       if (len(a[0] - x, a[1] - y) <= clickSize) {
		  this.P.splice(j, 0, this.mI.transform([ x, y ]));
	          this.jP = j;
		  break;
	       }
	    }
      }
      this.mouseDrag = function(x, y) {
         if (this.jP >= 0)
	    this.P[this.jP] = this.mI.transform([ x, y ]);
      }
      this.mouseUp = function(x, y) {

         // DELETE VERTEX IF IT HAS MOVED TO WITHIN CLICK-DISTANCE OF EDGE CONNECTING ITS NEIGHBORS.

         if (this.jP >= 0) {
	    var j = this.jP;
	    var i = (j - 1 + this.P.length) % this.P.length;
	    var k = (j + 1) % this.P.length;

	    var p = this.mF.transform(this.P[i]);
	    var q = this.mF.transform(this.P[j]);
	    var r = this.mF.transform(this.P[k]);
	    var a = [ (p[0] + r[0]) / 2, (p[1] + r[1]) / 2 ];
            if (len(a[0] - q[0], a[1] - q[1]) <= clickSize / 2)
	       this.P.splice(j, 1);
	 }
      }
      this.render = function() {
         function makeNgon(n) { return makeOval(-1,-1,2,2, n, TAU/4, TAU/4 + TAU * (n-1) / n); }
         if (! isNumeric(this.xlo)) {
	    switch (this.labels[this.selection]) {
	    case 'triangle': this.P = makeNgon(3); break;
	    case 'diamond' : this.P = makeNgon(4); break;
	    case 'pentagon': this.P = makeNgon(5); break;
	    case 'hexagon' : this.P = makeNgon(6); break;
	    }
	 }
	 if (this.isFilled)
	    mFillCurve(this.P);
         else
	    mClosedCurve(this.P);
      }
   }
   NGon.prototype = new Sketch;

