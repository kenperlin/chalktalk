/*
   Display Chalktalk strokes, either in 2D or in 3D stereo.
*/

function DisplayStrokes(g) {
   this.g = g;
   this.isStereo = false;
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
      this.path.push([ p[0], p[1], p[2], isLine ]);
   },

   stroke : function() {
      this.stroke_or_fill(0);
   },

   fill : function() {
      this.stroke_or_fill(1);
   },

   stroke_or_fill : function(isFill) {
      var x, y, z, i;
      if (this.isStereo) {
         var dw = this.width() / 2;
         var dh = this.height() / 2;
         var dz = 1 / 20;

         this.g.lineWidth /= 2;
         this.g.beginPath();
         for (i = 0 ; i < this.path.length ; i++)
	    this._drawTo(this.path[i][0] / 2 - dz * this.path[i][2],
                   this.path[i][1] / 2 + dh / 2,
                   this.path[i][3]);
         this._stroke_or_fill(isFill);

         this.g.beginPath();
         for (i = 0 ; i < this.path.length ; i++)
	    this._drawTo(this.path[i][0] / 2 + dz * this.path[i][2] + dw,
                   this.path[i][1] / 2 + dh / 2,
                   this.path[i][3]);
         this._stroke_or_fill(isFill);
         this.g.lineWidth *= 2;
      }
      else {
         this.g.beginPath();
         for (i = 0 ; i < this.path.length ; i++)
            this._drawTo(this.path[i][0], this.path[i][1], this.path[i][3]);
         this._stroke_or_fill(isFill);
      }
   },

   fillText : function(str, x, y) {
      if (! this.isStereo) {
         this.g.fillText(str, x, y);
	 return;
      }
      var f = this.g.font;
      this.g.font = (parseFloat(f) / 2) + f.substring(f.indexOf('p'), f.length);
      x = x / 2;
      y = y / 2 + this.height() / 4;
      this.g.fillText(str, x, y);
      x += this.width() / 2;
      this.g.fillText(str, x, y);
      this.g.font = f;
   },

   _drawTo : function(x, y, isLine) {
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

