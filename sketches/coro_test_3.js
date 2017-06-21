

function() {
   this.label = "coro3";
   this.is3D = true;
   this.isStepwise = false;
   this.blocked = null;

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
      "step (IS OFF)",
      function() {
         this.blocked = false;
      }
   ]

   // this.textDefault = "__DEFAULT__";
   // this.text = this.textDefault;
   // this._currState = "START";
   // this.isStepwise = false;
   // this._states = { // NOTE, probably will create a general utility function to create this map stucture more easily
   //       "START" : [
   //                   [ // 0
   //                      'BEGIN_DEMO',
   //                      function() {
   //                         console.log("switching to DURING state");
   //                         this._reset();
   //                         this._changeState("DURING");
   //                         this.text = "__READY__";
   //                      }
   //                   ],
   //                   undefined, // 1
   //                   undefined, // 2
   //                   undefined, // 3
   //                   undefined, // 4
   //                   undefined, // 5
   //                   undefined, // 6
   //                   undefined, // 7
   //       ],

   //       "DURING" : [
   //                   undefined, // 0
   //                   undefined, // 1
   //                   [ // 2
   //                      'RUN_TO_COMPLETION',
   //                      function() {
   //                         this.isStepwise = false;
   //                         let out = this.procedure();
   //                         console.log(out.value);
   //                         this.text = out.value;

   //                         console.log("RAN TO COMPLETION, switching to START state");
   //                         this._changeState("START");
   //                      }  
   //                   ],
   //                   undefined, // 3
   //                   undefined, // 4
   //                   undefined, // 5
   //                   [ // 6
   //                      'RUN_STEP',
   //                      function() {
   //                         this.isStepwise = true;
   //                         let out = this.procedure();
   //                         console.log("RAN A STEP");
   //                         if (out.done) {
   //                            console.log("FINISHED, switching to START state");
   //                            this._changeState("START");
   //                         }
   //                         else {
   //                            console.log(out.value);
   //                            this.text = out.value;
   //                         }
   //                      }
   //                   ], 
   //                   undefined, // 7
   //       ]
   // };

   // this._changeState = function(stateName) {
   //    if (this._states[stateName] === undefined) {
   //       return;
   //    }

   //    for (let swipeNum = 0; swipeNum < 8; swipeNum++) {
   //       this.onSwipe[swipeNum] = this._states[stateName][swipeNum]
   //    }
   //    this._currState = stateName;
   // };

   // this._reset = function() {
   //    this.text = this.textDefault;
   //    this.setup();
   // }

   // // https://x.st/javascript-coroutines/
   // function coroutine(procedure) {
   //    let coro = procedure();
   //    // coro.next();
   //    return function(arg) {
   //       return coro.next(arg);
   //    } 
   // }

   // this.setup = function() {
   //    this._changeState("START");
   //    this.isStepwise = false;

   //    let that = this;
   //    this.procedure = Stepthrough.makeStepFunc(function*() {
   //       let x = (that.isStepwise) ? yield "Yay" : 0;
   //       let y = (that.isStepwise) ? yield "this" : 0;
   //       let z = (that.isStepwise) ? yield "is" : 0;
   //       let u = (that.isStepwise) ? yield "working." : 0;
   //       return "Yay this is working";
   //    });

   //    this.ani = new SketchAnimation.Path(SketchAnimation.LINE, {start : new Location.Position(-1, -1, -1), end : new Location.Position(1, 1, 1)}, 5);
   //    this.aniB = new SketchAnimation.Path(
   //       SketchAnimation.BEZIER_CUBIC, 
   //       {
   //          start : new Location.Position(1, 1, -1), 
   //          end : new Location.Position(-1, -1, 1),
   //          control1 : new Location.Position(-.5 * FACTOR, -.5 * FACTOR, -.5 * FACTOR),
   //          control2 : new Location.Position(.5 * FACTOR, .5 * FACTOR, .5 * FACTOR),
   //       }, 
   //       7
   //    );
   // };

   // this._animation = function() {
   //    let ret = this.ani.step();
   //    let pt = ret.point;
   //    let fin = ret.finished;

   //    let dim = new Dimension.Dimension(.4, 1, 0);
   //    Bound.drawRect(new Location.Position(pt[0] - (dim.w / 2) , pt[1] + (dim.h / 2), pt[2] - (dim.d / 2)), dim);

   //    let posA = [-1, -1, -1];
   //    let posB = pt;
   //    mArrow([posA[0], posA[1], posA[2]], [posB[0], posB[1], posB[2]], 0.05);

   //    if (fin) {
   //       this.ani.reverse();
   //    }

   //    color("purple");

   //    ret = this.aniB.step();
   //    pt = ret.point;
   //    fin = ret.finished;

   //    Bound.drawRect(new Location.Position(pt[0] - (dim.w / 2) , pt[1] + (dim.h / 2), pt[2] - (dim.d / 2)), dim);

   //    posA = [1, 1, 1];
   //    posB = pt;
   //    mArrow([posA[0], posA[1], posA[2]], [posB[0], posB[1], posB[2]], 0.05);

   //    if (fin) {
   //       this.aniB.reverse();
   //    }
   // }

   this.bird = new Bird();

   this.animationLoop = function*(args) {
      let idx = 0;
      let adjust = 2;
      let ani = [
         new SketchAnimation.Path(
            SketchAnimation.LINE, 
            {
               start : new Location.Position(-1, -1, 0), 
               end : new Location.Position(1, 1, 0)
            }, 
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
         )
      ];

      let _scale = .2
      while (true) {
         let ret = null;
         let pos = null;
         let dim = null;
         while (true) {
            ret = ani[idx].step(this.ELAPSED);

            pos = new Location.Position(ret.point[0], ret.point[1], ret.point[2]);
            dim = new Dimension.Dimension(_scale * ret.point[0], _scale * ret.point[1], _scale * ret.point[2]);

            //this.bound.drawAt(pos, dim);
            m.translate(pos.xyz());
            this.bird.update(this.ELAPSED);

            // _g.save();
            // color("red");
            // mArrow([-1, -1, 0], pos.xyz());
            // _g.restore();

            if (ret.finished) {
               break;
            }
            else {
               yield;
            }
         }
         yield;

         while (this.isStepwise && this.blocked) {
            //this.bound.drawAt(pos, dim);
            m.translate(pos.xyz());
            this.bird.update(this.ELAPSED);
            // _g.save();
            // color("red");
            // mArrow([-1, -1, 0], pos.zyz());
            // _g.restore();

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
      color("red");
      mCurve([[-1, 1], [1, 1]]);
      mCurve([[1, 1], [1, -1]]);
      mCurve([[1, -1], [-1, -1], [-1, 1]]);

   this.bird.legLength  = this.stretch('leg length' , (.2 * S(2).height) / 0.2 );
   this.bird.bodyLength = this.stretch('body length', (.2 * S(1).height) / 0.15);
   this.bird.headWidth  = this.stretch('head width' , (.2 * S(0).width)  / 0.15);
   this.bird.headHeight = 0.2;
   //this.bird.headHeight = this.stretch('head height', (S(0).height) / 0.1 );

      this.afterSketch(function() {
         color("white");
         this.ELAPSED = elapsed;
         this.loop.next();
      });
   };

   this.output = function() {
      return 0;
   };
}
