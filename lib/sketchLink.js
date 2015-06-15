
/*
   Link from sketch a, port i to sketch b, port j, with curvature s.
*/

function SketchLink(a, i, b, j, s) {
   this.a = a;
   this.i = i;
   this.b = b;
   this.j = j;
   this.s = def(s, 0);
   this._displayMode = 0;
   this._displayIndex = 0;

   // If a has no out links on port i, set this to be its out link.

   if (i >= a.out.length || a.out[i] === undefined)
      a.out[i] = [];
   a.out[i].push(this);

   // Set this to be the in link for sketch b, port j.

   b.in[j] = this;
}

SketchLink.prototype = {

   mouseDown : function(x, y) {
      this.xDown = x;
      this.yDown = y;
      this.dragMode = -1;
   },

   mouseDrag : function(x, y) {
      var dx = x - this.xDown;
      var dy = y - this.yDown;
      if (this.dragMode == -1 && len(dx, dy) > clickSize())
         this.dragMode = pieMenuIndex(dx, dy);
      switch (this.dragMode) {
      case 1:
      case 3:
         if (abs(dy) > clickSize()) {
            this._displayIndex += dy < 0 ? -1 : 1;
            this.yDown = y;
         }
         break;
      }
   },

   mouseUp : function(x, y) {
      switch (this.dragMode) {
      case 0: this._displayMode = this._displayMode != 2 ? 2 : 0; break;
      case 2: this._displayMode = this._displayMode != 1 ? 1 : 0; break;
      }
   },

   computeCurvature : function(xy) {
      this.s = computeCurvature(this.a.portXY(this.i), xy, this.b.portXY(this.j));
      this.status = undefined;
   },

   displayIndex : function() {
     var nVals = this.b.inValues.length;
     return (nVals * 100 + this._displayIndex) % nVals;
   },

   displayMode : function() {
     return this._displayMode;
   },

   draw : function(isVisible) {
      var a = this.a;
      var i = this.i;
      var b = this.b;
      var j = this.j;
      var s = this.s;

      // Get the locations of the start and end points for the link.

      var A = a.portXY(i), ax = A[0], ay = A[1];
      var B = b.portXY(j), bx = B[0], by = B[1];

      // Clip against bounds of the two sketches.

      var aR = a.hasPortBounds(i) ? a.portBounds[i] : [a.xlo,a.ylo,a.xhi,a.yhi];
      var bR = b.hasPortBounds(j) ? b.portBounds[j] : [b.xlo,b.ylo,b.xhi,b.yhi];

      // ONLY RECOMPUTE LINK SHAPE WHEN NECESSARY.

      var status = [ax,ay,bx,by,s, aR[0],aR[1],aR[2],aR[3], bR[0],bR[1],bR[2],bR[3]];
      if (! isEqualArray(status, this.status)) {
         this.status = status;
         this.C = createCurve(A, B, s);
         this.C = clipCurveAgainstRect(this.C, aR);
         this.C = clipCurveAgainstRect(this.C, bR);

         this.C = clipCurveAgainstRect(this.C, [a.xlo,a.ylo,a.xhi,a.yhi]);
         this.C = clipCurveAgainstRect(this.C, [b.xlo,b.ylo,b.xhi,b.yhi]);
         this.C = resampleCurve(this.C, 20);

         // Text label will appear in center of curve.

         var n = this.C.length;
         var i = floor(n / 2);
         this.c = getPointOnCurve(this.C, 0.5);
      }

      // Draw the link:

      if (isVisible) {
         lineWidth(dataLineWidth);
         color(dataColor);

         // as a curved line with an arrow at the end.

         var C = this.C;
         for (var n = 0 ; n < C.length-1 ; n++)
            if (n < C.length-2)
               line(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);
            else
               arrow(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);

         switch (this._displayMode) {

         case 2: // Show time-varying numeric value for the link:

            var val = b.inValues[this.displayIndex()];

            if (this.valueBuffer === undefined)
               this.valueBuffer = [];

            if (val !== undefined) {
               this.valueBuffer.push(valueOf(0, time));
               this.valueBuffer.push(valueOf(val, time));
               if (b.inValues.length > 1) {
                  color(liveDataColor);
                  textHeight(sfs(10));
                  utext(this.displayIndex() + '/' + b.inValues.length, this.c[0], this.c[1], .5, -1.5);
               }
            }

            if (this.valueBuffer.length > 0) {
               var curve = [];
               var scale = height() / 20;
               for (var i = 0 ; i < this.valueBuffer.length ; i++)
                  curve.push([this.c[0] + this.valueBuffer.length - i,
                              this.c[1] - scale * this.valueBuffer[i]]);
               _g.save();
               lineWidth(1);
               color(liveDataColor);
               drawCurve(curve);
               _g.restore();
            }
            break;

         case 1: // Show the numeric value currently traversing the link:

            var val = b.inValues[this.displayIndex()];

            if (val !== undefined) {
               color(liveDataColor);
               if (b.inValues.length > 1) {
                  textHeight(sfs(10));
                  utext(this.displayIndex() + '/' + b.inValues.length, this.c[0], this.c[1], .5, -1.5);
               }
               textHeight(sfs(12));
               utext(roundedString(valueOf(val, time)), this.c[0], this.c[1], .5, .5);
            }
            break;

         case 0: // Label the link as 'x','y' or 'z'.

            var ts = sfs(10);
            color(backgroundColor);
            fillOval(this.c[0] - ts, this.c[1] - ts, 2*ts, 2*ts);
            color(dataColor);
            textHeight(ts*16/13);
            utext("xyzXYZ".substring(j, j+1), this.c[0], this.c[1] - (j==1?3:1), .5, .6, 'Arial');
            break;

         }
      }
   },

   highlight : function() {
      _g.save();
      color('rgba(0,128,255,.3)');
      lineWidth(20);
      _g.beginPath();
      _g.moveTo(this.C[0][0], this.C[0][1]);
      for (var n = 1 ; n < this.C.length ; n++)
         _g.lineTo(this.C[n][0], this.C[n][1]);
      _g.stroke();
      _g.restore();
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

