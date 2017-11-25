"use strict";

function GlyphChart() {
   this.t = 0;
   this.iDragged = 0;
   this.isDragging = false;
   this.isSelectingTag = false;
   this.isClicked = false;
   this.iSelectedTag = 0;
   this.hoveredOverTag = null;
   
   this.strokeCountMask = 0;
   
   // ARRAY OF REGISTERED TAGS
   this.tags = [''];
   // MAP OF ON / OFF STATES FOR EACH TAG
   this.tagStates = {};
   this.numActiveTags = 0;
}

GlyphChart.prototype = {
   gR : 5,

   glyphsPerCol : 12,

   setStrokeCountBit : function(b, state) {
      if (state)
         this.strokeCountMask |= 1 << b;
      else
         this.strokeCountMask ^= 1 << b;
   },
   colWidth : function() {
      return height() / this.glyphsPerCol * .89;
   },
   color : function() {
      return isWhiteBackground() ? 'rgb(0,50,100)' : 'rgb(128,192,255)' ;
   },
   scrim : function() {
     return fadedRGB(isWhiteBackground() ? .3 : .1, this._isFuzzyLines ? [0,32,64] : [0,128,255]);
   },
   bounds : function(i) {
      var ht = height() / this.glyphsPerCol;
      var x = this.colWidth() * (0.05 + floor(i / this.glyphsPerCol)) - _g.panX;
      var y = ((i % this.glyphsPerCol) * height()) / this.glyphsPerCol + ht * .1 - _g.panY;
      return [ x, y, x + ht * .75, y + ht * .85 ];
   },
   draw : function() {
      this._isFuzzyLines = sketchPage.isFuzzyLines();
      sketchPage.setFuzzyLines(false);

      var mx = This().mouseX, my = This().mouseY, i, b;

      _g.save();
      _g.globalAlpha = 1.0;

      color(backgroundColor);
      fillRect(-_g.panX - 100, 0, width() + 200 - _g.panY, height());

      _g.textHeight = floor(10 * height() / 800);
      _g.font = _g.textHeight + 'pt Arial';

      this.t = this.isDragging
                 ? this.iDragged + 0.99
                 : this.glyphsPerCol * (floor( (sketchPage.mx + _g.panX) / this.colWidth() ) +
                                   max(0, _g.panY + min(.99, sketchPage.my / height())));

      this.isAnySelected = false;
      for (i = 0 ; i < glyphs.length ; i++) {
         b = this.bounds(i);
         if (mx >= b[0] && my >= b[1] && mx < b[2] && my < b[3]) {
            if (mx - b[0] + my - b[1] > this.gR ||
                mx - b[0] + b[3] - my > this.gR ||
                b[2] - mx + my - b[1] > this.gR ||
                b[2] - mx + b[3] - my > this.gR)
               this.isAnySelected = true;
               break;
         }
      }

      this.drawTagList();

      for (i = 0 ; i < glyphs.length ; i++)
         this.drawGlyph(i);

      if (this.isDragging)
         this.drawGlyph(this.iDragged, This().mouseX, This().mouseY);

      this.hoveredOverTag = null;

      _g.restore();

      sketchPage.setFuzzyLines(this._isFuzzyLines);
   },

   // RESET TAGS TEMPORARILY A TAG BUTTON (SHOULD CHANGE)
   resetTagHeader : "Reset Tags",

   heightScale : 1.5,
   tagBounds : function(i) {
      const txtLen = (i == 0) ? this.resetTagHeader.length : this.tags[i].length;
      var ht = this.heightScale * textHeight();
      var strLen = textWidth(((i == 0) ? this.resetTagHeader : this.tags[i]) + ' ');
      var x = width() - strLen - _g.panX;
      // THIS COMMENTED CODE WOULD CYCLE THE BOX AROUND TO THE NEXT COLUMN,
      // DISABLED FOR NOW FOR TAGS, LIKELY TO RE-ACTIVATED LATER
      var y = ((i /*% this.glyphsPerCol*/) * height()) / (height() / ht) + ht * .1 - _g.panY;

      return [ x, y , x + strLen + 20, y + ht];
   },
   addTags : function(tags) {
      tags.sort();

      for (let k = 0, i = 1; k < tags.length; k++) {
         const tag = tags[k];
         if (this.tagStates[tag] !== undefined) {
            continue;
         }
         this.tagStates[tag] = false;
         for (; i < this.tags.length; i++) {
            if (tag < this.tags[i]) {
               this.tags.splice(i, 0, tag);
               i++;
               break;
            }
         }
         if (i == this.tags.length) {
            for (; k < tags.length; k++) {
               this.tags.push(tags[k]);
            }
         }
      }
   },
   disableAllTags : function() {
      for (let i = 1; i < this.tags.length; i++) {
         this.tagStates[this.tags[i]] = false;
      }
      this.numActiveTags = 0;
   },
   drawTagList : function() {
      var mx = This().mouseX, my = This().mouseY, i, b;

      _g.save();

      const that = this;

      function drawTag(i) {
         var b = that.tagBounds(i);
         var gX = b[0], gY = b[1], gW = b[2]-b[0], gH = b[3]-b[1];

         var x = gX + (height() / (that.heightScale * textHeight())) * .1;
         var y = gY;
         var t = (that.t - i - 0.55) * 2.5 + i + .5;
         var isSelected = mx >= b[0] && my >= b[1] && mx < b[2] && my < b[3];

         // WHETHER THIS TAG HAS BEEN CLICKED ON THE CURRENT FRAME
         var isClicked = isSelected && that.isClicked && i == that.iSelectedTag;

         // IF SO, TOGGLE ACTIVE STATE
         const tag = that.tags[i];
         if (isSelected) {
            that.hoveredOverTag = tag;
         }
         if (isClicked) {
            that.isClicked = false;
            // RESET ALL TO OFF STAT
            if (i == 0) {
               that.disableAllTags();
            }
            // TOGGLE INDIVIDUAL STATE
            else {
               const prevWasOn = that.tagStates[tag];
               that.tagStates[tag] = !prevWasOn;
               if (prevWasOn) {
                  that.numActiveTags--;
               }
               else {
                  that.numActiveTags++;
               }
            }
         }

         // NEW STATE
         var isActive = ((i == 0) ? false : that.tagStates[tag]);

         var isHighlighted = isSelected || isActive;

         var gR = that.gR;
         var sc = height() / 2000 * 10 / (textHeight() * that.heightScale);
         var n, d, j;

         function highlightTagAsActive() {
            fillPolygon(createRoundRect(gX, gY, gW, gH, gR));
            lineWidth(0.5);
            color(that.color());
            if (isWhiteBackground()) {
               line(gX + gW, gY + gH - gR, gX + gW, gY + gR);
               line(gX + gW - gR, gY + gH, gX + gR, gY + gH);
               var rx = gX + gW - gR + .707 * gR;
               var ry = gY + gH - gR + .707 * gR;
               line(gX + gW - gR, gY + gH, rx, ry);
               line(gX + gW, gY + gH - gR, rx, ry);
            }
            else {
               line(gX + gR, gY, gX + gW - gR, gY);
               line(gX, gY + gR, gX, gY + gH - gR);
               var rx = gX + gR - .707 * gR;
               var ry = gY + gR - .707 * gR;
               line(gX + gR, gY, rx, ry);
               line(gX, gY + gR, rx, ry);
            }
         }
         // RESET-TAGS SHOULD BE A DIFFERENT ELEMENT 
         // (NOT THE SAME TYPE OF BUTTON...CURRENT IMPLEMENTATION TEMPORARY)
         if (isActive || i == 0) {
            color(that.scrim());
            highlightTagAsActive();
         }

         const stroke = (isSelected) ? defaultPenColor : that.color();

         _g.strokeStyle = _g.fillStyle = stroke;
                                         
         _g.lineWidth = (isActive) ? 2 : 
                        (isHighlighted ? 2 : 1);

         _g_text(((i == 0) ? that.resetTagHeader : that.tags[i]), [gX + 2, y + 2, 0]);
      }

      for (let i = this.tags.length - 1; i >= 0; i--) {
         color(this.scrim());
         drawTag(i);
      }

      _g.restore();    
   },
   drawGlyph : function(i, cx, cy) {
      var mx = This().mouseX, my = This().mouseY;
      var glyph = glyphs[i];
      var nn = glyph.data.length;
      var b = this.bounds(i);
      var gX = b[0], gY = b[1], gW = b[2]-b[0], gH = b[3]-b[1];
      if (isDef(cx)) {
         gX += cx - (b[0] + b[2]) / 2;
         gY += cy - (b[1] + b[3]) / 2;
      }
      var x = gX + (height()/this.glyphsPerCol) * .1;
      var y = gY;
      var t = (this.t - i - .55) * 2.5 + i + .5;
      var txt = glyphs[i].indexName;
      var isSelected = mx >= b[0] && my >= b[1] && mx < b[2] && my < b[3];

      var highlightedByTag = false;
      if (glyph.tags.length > 0) {
         function isHighlightedByTag(chart) {
            // IF ANY TAGS ARE LOCKED-IN
            if (chart.numActiveTags > 0) {
               for (let i = 0; i < glyph.tags.length; i++) {
                  if (chart.hoveredOverTag == glyph.tags[i] ||
                      chart.tagStates[glyph.tags[i]] == true) {
                     return true;
                  }
               }
               return false;
            }
            // OTHERWISE CHECK ONLY THE HOVERED-OVER TAG IF IT EXISTS
            if (chart.hoveredOverTag != null) {
               for (let i = 0; i < glyph.tags.length; i++) {
                  if (chart.hoveredOverTag == glyph.tags[i]) {
                     return true;
                  }
               }
               return false;
            }
            return false;
         }
         highlightedByTag = isHighlightedByTag(this);
      }

      const maskNZ = (this.strokeCountMask & 1 << nn) != 0;
                          // GLYPH IS SELECTED DIRECTLY
      var isHighlighted = isSelected ||
                          // GLYPH HAS NO LOCKED-IN OR HOVERED-OVER TAGS, CONSIDER THE STROKE COUNT MASK
                          (this.numActiveTags == 0 && this.hoveredOverTag == null && maskNZ) ||
                          // GLYPH HAS A LOCKED-IN OR HOVERED-OVER TAG, CONSIDER THE COUNT MASK ONLY IF IT IS ACTIVE
                          (highlightedByTag && (maskNZ || this.strokeCountMask == 0));

      var gR = this.gR;
      var sc = height() / 2000 * 10 / this.glyphsPerCol;
      var n, d, j;

      color(this.scrim());
      fillPolygon(createRoundRect(gX, gY, gW, gH, gR));

      lineWidth(0.5);
      color(this.color());
      if (isWhiteBackground()) {
         line(gX + gW, gY + gH - gR, gX + gW, gY + gR);
         line(gX + gW - gR, gY + gH, gX + gR, gY + gH);
         var rx = gX + gW - gR + .707 * gR;
         var ry = gY + gH - gR + .707 * gR;
         line(gX + gW - gR, gY + gH, rx, ry);
         line(gX + gW, gY + gH - gR, rx, ry);
      }
      else {
         line(gX + gR, gY, gX + gW - gR, gY);
         line(gX, gY + gR, gX, gY + gH - gR);
         var rx = gX + gR - .707 * gR;
         var ry = gY + gR - .707 * gR;
         line(gX + gR, gY, rx, ry);
         line(gX, gY + gR, rx, ry);
      }

      _g.strokeStyle = _g.fillStyle = isHighlighted ? defaultPenColor : this.color();
      _g.lineWidth = isHighlighted ? 2 : 1;

      // CHECK WHETHER TO DISPLAY SKETCH NAME
      if (isHighlighted || 
         (this.strokeCountMask == 0 && 
          this.numActiveTags == 0 && 
          this.hoveredOverTag == null &&
          !this.isAnySelected)) {
         _g_text(txt, [gX + 2, y + 2, 0]);
      }

      y += height() / 45 * 10 / this.glyphsPerCol;

      for (n = 0 ; n < nn ; n++) {
         d = glyph.data[n];
         if (isSelected)
       if (mix(i, i+1, n / nn) <= t)
               fillOval(x + d[0][0] * sc - 3, y + d[0][1] * sc - 3, 6, 6);
            else
          continue;

         _g_beginPath();
         _g_moveTo(x + d[0][0] * sc, y + d[0][1] * sc);
    var incr = isSelected ? 1 : max(1, floor(d.length / 10));
         for (j = 1 ; j < d.length ; j += incr) {
            if (isSelected && mix(i, i+1, (n + j / d.length) / nn) > t)
               break;
            _g_lineTo(x + d[j][0] * sc, y + d[j][1] * sc);
         }
    if (incr > 1)
            _g_lineTo(x + d[d.length-1][0] * sc, y + d[d.length-1][1] * sc);
         _g_stroke();
      }
   },
}

var glyphChart = new GlyphChart();

