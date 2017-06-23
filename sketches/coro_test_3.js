

function() {
   this.label = "coro3";
   this.is3D = true;
   this.isStepwise = true;
   this.blocked = true;
   this.showArrow = false;

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
   ]

   this.onSwipe[6] = [
      "toggle arrow",
      function() {
         this.showArrow = !this.showArrow;
      }
   ]

   this.animationLoop = function*(args) {
      let idx = 0;
      let adjust = 2;
      let ani = [
         new SketchAnimation.Animation( // new version of arg passing that generates functions 
            SketchAnimation.Type.LINE({
               start : new Location.Position(-1, -1, 0), 
               end : new Location.Position(1, 1, 0)
            }),
            null, // will need to change arg list so it's just an object and this null becomes unnecessary
            2,
            true
         ),
         new SketchAnimation.Path(
            SketchAnimation.BEZIER_CUBIC, 
            {
               start : new Location.Position(1, 1, 0),
               end : new Location.Position(-1, -1, 0),
               control1 : new Location.Position(5, .5, 0), 
               control2 : new Location.Position(-2, -.5, 0),
            }, 
            2,
            true
         ),
         new SketchAnimation.Path(
            SketchAnimation.BEZIER_CUBIC, 
            {
               start : new Location.Position(-1, -1, 0),
               end : new Location.Position(-1, -1, 0),
               control1 : new Location.Position(-1 - adjust, -1 + adjust, 0), 
               control2 : new Location.Position(-1, + adjust, -1 - adjust, 0),
            }, 
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
            null,
            4,
            true
         ),
         new SketchAnimation.Animation(
            SketchAnimation.Type.LINE({
               start : new Location.Position(-1, 0, 0), 
               end : new Location.Position(-1, -1, 0)
            }),
            null,
            1,
            true
         ),
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

      let _scale = .2
      while (true) {
         let ret = null;
         let pos = null;
         let dim = null;
         while (true) {
            ret = ani[idx].step(this.ELAPSED);

            pos = new Location.Position(ret.point[0], ret.point[1], ret.point[2]);
            dim = new Dimension.Dimension(_scale * ret.point[0], _scale * ret.point[1], _scale * ret.point[2]);

            if (this.showArrow) {
               _g.save();
               color("red");
               mArrow([-1, -1, 0], pos.xyz());
               _g.restore();
            }

            //this.bound.drawAt(pos, dim);
            m.translate(pos.xyz());

            drawSmile();


            //this.bird.update(this.ELAPSED);

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

            drawSmile();
            //this.bird.update(this.ELAPSED);

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

      this.bird = new Bird();
      this.loop = this.animationLoop();
   };
   this.ELAPSED = 0;
   this.render = function(elapsed) {
      _g.save();
      color("red");
      mCurve([[-1, 1], [1, 1]]);
      mCurve([[1, 1], [1, -1]]);
      mCurve([[1, -1], [-1, -1], [-1, 1]]);
      _g.restore();

   this.bird.legLength  = this.stretch('leg length' , (.2 * S(2).height) / 0.2 );
   this.bird.bodyLength = this.stretch('body length', (.2 * S(1).height) / 0.15);
   this.bird.headWidth  = this.stretch('head width' , (.2 * S(0).width)  / 0.15);
   this.bird.headHeight = 0.2;
   //this.bird.headHeight = this.stretch('head height', (S(0).height) / 0.1 );

      this.afterSketch(function() {
         this.ELAPSED = elapsed;
         this.loop.next();
      });
   };

   this.output = function() {
      return 0;
   };
}
