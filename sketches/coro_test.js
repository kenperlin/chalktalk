function() {
   this.label = "coro";
   this.text = "";
   this._currState = "START";
   this._states = { // NOTE, probably will create a general utility function to create this map stucture more easily
         "START" : [
                     [ // 0
                        'BEGIN_DEMO',
                        function() {
                           this._reset();
                           console.log("switching to DURING state");
                           this._changeState("DURING");
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
                           console.log("RAN A STEP");
                           this.procedure();
                        }
                     ], 
                     undefined, // 7
         ]
   };

   this._changeState = function(stateName) {
      if (this._states[stateName] === undefined) {
         return;
      }
      console.log("IN CHANGE STATE");
      for (let swipeNum = 0; swipeNum < 8; swipeNum++) {
         this.onSwipe[swipeNum] = this._states[stateName][swipeNum]
      }
      this._currState = stateName;
   };

   this._reset = function(){
      this.text = "";
   }

   this.init = function() {
      this._changeState("START");
   };

   this.render = function() {
      mCurve([[1, 1], [-1, 1]]);
      mCurve([[-1, 1], [-1, -1]]);
      mCurve([[-1, -1], [1, -1]]);
      this.afterSketch(function() {

      });
   };

   this.procedure = function() {
      // TODO:
   };

   this.output = function() {
      return 0;
   };
}
