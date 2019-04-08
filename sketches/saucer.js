function() {
   this.label = 'saucer';
   this.onSwipe[2] = ['BLAST OFF!', function() { launchTime = time + 0.5; }];
   this.render = elapsed => {
      if (launchTime > 0 && time > launchTime) { // AFTER SWIPE
         velocity += 0.1 * elapsed;
         altitude += velocity;                   // ACCELERATE
      }
      m.rotateZ(-0.02 * altitude);               // ANIMATE TRAJECTORY
      m.translate(0, altitude, 0);

      mDrawOval([-1,-.4],[1,.4],32,.39*PI,-1.39*PI);
      mDrawOval([-.5,-.5],[.5,.5],32,.85*PI,.15*PI);
      this.afterSketch(() => {
         mDrawOval([-.7,.12],[.7,1],32,-.28*PI,-.72*PI);
         mDrawOval([-.36,-.2],[-.16,-.1]);
         mDrawOval([ .16,-.2],[ .36,-.1]);
         mDrawOval([-.7,  0],[-.5, .1]);
         mDrawOval([ .5,  0],[ .7, .1]);
         if (launchTime != 0) {
	    m.translate(0,.6,0);
            mCurve([[-.20, -1.10], [-.3, -1.4 + .7*noise2(10*time, 100)], 
                    [-.08, -1.15], [  0, -1.6 + .7*noise2(10*time, 200)], 
                    [ .08, -1.15], [ .3, -1.4 + .7*noise2(10*time, 300)],
                    [ .20, -1.10]]);
         }
         if (! this.isOnScreen())
            this.fade();
      });
   }
   let launchTime = 0, velocity = 0, altitude = 0;
}

