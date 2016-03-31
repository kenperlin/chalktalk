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

      var id = isk() ? sk().id + sk().stringId++ : 0;

      var c, curve, curves, i, j, n, pt, sx, sy, save_lineWidth, save_strokeStyle, x, y;

      save_lineWidth = _g.lineWidth;
      save_strokeStyle = _g.strokeStyle;

      sy = parseFloat(this.g.font) / 4;
      sx = sy * this.textCharWidth();

      //_g.lineWidth = max(1.4, sy / 5);
      _g.lineWidth = max(1, sy / 5);
      _g.strokeStyle = _g.fillStyle;

      x = p[0] + sx;
      y = p[1] - sy * 1.5;
      var font = CT.lineFont[sy > 6 ? 0 : 1];
      for (n = 0 ; n < str.length ; n++) {
         ch = str.charCodeAt(n);
	 if (ch >= 32 && ch < 128) {
            curves = font[ch - 32];
	    for (i = 0 ; i < curves.length ; i++) {
	       curve = curves[i];
	       if (isCasualFont && sy > 6)
	          curve = randomizeCurve(curve, n + id);
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

   ///////////////// INTERNAL METHODS TO SUPPORT DRAWING OR FILLING A PATH /////////////////

   _stroke_or_fill : function(isFill) {
      for (var i = 0 ; i < this.path.length ; i++) {
         var p = this.path[i];
         this._actual_moveTo_or_lineTo(p);
      }
      this._actual_stroke_or_fill(isFill);
   },

   _actual_moveTo_or_lineTo : function(p) {
      this._posBuffer.push( ( p[0] + _g.panX - width()  / 2 ) / (width() / 2),
                           -( p[1] + _g.panY - height() / 2 ) / (width() / 2),
                              p[2]                            / (width() / 2),
			      _g.lineWidth                    / width());
   },

   _actual_stroke_or_fill : function(isFill) {
      var buffer = this._posBuffer;
      if (! window._isExtendBounds && buffer.length > 1) {

         // ONLY RENDER IF SHAPE IS IN THE VISIBLE WINDOW.

         var xlo = 1000, ylo = 1000, xhi = -1000, yhi = -1000, aspect = height() / width();
         for (var i = 0 ; i < buffer.length ; i += 4) {
	    xlo = min(xlo, buffer[i  ]);
	    xhi = max(xhi, buffer[i  ]);
	    ylo = min(ylo, buffer[i+1]);
	    yhi = max(yhi, buffer[i+1]);
	 }
	 if (xlo <= 1 && ylo <= aspect && xhi >= -1 && yhi >= -aspect) {

	    // COMPUTE COLOR.

            var _rgba = parseRGBA(isFill ? _g.fillStyle : _g.strokeStyle);
/*
	    var rgba = [ _rgba[0]/255, _rgba[1]/255, _rgba[2]/255, _rgba[3] * _g.globalAlpha ];
*/
            var rgba = mix( backgroundColor == 'black' ? [0,0,0,1] : [1,1,1,1],
	                    [ _rgba[0]/255, _rgba[1]/255, _rgba[2]/255, 1],
			    _rgba[3] * _g.globalAlpha);

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

