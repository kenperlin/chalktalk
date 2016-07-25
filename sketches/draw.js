
function() {

/*
   TO DO:   Add translational joints.
            Create more sensible semantics for joints.
	    Output joints when outputting a sketch.
*/

   this.labels = [ 'LineUp'       , 'LineDown'    , 'LineLeft'    , 'LineRight'    ,
                   'ArcUpLeft'    , 'ArcUpRight'  , 'ArcDownLeft' , 'ArcDownRight' ,
                   'ArcRightDown' , 'ArcLeftDown' , 'ArcRightUp'  , 'ArcLeftUp'    ];

   this.is3D = true;
   this._tolerance = 0.1; // HOW NEAR THINGS NEED TO BE TO BE CONSIDERED THE "SAME" POINT.
   this._curveState = 'none';
   this._x = 0;
   this._y = 0;
   this._p0 = newVec3();
   this._p1 = newVec3();
   this._p2 = newVec3();
   this._p3 = newVec3();

   this.createLine = function(ax, ay, bx, by) {
      var cx = (ax + bx) / 2, cy = (ay + by) / 2;
      var rx = (bx - ax) / 2, ry = (by - ay) / 2;
      return { type: 'line', bounds: [cx, cy, rx, ry] };
   }

   this.createArc = function(cx, cy, rx, ry, t0, t1) {
      return { type: 'arc', bounds: [cx, cy, rx, ry], data: [t0, t1] };
   }

   this.createJoint = function(data) {
      return { type: 'joint', data: data };
   }

   this.p2p = function(src, dst) {
      this.pointToPixel(src, dst);
      dst.x = this.unadjustX(dst.x);
      dst.y = this.unadjustY(dst.y);
   }

   this.isAtMouse = function(x, y) {
      this.p2p(this._p0, this._p1);
      this._p2.x = x;
      this._p2.y = y;
      this.p2p(this._p2, this._p3);
      var dx = this._p3.x - this._p1.x;
      var dy = this._p3.y - this._p1.y;
      return abs(dx) < 10 && abs(dy) < 10;
   }

   this._setPointAtCursor = function(i, x, y) {
      this._pointAtCursor = [i, x, y];
      mFillDisk([x, y], 10 / this.mScale(1));
   }

   this.renderCurve = function(curve, i) {
      if (curve.type == 'joint') {
	 mDrawDisk(curve.data, 0.2);
	 return;
      }
      else
         mDraw(curve.type, curve.bounds, curve.data);

      if (isDef(i) && this._pointAtCursor == 'no match' && this.isAfterSketch()) {
         var cx = curve.bounds[0], cy = curve.bounds[1],
             rx = curve.bounds[2], ry = curve.bounds[3];
         if (this.isAtMouse(cx   , cy   )) this._setPointAtCursor(i, cx   , cy   );
         if (this.isAtMouse(cx-rx, cy-ry)) this._setPointAtCursor(i, cx-rx, cy-ry);
         if (this.isAtMouse(cx+rx, cy+ry)) this._setPointAtCursor(i, cx+rx, cy+ry);
      }
   }

   this.getFirstPoint = function(curve) {
      var cx = curve.bounds[0], cy = curve.bounds[1],
          rx = curve.bounds[2], ry = curve.bounds[3];
      switch (curve.type) {
      case 'line':
         return [ cx - rx, cy - ry ];
      case 'arc':
         var c = cos(curve.data[0] * PI / 180),
             s = sin(curve.data[0] * PI / 180);
         return [ cx + c * rx, cy + s * ry ];
      }
   }

   this.getLastPoint = function(curve) {
      var cx = curve.bounds[0], cy = curve.bounds[1],
          rx = curve.bounds[2], ry = curve.bounds[3];
      switch (curve.type) {
      case 'line':
         return [ cx + rx, cy + ry ];
      case 'arc':
         var c = cos(curve.data[1] * PI / 180),
             s = sin(curve.data[1] * PI / 180);
         return [ cx + c * rx, cy + s * ry ];
      }
   }

   this._curves = [
     [ this.createLine( 0,-1,  0, 1) ],
     [ this.createLine( 0, 1,  0,-1) ],
     [ this.createLine( 1, 0, -1, 0) ],
     [ this.createLine(-1, 0,  1, 0) ],

     [ this.createArc ( 0, 0,  1, 1,  0, 90) ],
     [ this.createArc ( 0, 0, -1, 1,  0, 90) ],
     [ this.createArc ( 0, 0,  1,-1,  0, 90) ],
     [ this.createArc ( 0, 0, -1,-1,  0, 90) ],

     [ this.createArc ( 0, 0,  1, 1,  90, 0) ],
     [ this.createArc ( 0, 0,  1,-1,  90, 0) ],
     [ this.createArc ( 0, 0, -1, 1,  90, 0) ],
     [ this.createArc ( 0, 0, -1,-1,  90, 0) ],
   ];

   this.render = function() {
      var curves = this._curves[this.selection];
      var a, b, i, d;

      this._pointAtCursor = 'no match';
      for (i = 0 ; i < curves.length ; i++)
         this.renderCurve(curves[i], i);

      a = this._a;
      b = this._b;

      switch (this._curveState) {
      case 'horizontal line':
      case 'vertical line'  :
      case 'diagonal line'  :
         this.renderCurve(this.createLine(a[0], a[1], b[0], b[1]));
         break;
      case 'horizontal arc':
         this.renderCurve(this.createArc(a[0], b[1], b[0] - a[0], a[1] - b[1], 90, 0));
         break;
      case 'vertical arc'  :
         this.renderCurve(this.createArc(b[0], a[1], a[0] - b[0], b[1] - a[1], 0, 90));
         break;
      }
   }

   this._a = [0, 0];
   this._b = [0, 0];
   this._m0 = 0;
   this._m1 = 0;

   this.onCmdPress = function(p) {
      this._m0 = [ p.x, p.y ];
      if (this._pointAtCursor != 'no match') {
         var i = this._pointAtCursor[0];
         var xy = [ this._pointAtCursor[1],
                    this._pointAtCursor[2] ];
         var curves = this._curves[this.selection];
         curves.splice(i + 1, 0, this.createJoint(xy));
      }
   }

   this.onCmdDrag = function(p) {
      this._m1 = [ p.x, p.y ];
   }

   this.onCmdRelease = function(p) {
      if (! this.isNear(this._m0, this._m1)) {
         var dir = pieMenuIndex(this._m1[0] - this._m0[0],
                                this._m0[1] - this._m1[1], 8);
      }
   }

   this.onCmdClick = function(pt) {
      var curves = this._curves[this.selection], i, a, b, c;
      var name = 'draw01';
      var code = 'function() {\n';
      code += "   this.label = '" + name + "';\n";
      code += '   this.render = function() {\n';
      for (i = 0 ; i < curves.length ; i++) {
         var curve = curves[i];
         switch (curve.type) {
         case 'line': 
            code += '      mDraw(\'line\', [' +
                                      roundedString(curve.bounds[0]) + ',' +
                                      roundedString(curve.bounds[1]) + ', ' +
                                      roundedString(curve.bounds[2]) + ',' +
                                      roundedString(curve.bounds[3]) + ']);\n';
            break;
         case 'arc': 
            code += '      mDraw(\'arc\' , [' +
                                      roundedString(curve.bounds[0]) + ',' +
                                      roundedString(curve.bounds[1]) + ', ' +
                                      roundedString(curve.bounds[2]) + ',' +
                                      roundedString(curve.bounds[3]) + '], [' +
                                      roundedString(curve.data  [0]) + ',' +
                                      roundedString(curve.data  [1]) + ']);\n';
            break;
         }
      }
      code += '   }\n';
      code += '   this.onCmdPress   = function(p) { this.editRenderPress  (p); }\n';
      code += '   this.onCmdDrag    = function(p) { this.editRenderDrag   (p); }\n';
      code += '   this.onCmdRelease = function(p) { this.editRenderRelease(p); }\n';
      code += '   this.onCmdClick = function(p) { this.spliceRender(2, 0, \'m.rotateZ(this.inValue[0]);\'); }\n';
      code += '}\n';
      createSketchType(name, code);
   }

   // THIS SHOULD BE CHANGED TO DELETE JUST THE LINE OR ARC CLICKED ON.

   this.onClick = function(pt) {
      var curves = this._curves[this.selection];
      if (curves.length > 1)
         curves.pop();
   }

   this.onMove = function(pt) {
      this._p0.x = pt.x;
      this._p0.y = pt.y;
   }

   this.onPress = function(pt) {
      var curves = this._curves[this.selection], i, a, b, c;
      this._a[0] = this.match(0, pt.x);
      this._a[1] = this.match(1, pt.y);
      this._curveState = 'none';
      for (i = 0 ; i < curves.length ; i++) {
         if (curves[i].type == 'joint')
	    continue;

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
      if (max(ax, ay) < this._tolerance)
         return;

      isHorizontal = ay < ax / 2;
      isVertical   = ax < ay / 2;

      if (this._curveState == 'none' && isHorizontal)
         this._curveState = 'horizontal line';

      else if (this._curveState == 'none' && isVertical)
         this._curveState = 'vertical line';

      else if (this._curveState == 'none')
         this._curveState = 'diagonal line';

      else if (this._curveState == 'horizontal line' && ! isHorizontal)
         this._curveState = 'horizontal arc';

      else if (this._curveState == 'vertical line' && ! isVertical)
         this._curveState = 'vertical arc';
   }

   this.onRelease = function(p) {
      var curves = this._curves[this.selection], C, a, b, cc, dx, dy, d, p0, p1;

      this._b[0] = this.match(0, this._b[0]);
      this._b[1] = this.match(1, this._b[1]);

      a = this._a;
      b = this._b;

      C = this.createLine(a[0], a[1], b[0], b[1]);

      if (max( abs(C.bounds[2]), abs(C.bounds[3]) ) < this._tolerance) {
         this._curveState = 'none';
         return;
      }

      switch (this._curveState) {
      case 'horizontal line':
         C.bounds[3] = 0;
         break;
      case 'vertical line':
         C.bounds[2] = 0;
         break;
      case 'horizontal arc':
         this.renderCurve(C = this.createArc(a[0], b[1], b[0] - a[0], a[1] - b[1], 90, 0));
         break;
      case 'vertical arc':
         this.renderCurve(C = this.createArc(b[0], a[1], a[0] - b[0], b[1] - a[1], 0, 90));
         break;
      }

      this._curveState = 'none';
      if (C.type == 'arc') {
         c = curves[curves.length - 1];
         if (c.type == 'arc' && this.isNear(c.bounds, C.bounds, .2)) {
            p0 = this.getFirstPoint(c);
            p1 = this.getFirstPoint(C);
            if (this.isNear(p0, p1)) {
               c.data[0] -= (c.data[0] < c.data[1] ? 90 : -90);
               return;
            }
            p0 = this.getLastPoint(c);
            if (this.isNear(p0, p1)) {
               c.data[1] += (c.data[0] < c.data[1] ? 90 : -90);
               return;
            }
         }
      }

      curves.push(C);
   }

   this.extendsArc = function(C) {
      var curves = this._curves[this.selection], c, p0, p1;
      if (C.type == 'arc') {
         c = curves[curves.length - 1];
         if (c.type == 'arc' && this.isNear(c.bounds, C.bounds)) {
            p0 = this.getFirstPoint(c);
            p1 = this.getFirstPoint(C);
            if (this.isNear(p0, p1))
               return -1;
            p0 = this.getLastPoint(c);
            if (this.isNear(p0, p1))
               return 1;
         }
      }
      return 0;
   }

   this.match = function(n, value) {
      var curves = this._curves[this.selection], i, j, len, p0, p1;

      // FIRST TRY TO MATCH ENDS.

      for (i = 0 ; i < curves.length ; i++) {
         if (curves[i].type == 'joint')
	    continue;

         p = this.getFirstPoint(curves[i]);
         if (abs(value - p[n]) < this._tolerance)
            return p[n];

         p = this.getLastPoint(curves[i]);
         if (abs(value - p[n]) < this._tolerance)
            return p[n];
      }

      // THEN TRY TO MATCH MIDPOINTS.

      for (i = 0 ; i < curves.length ; i++) {
         if (curves[i].type == 'joint')
	    continue;

         if (curves[i].length == 2) {
            p0 = this.getFirstPoint(curves[i]);
            p1 = this.getLastPoint (curves[i]);
            var midpt = (p0[n] + p1[n]) / 2;

            if (abs(value - midpt) < this._tolerance)
               return midpt;
         }
      }

      return value;
   }

   this.isNear = function(a,b,t) {
      t = def(t, this._tolerance);
      return abs(a[0] - b[0]) < t && abs(a[1] - b[1]) < t;
   }

   this.copy = function(dst, src) {
      dst[0] = src[0];
      dst[1] = src[1];
   }
}

