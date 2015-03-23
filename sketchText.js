/*
   A SketchText is a kind of object that appears as visible one-line text inside a Chalktalk Sketch.

   Every Sketch has a (possibly empty) array of SketchText objects.  Each SketchText has a
   current text string, an x,y location (in the local [-1,+1]x[-1,+1] coordinate of the sketch),
   and a specified size (where 2.0 would be the entire height of the sketch).

   If the text has a numeric value, then dragging with the mouse, starting within the bounding box
   of the displayed text, will change its numeric (and therefore displayed) value as follows:

   -- Up or down drag to increase or decrease the least significant digit;
   -- Left or right swipe to shift value up or down by factors of 10.
*/

function SketchText(value, position, scale) {
   this.bounds = [[0,0],[0,0]];
   this.isVisible = true;
   this.position  = def(position, [0,0]);
   this.scale     = def(scale, 1);
   this.setValue(value);
}

SketchText.prototype = {

   setValue : function(value) {
      this.value = def(value, '');

      // If value is a number with trailing decimal digits, compute corresponding increment.

      this.increment = 1;
      if (! isNaN(this.value)) {
         var i = this.value.indexOf('.');
         if (i >= 0)
            while (++i < this.value.length)
	       this.increment /= 10;
      }
   },

   contains : function(p) {
      return this.isVisible && p[0] >= this.bounds[0][0]
	                    && p[0] <  this.bounds[1][0]
                            && p[1] >= this.bounds[0][1]
	                    && p[1] <  this.bounds[1][1];
   },

   mouseDown : function(x, y) {

      if (isNaN(this.value))
         return false;

      this._yChange = 0;
      this._xDown = x;
      this._yDown = y;
      this._xPrev = x;
      this._yPrev = y;
      this._xTravel = 0;
      this._yTravel = 0;

      return true;
   },

   mouseDrag : function(x, y) {
      if (isNaN(this.value))
         return false;

      this._yChange += y - this._yPrev;
      if (abs(this._yChange) > 30) {
         var incr = min(1, this.increment);
         if (this._yChange < 0)
            this.value = "" + (parseFloat(this.value) + incr);
         else
            this.value = "" + (parseFloat(this.value) - incr);
         this.roundValue();
         this._yChange = 0;
      }

      this._xPrev = x;
      this._yPrev = y;

      this._xTravel = max(this._xTravel, abs(x - this._xDown));
      this._yTravel = max(this._yTravel, abs(y - this._yDown));

      return true;
   },

   mouseUp : function(x, y) {
      if (isNaN(this.value))
         return false;

      if (! this.isClick && this._xTravel > this._yTravel) {
         if (x > this._xDown) {
            this.value = "" + (parseFloat(this.value) / 10);
            this.increment /= 10;
         }
         else {
            this.value = "" + (parseFloat(this.value) * 10);
            if (this.increment < 0.5)
               this.increment *= 10;
         }
         this.roundValue();
      }

      return true;
   },

   roundValue : function() {
      var val = parseFloat(this.value);
      if (this.increment < 0.5)
         val += (val >= 0 ? 0.1 : -0.1) * this.increment;

      var decimalPlaces = 0;
      for (var p = this.increment ; p < 0.5 ; p *= 10)
         decimalPlaces++;

      this.value = roundedString(val, decimalPlaces);
   },

   update : function(sketch) {
      if (! this.isVisible)
         return;

      var saveTextHeight = _g.textHeight;

      var scale = sketch.mScale();
      textHeight(2 * scale * this.scale);
      _g.font = _g.textHeight + 'pt ' + defaultFont;
      var x = this.position[0];
      var y = this.position[1];
      var tw = textWidth(this.value) / scale;
      this.bounds = [ [x - tw / 2, y - this.scale],
                      [x + tw / 2, y + this.scale] ];
      sketch.extendBounds(this.bounds);

      var bounds = this.bounds;
      sketch.afterSketch(function() {
         _g.save();
         color(bgScrimColor(.5));
         mFillRect(bounds[0], bounds[1]);
         _g.restore();
      });
      mText(this.value, this.position, 0.5, 0.5);

      _g.textHeight = saveTextHeight;
   },
}

