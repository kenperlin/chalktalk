
   function Flower() {
      this.labels = "flower".split(' ');
      this.tall = 0;
      this.tallTarget = 0;
      this.wiggle = 0;
      this.wiggleTarget = 0;
      this.onSwipe = function(dx,dy) {
         switch(pieMenuIndex(dx,dy)) {
         case 0: this.wiggleTarget = 0; break;
         case 1: this.tallTarget   = 1; break;
         case 2: this.wiggleTarget = 1; break;
         case 3: this.tallTarget   = 0; break;
         }
      }
      this.render = function(elapsed) {
         this.tall = this.tallTarget == 1 ? min(1, this.tall + elapsed)
                                          : max(0, this.tall - elapsed);
         this.wiggle = this.wiggleTarget == 1 ? min(1, this.wiggle + elapsed)
                                              : max(0, this.wiggle - elapsed);
         var t = sCurve(this.tall);
         m.save();
         m.translate(0,-1,0);

         // STEM

	 var s1 = this.wiggle * sin(1.5 * TAU * time);
	 var s2 = this.wiggle * sin(3.0 * TAU * time);

         mCurve(makeSpline([[0,0],
                            [s1*.1+lerp(t,.08,.16),lerp(t,.5,1)],
                            [s1*.2+0,lerp(t,.8,1.6)],
                            [s1*.3+lerp(t,-.25,-.5),lerp(t,1.4,2.8)],
                            [s1*.4+lerp(t,.25,-.25),lerp(t,2,4)-s1*.1]]
        ));

         // PETALS

         m.save();
         m.translate(s1*.4+lerp(t,.25,-.25),lerp(t,2,4)-s1*.1,0);
         m.rotateZ(s1*.025);
         for (var i = 0 ; i < 6 ; i++) {
            m.save();
            m.rotateZ(-TAU * (i+lerp(t,2.95,2.5)) / 6);
            m.scale(pow(t+1, .7));
            mCurve(makeSpline([[0,0],[.35,.12],[.5,.06],[.5,-.06],[.35,-.12],[0,0]]));
            m.restore();
         }
         m.restore();

         // LEAVES

         m.translate(0,lerp(t,.5,1),0);
         for (var i = 0 ; i < 2 ; i++) {
            m.save();
               m.rotateZ(i==0 ? -.3 : .5);
               m.translate(lerp(t, i==0?.08:.14, i==0?.17:.24), i==0?0:.2, 0);
               m.translate(i==0 ? s1*.1 : s1*.15, 0, 0);
               m.rotateZ(i==0 ? -s2/3 : s2/3);
               var sgn = i==0 ? -1 : 1;
               mCurve(makeSpline([[0,0],
                              [sgn*lerp(t,.3,0.6),  .2],
                              [sgn*lerp(t,.6,1.2), .01],
                              [sgn*lerp(t,.6,1.2),-.01],
                              [sgn*lerp(t,.3,0.6), -.2],
                              [0,0]]
            ));
               m.restore();
         }

         m.restore();
      }
   }
   Flower.prototype = new Sketch;
   addSketchType("Flower");

