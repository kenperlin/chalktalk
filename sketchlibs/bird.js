
function Bird() {

   // BODY PROPORTIONS, SET BY CLIENT PROGRAM

   this.legLength  = 1;
   this.bodyLength = 1;
   this.headWidth  = 1;
   this.headHeight = 1;

   // MOVEMENT PARAMETERS, SET BY CLIENT PROGRAM

   this.lookUp  = 0;
   this.pace    = 1.2;
   this.turnDir = 0;

   // STATE FUNCTIONS, CALLED BY CLIENT PROGRAM

   this.turnOnWalk = function() { this.moving.setState(2); this.gazing.setState(0); }
   this.toggleGaze = function() { this.gazing.setState(1 - this.gazing.getState()); }
   this.turnOnIdle = function() { this.moving.setState(1); }

   // INTERNAL STATE MACHINES

   this.moving = new Choice();
   this.gazing = new Choice();

   // INTERNAL CONTINUOUS VARIABLES

   this.walkP   = 0;
   this.walkT   = 0;
   this.walkX   = 0;
   this.walkZ   = 0;
   this.T       = 0;
   this.t       = 0;

   // UPDATE FUNCTION, CALLED BY CLIENT PROGRAM EACH ANIMATION FRAME

   this.update = function(elapsed) {

      this.moving.update(elapsed);
      this.gazing.update(elapsed);

      var gaze = this.gazing.getValue(1);
      var idle = this.moving.getValue(1);
      var walk = this.moving.getValue(2);

      // T CONTROLS WALK, IS ZERO UNTIL SKETCH IS FINISHED.

      var state = this.moving.getState();

      switch (state) {
      case 1:
      case 2:
         if (this.time === undefined) {
            this.time = time;
            this.T = 0;
            this.walkT = 0;
         }
      }

      // LEFT AND RIGHT FOOT ARE DISPLACED IN PHASE.

      var TFoot = [ saw(this.walkP) / 2 - .5, saw(this.walkP + .5) / 2 - .5 ];

      // WALKING MOVEMENT IS DRIVEN BY SINUSOIDAL WAVES.

      var s2 = 0, c2 = 1, s4 = 0, c4 = 1;

      if (walk > 0) {
         var phase = abs(this.pace) * TAU * this.walkT;
         s2 = sin(    phase);
         c2 = cos(    phase);
         s4 = sin(2 * phase);
         c4 = cos(2 * phase);
      }

      // BODY PROPORTIONS.

      var footY     = -1.2;
      var spineBase = footY + this.legLength;
      var spineTop  = spineBase + 0.8 * this.bodyLength;
      var uLeg      = (spineBase - footY) / 1.2;
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

      // SET CURRENT POSITION AND ORIENTATION OF BIRD WITHIN THE WORLD.

      m.translate(this.walkX, 0, this.walkZ);
      m.rotateY(this.turnDir);

      // DRAW HEAD

      m.save();
         m.translate(neckX,neckY,0);
         m.rotateZ(lerp(gaze, lookUp, this.lookUp));
         m.rotateY(lookSide);
	 m.scale(this.headWidth, this.headHeight, 1);
         mCurve([[.0,.0,0],[.8,.3,0],[.0,.6,0],[.0,.0,0]]);
      m.restore();

      // DRAW SPINE

      var spine = [];
      var arching = .1;
      for (var t = 0 ; t <= 1 ; t += 1/10) {
         var arch = arching * sin(PI * t);
         spine.push([ lerp(t, neckX, hipX) + arch * (1 - 2.7 * bounce),
                      lerp(t, neckY, hipY),
                      0 ]);
      }
      mCurve(spine);

      // DRAW LEGS

      for (var n = 0 ; n < 2 ; n++) {
         var footLift = max(0, (n==0 ? .3 : -.3) * s2);
         var Foot = [-hipX + TFoot[n] * 2.4 * uLeg + .15, footY-hipY + footLift, 0];
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

      // ADVANCE TIME.

      switch (state) {
      case 1:
      case 2:
         let dt = this.pace < 0 ? this.time - time : time - this.time;
         this.T += dt;
         if (state == 2) {
            this.walkP += dt * this.pace;
            this.walkT += dt;
            this.walkX +=  cos(this.turnDir) * dt * 2.4 * uLeg * abs(this.pace);
            this.walkZ += -sin(this.turnDir) * dt * 2.4 * uLeg * abs(this.pace);
         }
         this.time = time;
         break;
      }
   }
}

