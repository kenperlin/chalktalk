
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
      var jNext = function(j, P) { return (j + 1) % P.length; }
      var jPrev = function(j, P) { return (j - 1 + P.length) % P.length; }

      this.fillMode = 0;
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
	    this.fillMode = (this.fillMode + 1) % 3;
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
	    var i = jPrev(j, this.P);
	    var k = jNext(j, this.P);

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
	 switch (this.fillMode) {
	 case 0:
	    mClosedCurve(this.P);
	    break;
	 case 1:
	    var c = _g.strokeStyle;
	    color(scrimColor(0.25));
	    mFillCurve(this.P);
	    color(c);
	    mClosedCurve(this.P);
	    break;
	 case 2:
	    mFillCurve(this.P);
	    break;
         }
      }
   }
   NGon.prototype = new Sketch;

   function Bounce() {
      this.labels = "bounce".split(' ');
      this.isBouncing = false;
      this.bouncing = 0;
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 1:
	    this.isBouncing = ! this.isBouncing;
	    break;
	 }
      }
      this.render = function(elapsed) {
	 this.bouncing = this.isBouncing ? min(1, this.bouncing + elapsed)
	                                 : max(0, this.bouncing - elapsed);
         var bouncing = isDef(this.in[0]) ? this.inValue[0] : this.bouncing;

         m.save();
	    this.afterSketch(function() {
	       color(scrimColor(.25));
	       mFillCurve([[-1,0],[1,0],[1,-.15],[-1,-.15]]);
	       color(defaultPenColor);
	    });
	    mLine([-1,0],[1,0]);

	    var s = sin(2 * TAU * time);
	    var y = sqrt(.5 + .5 * s) * bouncing;
	    var h = 1 + min(0, .4 * s * abs(s)) * bouncing;
	    var oval = makeOval(-.5,y,1,h, 32, -TAU/4, -TAU*5/4);
	    this.afterSketch(function() {
	       color(scrimColor(.25));
	       mFillCurve(oval);
	       color(defaultPenColor);
            });
	    mCurve(oval);
         m.restore();

         if (this.nPorts == 0)
	    this.addPort("y", 0, 0);
	 this.setOutValue("y", y);
      }
   }
   Bounce.prototype = new Sketch;

   function Lightbulb() {
      this.labels = "lightbulb".split(' ');
      this.light = 0;
      this.mouseDown = function(){};
      this.mouseDrag = function(){};
      this.mouseUp   = function(){};
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 0:
	    this.setColorId((this.colorId + 1) % palette.length);
	    break;
	 case 1:
	    this.light = 1;
	    break;
	 case 2:
	    this.setColorId((this.colorId + palette.length - 1) % palette.length);
	    break;
	 case 3:
	    this.light = 0;
	    break;
	 }
      }
      this.render = function(elapsed) {
         if (this.nPorts == 0)
	    this.addPort("light", 0, 0);
         var light = isDef(this.in[0]) ? this.inValue[0] : this.light;
	 this.setOutValue("light", light);
         m.save();
	    var C = [[-.5,-1.6],[-.55,-1],[-.7,-.7],[-.95,0],[-.7,.7],
	             [0,1],
	             [.7,.7],[.95,0],[.7,-.7],[.55,-1],[.5,-1.6]];
	    mCurve(makeSpline(C));
	    this.afterSketch(function() {
	       color(scrimColor(lerp(light, .25, 1), this.colorId));
	       mFillCurve(makeSpline(C));
	       color(palette[this.colorId]);
	    });
	    color(defaultPenColor);
	    lineWidth(1);
	    for (var s = -1 ; s <= 1 ; s += 2)
               mCurve([[s*.45,-1.6],[s*.5,-1.65],[s*.5,-1.75],
	               [s*.45,-1.8],[s*.5,-1.85],[s*.5,-1.95],
		       [s*.45,-2.0],[s*.5,-2.05],[s*.5,-2.15],
		       [s*.45,-2.2],[s*.3,-2.2]]);
	    mCurve(makeOval(-.3,-2.5,.6,.6,10,PI,2*PI));
         m.restore();
      }
   }
   Lightbulb.prototype = new Sketch;

