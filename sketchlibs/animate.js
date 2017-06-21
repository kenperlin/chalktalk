"use strict";

var SketchAnimation = (function() {
   let a = {};

   // https://stackoverflow.com/a/17096947/7361580

   a.LINE = function(args, fractionComplete) {
      const start = args.start;
      const end = args.end;

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dz = end.z - start.z;
      return [
         start.x + (dx * fractionComplete),
         start.y + (dy * fractionComplete),
         start.z + (dz * fractionComplete)
      ];
   };

   function _cubic(fc, a, b, c, d) {
      let t2 = fc * fc;
      let t3 = t2 * fc;
      return a + (-a * 3 + fc * (3 * a - a * fc)) * fc +
         (3 * b + fc * (-6 * b + b * 3 * fc)) * fc +
         (c * 3 - c * 3 * fc) * t2 +
         d * t3;
   }

   a.BEZIER_CUBIC = function(args, fractionComplete) {
      const start = args.start;
      const end = args.end;
      const c1 = args.control1;
      const c2 = args.control2;

      return [
         _cubic(fractionComplete, start.x, c1.x, c2.x, end.x),
         _cubic(fractionComplete, start.y, c1.y, c2.y, end.y),
         _cubic(fractionComplete, start.z, c1.z, c2.z, end.z)
      ];
   };
   
   a.Path = function(stepProcedure, args, timeToCompleteSeconds, doProvideElapsed) {
      let that = this;
      this.prevTime = time;
      this.args = args;
      this.timeToComplete = timeToCompleteSeconds;
      this.elapsedTime = 0;
      this.stepProcedure = stepProcedure;

      if (doProvideElapsed === undefined || !doProvideElapsed) {
         this.step = function() {
            let dT = time - this.prevTime;
            this.prevTime = time;
            this.elapsedTime += dT;

            let fin = false;
            if (this.elapsedTime >= this.timeToComplete) {
               this.elapsedTime = this.timeToComplete;
               fin = true;
            }

            let nextPt = this.stepProcedure(this.args, this.elapsedTime / this.timeToComplete);
            
            return {point : nextPt, finished : fin};
         };
      }
      else {
         this.step = function(elapsed) {
            this.elapsedTime += elapsed;

            let fin = false;
            if (this.elapsedTime >= this.timeToComplete) {
               this.elapsedTime = this.timeToComplete;
               fin = true;
            }

            let nextPt = this.stepProcedure(this.args, this.elapsedTime / this.timeToComplete);
            
            return {point : nextPt, finished : fin};
         };         
      }

      this.reset = function() {
         this.prevTime = time;
         this.elapsedTime = 0;
      };

      this.reverse = function() {
         this.prevTime = time;
         this.elapsedTime = 0;
         let end = this.args.end;
         this.args.end = this.args.start;
         this.args.start = end;
      };
   };

   return a;
})();
