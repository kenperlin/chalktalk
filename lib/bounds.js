"use strict";

function Bounds(xlo, ylo, xhi, yhi) {
   this.set(xlo, ylo, xhi, yhi);
}

Bounds.prototype = {
   contains : function(x, y) {
      return x >= this.xlo && y >= this.ylo &&
             x <  this.xhi && y <  this.yhi ;
   },

   scale : function(s) {
      this.set(s * this.xlo, s * this.ylo, s * this.xhi, s * this.yhi);
   },

   set : function(xlo, ylo, xhi, yhi) {
      this.xlo = xlo;
      this.ylo = ylo;
      this.xhi = xhi;
      this.yhi = yhi;
      this.x = (xlo + xhi) / 2;
      this.y = (ylo + yhi) / 2;
      this.width  = xhi - xlo;
      this.height = yhi - ylo;
   },

   toString : function() {
      return '< ' + roundedString(this.xlo) + ',' + roundedString(this.ylo) +
              ' ' + roundedString(this.xhi) + ',' + roundedString(this.yhi) + ' >';

   },
}

