
function SketchLink(a, i, b, j, s) {
   this.a = a;
   this.i = i;
   this.b = b;
   this.j = j;
   this.s = s === undefined ? 0 : s;

   if (i >= a.out.length || a.out[i] === undefined)
      a.out[i] = [];
   a.out[i].push(this);

   b.in[j] = this;
}

SketchLink.prototype = {

   computeCurvature : function(xy) {
      this.s = computeCurvature(this.a.portXY(this.i), xy, this.b.portXY(this.j));
      this.status = undefined;
   },

   draw : function(isVisible) {
      var a = this.a;
      var i = this.i;
      var b = this.b;
      var j = this.j;
      var s = this.s;

      var A = a.portXY(i), ax = A[0], ay = A[1];
      var B = b.portXY(j), bx = B[0], by = B[1];

      var aR = a.hasPortBounds(i) ? a.portBounds[i] : [a.xlo,a.ylo,a.xhi,a.yhi];
      var bR = b.hasPortBounds(j) ? b.portBounds[j] : [b.xlo,b.ylo,b.xhi,b.yhi];

      // ONLY RECOMPUTE LINK SHAPE WHEN NECESSARY.

      var status = [ax,ay,bx,by,s, aR[0],aR[1],aR[2],aR[3], bR[0],bR[1],bR[2],bR[3]];
      if (! isEqualArray(status, this.status)) {
         this.status = status;
         this.C = createCurve(A, B, s);
         this.C = clipCurveAgainstRect(this.C, aR);
         this.C = clipCurveAgainstRect(this.C, bR);
         //this.C = clipCurveAgainstRect(this.C, [a.xlo,a.ylo,a.xhi,a.yhi]);
         //this.C = clipCurveAgainstRect(this.C, [b.xlo,b.ylo,b.xhi,b.yhi]);
      }

      if (isVisible) {
         lineWidth(dataLineWidth);
         color(dataColor);
         var C = this.C;
         for (var n = 0 ; n < C.length-1 ; n++)
            if (n < C.length-2)
               line(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);
            else
               arrow(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);

         if (! isExpertMode) {
            var cx = (ax + bx) / 2 + (ay - by) * s;
            var cy = (ay + by) / 2 + (bx - ax) * s;
            color(defaultPenColor);
            textHeight(12);
            utext(roundedString(a.outValue[i]), cx, cy, .5, .5);
	 }

         else if (b.portName.length == 0 && (! b.isNullText() || b.code != null)) {
            var cx = (ax + bx) / 2 + (ay - by) * s;
            var cy = (ay + by) / 2 + (bx - ax) * s;
            color(backgroundColor);
            fillOval(cx - 13, cy - 13, 26, 26);
            color(dataColor);
            textHeight(16);
            utext(j==0 ? "x" : j==1 ? "y" : "z", cx, cy - (j==1?3:1), .5, .6, 'Arial');
            lineWidth(1);
            drawOval(cx - 13, cy - 13, 26, 26);
         }
      }
   },

   removeFromOutSketch : function() {
      var a = this.a;
      var i = this.i;
      for (var k = 0 ; k < a.out[i].length ; k++)
         if (a.out[i][k] == this) {
            a.out[i].splice(k, 1);
            if (a.out[i].length == 0)
               a.outValue[i] = undefined;
            break;
         }
   },

   removeFromInSketch : function() {
      var b = this.b;
      var j = this.j;
      b.in[j] = undefined;
      b.inValue[j] = undefined;
      if (isSimpleSketch(b) && b.isNullText() && b.sp0.length <= 1)
         deleteSketch(b);
   },
}

