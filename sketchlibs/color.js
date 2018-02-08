"use strict";

// SELECTIVELY ENABLE OR DISABLE COLORS,
// MAINLY FOR PURPOSES OF HIGHLIGHTING OR ANIMATING GRAPHICAL ELEMENTS

function ColorManager() {
   this.useColor = false;
   this.color = "white";
}

ColorManager.prototype = {
   getColor : function() {
      return this.color;
   },
   setColor : function(color) {
      this.color = color;
      return this;
   },
   enableColor: function(bool) {
      this.useColor = bool;
      return this;
   },
   activateColor : function() {
      if (this.useColor == false) {
         return this;
      }

      _g.save();
      color(this.color);
      return this;
   },
   deactivateColor : function() {
      if (this.useColor == false) {
         return this;
      }

      _g.restore();
      return this;
   },
   colorIsEnabled : function() { 
      return this.useColor; 
   }
};

