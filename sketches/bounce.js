function() {
   this.label = "bounce";
   this.isBouncing = false;
   this.bouncing = 0;

   this.swipe[2] = ['start\nbouncing', function() { this.isBouncing = true ; }];
   this.swipe[6] = ['stop\nbouncing' , function() { this.isBouncing = false; }];

   this.render = function(elapsed) {
      this.bouncing = this.isBouncing ? min(1, this.bouncing + elapsed)
                                      : max(0, this.bouncing - elapsed);
      var bouncing = max(0, min(1, this.getInValue(0, this.bouncing)));

      this.afterSketch(function() {
         color(scrimColor(.25));
         mFillCurve([[-1,0],[1,0],[1,-.15],[-1,-.15]]);
         color(defaultPenColor);
      });
      mLine([-1,0],[1,0]);

      var s = sin(2 * TAU * time);
      var y = sqrt(.5 + .5 * s) * bouncing;
      var h = 1 + min(0, .4 * s * abs(s)) * bouncing;
      var oval = makeOval(-.5,y,1,h, 32, -TAU/4, -TAU*5/4);
      this.afterSketch(function() {
         color(scrimColor(.25));
         mFillCurve(oval);
         color(defaultPenColor);
      });
      mCurve(oval);

      this.extendBounds([[-1, 0], [1, 2]]);
      this.setOutPortValue(y);
   }
}
