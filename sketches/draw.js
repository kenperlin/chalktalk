
function() {

// THEN NEED TO MERGE LINES AND ARCS THAT CONTINUE EACH OTHER (CHECKING FOR NEAR-EQUAL RADII).

// TO ADD: CMD-DRAG ON A POINT TO MOVE IT.

// THINK ABOUT HOW TO EXTEND ALL THIS TO 3D.

   this.labels = [ 'LineUp'       , 'LineDown'    , 'LineLeft'    , 'LineRight'    ,
                   'ArcUpLeft'    , 'ArcUpRight'  , 'ArcDownLeft' , 'ArcDownRight' ,
                   'ArcRightDown' , 'ArcLeftDown' , 'ArcRightUp'  , 'ArcLeftUp'    ];

   this._tolerance = 0.1; // HOW NEAR THINGS NEED TO BE TO BE CONSIDERED THE "SAME" POINT.
   this._lineState = 'none';

   this.createLine = function(ax, ay, bx, by) {
      return { type: 'line', a: [ax, ay], b: [bx, by] };
   }
   this.createArc = function(x, y, rx, ry, isReverse) {
      var curve = [], n, theta;;
      for (n = 0 ; n <= 8 ; n++) {
         theta = PI / 2 * n / 8;
         curve.push( [ x + rx * cos(theta), y + ry * sin(theta) ] );
      }
      return { type: 'arc', center: [x, y], radius: [rx,ry], reverse: isReverse };
   }
   this.renderCurve = function(curve) {
      switch (curve.type) {
      case 'line':
         mLine( curve.a, curve.b );
	 break;
      case 'arc':
         var c = [];
         for (n = 0 ; n <= 8 ; n++) {
            theta = PI / 2 * n / 8;
            c.push( [ curve.center[0] + curve.radius[0] * cos(theta),
	              curve.center[1] + curve.radius[1] * sin(theta) ] );
         }
	 mCurve( curve.reverse ? reverse(c) : c );
         break;
      }
   }
   this.getFirstPoint = function(curve) {
      switch (curve.type) {
      case 'line':
         return curve.a;
      case 'arc':
         if (curve.reverse)
	    return [ curve.center[0], curve.center[1] + curve.radius[1] ];
         else
	    return [ curve.center[0] + curve.radius[0], curve.center[1] ];
      }
   }
   this.getLastPoint = function(curve) {
      switch (curve.type) {
      case 'line':
         return curve.b;
      case 'arc':
         if (curve.reverse)
	    return [ curve.center[0] + curve.radius[0], curve.center[1] ];
         else
	    return [ curve.center[0], curve.center[1] + curve.radius[1] ];
      }
   }

   this._curves = [
     [ this.createLine( 0,-1,  0, 1) ],
     [ this.createLine( 0, 1,  0,-1) ],
     [ this.createLine( 1, 0, -1, 0) ],
     [ this.createLine(-1, 0,  1, 0) ],
     [ this.createArc ( 0, 0,  1, 1      ) ],
     [ this.createArc ( 0, 0, -1, 1      ) ],
     [ this.createArc ( 0, 0,  1,-1      ) ],
     [ this.createArc ( 0, 0, -1,-1      ) ],
     [ this.createArc ( 0, 0,  1, 1, true) ],
     [ this.createArc ( 0, 0, -1, 1, true) ],
     [ this.createArc ( 0, 0,  1,-1, true) ],
     [ this.createArc ( 0, 0, -1,-1, true) ],
   ];
   this.render = function() {
      var curves = this._curves[this.selection];
      this.renderCurve(curves[0]);

      this.afterSketch(function() {
         var a, b, i;

         for (i = 1 ; i < curves.length ; i++)
            this.renderCurve(curves[i]);

         a = this._a;
         b = this._b;
         switch (this._lineState) {
	 case 'horizontal line':
	 case 'vertical line'  :
	 case 'diagonal line'  :
            this.renderCurve(this.createLine(a[0], a[1], b[0], b[1]));
	    break;
	 case 'horizontal arc':
            this.renderCurve(this.createArc(a[0], b[1], b[0] - a[0], a[1] - b[1], true));
	    break;
	 case 'vertical arc'  :
            this.renderCurve(this.createArc(b[0], a[1], a[0] - b[0], b[1] - a[1]));
	    break;
	 }
      });
   }
   this._a = [0, 0];
   this._b = [0, 0];

   // THIS SHOULD BE CHANGED TO DELETE JUST THE LINE OR ARC CLICKED ON.

   this.onClick = function(pt) {
      var curves = this._curves[this.selection];
      if (curves.length > 1)
         curves.pop();
   }

   this.onPress = function(pt) {
      var curves = this._curves[this.selection], i, a, b, c;
      this._a[0] = this.match(0, pt.x);
      this._a[1] = this.match(1, pt.y);
      this._lineState = 'none';
      for (i = 0 ; i < curves.length ; i++) {
         a = this.getFirstPoint(curves[i]);
         b = this.getLastPoint(curves[i]);
         c = mix(a, b, .5);

         if (this.isNear(this._a, a))
            this.copy(this._a, a);
         else if (this.isNear(this._a, b))
            this.copy(this._a, b);
         else if (this.isNear(this._a, c))
            this.copy(this._a, c);
      }
      this.copy(this._b, this._a);
   }
   this.onDrag = function(p) {
      var ax, ay, isHorizontal, isVertical;

      this._b[0] = p.x;
      this._b[1] = p.y;

      ax = abs(this._b[0] - this._a[0]);
      ay = abs(this._b[1] - this._a[1]);
      if (max(ax, ay) < 2 * this._tolerance)
         return;

      isHorizontal = ay < ax / 4;
      isVertical   = ax < ay / 4;

      if (this._lineState == 'none' && isHorizontal)
         this._lineState = 'horizontal line';

      else if (this._lineState == 'none' && isVertical)
         this._lineState = 'vertical line';

      else if (this._lineState == 'none')
         this._lineState = 'diagonal line';

      else if (this._lineState == 'horizontal line' && ! isHorizontal)
         this._lineState = 'horizontal arc';

      else if (this._lineState == 'vertical line' && ! isVertical)
         this._lineState = 'vertical arc';
   }
   this.onRelease = function(p) {
      var curves = this._curves[this.selection], C, c, dx, dy, d;

      this._b[0] = this.match(0, this._b[0]);
      this._b[1] = this.match(1, this._b[1]);

      C = this.createLine(this._a[0], this._a[1], this._b[0], this._b[1]);

      if (max( abs(C.b[0] - C.a[0]), abs(C.b[1] - C.a[1]) ) < this._tolerance) {
         this._lineState = 'none';
         return;
      }

      switch (this._lineState) {
      case 'horizontal line':
         C.b[1] = C.a[1];
         break;
      case 'vertical line':
         C.b[0] = C.a[0];
         break;
      case 'horizontal arc':
         C = this.createArc(C.a[0], C.b[1], C.b[0] - C.a[0], C.a[1] - C.b[1], true);
         break;
      case 'vertical arc':
         C = this.createArc(C.b[0], C.a[1], C.a[0] - C.b[0], C.b[1] - C.a[1]);
         break;
      }

      if (C.type == 'arc') {
         c = curves[curves.length - 1];
         if (c.type == 'arc' && this.isNear(c.center, C.center)) {
	    C.center[0] = c.center[0];
	    C.center[1] = c.center[1];
	    C.radius[0] = abs(c.radius[0]) * (C.radius[0] > 0 ? 1 : -1);
	    C.radius[1] = abs(c.radius[1]) * (C.radius[1] > 0 ? 1 : -1);
	 }
      }

      curves.push(C);
      this._lineState = 'none';
   }
   this.match = function(n, value) {
      var curves = this._curves[this.selection], i, j, len;

      // FIRST TRY TO MATCH ENDS.

      for (i = 0 ; i < curves.length ; i++) {
         p = this.getFirstPoint(curves[i]);
	 if (abs(value - p[n]) < this._tolerance)
	    return p[n];

         p = this.getLastPoint(curves[i]);
	 if (abs(value - p[n]) < this._tolerance)
	    return p[n];
      }

      // THEN TRY TO MATCH MIDPOINTS.

      for (i = 0 ; i < curves.length ; i++)
         if (curves[i].length == 2) {
            p0 = this.getFirstPoint(curves[i]);
            p1 = this.getLastPoint (curves[i]);
	    var midpt = (p0[n] + p1[n]) / 2;

	    if (abs(value - midpt) < this._tolerance)
	       return midpt;
	 }
      return value;
   }
   this.isNear = function(a,b) {
      var x = b[0] - a[0], y = b[1] - a[1];
      return x * x + y * y < this._tolerance * this._tolerance;
   }
   this.copy = function(dst, src) {
      dst[0] = src[0];
      dst[1] = src[1];
   }
}

