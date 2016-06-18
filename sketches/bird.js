function() {
   this.label = "bird";
   this.is3D = true;
   this.isGaze = false;
   this.isTall = false;
   this.gaze = 0.0;
   this.tall = 0.0;
   this.walkT = 0;
   this.T = 0;

   this.choice = new Choice();

   this.swipe[0] = ['walk'        , function() { this.choice.setState(2); this.isGaze = false; }];
   this.swipe[1] = ['toggle\ngaze', function() { this.isGaze = ! this.isGaze; }];
   this.swipe[2] = ['toggle\ngaze', function() { this.isGaze = ! this.isGaze; }];
   this.swipe[4] = ['come\nalive' , function() { this.choice.setState(1); }];

   this.render = function(elapsed) {
      this.choice.update(elapsed);

      this.tall = this.isTall ? min(1, this.tall + 2 * elapsed)
                              : max(0, this.tall - elapsed);

      this.gaze = this.isGaze ? min(1, this.gaze + 2 * elapsed)
                              : max(0, this.gaze - elapsed);

      var idle = this.choice.getValue(1);
      var walk = this.choice.getValue(2);

      function walkX(t) { return 2.6 * t * uLeg; }

      // IF AUTO-SKETCHED, KEEP SKETCHY STYLE EVEN AFTER FINISHED DRAWING.

      if (this.glyphTransition == 0) {
         noisy = 1;
         this.styleTransition = 0;
      }

      // T CONTROLS WALK, IS ZERO UNTIL SKETCH IS FINISHED.

      var state = this.choice.getState();

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

      var tall      = sCurve(this.tall);
      var footY     = -1.2;
      var spineBase = footY + lerp(tall, 1.0, 1.5) * this.stretch('leg length', S(2).height / 0.2);
      var spineTop  = spineBase + lerp(tall, 0.8, 1.3) * this.stretch('body length', S(1).height / 0.15);
      var uLeg      = (spineBase - footY) / lerp(tall, 1.2, 1.5);
      var lLeg      = 0.9 * uLeg;

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
                                         max(0, sketchPage.x - this.cx())));
         m.rotateZ(rotz);
         m.rotateY(lookSide);
	 m.scale(this.stretch('head width', S(0).width / 0.15),
	         this.stretch('head height', S(0).height / 0.1), 1);
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
                     footY-hipY + footLift, 0];
         var Knee = [-1,0,0];
         ik(uLeg, lLeg, Foot, Knee);
	 Foot[2] = (n==0 ? .3 : -.3) * lLeg;
	 Knee[2] = Foot[2];

         var c = [];
         m.save();
	    m.identity();
            m.translate(hipX,hipY,0);
            c.push(m.transform([0,0,0]));
            c.push(m.transform([0,0,Knee[2]]));
            c.push(m.transform(Knee));
            c.push(m.transform(Foot));
            m.save();
               m.translate(Foot[0],Foot[1],Foot[2]);
               m.rotateZ(.6*footLift);
               c.push(m.transform([0,0,0]));
               c.push(m.transform([.3,0,0]));
            m.restore();
         m.restore();
         mCurve(c);
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

         // AFTER THE BIRD WALKS OFF THE SCREEN, DELETE IT.

         if (! this.isOnScreen())
            this.fade();
      });
   }
}
