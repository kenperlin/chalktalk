"use strict";

function Group() {
   this.actionType;
   this.fadeAway;
   this.isAtCursor;
   this.isCreating;
   this.isDoingAction;
   this.isDown = false;
   this.sketches;
   this.travel;
   this.xDown;
   this.yDown;
   this.xhi;
   this.xlo;
   this.yhi;
   this.ylo;
   this.clear();
}

Group.prototype = {
   clear : function() {
      this.actionType = -1;
      this.fadeAway = 0;
      this.isAtCursor = false;
      this.isCreating = false;
      this.isDoingAction = false;
      this.sketches = [];
      this.xhi = this.xlo = this.yhi = this.ylo =
      this.xDown = this.yDown = this.x = this.y = 0;
      this._isTemporaryAction = false;
   },

   contains : function(x, y) {
      return x >= this.xlo && x < this.xhi && y >= this.ylo && y < this.yhi;
   },

   containsSketch : function(sketch) {
      for (var i = 0 ; i < this.sketches.length ; i++)
         if (this.sketches[i] == sketch)
            return true;
      return false;
   },

   copy : function() {
      var sketches = [], i, j, s, port, link;

      // COPY ALL SKETCHES TO A SET OF NEW SKETCHES

      for (i = 0 ; i < this.sketches.length ; i++) {
         copySketch(this.sketches[i]);
         sk().tX = this.sketches[i].tX;
         sk().tY = this.sketches[i].tY;
	 sketches.push(sk());
      }

      // REPLICATE ALL LINKS BETWEEN SKETCHES IN THE GROUP

      for (j = 0 ; j < sketches.length ; j++) {
         s = this.sketches[j];
	 for (port = 0 ; port < s.in.length ; port++)
	    if ((link = s.in[port]) && (i = this.sketches.indexOf(link.a)) >= 0)
	       new SketchLink(sketches[i], link.i, sketches[j], link.j, link.s);
      }

      // REDEFINE THE GROUP TO CONSIST OF THE NEWLY CREATED SKETCHES

      this.sketches = [];
      for (i = 0 ; i < sketches.length ; i++)
         this.sketches.push(sketches[i]);
   },

   create : function() {
      this.clear();
      this.isCreating = true;
   },

   mouseDown : function(x, y) {
      this.isAtCursor = this.contains(x, y);
      this.travel = 0;
      this.x = x;
      this.y = y;

      if (this.isCreating) {
         this.xDown = x;
         this.yDown = y;
         return true;
      }

      return this.actionType >= 0 || this.isAtCursor;
   },

   mouseDrag : function(x, y) {
      var dx = x - this.x, dy = y - this.y;
      this.travel += len(dx, dy);
      this.x = x;
      this.y = y;

      if (this.isCreating) {
         this.xlo = min(this.xDown, x);
         this.ylo = min(this.yDown, y);
         this.xhi = max(this.xDown, x);
         this.yhi = max(this.yDown, y);
         return true;
      }
      if (this.actionType >= 0) {
         return true;
      }
      if (this.isAtCursor) {
         if (this.travel > clickSize())
            this.translate(dx, dy);  
         return true;
      }
      return false;
   },

   mouseMove : function(x, y) {
      if (this.actionType >= 0) {
         switch (this.actionType) {
         case 2:
            this.translate(x - this.x, y - this.y);
            break;
         case 4:
            this.scale(x - this.x, y - this.y);
            break;
         }
         this.x = x;
         this.y = y;
         return true;
      }
      return false;
   },

   mouseUp : function(x, y) {
      if (this.isCreating) {
         if (max(this.xhi - this.xlo, this.yhi - this.ylo) <= clickSize())
            this.clear();
         else
            for (var I = 0 ; I < nsk() ; I++)
               if ( sk(I).xlo < this.xhi && this.xlo < sk(I).xhi &&
                    sk(I).ylo < this.yhi && this.ylo < sk(I).yhi )
                  this.sketches.push(sk(I));
         this.isCreating = false;
         return true;
      }
      if (this.actionType >= 0) {
         if (! this.isDoingAction)
            this.doClickAction();
         else {
            this.isDoingAction = false;
            this.actionType = -1;
            if (this._isTemporaryAction)
               this.clear();
         }
         this.x = x;
         this.y = y;
         return true;
      }
      if (this.isAtCursor) {
         if (this.travel <= clickSize()) {
            this.fadeAway = 1;
         }
         return true;
      }
      return false;
   },

   doClickAction : function() {
      switch (this.actionType) {
      case 0:
         while (this.sketches.length > 0)
            this.sketches.pop().fade();
         this.fadeAway = 1;
         break;
      case 3:
         this.copy();
         this.actionType = 2;
         this.isDoingAction = true;
         break;
      default:
         this.isDoingAction = true;
         break;
      }
   },

   scale : function(dx, dy) {
       var s = pow(16, dy / -height());
       var x = (this.xlo + this.xhi) / 2;
       var y = (this.ylo + this.yhi) / 2;
       function sx(_x) { return (_x - x) * s + x; }
       function sy(_y) { return (_y - y) * s + y; }
       this.xlo = sx(this.xlo);
       this.ylo = sy(this.ylo);
       this.xhi = sx(this.xhi);
       this.yhi = sy(this.yhi);
       for (var i = 0 ; i < this.sketches.length ; i++) {
          var sk = this.sketches[i];
          sk.scale(s);
          this._translateSketch(sk, (sk.cx() - x) * (s - 1), (sk.cy() - y) * (s - 1));
       }
   },

   setColorId : function(id) {
      for (var i = 0 ; i < this.sketches.length ; i++)
         this.sketches[i].setColorId(id);
   },

   startAction : function(type) {
      this.actionType = type;
      this.isDoingAction = false;
   },

   temporaryAction : function(sketches, x, y) {
      this.clear();
      for (var i = 0 ; i < sketches.length ; i++)
         this.sketches.push(sketches[i]);
      this._isTemporaryAction = true;
      this.xlo = this.xhi = this.x = x;
      this.ylo = this.yhi = this.y = y;
      this.actionType = pieMenuIndex(bgClickX - x, bgClickY - y, 8);
      this.isDoingAction = true;
      this.doClickAction();
   },

   translate : function(dx, dy) {
      this.xlo += dx;
      this.ylo += dy;
      this.xhi += dx;
      this.yhi += dy;
      for (var i = 0 ; i < this.sketches.length ; i++)
         this._translateSketch(this.sketches[i], dx, dy);
   },

   drawOverlayView : function() {
      if (this._isTemporaryAction)
         return;

      function ident(t) { return t; }
      var alpha = (this.fadeAway > 0 ? this.fadeAway : 1) * overview_alpha;
      this._drawShape(alpha);
      lineWidth(4);
      for (var i = 0 ; i < this.sketches.length ; i++) {
         var rgb = palette.rgb[this.sketches[i].colorId];
         alpha = mix(1, .25, overview_alpha);
         color('rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')');
         this.sketches[i].drawTransformed(ident, ident);
      }
   },

   update : function(elapsed) {
      if (this._isTemporaryAction)
         return;

      var alpha = (this.fadeAway > 0 ? this.fadeAway : 1) * (1-overview_alpha);
      this._drawShape(alpha);
      if (this.fadeAway > 0) {
         this.fadeAway = max(0, this.fadeAway - elapsed / 0.25);
         if (this.fadeAway == 0)
            this.clear();
      }
   },

   // INTERNAL METHODS

   _drawShape : function(alpha) {
      var r;
      if (this.xhi != this.xlo || this.yhi != this.ylo) {
         color(fadedColor((isBlackBackground() ? .1 : .6) * (this.fadeAway ? this.fadeAway : 1)));
         lineWidth(r = width() / 120);
         drawRoundRect(this.xlo, this.ylo, this.xhi - this.xlo, this.yhi - this.ylo, r);
      }
   },

   _translateSketch : function(sketch, dx, dy) {
      var f = sketch.mScale();
      sketch.translate(dx / f, dy / f);
   },
}

var group = new Group();

