/*
   Display Chalktalk strokes.
*/

function DisplayStrokes(g) {
   this.g = g;
   this.focalLength = 10;
   this.interocular = 1;
   this.isStereo = false;
}

DisplayStrokes.prototype = {

   centerX : function(sign) {
      return this.width() / 2 + sign * this.width() / 4 * this.interocular;
   },

   stereoX : function(p) {
      var x = p[0] - this.width() / 2;
      x -= this.width() * this.sign;
      x *= this.focalLength / (this.focalLength - p[2] / this.width());
      x += this.width() * this.sign;
      return x / 2 + this.centerX(this.sign);
   },

   stereoY : function(p) {
      var y = p[1] * this.focalLength / (this.focalLength - p[2] / this.width());
      return (this.height() / 2 + y) / 2;
   },

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
      var c, curve, curves, i, j, n, pt, sx, sy, save_lineWidth, save_strokeStyle, x, y;

      save_lineWidth = _g.lineWidth;
      save_strokeStyle = _g.strokeStyle;

      sy = parseFloat(this.g.font) / 4;
      sx = sy * this.textCharWidth();

      _g.lineWidth = max(1, sy / 5);
      _g.strokeStyle = _g.fillStyle;

      x = p[0] + sx;
      y = p[1] - sy * 1.5;
      for (n = 0 ; n < str.length ; n++) {
         ch = str.charCodeAt(n);
	 if (ch >= 32 && ch < 128) {
            curves = CT.lineFont[ch - 32];
	    for (i = 0 ; i < curves.length ; i++) {
	       curve = curves[i];
	       for (j = 0 ; j < curve.length ; j++) {
	          pt = curve[j];
                  this._actual_moveTo_or_lineTo([x + sx * pt[0], y - sy * pt[1], 0, j > 0]);
	       }
               this._actual_stroke_or_fill(false);
	    }
	    x += 2 * sx;
         }
      }

      _g.lineWidth = save_lineWidth;
      _g.strokeStyle = save_strokeStyle;
   },

   fillText : function(str, x, y) {

      // ONLY DRAW TEXT IF IT IS IN THE VISIBLE WINDOW.

      var w = this.g.measureText(str).width;
      var h = this.g.textHeight;
      var xlo = x - w/2, xhi = x + w/2;
      var ylo = y - h/2, yhi = y + h/2;
      if ( xhi >= -this.g.panX && xlo < width()  - this.g.panX &&
           yhi >= -this.g.panY && ylo < height() - this.g.panY )
         this.g.fillText(str, x, y);
   },

   // INTERNAL METHODS.

   _stroke_or_fill : function(isFill) {
      if (isWebgl() || ! this.isStereo) {
	 this._drawPath(this.path, isFill);
	 return;
      }
      this.g.lineWidth /= 2;
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this._drawStereoPath(this.path, isFill);
      this.g.lineWidth *= 2;
   },

   _drawPath : function(path, isFill) {
      this.g.beginPath();
      for (var i = 0 ; i < this.path.length ; i++) {
         var p = this.path[i];
         this._actual_moveTo_or_lineTo(p);
      }
      this._actual_stroke_or_fill(isFill);
   },

   _drawStereoPath : function(path, isFill) {
      this.g.beginPath();
      for (var i = 0 ; i < path.length ; i++) {
         var p = path[i];
         this._actual_moveTo_or_lineTo([this.stereoX(p), this.stereoY(p), 0, p[3]]);
      }
      this._actual_stroke_or_fill(isFill);
   },

   // ACTUAL DRAWING IS DONE HERE.

   _posBuffer : [],

   _actual_moveTo_or_lineTo : function(p) {
      if (! isWebgl()) {
         if (! p[3])
            this.g.moveTo(p[0], p[1]);
         else
            this.g.lineTo(p[0], p[1]);
         return;
      }

      if (! p[3])
         this._posBuffer = [];

      this._posBuffer.push( ( p[0] - width()  / 2 ) / (width() / 2),
                           -( p[1] - height() / 2 ) / (width() / 2),
                              p[2]                  / (width() / 2) );
   },

   _actual_stroke_or_fill : function(isFill) {
      if (! isWebgl()) {
         if (isFill)
            this.g.fill();
         else
            this.g.stroke();
         return;
      }

      var buf = this._posBuffer, aspect = height() / width();
      if (! window._isExtendBounds && buf.length > 1) {

         // IF SHAPE IS ENTIRELY OUT OF THE WINDOW, DO NOT DRAW IT.

         var xlo = 1000, ylo = 1000, xhi = -1000, yhi = -1000;
         for (var i = 0 ; i < buf.length ; i += 3) {
	    xlo = min(xlo, buf[i]);
	    xhi = max(xhi, buf[i]);
	    ylo = min(ylo, buf[i+1]);
	    yhi = max(yhi, buf[i+1]);
	 }
         var dx = _g.panX / (width() / 2), dy = _g.panY / (width() / 2);
	 xlo += dx;
	 xhi += dx;
	 ylo -= dy;
	 yhi -= dy;
	 if (xlo > 1 || ylo > aspect || xhi < -1 || yhi < -aspect) {
	    this._posBuffer = [];
	    return;
	 }

         var rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
         rgba[3] *= _g.globalAlpha;
         var scale = 1 / (width() / 2);
         var matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, _g.panX * scale,-_g.panY * scale,0,1];
         if (! isFill)
            ctPath.setLineWidth(_g.lineWidth / width() * (this.isStereo ? 1 : 2));
         ctPath.setMatrix(matrix);
         ctPath.setRGBA(rgba);
         ctPath.setFill(isFill);
         ctPath.setPath(buf);
         ctPath.draw();

         this.ptsPerFrame += buf.length / 3;
      }     
      this._posBuffer = [];
   },     
}

