
function() {
   var candleX = 0;
   var candleY = 0;
   this.labels = 'moth candle'.split(' ');
   this.is3D = true;
   this.isAnimating = false;
   this.mm = new M4();
   this.up = (new M4()).identity().rotateX(PI/2);
   this.moveMothX = 0;
   this.moveMothY = 0;
   this.transitionToCandle = 0;

   this.code = [ ['', ''] ];

   this.onSwipe[2] = ['animate', function() {
      this.isAnimating = true;
   }];

   this.onSwipe[6] = ['gather moths', function() {
      for (var i = 0 ; i < sketchPage.sketches.length ; i++) {
         var s = sketchPage.sketches[i];
         if ((s instanceof MothAndCandle) && s.labels[s.selection] == 'moth')
            s.isAnimating = true;
      }
   }];

   this.render = function(elapsed) {
      if (this.startTime === undefined)
         this.startTime = time;
      var transition = sCurve(max(0, min(1, 2 * (time - this.startTime) - 1.5)));

      function sharpen(t) { return (t < 0 ? -1 : 1) * pow(abs(t), 4.0); }

      m.save();
      switch (this.labels[this.selection]) {

      case 'moth':
         this.code[0][1] = 'When I see a light,\n   I go to it.';

         if (this.isAnimating) {

            if (this.animationThrottle === undefined)
               this.animationThrottle = 0;
            this.animationThrottle = min(1, this.animationThrottle + elapsed / 0.5);
            var animationSpeed = sCurve(this.animationThrottle);

            // ALWAYS MOVE FORWARD.

            this.mm.translate(0, 15 * elapsed * animationSpeed, 0);

            // IF THERE IS A CANDLE, HOVER AROUND THE CANDLE.

            if (window.isCandle) {
               this.mm._m()[12] *= 1 - elapsed/2;
               this.mm._m()[13] *= 1 - elapsed/2;
               this.mm._m()[14] *= 1 - elapsed/2;

               this.transitionToCandle = min(1, this.transitionToCandle + elapsed / 2.0);
               var t = sCurve(this.transitionToCandle);

               var x = (this.xlo + this.xhi) / 2;
               var y = (this.ylo + this.yhi) / 2;

               this.moveMothX += elapsed * max(-10, min(10, candleX - x)) * min(1, 200 / this.size);
               this.moveMothY -= elapsed * max(-10, min(10, candleY - y)) * min(1, 200 / this.size);
            }

            m.translate(this.moveMothX, this.moveMothY, 0);

            // CONTINUALLY CHANGE DIRECTION.

            var turnRate = 25 * elapsed * animationSpeed;
            this.mm.rotateX(turnRate * sharpen(2 * noise2(8 * (time - this.startTime), 200.5 + 10 * this.id)));
            this.mm.rotateZ(turnRate * sharpen(2 * noise2(8 * (time - this.startTime), 300.5 + 10 * this.id)));

            // TRY TO STAY ORIENTED UPRIGHT.

            if (animationSpeed == 1)
               this.mm.aimZ(this.up);
         }

         // DRAW TORSO

         lineWidth(mix(2, 0.5, transition));

         m.scale(this.size / 250);
         m.translate(0,-.1,0);
         m._xf(this.mm._m());
         m.save();
            // ALWAYS TURN TORSO TO FACE VIEW.
            m.rotateY(atan2(m._m()[2], m._m()[0]));
            mCurve(createCurvedLine([-0.01,-0.6],[ 0.01,-0.6], 45.0));
         m.restore();

         // DRAW LEFT WING

         var flap = sin(6 * TAU * time);
         lineWidth(2);

         m.save();
            m.translate(-0.06,0,0);
            if (this.isAnimating)
               m.rotateY(flap);
            mCurve(createCurvedLine([-0.03, 0.1],[-0.34,-0.2],-0.8).
            concat(createCurvedLine([-0.34,-0.2],[-0.00,-0.4],-0.5)));
         m.restore();

         // DRAW RIGHT WING

         m.save();
            m.translate(0.06,0,0);
            if (this.isAnimating)
               m.rotateY(-flap);
            mCurve(createCurvedLine([ 0.03, 0.1],[ 0.34,-0.2], 0.8).
            concat(createCurvedLine([ 0.34,-0.2],[ 0.00,-0.4], 0.5)));
         m.restore();

         // DRAW LEFT AND RIGHT ANTENNAE

         this.afterSketch(function() {
            lineWidth(mix(2, 0.5, transition));
            mCurve(createCurvedLine([-0.03, 0.28],[-0.2, 0.8], -0.1));
            mCurve(createCurvedLine([ 0.03, 0.28],[ 0.2, 0.8],  0.1));
         });

         break;

      case 'candle':
         this.code[0][1] = 'I am a light.';

         // MOTHS GO TO THE FLAME WHEN THE CANDLE APPEARS.

         if (this.glyphTransition >= 0.5 && isNumeric(this.xlo)) {
            candleX = (this.xlo + this.xhi) / 2;
            candleY = this.ylo;
            window.isCandle = true;
         }

         // THEY WANDER OFF WHEN THE CANDLE DISAPPEARS.

         if (this.fadeAway > 0 && this.fadeAway < 1)
            window.isCandle = false;

         m.scale(this.size / 350);

         // CANDLE

         mCurve([[-.2,-1.1],[-.2,.3]]
                .concat(createCurvedLine([-.2,.3],[.2,.2],-.1))
                .concat([[.2,.2],[.2,-1.1]]));

         // WICK

         mCurve(createCurvedLine([ .01, .21],[ .01, .4], .05));

         // FLAME

	 var dx = this.isAnimating ? 0.5 * noise(5 * time) : 0;

         mCurve(createCurvedLine([ 0.00+dx*.4 ,0.90],[-0.10+dx*.1 ,0.60], 0.08).
         concat(createCurvedLine([-0.10+dx*.1 ,0.60],[ 0.00 ,0.30],-0.31)));

         mCurve(createCurvedLine([ 0.00+dx*.4 ,0.90],[ 0.195+dx*.1,0.63], 0.03).
         concat(createCurvedLine([ 0.195+dx*.1,0.63],[ 0.00 ,0.30], 0.30)));

         break;
      }
      m.restore();
   }
}

