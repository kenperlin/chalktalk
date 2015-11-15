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
         this._moveTo_or_lineTo(p);
      }
      this._stroke_or_fill(isFill);
   },

   drawStereoPath : function(path, isFill) {
      this.g.beginPath();
      for (var i = 0 ; i < path.length ; i++) {
         var p = path[i];
         this._moveTo_or_lineTo([this.stereoX(p), this.stereoY(p), 0, p[3]]);
      }
      this._stroke_or_fill(isFill);
   },

   stroke_or_fill : function(isFill) {
      if (isWebgl() || ! this.isStereo) {
	 this.drawPath(this.path, isFill);
	 return;
      }
      this.g.lineWidth /= 2;
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this.drawStereoPath(this.path, isFill);
      this.g.lineWidth *= 2;
   },

   text : function(str, p) {
      if (this.isStereo) {
         this.g.fillText(str, p[0], p[1]);
	 return;
      }
      var f = this.g.font;
      this.g.font = (parseFloat(f) / 2) + f.substring(f.indexOf('p'), f.length);
      for (this.sign = -1 ; this.sign <= 1 ; this.sign += 2)
         this.g.fillText(str, this.stereoX(p), this.stereoY(p));
      this.g.font = f;
   },

   // ACTUAL DRAWING IS DONE HERE.

   _points : [],

   _moveTo_or_lineTo : function(p) {
      if (! isWebgl()) {
         if (! p[3])
            this.g.moveTo(p[0], p[1]);
         else
            this.g.lineTo(p[0], p[1]);
         return;
      }

      if (! p[3])
         this._points = [];
      this._points.push(  ( p[0] - width()  / 2 ) / (width() / 2) );
      this._points.push( -( p[1] - height() / 2 ) / (width() / 2) );
      this._points.push(   -p[2]                  / (width() / 2) );
   },

   _stroke_or_fill : function(isFill) {
      if (! isWebgl()) {
         if (isFill)
            this.g.fill();
         else
            this.g.stroke();
         return;
      }

      if (this._points.length > 1) {
         var rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
         rgba[3] *= _g.globalAlpha;
         var scale = 1 / (width() / 2);
         var matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, _g.panX * scale,-_g.panY * scale,0,1];
         var shader = isFill ? fillShader : strokeShader;
         shader.useProgram();
         if (! isFill)
            shader.setLineWidth(_g.lineWidth / width() * (this.isStereo ? 1 : 2));
         if (! this.isStereo) {
            shader.setMatrix(matrix);
            shader.draw(this._points, rgba);
         }
         else {
            matrix[0] = matrix[5] = matrix[10] = 0.5;
            matrix[12] -= this.interocular / 2; 
            shader.setMatrix(matrix);
            shader.draw(this._points, rgba);
            matrix[12] += this.interocular;
            shader.setMatrix(matrix);
            shader.draw(this._points, rgba);
         }  
      }     
   },     
}

