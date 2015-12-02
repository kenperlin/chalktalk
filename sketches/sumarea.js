function() {
   this.label = 'sumarea';
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   var x0 = -.2;
   var x1 =  .5;
   var y0 = -.2;
   var y1 =  .6;
   this.render = function() {
      mClosedCurve([[-1,-1],[-1,1],[1,1],[1,-1]]);
      mClosedCurve([[x0,y0],[x0,y1],[x1,y1],[x1,y0]]);
      if (this.mode > 0) {
         lineWidth(1);
         mLine([-1,y0],[x0,y0]);
         mLine([-1,y1],[x0,y1]);
         mLine([x0,-1],[x0,y0]);
         mLine([x1,-1],[x1,y0]);
         if (this.mode > 1) {
            textHeight(this.mScale(.2));
            color('pink');
            mText('S0', [mix(-1,x0,.5), mix(-1,y0,.5)], .5,.5);
            mText('S1', [mix(x0,x1,.5), mix(-1,y0,.5)], .5,.5);
            mText('S2', [mix(-1,x0,.5), mix(y0,y1,.5)], .5,.5);
            mText('S3', [mix(x0,x1,.5), mix(y0,y1,.5)], .5,.5);
            if (this.mode > 2) {
               color('red');
               mText('S3 - S2 - S1 + S0', [0, 1.3], .5,.5);
               lineWidth(3);
               mClosedCurve([[x0,y1],[x1,y1],[x1,y0],[x0,y0]]);
            }
         }
      }
   }
}
