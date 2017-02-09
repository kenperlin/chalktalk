"use strict";

/*
   A SketchText is a kind of object that appears as visible text inside a Chalktalk Sketch.

   Every Sketch has a (possibly empty) array of SketchText objects.  Each SketchText has a
   current text string, an x,y location (in the local [-1,+1]x[-1,+1] coordinate of the sketch),
   and a specified size (where 2.0 would span the entire height of the sketch, from -1.0 to +1.0).

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

      // FORCE VALUE TO BE A STRING, IF IT ISN'T ALREADY.

      if (typeof this.value != 'string')
         this.value = '' + this.value;

      // IF VALUE IS A NUMBER WITH TRAILING DECMIAL DIGITS, COMPUTE CORRESPONDING INCREMENT.

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

         // DRAG UP/DOWN ON A DIGIT TO INCREMENT/DECREMENT ITS VALUE.

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
            if (this.value < 0)
               digit--;

            if (digit < 0) {
	       this._gesture = 'NONE';
	       return false;
            }

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
      var saveTextHeight, x, y, tw;

      if (! this.isVisible)
         return;

      saveTextHeight = _g.textHeight;

      this.sketchScale = sketch.mScale();
      this.textHeight = 2 * this.scale * this.sketchScale;
      this.font = this.textHeight + 'pt ' + defaultFont;

      _g.textHeight = this.textHeight;
      _g.font = this.font;

      x = this.position[0];
      y = this.position[1];
      tw = textWidth(this.value) / this.sketchScale;
      sketch.extendBounds(
         this.bounds = [ [x - tw / 2, y - this.scale],
                         [x + tw / 2, y + this.scale] ]);

      mText(this.value, this.position, 0.5, 0.5);

      _g.textHeight = saveTextHeight;
   },
}

