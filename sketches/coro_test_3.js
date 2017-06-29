
function() {
   this.label = "coro3";
   this.is3D = true;
   this.isStepwise = true;
   this.blocked = true;
   this.showArrow = false;

   this.mostRecentPos = null;

   this.onSwipe[0] = [
      "toggle stepwise",
      function() {
         this.isStepwise = !this.isStepwise; 
         if (this.isStepwise) {
            this.onSwipe[4][0] = "step";
         }
         else {
            this.onSwipe[4][0] = "step (IS OFF)";
         }
      }
   ];

   this.onSwipe[4] = [
      "step",
      function() {
         this.blocked = false;
      }
   ];

   this.onSwipe[6] = [
      "toggle arrow",
      function() {
         this.showArrow = !this.showArrow;
      }
   ];

   this.animationLoop = function*(args) {
      let idx = 0;
      let adjust = 2;
      // ARRAY OF SKETCHES THROUGH WHICH THIS EXAMPLE CYCLES
      let ani = [
         new SketchAnimation.Animation(
            SketchAnimation.Type.LINE({
               start : new Location.Position(-1, -1, 0), 
               end : new Location.Position(1, 1, 0)
            }),
            //null, // will need to change arg list so it's just an object and this null becomes unnecessary
            2,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.BEZIER_CUBIC({
               start : new Location.Position(1, 1, 0),
               end : new Location.Position(-1, -1, 0),
               control1 : new Location.Position(5, .5, 0), 
               control2 : new Location.Position(-2, -.5, 0),
            }),
            //null, 
            2,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.BEZIER_CUBIC({
               start : new Location.Position(-1, -1, 0),
               end : new Location.Position(-1, -1, 0),
               control1 : new Location.Position(-1 - adjust, -1 + adjust, 0), 
               control2 : new Location.Position(-1, + adjust, -1 - adjust, 0),
            }),
            //null, 
            2,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.SPRING({
               halfCycles : 15, // [1, +inf)
               damping : 0.2, // [0, 1)
               startX : -1,
               startY : -.9,
               startZ : 0,
               initialVelocity : 0
            }),
            //null,
            4,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.LINE({
               start : new Location.Position(-1, 0, 0), 
               end : new Location.Position(-1, 5, 0)
            }),
            //null,
            1,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.BOUNCE({
               startY : 5,
               endX : -1,
               endY : -1,
               endZ : 0,
               numBounces : 7,
               threshold : 0.01,
               velocityX : 4 // truthfully not very realistic horizontal component for now...
            }),
            //null,
            3.75,
            true
         ),
         (function() {
            let a = new SketchAnimation.Animation(
               SketchAnimation.Type.SIGMOID_EASE_IN_OUT({
                  length : 4,
                  sharpness : 7,
                  startX : -1,
                  startY : -1,
                  startZ : 0,
                  inX : 1,
               }),
               //null,
               2.25,
               true

            );
            a.reverse();
            return a;
         }()),
         new SketchAnimation.Animation(
            SketchAnimation.Type.FUNCTION_ONE_INPUT({
               startX : -1,
               startY : -1,
               startZ : 0,
               endX : 1,
               inX : 1,
               inY : 0,
               inZ : 0,
               function : function(x) {
                  return .5 * sin(3 * x);
               }
            }),
            //null,
            5,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.FUNCTION_ONE_INPUT({
               startX : 1,
               startY : -1,
               startZ : 0,
               endX : -1,
               inX : 1,
               inY : 0,
               inZ : 0,
               function : function(x) {
                  return .1 / ((x === 0) ? 0.00001 : x);
               }
            }),
            //null,
            3,
            true
         )
      ];

      function drawSmile(scaleX, scaleY) {
         let FACTOR_X = (scaleX === undefined) ? .25 : scaleX;
         let FACTOR_Y = (scaleY === undefined) ? .25 : scaleY;

         mDrawOval([-1*FACTOR_X,-1*FACTOR_X],[1*FACTOR_Y,1*FACTOR_Y],32,PI/2,PI/2-TAU);
         mDrawOval([-.6*FACTOR_X,-.6*FACTOR_X],[.6*FACTOR_Y,.6*FACTOR_Y],32,TAU*6/10,TAU*9/10);
         mDrawOval([-.2*FACTOR_X,-.2*FACTOR_X],[.8*FACTOR_Y,.5*FACTOR_Y],32,PI*.5,PI*.2);
         mDrawOval([ .5*FACTOR_X,.2*FACTOR_X],[ .3*FACTOR_Y,.4*FACTOR_Y],32,-PI,0);
         mDrawOval([-1*FACTOR_X,.2*FACTOR_X],[.3*FACTOR_Y,.9*FACTOR_Y],32,-PI*.6,-PI*.4);
         // mDrawOval([-.8*FACTOR_X,-.2*FACTOR_X],[.2*FACTOR_Y,.5*FACTOR_Y],32,PI*.8,PI*.5);
         // mDrawOval([-.5*FACTOR_X,.2*FACTOR_X],[-.3*FACTOR_Y,.4*FACTOR_Y],32,-PI,0);         
      }

      function drawXO(scaleX, scaleY) {
         let FACTOR_X = (scaleX === undefined) ? .25 : scaleX;
         let FACTOR_Y = (scaleY === undefined) ? .25 : scaleY;

         mDrawOval([-1*FACTOR_X,-1*FACTOR_X],[1*FACTOR_Y,1*FACTOR_Y],32,PI/2,PI/2-TAU);
         m.save();
         m.translate([0, -.43*FACTOR_Y, 0]);
         mDrawOval([-.2*FACTOR_X,-.2*FACTOR_X],[.2*FACTOR_Y,.2*FACTOR_Y],32,PI/2,PI/2-TAU);
         m.restore();
         mCurve([[-.4*FACTOR_X, .4*FACTOR_Y], [-.2*FACTOR_X, .1*FACTOR_Y]]);
         mCurve([[-.4*FACTOR_X, .1*FACTOR_Y], [-.2*FACTOR_X, .4*FACTOR_Y]]);
         mCurve([[.4*FACTOR_X, .4*FACTOR_Y], [.2*FACTOR_X, .1*FACTOR_Y]]);
         mCurve([[.4*FACTOR_X, .1*FACTOR_Y], [.2*FACTOR_X, .4*FACTOR_Y]]);
         //mDrawOval([-.2*FACTOR_X,-.2*FACTOR_X],[.8*FACTOR_Y,.5*FACTOR_Y],32,PI*.5,PI*.2);
         //mDrawOval([ .5*FACTOR_X,.2*FACTOR_X],[ .3*FACTOR_Y,.4*FACTOR_Y],32,-PI,0);
         //mDrawOval([-1*FACTOR_X,.2*FACTOR_X],[.3*FACTOR_Y,.9*FACTOR_Y],32,-PI*.6,-PI*.4);
         // mDrawOval([-.8*FACTOR_X,-.2*FACTOR_X],[.2*FACTOR_Y,.5*FACTOR_Y],32,PI*.8,PI*.5);
         // mDrawOval([-.5*FACTOR_X,.2*FACTOR_X],[-.3*FACTOR_Y,.4*FACTOR_Y],32,-PI,0);         
      }

      let _scale = .2      
      while (true) {
         let ret = null;
         let pos = null;
         let dim = null;
         let doSay = true; // temporary, for fun
         while (true) {
            ret = ani[idx].step(this.ELAPSED);

            pos = new Location.Position(ret.point[0], ret.point[1], ret.point[2]);
            dim = new Dimension.Dimension(_scale * ret.point[0], _scale * ret.point[1], _scale * ret.point[2]);
            this.mostRecentPos = pos;

            if (this.showArrow) {
               _g.save();
               color("red");
               mArrow([-1, -1, 0], pos.xyz());
               _g.restore();
            }

            //this.bound.drawAt(pos, dim);
            m.translate(pos.xyz());

            if (idx === 5 && pos.y <= -.5) {
               drawXO();
               if (pos.y <= .7 && doSay) {
                  Speech.say("ouch!");
                  doSay = false;
               }
            }
            else {
               drawSmile();
            }

            if (ret.finished) {
               break;
            }
            else {
               yield;
            }
         }
         yield;

         while (this.isStepwise && this.blocked) {
            if (this.showArrow) {
               _g.save();
               color("red");
               mArrow([-1, -1, 0], pos.xyz());
               _g.restore();
            }

            //this.bound.drawAt(pos, dim);
            m.translate(pos.xyz());

            if (idx === 5 && pos.y <= -.5) {
               drawXO();
            }
            else {
               drawSmile();
            }

            yield;
         }
         this.blocked = true;

         ani[idx].reset();
         idx = (idx + 1) % ani.length;
      }
   };

   this.setup = function() {
      this.bound = new Bound.BoundRect(
         new Location.Position(0, 0, 0),
         new Dimension.Dimension(.2, .2, 0),
         Bound.drawRect
      );

      this.loop = this.animationLoop();
   };
   this.ELAPSED = 0;
   this.render = function(elapsed) {
      _g.save();
      color("red");
      let scaleOut = 0;
      mCurve([[-1 -scaleOut, 1 + scaleOut], [1 + scaleOut, 1 + scaleOut]]);
      mCurve([[1 + scaleOut, 1 + scaleOut], [1 + scaleOut, -1 - scaleOut]]);
      mCurve([[1 + scaleOut, -1 - scaleOut], [-1 - scaleOut, -1 - scaleOut], [-1 - scaleOut, 1 + scaleOut]]);
      _g.restore();

      this.afterSketch(function() {
         this.ELAPSED = elapsed;
         this.loop.next();
      });
   };

   this.output = function() {
      if (this.mostRecentPos === null) {
         return 0;
      }

      return SketchAnimation.clamp(this.mostRecentPos.y, -10, 10);
   };
}
