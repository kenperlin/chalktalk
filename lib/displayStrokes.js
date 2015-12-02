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

   text : function(str, p) {
      var saveGlobalAlpha = _g.globalAlpha;
      var alpha = 1 - overview_alpha;
      _g.globalAlpha = sCurve(alpha * alpha);
      if (! this.isStereo) {
         this.g.fillText(str, p[0], p[1]);
	 return;
      }
      var f = this.g.font;
      this.g.font = (parseFloat(f) / 2) + f.substring(f.indexOf('p'), f.length);
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this.g.fillText(str, this.stereoX(p), this.stereoY(p));
      this.g.font = f;
      _g.globalAlpha = saveGlobalAlpha;
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
      if (! p[3]) {
         this._posBuffer = [];
      }
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

      if (! window._isExtendBounds && this._posBuffer.length > 1) {
         var rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
         rgba[3] *= _g.globalAlpha;
         var scale = 1 / (width() / 2);
         var matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, _g.panX * scale,-_g.panY * scale,0,1];
         if (! isFill)
            ctPath.setLineWidth(_g.lineWidth / width() * (this.isStereo ? 1 : 2));
         ctPath.setMatrix(matrix);
         ctPath.setRGBA(rgba);
         ctPath.setFill(isFill);
         ctPath.setPath(this._posBuffer);
         ctPath.draw();
      }     
      this._posBuffer = [];
   },     
}

