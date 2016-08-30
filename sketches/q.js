function() {
   isCasualFont
   isFog
   sketchPadding

   this.label = 'q';
   this.render = function() {
      mCurve(buildCurve([[-1,0], 3,[1,1], -2,[-.6,-.6]]));
   }
}
