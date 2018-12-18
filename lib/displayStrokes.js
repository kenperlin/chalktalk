"use strict";

/*
   Display Chalktalk strokes.
*/

let DSDebug = {};

function DisplayStrokes(g) {
   this.g = g;
   this.focalLength = 10;
   this.interocular = 1;

   DSDebug.ds = this;
}


const FN = {ex : function(py, sy, sketch) {
   return (py + (sy * 2 ))
}};



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

      let xyavg = [0.0, 0.0, 0];

      for (let n = 0; n < str.length; n++) {
         let ch = str.charCodeAt(n);
         if (charCurves[ch]) {
            for (let i = 0; i < charCurves[ch].length; i++) {
               let C = charCurves[ch][i];
               if (isCasualFont && sy > 6)
                  C = randomizeCurve(C, n + id);
               for (let j = 0; j < C.length; j++) {
                  let pt = [x + sx * (C[j][0] + .2 * C[j][1] * italic), y + flipY * sy *  C[j][1], z, j > 0];
                  if (m) {
                     pt = m.rotateAbout(p, pt);
                  }
                  xyavg[0] += pt[0];
                  xyavg[1] += pt[1];
                  xyavg[2] += 1;
                  this._actual_moveTo_or_lineTo(pt);
               }
               this._actual_stroke_or_fill(false, true);
       }
            x += 2 * sx;
         }
      }

      if (window.displayListener) {
        // this._sendTextToDisplayListener(this._computeRGBA(false), p[0] + (sx * str.length), y + flipY * sy, sy, str);
        _sendTextToDisplayListener(this.width(), this.height(), this._computeRGBA(false), (p[0] + sx*str.length) + _g.panX, (p[1]-(sy * 1.5)) + _g.panY, sy, str);
      }

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



   _convertToFixedPoint(value) {
      var t = .5 + .5 * value;
      t = max(0, min(1, t));
      return floor(0xffff * t);
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

            if (window.displayListener && ! isText) {
				//console.log("sketchpage.index in displayStroke.js" + sketchPage.index);
               _sendStrokeToDisplayListener(this.width(), this.height(), rgba, isFill, buffer);

            }

            ///////////////// COMMUNICATION WITH THE GPU RENDERER IS HERE: //////////////////

            ctPath.setFill ( isFill );
            ctPath.setPath ( buffer );
            ctPath.setRGBA ( rgba   );
            ctPath.drawPath();

            /////////////////////////////////////////////////////////////////////////////////
         }
         else if (!this._doCullingForDisplayList && window.displayListener && !isText) {
            var rgba = this._computeRGBA(isFill);
            _sendStrokeToDisplayListener(this.width(), this.height(),rgba, isFill, buffer);
         }     
      }     
      this._posBuffer = [];
   },     

   _posBuffer : [],

   _doCullingForDisplayList : false,
}

var displayListObjectId = 0;


