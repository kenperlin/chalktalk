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

      this._gesture = 'NONE';
      this._xChange = 0;
      this._yChange = 0;
      this._xDown = x;
      this._yDown = y;
      this._xPrev = x;
      this._yPrev = y;

      return true;
   },

   mouseDrag : function(x, y) {
      if (isNaN(this.value))
         return false;

      this._xChange += x - this._xPrev;
      this._yChange += y - this._yPrev;

      // IF FIRST SIGNIFICANT MOVEMENT IS HORIZONTAL, THEN LABEL THIS GESTURE AS A HORIZONTAL SWIPE.

      if (this._gesture == 'NONE' && abs(this._xChange) > sfs(30) && abs(this._xChange) > 2 * abs(this._yChange))
         this._gesture = 'HORIZONTAL SWIPE';

      // IF NOT A HORIZONTAL SWIPE, RESPOND TO SIGNIFICANT CHANGES IN CURSOR Y.

      if (this._gesture != 'HORIZONTAL SWIPE' && abs(this._yChange) > sfs(30)) {

         // SWEEP VERTICALLY NEAR LEFT TO CHANGE MOST SIGNIFICANT DIGIT.
         // SWEEP VERTICALLY ANYWHERE ELSE TO CHANGE LEAST SIGNIFICANT DIGIT.

         if (this._gesture == 'NONE') {
            this._gesture = 'VERTICAL DRAG';

            _g.font = this.font;

            var xDown = m.transform([this._xDown, this._yDown])[0];
            var xLeft = this.position[0] - 0.5 * textWidth(this.value) / this.sketchScale;
            var isAfterDecimalPoint = false;
            var digit = 0;
            for ( ; digit < this.value.length - 1 ; digit++) {
               var dx = textWidth(this.value.substring(0, digit + 1)) / this.sketchScale;
               if (xLeft + dx > xDown)
                  break;
               if (this.value.substring(digit, digit+1) == '.')
                  isAfterDecimalPoint = true;
            }
            if (isAfterDecimalPoint)
               digit--;

            this._incr = 1;
            var n = abs(this.value);
            while ((n = floor(n / 10)) != 0)
               this._incr *= 10;
            for (var i = 0 ; i < digit ; i++)
               this._incr /= 10;
         }

         if (this._yChange < 0)
            this.value = "" + (parseFloat(this.value) + this._incr);
         else
            this.value = "" + (parseFloat(this.value) - this._incr);
         this.roundValue();

         this._xChange = 0;
         this._yChange = 0;
      }

      this._xPrev = x;
      this._yPrev = y;

      return true;
   },

   mouseUp : function(x, y) {
      if (isNaN(this.value))
         return false;

      if (this._gesture == 'HORIZONTAL SWIPE') {
         if (x < this._xDown) {
            this.value = "" + (parseFloat(this.value) / 10);
            if (this.value != floor(this.value))
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

      this.sketchScale = sketch.mScale();
      this.textHeight = 2 * this.scale * this.sketchScale;
      this.font = this.textHeight + 'pt ' + defaultFont;

      _g.textHeight = this.textHeight;
      _g.font = this.font;

      var x = this.position[0];
      var y = this.position[1];
      var tw = textWidth(this.value) / this.sketchScale;
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

