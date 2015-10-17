/*
   Display Chalktalk strokes, either in 2D or in 3D stereo.

   Still to implement: sort from back to front when in 3D stereo mode.
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

   stereoX : function(p, sign) {
      var x = p[0] - this.width() / 2;
      x -= this.width() * sign;
      x *= this.focalLength / (this.focalLength - p[2] / this.width());
      x += this.width() * sign;
      return x / 2 + this.centerX(sign);
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

   beginFrame : function() {
   },

   endFrame : function() {
      // Eventually we will implement back to front sorting here.
   },

   beginPath : function() {
      this.path = [];
   },

   pathTo : function(p, isLine) {
      this.path.push([ p[0], p[1], p[2], isLine ]);
   },

   stroke : function() {
      this.stroke_or_fill(0);
   },

   fill : function() {
      this.stroke_or_fill(1);
   },

   drawStereoPath : function(path, sign, isFill) {
      this.sign = sign;
      this.g.beginPath();
      for (i = 0 ; i < path.length ; i++) {
         var p = path[i];
         this._drawTo(this.stereoX(p, sign), this.stereoY(p), p[3], sign);
      }
      this._stroke_or_fill(isFill);
   },

   stroke_or_fill : function(isFill) {
      var x, y, z, i;
      if (this.isStereo) {
         this.g.lineWidth /= 2;
	 this.drawStereoPath(this.path, -1, isFill);
	 this.drawStereoPath(this.path,  1, isFill);
         this.g.lineWidth *= 2;
      }
      else {
         this.g.beginPath();
         for (i = 0 ; i < this.path.length ; i++) {
	    var p = this.path[i];
            this._drawTo(p[0], p[1], p[3]);
         }
         this._stroke_or_fill(isFill);
      }
   },

   text : function(str, p) {
      if (! this.isStereo) {
         this.g.fillText(str, p[0], p[1]);
	 return;
      }
      var f = this.g.font;
      this.g.font = (parseFloat(f) / 2) + f.substring(f.indexOf('p'), f.length);
      this.g.fillText(str, this.stereoX(p, -1), this.stereoY(p));
      this.g.fillText(str, this.stereoY(p,  1), this.stereoY(p));

      this.g.font = f;
   },

   _drawTo : function(x, y, isLine, sign) {
      if (! this.isStero) {
         if (! isLine)
            this.g.moveTo(x, y);
         else
            this.g.lineTo(x, y);
      }
      else {
         if (! isLine) {
            this.g.moveTo(x, y);
         }
         else {
            this.g.lineTo(x, y);
         }
	 this._x = x;
	 this._y = y;
      }
   },

   _stroke_or_fill : function(isFill) {
      if (isFill)
         this.g.fill();
      else
         this.g.stroke();
   },
}

