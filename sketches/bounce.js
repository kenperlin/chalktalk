function() {
   this.label = "bounce";
   this.isBouncing = false;
   this.bouncing = 0;
   this.y = 0;

   this.onSwipe[2] = ['start\nbouncing', function() { this.isBouncing = true ; }];
   this.onSwipe[6] = ['stop\nbouncing' , function() { this.isBouncing = false; }];

   this.render = function(elapsed) {
      this.bouncing = this.isBouncing ? min(1, this.bouncing + elapsed)
                                      : max(0, this.bouncing - elapsed);
      var bouncing = max(0, min(1, this.getInValue(0, this.bouncing)));

      this.afterSketch(function() {
         color(fadedColor(.25, this.colorId));
         mFillCurve([[-1,0],[1,0],[1,-.15],[-1,-.15]]);
         color(defaultPenColor);
      });
      mLine([-1,0],[1,0]);

      var s = sin(2 * TAU * time);

      this.y = sqrt(.5 + .5 * s) * bouncing;

      var h = 1 + min(0, .4 * s * abs(s)) * bouncing;
      var oval = makeOval(-.5, this.y, 1, h, 32, -TAU/4, -TAU*5/4);

      this.afterSketch(function() {
         color(fadedColor(.25, this.colorId));
         mFillCurve(oval);
         color(defaultPenColor);
      });

      mCurve(oval);

      this.extendBounds([[-1, 0], [1, 2]]);
   }

   this.output = function() { return this.y; }
}
