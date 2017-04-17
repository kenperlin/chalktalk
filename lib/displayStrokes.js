"use strict";

/*
   Display Chalktalk strokes.
*/

function DisplayStrokes(g) {
   this.g = g;
   this.focalLength = 10;
   this.interocular = 1;
}

DisplayStrokes.prototype = {

   width : function() {
      return this.g.canvas.width;
   },

   height : function() {
      return this.g.canvas.height;
   },

   beginPath : function() {
      this.path = [];
   },

   pathTo : function(p, isLine) {
      this.path.push([ p[0], p[1], def(p[2],0), isLine ]);
   },

   stroke : function() {
      this._stroke_or_fill(0);
   },

   fill : function() {
      this._stroke_or_fill(1);
   },

   textCharWidth : function() {
      return 0.85;
   },

   text : function(str, p) {
      var id = isk() ? sk().id + sk().stringId++ : 0;

      var c, curve, curves, i, j, n, pt, sx, sy, save_lineWidth, save_strokeStyle, x, y;

      save_lineWidth = _g.lineWidth;
      save_strokeStyle = _g.strokeStyle;

      sy = parseFloat(this.g.font) / 4;
      sx = sy * this.textCharWidth();

      var bold   = this.g.font.indexOf('bold'  ) >= 0 ? 1 : 0;
      var italic = this.g.font.indexOf('italic') >= 0 ? 1 : 0;

      _g.lineWidth = max(1, sy / 5) * (1 + bold);
      _g.strokeStyle = _g.fillStyle;

      x = p[0] + sx;
      y = p[1] - sy * 1.5;
      var font = CT.lineFont[sy > 5 ? 0 : 1];
      for (n = 0; n < str.length; n++) {
         let ch = str.charCodeAt(n);
         if (font[ch]) {
            curves = font[ch];
            for (i = 0; i < curves.length; i++) {
               curve = curves[i];
               if (isCasualFont && sy > 6)
                  curve = randomizeCurve(curve, n + id);
               for (j = 0; j < curve.length; j++) {
                  pt = curve[j];
                  pt = [x + sx * (pt[0] + .2 * pt[1] * italic), y - sy * pt[1], 0, j > 0];
                  this._actual_moveTo_or_lineTo(pt);
               }
               this._actual_stroke_or_fill(false);
            }
            x += 2 * sx;
         }
      }

      _g.lineWidth = save_lineWidth;
      _g.strokeStyle = save_strokeStyle;
   },

   ///////////////// INTERNAL METHODS TO SUPPORT DRAWING OR FILLING A PATH /////////////////

   _stroke_or_fill : function(isFill) {
      for (var i = 0 ; i < this.path.length ; i++) {
         var p = this.path[i];
         this._actual_moveTo_or_lineTo(p);
      }
      this._actual_stroke_or_fill(isFill);
   },

   _actual_moveTo_or_lineTo : function(p) {
      if (! window.ctPath)
         return;

      this._posBuffer.push( ( p[0] + _g.panX - width()  / 2 ) / (width() / 2),
                           -( p[1] + _g.panY - height() / 2 ) / (width() / 2),
                              p[2]                            / (width() / 2),
			      _g.lineWidth                    /  width()    );
   },

   _actual_stroke_or_fill : function(isFill) {
      if (! window.ctPath)
         return;

      var buffer = this._posBuffer;
      if (! window._isExtendBounds && buffer.length > 1) {

         // ONLY RENDER IF SHAPE IS IN THE VISIBLE WINDOW.

         var i, t, xlo = 1000, ylo = 1000, xhi = -1000, yhi = -1000, aspect = height() / width();
         for (i = 0 ; i < buffer.length ; i += 4) {
	    xlo = min(xlo, buffer[i  ]);
	    xhi = max(xhi, buffer[i  ]);
	    ylo = min(ylo, buffer[i+1]);
	    yhi = max(yhi, buffer[i+1]);
	 }
	 if (xlo <= 1 && ylo <= aspect && xhi >= -1 && yhi >= -aspect) {

	    // COMPUTE COLOR.

            var _rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
            var rgba = mix( backgroundColor == 'black' ? [0,0,0,1] : [1,1,1,1],
	                    [ _rgba[0]/255, _rgba[1]/255, _rgba[2]/255, 1],
			    _rgba[3] * _g.globalAlpha);

            if (window.displayListener) {
      	       //displayList[0] += 2 + buffer.length / 4 * 3 + 1;
                // new version [0] means the count of curve
                displayList[0] += 1;
      	       // displayList.push(2 + buffer.length/ 4 * 3 );
                // new version [1] means the length of current curve
                displayList.push(buffer.length/ 4);
      	       displayList.push( floor(255*rgba[0]) << 8 | floor(255*rgba[1]) );
      	       displayList.push( floor(255*rgba[2]) << 8 | floor(255*rgba[3]) );
                console.log("rgba:" + displayList[displayList.length-2] + "\t" + displayList[displayList.length-1]);
                // width
                var w = .5 + .5 * buffer[3];
                w = max(0, min(1, w));
                displayList.push(floor(0xffff * w));
      	       for (i = 0 ; i < buffer.length ; i++) {
                  if (i % 4 != 3){
                    t = .5 + .5 * buffer[i];
                    t = max(0, min(1, t));
                    displayList.push(floor(0xffff * t));  
                  }
               }
	        }

	    ///////////////// COMMUNICATION WITH THE GPU RENDERER IS HERE: //////////////////

            ctPath.setFill ( isFill );
            ctPath.setPath ( buffer );
            ctPath.setRGBA ( rgba   );
            ctPath.drawPath();

	    /////////////////////////////////////////////////////////////////////////////////
         }     
      }     
      this._posBuffer = [];
   },     

   _posBuffer : [],
}

