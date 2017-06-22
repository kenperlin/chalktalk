function() {
   this.label = "textbugtest";

   this.render = function() {
      mCurve([[-1, 1], [1, 1]]);
      this.duringSketch(function() {
         mCurve([[0, 1], [0, -1]]);
      });
      mCurve([[1, 1], [1, -1]]);

      this.afterSketch(function() {
         textHeight(this.mScale(0.25));
         if (isDef(this.inValue[0])) {
            mText(this.inValue[0], [0, 0], 0.5, 0.5);
         }
      });
   }
}

