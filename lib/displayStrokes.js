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

   text : function(str, p, mat) {

      this.widthFactor = sketchPage.isFuzzyLines() ? 0.25 : 1;

      p[2] = def(p[2], 0);                                         // IF NO Z COORDINATE, PROVIDE ONE.

      var m                = mat ? new Rotation(mat._m()) : null;  // USE mat, IF ANY, TO ROTATE ABOUT p.
      var id               = isk() ? sk().id + sk().stringId++ : 0;
      var save_lineWidth   = _g.lineWidth;
      var save_strokeStyle = _g.strokeStyle;
      var sy               = parseFloat(this.g.font) / 4;
      var sx               = sy * this.textCharWidth();
      var bold             = this.g.font.indexOf('bold'  ) >= 0 ? 1 : 0;
      var italic           = this.g.font.indexOf('italic') >= 0 ? 1 : 0;
      var x                = p[0] + sx;
      var y                = p[1] + sy * 1.5;
      var z                = p[2];
      var charCurves       = CT.lineFont[sy > 5 ? 0 : 1];
      var flipY            = mat ? 1 : -1;

      _g.lineWidth   = max(1, sy / 5) * (1 + bold);
      _g.strokeStyle = _g.fillStyle;

      for (let n = 0; n < str.length; n++) {
         let ch = str.charCodeAt(n);
         if (charCurves[ch]) {
            for (let i = 0; i < charCurves[ch].length; i++) {
               let C = charCurves[ch][i];
               if (isCasualFont && sy > 6)
                  C = randomizeCurve(C, n + id);
               for (let j = 0; j < C.length; j++) {
                  let pt = [x + sx * (C[j][0] + .2 * C[j][1] * italic), y + flipY * sy *  C[j][1], z, j > 0];
                  if (m)
		     pt = m.rotateAbout(p, pt);
                  this._actual_moveTo_or_lineTo(pt);
               }
               this._actual_stroke_or_fill(false, true);
	    }
            x += 2 * sx;
         }
      }

      if (window.displayListener)
         this._sendTextToDisplayListener(this._computeRGBA(false), x, y, sy, str); 

      _g.lineWidth   = save_lineWidth;
      _g.strokeStyle = save_strokeStyle;
      this.widthFactor = 1;
   },

   ///////////////// INTERNAL METHODS TO SUPPORT DRAWING OR FILLING A PATH /////////////////

   _stroke_or_fill : function(isFill) {
      for (var i = 0 ; i < this.path.length ; i++) {
         var p = this.path[i];
         this._actual_moveTo_or_lineTo(p);
      }
      this._actual_stroke_or_fill(isFill, false);
   },

   _actual_moveTo_or_lineTo : function(p) {
      if (! window.ctPath)
         return;

      let newP = mult(pixelSpaceTo3DSpaceMatrix(), [p[0], p[1], p[2], 1]);
      var x = newP[0], y = newP[1], z = newP[2],
          w = _g.lineWidth / width();

      if (p[3] == 0 && this._posBuffer.length > 0)
         this._posBuffer.push(x, y, z, 0);

      let lw = w * def(this.widthFactor, 1) * (sketchPage.isFuzzyLines() ? 10 : 1);

      this._posBuffer.push(x, y, z, lw);
   },

   _sendTextToDisplayListener : function(rgba, x, y, s, text) {
      
      this._sendObjectHeaderToDisplayListener(12 + Math.ceiling(text.length / 2), rgba, x, y, s);

      displayList.push(2);                     // Type: 2 == text

      for (i = 0 ; i < text.length ; i += 2) {
         let ch0 = text.charCodeAt(i);                            // Two characters per 2-byte word.
         let ch1 = i+1 == text.length ? 0 : text.charCodeAt(i+1); // Pad with 0 if necessary.
         displayList.push(ch0 << 8 || ch1);
      }
   },

   _convertToFixedPoint(value) {
      var t = .5 + .5 * value;
      t = max(0, min(1, t));
      return floor(0xffff * t);
   },

   _sendStrokeToDisplayListener : function(rgba, isFill, buffer) {

      this._sendObjectHeaderToDisplayListener(12 + buffer.length, rgba);

      displayList.push(isFill ? 1 : 0);        // Type: 0 == stroke, 1 == fill

      for (i = 0 ; i < buffer.length ; i++) {
         let n = this._convertToFixedPoint(buffer[i]);
         displayList.push(n);
      }
   },

   _sendObjectHeaderToDisplayListener : function(size, rgba, x, y, s) {
      displayList[0] += size;
      displayList.push(size);                  // Total no. of 2-byte words, including this one.

      displayList.push(displayListObjectId++); // Unique id for this display object.

      displayList.push( floor(255*rgba[0]) << 8 | floor(255*rgba[1]) ); // Color: red, green
      displayList.push( floor(255*rgba[2]) << 8 | floor(255*rgba[3]) ); //        blue, alpha

      if (s) {
         displayList.push(this._convertToFixedPoint(x));
         displayList.push(this._convertToFixedPoint(y));
         displayList.push(this._convertToFixedPoint(0));
         for (let q = 0 ; q < 3 ; q++)
            displayList.push(0);
         displayList.push(this._convertToFixedPoint(s));
      }

      else {
         for (let pq = 0 ; pq < 6 ; pq++)      // Px,Py,Pz,Qx,Qy,Qz (identity for now)
            displayList.push(0);
         displayList.push(0x1000);             // Scale: fixed precision, 2^12 === 1.0
      }
   },

   _computeRGBA : function(isFill) {
      var _rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
      let brgb = backgroundRGB();
      let rgba = mix( [  brgb[0]/255,  brgb[1]/255,  brgb[2]/255, 1],
                      [ _rgba[0]/255, _rgba[1]/255, _rgba[2]/255, 1],
                        _rgba[3] * _g.globalAlpha);
      return rgba;
   },

   _actual_stroke_or_fill : function(isFill, isText) {
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
         if (xlo <= 1.05 && ylo <= aspect && xhi >= -1.05 && yhi >= -aspect) {

            var rgba = this._computeRGBA(isFill);

            ///////////////// COMMUNICATION WITH EXTERNAL CLIENTS IS HERE: //////////////////

            if (window.displayListener && ! isText)
               this._sendStrokeToDisplayListener(rgba, isFill, buffer);

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

var displayListObjectId = 0;


