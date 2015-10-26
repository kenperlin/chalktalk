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

   drawPath : function(path, isFill) {
      this.g.beginPath();
      for (var i = 0 ; i < this.path.length ; i++) {
         var p = this.path[i];
         this._moveTo_or_lineTo(p[0], p[1], p[3]);
      }
      this._stroke_or_fill(isFill);
   },

   drawStereoPath : function(path, isFill) {
      this.g.beginPath();
      for (var i = 0 ; i < path.length ; i++) {
         var p = path[i];
         this._moveTo_or_lineTo(this.stereoX(p), this.stereoY(p), p[3]);
      }
      this._stroke_or_fill(isFill);
   },

   stroke_or_fill : function(isFill) {
      if (! this.isStereo) {
	 this.drawPath(this.path, isFill);
	 return;
      }
      this.g.lineWidth /= 2;
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this.drawStereoPath(this.path, isFill);
      this.g.lineWidth *= 2;
   },

   text : function(str, p) {
      if (! this.isStereo) {
         this.g.fillText(str, p[0], p[1]);
	 return;
      }
      var f = this.g.font;
      this.g.font = (parseFloat(f) / 2) + f.substring(f.indexOf('p'), f.length);
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this.g.fillText(str, this.stereoX(p), this.stereoY(p));
      this.g.font = f;
   },

   // THE ACTUAL DRAWING TO THE CANVAS IS DONE HERE.

   _moveTo_or_lineTo : function(x, y, isLine) {
      if (! isLine)
         this.g.moveTo(x, y);
      else
         this.g.lineTo(x, y);
   },

   _stroke_or_fill : function(isFill) {
      if (isFill)
         this.g.fill();
      else
         this.g.stroke();
   },
}

