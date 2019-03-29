function() {
   this.label = 'tristrip';
   this.mode = 0;
   this.onClick = ['next mode', function() { this.mode = (this.mode + 1) % 5; }];
   this.render = function() {
      mLine([-1,-1],[-1, 1]);
      mLine([-1, 1],[ 1, 1]);
      mLine([ 1, 1],[ 1,-1]);
      mLine([ 1,-1],[-1,-1]);
      this.afterSketch(function() {
         textHeight(this.mScale(.13));
         if (this.mode >= 3) {
            color(fadedColor(.3, this.colorId));
            mFillCurve([[-.5,-.5],[.5,-.5],[-.5,.5]]);
            if (this.mode >= 4) {
               color(fadedColor(.5, this.colorId));
               mFillCurve([[.5,-.5],[-.5,.5],[.5,.5]]);
            }
            color(palette.color[this.colorId]);
         }
         switch (this.mode) {
         case 4: mArrow([ .4,-.4 ],[ .4 , .4 ], .1); mText("3", [ .5, .5], .5,.5);
         case 3: mArrow([-.4, .4 ],[ .3 ,-.3 ], .1); mText("2", [ .5,-.5], .5,.5);
         case 2: mArrow([-.4,-.4 ],[-.4 , .3 ], .1); mText("1", [-.5, .5], .5,.5);
         case 1:                                  mText("0", [-.5,-.5], .5,.5);
         }
      });
   }
}
