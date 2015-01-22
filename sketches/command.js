function Command() {
   this.label = 'dict';
   this.render = function() {
      switch (this.labels[this.selection]) {
      case 'dict':
         mCurve([ [0,-1], [0,1], [0,-1] ]);
         if (! this.isMakingGlyph)
            if (this.fade() == 1)
               isShowingGlyphs = true;
            else
               isShowingGlyphs = false;
         break;
      }
   }
}
Command.prototype = new Sketch;
addSketchType("Command");
