"use strict";

var SketchAnimation = (function() {
   let a = {};

   // https://stackoverflow.com/a/17096947/7361580 for LINE and BEZIER

   // INTERPOLATION-BASED FUNCTIONS, GIVEN "FRACTION ALONG PATH COMPLETE" VALUE, RETURN POINT

   a.Type = {};
   a.Type.NONE = function() {
      return function() { return []; };
   };

   a.Type.LINE = function(args) {
      args.start.z = args.start.z || 0.0;
      args.end.z = args.end.z || 0.0;
      return function(/*UNUSED, */fractionComplete) {
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
   };

   function cubic(fc, a, b, c, d) {
      let t2 = fc * fc;
      let t3 = t2 * fc;
      return a + (-a * 3 + fc * (3 * a - a * fc)) * fc +
            (3 * b + fc * (-6 * b + b * 3 * fc)) * fc +
            (c * 3 - c * 3 * fc) * t2 +
            d * t3;
   }

   a.Type.BEZIER_CUBIC = function(args) {
      const start = args.start;
      const end = args.end;
      const c1 = args.control1;
      const c2 = args.control2;

      return function(/*UNUSED, */fractionComplete) {
         return [
            cubic(fractionComplete, start.x, c1.x, c2.x, end.x),
            cubic(fractionComplete, start.y, c1.y, c2.y, end.y),
            cubic(fractionComplete, start.z, c1.z, c2.z, end.z)
         ];
      };
   };

   a.Type.BEZIER_QUADRATIC = function(args) {
      const start = args.start;
      const end = args.end;
      const cp = args.control;

      return function(/*UNUSED, */fractionComplete) {
         const fc = fractionComplete;

         return [
            (1 - fc) * (1 - fc) * start.x + 2 * (1 - fc) * fc * cp.x + (fc * fc) * end.x,
            (1 - fc) * (1 - fc) * start.y + 2 * (1 - fc) * fc * cp.y + (fc * fc) * end.y,
            (1 - fc) * (1 - fc) * start.z + 2 * (1 - fc) * fc * cp.z + (fc * fc) * end.z,
         ];
      };
   };


   // TODO
   // a.Type.BSPLINE = function(args) {
   //    return function(/*UNUSED, */fractionComplete) {

   //    }
   // };


   a.Type.FUNCTION_ONE_INPUT = function(args) {
      const startX = defined(args.startX, 0);
      const startY = defined(args.startY, 0);
      const startZ = defined(args.startZ, 0);

      const endX = defined(args.endX, 1);
      const endY = defined(args.endY, 0);
      const endZ = defined(args.endZ, 0);

      let inX = defined(args.inX, 1);
      let inY = defined(args.inY, 0);
      let inZ = defined(args.inZ, 0);

      return function(/*UNUSED, */fractionComplete) {

         const func = args.function;
         const dx = endX - startX;

         let x = startX + (dx * fractionComplete);

         if (inX) {
            return [
               x,
               func(x) + startY,
               startZ
            ];
         }
         else if (inY) {
            return [
               func(x) + startY,
               x,
               startZ
            ];
         }
         else if (inZ) {
            return [
               startZ,
               func(x) + startY,
               x
            ];            
         }
         else {
            return [0, 0, 0];
         }
      }
   };

   // Thank you Daniel Zhang for sharing this: https://medium.com/analytic-animations/the-spring-factory-4c3d988e7129 ~ KTR

   function defined(arg, defaultVal) {
      return (arg === undefined || arg === null) ? defaultVal : arg;
   }
   
   function clamp(x, _min, _max) {
      return min(max(x, _min), _max);
   }
   a.clamp = clamp;

   function nvl(x, ifNull) {
      return x === undefined || x === null ? ifNull : x;
   }

   function computeOmega(A, B, k, zeta) {
      if (A * B < 0 && k >= 1) {
         k--;
      }

      return (-atan(A / B) + PI * k) / (2 * PI * sqrt(1 - zeta * zeta));
   }

   function numericallySolveOmegaAndB(args) {
      args = args || {};

      let zeta = args.zeta;
      let k = args.k;
      let y0 = defined(args.y0, 1);
      v0 = args.v0 || 0;

      function errorfn(B, omega) {
         let omegaD = omega * sqrt(1 - zeta * zeta);
         return B - ((zeta * omega * y0) + v0) / omegaD;
      }

      let A = y0;
      let B = zeta;
      let omega = 0;
      let error = 0;
      let direction = 0;

      function step() {
         omega = computeOmega(A, B, k, zeta);
         error = errorfn(B, omega);
         direction = -Math.sign(error);
      }

      step();

      let tolerance = 1e-6;
      let lower = 0;
      let upper = 0;

      let ct = 0;
      let maxct = 1e3;

      if (direction > 0) {
         while (direction > 0) {
            ct++;

            if (ct > maxct) {
               break;
            }

            lower = B;

            B *= 2;
            step();
         }
         upper = B;
      }
      else {
         upper = B;
         B *= -1;

         while (direction < 0) {
            ct++;

            if (ct > maxct) {
               break;
            }

            lower = B;

            B *= 2;
            step();
         }
         lower = B;
      }

      while (abs(error) > tolerance) {
         ct++;

         if (ct > maxct) {
            break;
         }

         B = (upper + lower) / 2;
         step();

         if (direction > 0) {
            lower = B;
         }
         else {
            upper = B;
         }
      }

      return {
         omega : omega,
         B : B
      };
   }

   a.Type.SPRING = function(args) {
      args = args || {};

      let zeta = args.damping;
      let k = args.halfCycles;
      let y0 = defined(args.startY, 1);
      let v0 = args.initialVelocity || 0;

      let A = y0;
      let B = 0;
      let omega = 0;

      if (abs(v0) < 1e-6) {
         B = zeta * y0 / sqrt(1 - zeta * zeta);
         omega = computeOmega(A, B, k, zeta);
      }
      else {
         let result = numericallySolveOmegaAndB({
            zeta : zeta,
            k : k,
            y0, y0,
            v0, v0
         });

         B = result.B;
         omega = result.omega;
      }

      omega *= 2 * PI;
      let omegaD = omega * sqrt(1 - zeta * zeta);

      let x = defined(args.startX, 0);
      let z = defined(args.startZ, 0);

      return function(/*UNUSED, */fractionComplete) {
         let t = fractionComplete;
         let sinusoid = A * cos(omegaD * t) + B * sin(omegaD * t);
         return [
            x,
            (exp(-t * zeta * omega) * sinusoid),
            z,
         ];
      };
   };

   a.Type.BOUNCE = function(args) {
      args = args || {};

      let startY = args.startY;
      let endY = args.endY;
      let delta = endY - startY;

      let numBounces = args.numBounces;
      let threshold = defined(args.threshold, 0.001);

      function energyToHeight(energy) {
         return energy; // h = E/mg
      }

      function heightToEnergy(height) {
         return height; // E = mgh
      }

      function bounceTime(height) {
         return 2 * sqrt(2 * height); // 2 * half bounce time measured from peak
      }

      function speed(energy) {
         return sqrt(2 * energy); // E = 1/2 m v^2, s = |sqrt(2E/m)|
      }

      let height = 1;
      let potential = heightToEnergy(height);
      let elasticity = pow(threshold, 1 / numBounces);

      // critical points mark contact with ground

      let criticalPoints = [{
         time : -bounceTime(height) / 2,
         energy : potential  
      },
      {
         time : bounceTime(height) / 2,
         energy : potential * elasticity
      }];

      potential *= elasticity;
      height = energyToHeight(potential);

      let localTime = criticalPoints[1].time;
      for (let i = 1; i < numBounces; i++) {
         localTime += bounceTime(height);
         potential *= elasticity; // remove energy following each bounce

         criticalPoints.push({
            time : localTime,
            energy : potential
         });

         height = energyToHeight(potential);
      }

      let duration = localTime;

      let x = defined(args.endX, 0);
      let z = defined(args.endZ, 0);

      let velocityX = args.velocityX;

      return function(/*UNUSED, */fractionComplete) {
         let t = clamp(fractionComplete, 0, 1);
         let tAdj = t * duration;

         if (tAdj === 0) {
            return [x, startY, z];
         }
         else if (tAdj >= duration) {
            return [defined(velocityX, 0) + x, endY, z];
         }

         function findBouncePointAbove(arr, val) {
            let idx = 1;
            for (let idx = 0; idx < arr.length; idx++) {
               if (criticalPoints[idx].time > val) {
                  return idx;
               }
            }
            return arr.length;           
         }

         let idx = findBouncePointAbove(criticalPoints, tAdj);
         let bouncePoint = criticalPoints[idx - 1];

         tAdj -= bouncePoint.time;

         let v0 = speed(bouncePoint.energy);
         let pos = v0 * tAdj + -0.5 * tAdj * tAdj;

         return [
            (velocityX === undefined) ? x : velocityX * t + x,
            startY + (1 - pos) * delta,
            z
         ];
      };
   };

   a.Type.SIGMOID_EASE_IN_OUT = function(args) {
      let length = defined(args.length, 0);
      let sharpness = args.sharpness;

      function base(t) {
         return (1 / (1 + exp(-sharpness * t))) - 0.5;
      }

      let correction = 0.5 / base(1);

      let x = defined(args.startX, -1);
      let y = defined(args.startY, 0);
      let z = defined(args.startZ, 0);

      let inX = defined(args.inX, 1);
      let inY = defined(args.inY, 0);
      let inZ = defined(args.inZ, 0);

      return function(/*UNUSED, */fractionComplete) {
         let t = clamp(fractionComplete, 0, 1);
         let displacement = ((correction * base(2 * t - 1) + 0.5) * length);
         return [
            x + (displacement * inX), 
            y + (displacement * inY),
            z + (displacement * inZ)
         ]
      };
   };

   a.Type.SIGMOID_EASE_OUT = function(args) {
      let length = defined(args.length, 0);
      let sharpness = (args.sharpness === 0) ? 1e-7 : args.sharpness;

      function base(t) {
         return (1 / (1 + exp(-sharpness * t))) - 0.5;
      }

      let x = defined(args.startX, -1);
      let y = defined(args.startY, 0);
      let z = defined(args.startZ, 0);

      let inX = defined(args.inX, 1);
      let inY = defined(args.inY, 0);
      let inZ = defined(args.inZ, 0);

      let denominator = base(1);

      return function(/*UNUSED, */fractionComplete) {
         let t = clamp(fractionComplete, 0, 1);
         let displacement = (base(t) / denominator) * length;
         return [
            x + (displacement * inX), 
            y + (displacement * inY),
            z + (displacement * inZ)
         ];
      };
   };
   
   a.Animation = function(stepProcedure, /*args, */timeToCompleteSeconds, doProvideElapsed) {
      let that = this;
      this.prevTime = time;
      //this.args = args;
      this.timeToComplete = timeToCompleteSeconds;
      this.elapsedTime = 0;
      this.stepProcedure = stepProcedure;
      this.isReversed = false;

      // TRACK INTERNAL ELAPSED TIME AND TIME DIFFERENCES
      if (doProvideElapsed === undefined || doProvideElapsed === null || !doProvideElapsed) {
         this.step = function() {
            let currTime = time;
            let dT = currTime - this.prevTime;
            this.prevTime = currTime;
            this.elapsedTime += dT;

            let fin = false;
            if (this.elapsedTime >= this.timeToComplete) {
               this.elapsedTime = this.timeToComplete;
               fin = true;
            }

            let fractionComplete = this.elapsedTime / this.timeToComplete;
            let nextPt = this.stepProcedure(/*this.args, */(this.isReversed) ? 1 - fractionComplete : fractionComplete);
            
            return {point : nextPt, finished : fin};
         };
      }
      else { // ALTERNATIVE: USE CHALKTALK SKETCH TIME DIFFERENCES FOR ELAPSED TIME ( TODO decide which version is better default )
         this.step = function(elapsed) {
            this.elapsedTime += elapsed;

            let fin = false;
            if (this.elapsedTime >= this.timeToComplete) {
               this.elapsedTime = this.timeToComplete;
               fin = true;
            }

            let fractionComplete = this.elapsedTime / this.timeToComplete;
            let nextPt = this.stepProcedure(/*this.args, */(this.isReversed) ? 1 - fractionComplete : fractionComplete);
            
            return {point : nextPt, finished : fin};
         };         
      }
   };

   a.Animation.prototype = {
      reset : function() {
         this.prevTime = time;
         this.elapsedTime = 0;
      },

      reverse : function() {
         this.isReversed = !this.isReversed;         
      }
   };

   // TODO IS THERE A HELPFUL WAY TO SYNCHRONIZE MULTIPLE ANIMATION OBJECTS 
   // TO GUARANTEE THAT A FUNCTION PROCEEDS ONLY AFTER a, b, and c ANIMATIONS TERMINATE?

   // a.Synchronizer = function(animations) {
   //    this.animations = [];
   //    for (let i = 0; i < animations.length; i++) {
   //       this.animations.push({
   //          animation :,
   //          point : null,
   //          finished  : false
   //       });
   //    }

   //    this.step = function(elapsed) {
   //       let fin = true;
   //       for (let i = 0; i < this.animations.length; i++) {
   //          let aniI = this.animations[i];
   //          if (aniI.finished) {
   //             continue;
   //          }
   //          else {
   //             fin = false;
   //          }

   //          // STEP EACH INCOMPLETE ANIMATION
   //          let status = aniI.step(elapsed);

   //          if (status.finished) {
   //             aniI.finished = true;
   //          }
   //       }
   //    };

   //    this.resetAll = function() {
   //       for (let i = 0; i < this.animations.length; i++) {
   //          this.animations[i].finished = false;
   //       }         
   //    };
   // }

   a.create = function(stepProcedure, timeToCompleteSeconds, doProvideElapsed) {
      return new a.Animation(stepProcedure, timeToCompleteSeconds, doProvideElapsed);
   }

   a.pause = function(timeToCompleteSeconds, elapsedSrc) {
      if (elapsedSrc) {
         return (function() {
            let pause = new a.Animation(a.Type.NONE(), timeToCompleteSeconds, true);
            return function() { return !pause.step(elapsedSrc.elapsed).finished; };
         }());
      }
      else {
         return (function() {
            let pause = new a.Animation(a.Type.NONE(), timeToCompleteSeconds, false);
            return function() { return !pause.step().finished; };
         }());       
      }
   }

   a.Path = a.Animation;

   return a;
})();
