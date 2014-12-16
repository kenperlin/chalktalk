function Command() {
   this.labels = "dict".split(' ');
   this.render = function() {
      mCurve([ [0,-1], [0,1], [0,-1] ]);
      if (! isRegisteringSketch)
         if (this.fade() == 1)
            isShowingGlyphs = true;
         else
            isShowingGlyphs = false;
   }
}
Command.prototype = new Sketch;
addSketchType("Command");
