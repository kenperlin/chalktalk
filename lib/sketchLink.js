"use strict";

/*
   Link from sketch "fromSketch", port "outputPortIndex" (at the moment all sketches only
   have one output port, so outputPortIndex should always be 0) to sketch "toSketch",
   port "inputPortIndex", with curvature of the line specified by "curvature".
*/

function SketchLink(fromSketch, outputPortIndex, toSketch, inputPortIndex, curvature) {
   this.a = fromSketch;
   this.i = outputPortIndex;
   this.b = toSketch;
   this.j = inputPortIndex;
   this.s = def(curvature, 0);
   this._isVisible = true;
   this._displayMode = 0;
   this._displayIndex = 0;
   this.color = fadedColor(0.5);

   // If fromSketch has no out links on port outputPortIndex, set this to be its out link.

   if (outputPortIndex >= fromSketch.out.length || fromSketch.out[outputPortIndex] === undefined)
      fromSketch.out[outputPortIndex] = [];
   fromSketch.out[outputPortIndex].push(this);

   // Set this to be the in link for sketch toSketch, port inputPortIndex.

   toSketch.in[inputPortIndex] = this;
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
      case -1: group.temporaryAction(this.a.findLinkedSketches(), x, y); break;
      case  0: this._displayMode = this._displayMode != 2 ? 2 : 0; break;
      case  2: this._displayMode = this._displayMode != 1 ? 1 : 0; break;
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
      this.color = fractionToGray(isWhiteBackground() ? 0.3 : 0.2);

      var a = this.a;
      var i = this.i;
      var b = this.b;
      var j = this.j;
      var s = this.s;

      // Draw an 'invisible' link only if one of the sketches is the selected sketch.

      if (! this._isVisible && a != sk() && b != sk())
         return;

      // The link tries to start and end at centroid of the sketches.

      var ax = (a.xlo + a.xhi) / 2;
      var ay = (a.ylo + a.yhi) / 2;

      var bx = (b.xlo + b.xhi) / 2;
      var by = (b.ylo + b.yhi) / 2;

      // Get the bounds of the two sketches.

      var aR = [a.xlo,a.ylo,a.xhi,a.yhi];
      var bR = [b.xlo,b.ylo,b.xhi,b.yhi];

      // ONLY RECOMPUTE LINK SHAPE WHEN NECESSARY.

      var status = [ax,ay,bx,by,s, aR[0],aR[1],aR[2],aR[3], bR[0],bR[1],bR[2],bR[3]];
      if (! isEqualArray(status, this.status)) {
         this.status = status;
         this.C = createCurvedLine([ax,ay], [bx,by], s);
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
         lineWidth(dataLineWidth * (this == linkAtCursor ? 2 : 1));
         color(this.color);

         // as a curved line with an arrow at the end.

         var C = this.C;
         var n = C.length;
         drawCurve(C);
         if (n >= 2)
            arrowHead(C[n-2][0], C[n-2][1], C[n-1][0], C[n-1][1]);

         if (sketchPage.isFuzzyLines())
	    return;

         switch (this._displayMode) {

         case 2: // Show time-varying numeric value for the link:

            var val = b.inValues[this.displayIndex()];

            if (this.valueBuffer === undefined)
               this.valueBuffer = [];

            if (val !== undefined) {
               this.valueBuffer.push(valueOf(0, time));
               this.valueBuffer.push(valueOf(val, time));
               if (b.inValues.length > 1 && this.c.length >= 2) {
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

            if (b.in.length > 1 || b.inLabel.length > 0) {
               var label, dy;
               if (b.inLabel[j] === undefined) {
                  label = "xyzXYZ".substring(j, j+1);
                  dy = j == 1 ? -3 : -1.5;
               }
               else {
                  label = b.inLabel[j];
                  dy = -3;
               }
               var ts = sfs(7);
               _g.font = floor(ts * 2) + 'pt ' + defaultFont;
               var tw = textWidth(label);
               color(backgroundColor);
               fillRect(this.c[0] - tw/2, this.c[1] - ts, tw, 2*ts);
               color(this.color);
               utext(label, this.c[0], this.c[1] + dy, .5, .5, _g.font);
            }
            break;
         }
      }
   },

   highlight : function() {
      _g.save();
      color('rgba(0,128,255,.3)');
      lineWidth(20);
      _g_beginPath();
      _g_moveTo(this.C[0][0], this.C[0][1]);
      for (var n = 1 ; n < this.C.length ; n++)
         _g_lineTo(this.C[n][0], this.C[n][1]);
      _g_stroke();
      _g.restore();
   },

   remove : function() {
      this.removeFromOutSketch();
      this.removeFromInSketch();
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
      if (b.isFreehandSketch() && b.isNullText() && b.sp0.length <= 1)
         deleteSketch(b);
   },

   split : function() {
      var s = this.s;
      this.remove();
      var j = 0;
      while (sk().in[j] !== undefined)
         j++;
      new SketchLink(this.a, this.i, sk(), j, s / 2);
      var i = sk().outPortIndex(true);
      new SketchLink(sk(), i, this.b, this.j, s / 2);
   },

   drawTransformed : function(transformX, transformY) {
      color(this.color);

      // as a curved line with an arrow at the end.

      var C = this.C;
      for (var n = 0 ; n < C.length-1 ; n++) {
         var ax = transformX(C[n  ][0]);
         var ay = transformY(C[n  ][1]);
         var bx = transformX(C[n+1][0]);
         var by = transformY(C[n+1][1]);
         if (n < C.length-2)
            line(ax, ay, bx, by);
         else
            arrow(ax, ay, bx, by);
      }
   },
}

