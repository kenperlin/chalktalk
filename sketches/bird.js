function() {
   this.T = 0;
   this.label = "bird";
   this.isGaze = false;
   this.isTall = false;
   this.gaze = 0.0;
   this.tall = 0.0;
   this.walkT = 0;

   this.choice = new Choice();

   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy, 8)) {
      case 0:
         this.choice.state(2);
         this.isGaze = false;
         break;
      case 1:
         this.isGaze = ! this.isGaze;
         break;
      case 2:
         this.isTall = true;
         break;
      case 4:
         this.choice.state(1);
         break;
      case 6:
         this.isTall = false;
         break;
      }
   }

   this.render = function(elapsed) {
      this.choice.update(elapsed);

      this.tall = this.isTall ? min(1, this.tall + 2 * elapsed)
                              : max(0, this.tall - elapsed);

      this.gaze = this.isGaze ? min(1, this.gaze + 2 * elapsed)
                              : max(0, this.gaze - elapsed);

      var idle = this.choice.value(1);
      var walk = this.choice.value(2);

      // WHEN THE BIRD WALKS OFF THE SCREEN, DELETE IT.

      if (this.xlo > width() - _g.panX) {
         sketchToDelete = this;
         return;
      }

      function walkX(t) { return 2.2 * t; }

      // IF AUTO-SKETCHED, KEEP SKETCHY STYLE EVEN AFTER FINISHED DRAWING.

      if (this.glyphTransition == 0) {
         noisy = 1;
         this.styleTransition = 0;
      }

      // T CONTROLS WALK, IS ZERO UNTIL SKETCH IS FINISHED.

      var state = this.choice.state();

      this.afterSketch(function() {
         switch (state) {
         case 1:
         case 2:
            if (this.time === undefined) {
               this.time = time;
               this.T = 0;
               this.walkT = 0;
            }
            break;
         }
      });

      var pace = 1.1;

      // LEFT AND RIGHT FOOT ARE DISPLACED IN TIME.

      var t = pace * this.walkT;
      var TFoot = [ (saw(t)/2 - .5) / pace, (saw(t+.5)/2 - .5) / pace ];

      // WALKING MOVEMENT IS DRIVEN BY SINUSOIDAL WAVES.

      var s2 = 0, c2 = 1, s4 = 0, c4 = 1;

      if (walk > 0) {
         var phase = pace * TAU * this.walkT;
         s2 = sin(    phase);
         c2 = cos(    phase);
         s4 = sin(2 * phase);
         c4 = cos(2 * phase);
      }

      // BODY PROPORTIONS.

      var tall = sCurve(this.tall);
      var footY = -1.2;
      var spineBase = footY + lerp(tall, 1.0, 1.5);
      var spineTop = spineBase + lerp(tall, 0.8, 1.3);
      var uLeg  =  (spineBase - footY) / lerp(tall, 1.2, 1.5);
      var lLeg  =  0.9 * uLeg;

      // PARAMETERS THAT CONTROL BODY LANGUAGE.

      var liftFoot = 0;
      var lookUp   = 0.2      + 1.5 * noise2(this.T / 3.0, 10);
      var lookSide = 0.0      + 3.0 * noise2(this.T / 3.0, 20);
      var bounce   = 0.1 * s4 + 0.2 * noise2(this.T / 1.5, 30);
      var bob      = 0.1 * c4 + 0.3 * noise2(this.T / 1.5, 40);

      // COMPUTED VALUES.

      var hipX = 0;
      var hipY = spineBase + bounce;
      var neckX = bob - .3 * lookUp - .1;
      var neckY = spineTop + bounce;

      m.scale(this.size / 400);
      m.translate(walkX(this.walkT), 0, 0);

      // HEAD

      m.save();
         m.translate(neckX,neckY,0);
         var rotz = lookUp;
         if (sketchPage.x !== undefined && isNumeric(this.cx()))
            rotz = lerp(this.gaze, rotz, -atan2(sketchPage.y - this.cy(),
	                                        sketchPage.x - this.cx()));
         m.rotateZ(rotz);
         m.rotateY(lookSide);
         mCurve([[.0,.0,0],[.8,.3,0],[.0,.6,0],[.0,.0,0]]);
      m.restore();

      // SPINE

      var spine = [];
      var arching = lerp(tall, .1, .2);
      for (var t = 0 ; t <= 1 ; t += 1/10) {
         var arch = arching * sin(PI * t);
         spine.push([ lerp(t, neckX, hipX) + arch * (1 - 2.7 * bounce),
                      lerp(t, neckY, hipY),
                      0 ]);
      }
      mCurve(spine);

      // LEGS

      for (var n = 0 ; n < 2 ; n++) {
         var footLift = max(0, (n==0 ? .3 : -.3) * s2);
         var Foot = [-hipX + walkX(TFoot[n]) + .15,
                     footY-hipY + footLift, .6];
         var Knee = [-1,0,0];
         ik(uLeg, lLeg, Foot, Knee);

         var c = [];
         m.save();
            m.translate(hipX,hipY,0);
            c.push(m.transform([0,0,0]));
            c.push(m.transform(Knee));
            c.push(m.transform(Foot));
            m.save();
               m.translate(Foot[0],Foot[1],Foot[2]);
               m.rotateZ(.6*footLift);
               c.push(m.transform([0,0,0]));
               c.push(m.transform([.3,0,0]));
            m.restore();
         m.restore();
         drawCurve(c);
      }

      this.afterSketch(function() {
         switch (state) {
         case 1:
         case 2:
            this.T += time - this.time;
            if (state == 2)
               this.walkT += time - this.time;
            this.time = time;
            break;
         }
      });
   }
}
