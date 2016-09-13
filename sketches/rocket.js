function() {
   this.label = "rocket";
   this.onSwipeTime = 0;
   this.velocity = 0;
   this.altitude = 0;

   this.onSwipe[2] = ['BLAST OFF!', function() { this.onSwipeTime = time + 0.5; }];

   this.render = function(elapsed) {
      if (this.onSwipeTime > 0 && time > this.onSwipeTime) { // AFTER SWIPE
         this.velocity += 0.4 * elapsed;
         this.altitude += this.velocity;                    // ACCELERATE
      }
      m.rotateZ(-0.02 * this.altitude);                  // ANIMATE TRAJECTORY
      m.translate(0, this.altitude, 0);

      mCurve(makeSpline([[-.25,-1],[-.35,.3],[-.24,.7],[0,1]])); // FUSILAGE
      mCurve(makeSpline([[0,1],[.24,.7],[ .35,.3],[ .25,-1]]));

      mCurve([[-.34,-.1],[-.8,-.8],[-.28,-.8]]);                 // WINGS
      mCurve([[ .34,-.1],[ .8,-.8],[ .28,-.8]]);

      this.afterSketch(function(elapsed) {               // THRUSTER FLAMES
         if (this.onSwipeTime != 0) {
            mCurve([[-.20, -1.10], [-.3, -1.4 + .7*noise2(10*time, 100)], 
                    [-.08, -1.15], [  0, -1.6 + .7*noise2(10*time, 200)], 
                    [ .08, -1.15], [ .3, -1.4 + .7*noise2(10*time, 300)],
                    [ .20, -1.10]]);
         }
         if (! this.isOnScreen())
            this.fade();
      });
   }
}
