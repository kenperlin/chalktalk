

function() {

            let FACTOR = 20;

   this.label = "coro2";
   this.is3D = true;

   this.textDefault = "__DEFAULT__";
   this.text = this.textDefault;
   this._currState = "START";
   this.isStepwise = false;
   this._states = { // NOTE, probably will create a general utility function to create this map stucture more easily
         "START" : [
                     [ // 0
                        'BEGIN_DEMO',
                        function() {
                           console.log("switching to DURING state");
                           this._reset();
                           this._changeState("DURING");
                           this.text = "__READY__";
                        }
                     ],
                     undefined, // 1
                     undefined, // 2
                     undefined, // 3
                     undefined, // 4
                     undefined, // 5
                     undefined, // 6
                     undefined, // 7
         ],

         "DURING" : [
                     undefined, // 0
                     undefined, // 1
                     [ // 2
                        'RUN_TO_COMPLETION',
                        function() {
                           this.isStepwise = false;
                           let out = this.procedure();
                           console.log(out.value);
                           this.text = out.value;

                           console.log("RAN TO COMPLETION, switching to START state");
                           this._changeState("START");
                        }  
                     ],
                     undefined, // 3
                     undefined, // 4
                     undefined, // 5
                     [ // 6
                        'RUN_STEP',
                        function() {
                           this.isStepwise = true;
                           let out = this.procedure();
                           console.log("RAN A STEP");
                           if (out.done) {
                              console.log("FINISHED, switching to START state");
                              this._changeState("START");
                           }
                           else {
                              console.log(out.value);
                              this.text = out.value;
                           }
                        }
                     ], 
                     undefined, // 7
         ]
   };

   this._changeState = function(stateName) {
      if (this._states[stateName] === undefined) {
         return;
      }

      for (let swipeNum = 0; swipeNum < 8; swipeNum++) {
         this.onSwipe[swipeNum] = this._states[stateName][swipeNum]
      }
      this._currState = stateName;
   };

   this._reset = function() {
      this.text = this.textDefault;
      this.setup();
   }

   // https://x.st/javascript-coroutines/
   function coroutine(procedure) {
      let coro = procedure();
      // coro.next();
      return function(arg) {
         return coro.next(arg);
      } 
   }

   this.setup = function() {
      this._changeState("START");
      this.isStepwise = false;

      let that = this;
      this.procedure = Stepthrough.makeStepFunc(function*() {
         let x = (that.isStepwise) ? yield "Yay" : 0;
         let y = (that.isStepwise) ? yield "this" : 0;
         let z = (that.isStepwise) ? yield "is" : 0;
         let u = (that.isStepwise) ? yield "working." : 0;
         return "Yay this is working";
      });

      this.ani = new SketchAnimation.Animation(
         SketchAnimation.Type.LINE({
            start : new Location.Position(-1, -1, -1), 
            end : new Location.Position(1, 1, 1)
         }),
         //null,
         5,
         false
      );
      this.aniB = new SketchAnimation.Path(
         SketchAnimation.Type.BEZIER_CUBIC({
            start : new Location.Position(1, 1, -1), 
            end : new Location.Position(-1, -1, 1),
            control1 : new Location.Position(-.5 * FACTOR, -.5 * FACTOR, -.5 * FACTOR),
            control2 : new Location.Position(.5 * FACTOR, .5 * FACTOR, .5 * FACTOR),
         }),
         //null, 
         7,
         false
      );
   };

   this._animation = function() {
      let ret = this.ani.step();
      let pt = ret.point;
      let fin = ret.finished;

      let dim = new Dimension.Dimension(.4, 1, 0);
      Bound.drawRect(new Location.Position(pt[0] - (dim.w / 2) , pt[1] + (dim.h / 2), pt[2] - (dim.d / 2)), dim);

      let posA = [-1, -1, -1];
      let posB = pt;
      mArrow([posA[0], posA[1], posA[2]], [posB[0], posB[1], posB[2]], 0.05);

      if (fin) {
         this.ani.reverse();
      }

      color("purple");

      ret = this.aniB.step();
      pt = ret.point;
      fin = ret.finished;

      Bound.drawRect(new Location.Position(pt[0] - (dim.w / 2) , pt[1] + (dim.h / 2), pt[2] - (dim.d / 2)), dim);

      posA = [1, 1, 1];
      posB = pt;
      mArrow([posA[0], posA[1], posA[2]], [posB[0], posB[1], posB[2]], 0.05);

      if (fin) {
         this.aniB.reverse();
      }
   }

   this.render = function() {
      mCurve([[-1, 1], [1, 1]]);
      mCurve([[1, 1], [1, -1]]);
      mCurve([[1, -1], [-1, -1]]);
      this.afterSketch(function() {
         mCurve([[-1, 1], [-1, -1]]);
         this._animation();
         // textHeight(this.mScale(.2));
         // mText(this.text, [0, 0], 0.5, 0.5);
      });
   };

   this.output = function() {
      return 0;
   };
}
