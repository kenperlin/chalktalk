
function() {

// NEED TO SWITCH TO MORE PROPER OBJECT FORMAT FOR LINES AND ARCS (MAYBE WITH CACHE OF ACTUAL CURVE).

// { type: 'line' , a: [x,y] , b: [x,y] }
// { type: 'arc'  , center: [x,y] , radius: [x,y] , reverse: boolean }

// THEN NEED TO MERGE LINES AND ARCS THAT CONTINUE EACH OTHER (CHECKING FOR NEAR-EQUAL RADII).

// TO ADD: CMD-DRAG ON A POINT TO MOVE IT.

// THINK ABOUT HOW TO EXTEND ALL THIS TO 3D.

   this.labels = [ 'LineUp'       , 'LineDown'    , 'LineLeft'    , 'LineRight'    ,
                   'ArcUpLeft'    , 'ArcUpRight'  , 'ArcDownLeft' , 'ArcDownRight' ,
                   'ArcRightDown' , 'ArcLeftDown' , 'ArcRightUp'  , 'ArcLeftUp'    ];

   this.tolerance = 0.1; // HOW NEAR THINGS NEED TO BE TO BE CONSIDERED THE "SAME" POINT.

   this.createLine = function(ax, ay, bx, by) {
      return [ [ ax, ay], [bx, by] ];
/*
      return { type: 'line', a: [ax, ay], b: [bx, by] };
*/
   }
   this.createArc = function(x, y, rx, ry, isReverse) {
      var curve = [], n, theta;;
      for (n = 0 ; n <= 8 ; n++) {
         theta = PI / 2 * n / 8;
         curve.push( [ x + rx * cos(theta), y + ry * sin(theta) ] );
      }
      return isReverse ? reverse(curve) : curve;
/*
      return { type: 'arc', center: [x, y], radius: [rx,ry], reverse: isReverse };
*/
   }
   this.renderCurve = function(curve) {
      mCurve(curve);
/*
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
*/
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
         a = curves[i][0];
         b = curves[i][curves[i].length - 1];
         c = mix(a, b, .5);
/*
         a = this.getFirstPoint(curves[i]);
         b = this.getLastPoint(curves[i]);
         c = mix(a, b, .5);
*/
         if (isNear(this._a, a))
            copy(this._a, a);
         else if (isNear(this._a, b))
            copy(this._a, b);
         else if (isNear(this._a, c))
            copy(this._a, c);
      }
      copy(this._b, this._a);
   }
   this.onDrag = function(p) {
      this._b[0] = p.x;
      this._b[1] = p.y;

      var x = this._b[0] - this._a[0];
      var y = this._b[1] - this._a[1];
      var ax = abs(x), ay = abs(y);
      if (max(ax, ay) < this.tolerance)
         return;

      var isHorizontal = ay < ax / 4;
      var isVertical   = ax < ay / 4;

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
      this._b[0] = this.match(0, this._b[0]);
      this._b[1] = this.match(1, this._b[1]);

      var C = [ [ this._a[0], this._a[1] ], [ this._b[0], this._b[1] ] ];
/*
      var C = createLine(this._a[0], this._a[1], this._b[0], this._b[1]);
*/

      if (max( abs(C[1][0] - C[0][0]), abs(C[1][1] - C[0][1]) ) < this.tolerance) {
         this._lineState = 'none';
         return;
      }

      switch (this._lineState) {
      case 'horizontal line':
         C[1][1] = C[0][1];
/*
         C.b[1] = C.a[1];
*/
         break;
      case 'vertical line':
         C[1][0] = C[0][0];
/*
         C.b[0] = C.a[0];
*/
         break;
      case 'horizontal arc':
         C = this.createArc(C[0][0], C[1][1], C[1][0] - C[0][0], C[0][1] - C[1][1], true);
/*
         C = this.createArc(C.a[0], C.b[1], C.b[0] - C.a[0], C.a[1] - C.b[1], true);
*/
         break;
      case 'vertical arc':
         C = this.createArc(C[1][0], C[0][1], C[0][0] - C[1][0], C[1][1] - C[0][1]);
/*
         C = this.createArc(C.b[0], C.a[1], C.a[0] - C.b[0], C.b[1] - C.a[1]);
*/
         break;
      }

      this._curves[this.selection].push(C);
      this._lineState = 'none';
   }
   this.match = function(n, value) {
      var curves = this._curves[this.selection], i, j, len;

      // FIRST TRY TO MATCH ENDS.

      for (i = 0 ; i < curves.length ; i++) {
         len = curves[i].length;
         for (j = 0 ; j < len ; j += len-1)
            if (abs(value - curves[i][j][n]) < this.tolerance)
               return curves[i][j][n];
/*
         p = getFirstPoint(curves[i]);
	 if (abs(value - p[n]) < this.tolerance;
	    return p;

         p = getLastPoint(curves[i]);
	 if (abs(value - p[n]) < this.tolerance;
	    return p;
*/
      }

      // THEN TRY TO MATCH MIDPOINTS.

      for (i = 0 ; i < curves.length ; i++)
         if (curves[i].length == 2) {
	    var midpt = (curves[i][0][n] + curves[i][1][n]) / 2;
/*
            p0 = getFirstPoint(curves[i]);
            p1 = getLastPoint(curves[i]);
	    var midpt = (p0[n] + p1[n]) / 2;
*/
	    if (abs(value - midpt) < this.tolerance)
	       return midpt;
	 }
      return value;
   }
   function isNear(a,b) {
      var x = b[0] - a[0], y = b[1] - a[1];
      return x * x + y * y < this.tolerance * this.tolerance;
   }
   function copy(dst, src) {
      dst[0] = src[0];
      dst[1] = src[1];
   }
}

