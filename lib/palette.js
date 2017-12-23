"use strict";

function Palette() {

   this.colorId   = 0;
   this.dragXY    = null;
   this.isVisible = false;
   this.pieRadius = 40;

   // ALL THE POSSIBLE DRAWING COLORS.
   this.rgb = [
      [255,255,255],        // FLIPS BETW WHITE AND BLACK WHEN USER TOGGLES WITH '-' KEY.
      [255,128,120],        // PINK
      [255,  0,  0],        // RED
      [255, 64,  0],        // ORANGE
      [255,255,  0],        // YELLOW
      [  0,255,  0],        // GREEN
      [  0,220,220],        // CYAN
      [  0,  0,255],        // BLUE
      [255,  0,255],        // MAGENTA
   ];

   this.color = [];
   for (var i = 0 ; i < this.rgb.length ; i++)
      this.color.push(rgbToColor(this.rgb[i]));
}

Palette.prototype = {

   draw : function(context) {
      if (context === undefined)
         context = _g;

      var w = width(), h = height(), nc = this.color.length;

      annotateStart(context);
      for (var n = 0 ; n < nc ; n++) {
         if (this.dragXY != null && n == this.colorId)
            continue;
         var r = this.r(n);
         context.fillStyle = this.color[n];
         fillOval(this.x(n) - r, this.y(n) - r, 2 * r, 2 * r);
      }
      annotateEnd(context);
   },

// GIVEN A CURSOR POSITION, FIND THE INDEX OF THE CORRESPONDING COLOR SWATCH IN THE PALETTE.

   findColorIndex : function(x, y) {
      if (this.isVisible)
         for (var n = 0 ; n < this.color.length ; n++) {
            var dx = x - this.x(n);
            var dy = y - this.y(n);
               if (dx * dx + dy * dy < 20 * 20)
                  return n;
         }
      return -1;
   },

// POSITION AND SIZE OF THE COLOR PALETTE ON THE UPPER LEFT OF THE SKETCH PAGE.

   width : function() {
      return 2 * this.pieRadius;
   },
   height : function() {
      return 2 * this.pieRadius;
   },
   x : function(i) {
      return bgAction_xDown + this.pieRadius * sin(TAU * i / this.color.length);
   },
   y : function(i) {
      return bgAction_yDown - this.pieRadius * cos(TAU * i / this.color.length);
   },
   r : function(i) {
      var index = this.colorId >= 0 ? this.colorId : sketchPage.colorId;
      return i == index ? 12 : 8;
   },
}

var palette = new Palette();

try { module.exports = Palette; } catch(e) {}

