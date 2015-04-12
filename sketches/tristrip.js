function() {
   this.label = 'tristrip';
   this.mode = 0;
   this.onClick = function() { this.mode++; }
   this.render = function() {
      mLine([-1,-1],[-1, 1]);
      mLine([-1, 1],[ 1, 1]);
      mLine([ 1, 1],[ 1,-1]);
      mLine([ 1,-1],[-1,-1]);
      this.afterSketch(function() {
         textHeight(this.mScale(.13));
         if (this.mode >= 3) {
            color(scrimColor(.3));
            mFillCurve([[-.5,.5],[.5,.5],[-.5,-.5]]);
            if (this.mode >= 4) {
               color(scrimColor(.5));
               mFillCurve([[.5,.5],[-.5,-.5],[.5,-.5]]);
            }
            color(defaultPenColor);
         }
         switch (this.mode) {
         case 4: mArrow([-.4,-.5],[ .4,-.5], .1); mText("3", [ .5,-.5], .5,.5);
         case 3: mArrow([ .4, .4],[-.4,-.4], .1); mText("2", [-.5,-.5], .5,.5);
         case 2: mArrow([-.4, .5],[ .4, .5], .1); mText("1", [ .5, .5], .5,.5);
         case 1:                                  mText("0", [-.5, .5], .5,.5);
         }
      });
   }
}
