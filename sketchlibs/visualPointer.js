"use strict";

let VisualPointer = (function() {
   let _vp = {};

   function getLineCurve(self) {
      const cThis = self.getHolderContainer();
      const cOther = self.getPointeeContainer();
      if (cThis == null || cOther == null) {
         return [self.getOutPos(), self.getTargetPos()];
      }
      else {
         return cThis.getLineSegment(cOther);
      }     
   }

   const TEST_JAGGED_LINE = false;

   let defaultDrawHandler = (function() {

      return function(self) {
         if (self.colorManager.colorIsEnabled()) {
            self.colorManager.activateColor();
         }

         let c = getLineCurve(self);
         if (c[0][0] != c[1][0] || c[0][1] != c[1][1]) {
            if (TEST_JAGGED_LINE) {
               c = [c[0], [(c[0][0] + c[1][0]) / 2, c[0][1]], [(c[0][0] + c[1][0]) / 2, c[1][1]], c[1]];
            }
            mCurve(c);
         }

         self.colorManager.deactivateColor();

         return {done : false};
      }

   }());

   let createTraversalDrawHandler = function(args) {
      let handler = (function() {
         let started = false;
         let progress = LerpUtil.lerpAutoResetSaveFracDone(args.duration || 2.5, LerpUtil.Type.NONE());

         return function(self) {
            const status = progress();

            const curve = getLineCurve(self);
            const start = curve[0];
            const end = curve[1];

            const mid = LerpUtil.Type.LINE({
               start : {x : start[0], y : start[1], z : start[2]},
               end   : {x : end[0],   y : end[1],   z : end[2]},
            })(status.fracDone);

            self.colorManager.enableColor(true).setColor("green");
            self.colorManager.activateColor();
            mLine(start, mid);
            self.colorManager.deactivateColor();
            mLine(mid, end);

            // TEST ///////////////////////////
            const TEST_ON = false;
            function lerp(t, a, b) { return a + t * (b - a); }
            for (let i = 0; i <= 10 && TEST_ON; i++) {
               let t = ((i + (5 * time)) % 10) / 10;
               const p = [lerp(t, start[0], end[0]), lerp(t, start[1], end[1]), 0];
               if (distance(start, mid) < distance(start, p)) {
                  continue;
               }
               m.save();
                  m.translate(p);
                  m.scale(0.05);
                  mSphere().color(0, 0, 1);
               m.restore();
            }
            // TEST ///////////////////////////

            if (status.done) {
               self.colorManager.activateColor();
            }
            return status;
         }

      }());

      return handler;
   };


   function getLineCurveSpecifyPointee(self, pointee) {
      const cThis = self.getHolderContainer(); // TODO
      const cOther = pointee.container;
      if (cThis == null || cOther == null) {
         return [self.getOutPos(), pointee.getPtrInPos()];
      }
      else {
         return cThis.getLineSegment(cOther);
      } 
   }

   let createAssignmentDrawHandler = function(args) {
      let handler = (function() {
         let self = args.self;
         let pointee = args.pointee;
         let started = false;
         let progress = LerpUtil.lerpAutoResetSaveFracDone(args.duration || 2.5, LerpUtil.Type.NONE()); 
         let originalTarget = getLineCurve(self)[1];

         return function(self) {
            const status = progress();

            const newCurve = getLineCurveSpecifyPointee(self, pointee);
            const start = newCurve[0];
            const newTarget = newCurve[1];
            const end = LerpUtil.Type.LINE({
               start : {x : originalTarget[0], y : originalTarget[1], z : originalTarget[2]},
               end   : {x : newTarget[0],      y : newTarget[1],      z : newTarget[2]}
            })(status.fracDone);

            mSpline([
               start,
               [(start[0] + end[0]) / 4, (start[1] + end[1]) / 4], 
               [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
               end
            ]);

            if (status.done) {
               if (pointee == null) {
                  self.pointee = {
                     getPtrOutPos : function() { return self.holder.getPtrOutPos(); }, 
                     getPtrInPos  : function() { return self.holder.getPtrInPos(); },
                  };
                  self._isNullptr = true;
               }
               else {
                  self.pointee = pointee;
                  self._isNullptr = false;
               }
            }

            return status;
         }

      }());

      // TEMPORARY IMPLEMENTATION OF SKETCH-LINK-BASED POINTER ARROW

      let linkLike = (function() {
         let self = args.self;
         let pointee = args.pointee;
         let started = false;
         let progress = LerpUtil.lerpAutoResetSaveFracDone(args.duration || 2.5, LerpUtil.Type.NONE());
         let originalTarget = getLineCurve(self)[1];
         let C = null;

         return function(self) {
            const status = progress();

            const newCurve = getLineCurveSpecifyPointee(self, pointee);
            const start = newCurve[0];
            const newTarget = newCurve[1];
            const end = LerpUtil.Type.LINE({
               start : {x : originalTarget[0], y : originalTarget[1], z : originalTarget[2]},
               end   : {x : newTarget[0],      y : newTarget[1],      z : newTarget[2]}
            })(status.fracDone);

            var a = start;
            var b = end;

            var ax = a[0];
            var ay = a[1];

            var bx = b[0];
            var by = b[1];

            // Get the bounds of the two sketches.

            var aR = [ax, ay, ax, ay];
            var bR = [bx, by, bx, by];

            // straighten the curve as it approaches its destination
            const dxTarget = (newTarget[0] - bx);
            const dyTarget = (newTarget[1] - by);
            const dTarget = sqrt((dxTarget * dxTarget) + (dyTarget * dyTarget));
            // unstraighten the curve as it departs
            const dxStart = (bx - start[0]);
            const dyStart = (by - start[1]);
            const dStart = sqrt((dxStart * dxStart) + (dyStart * dyStart));

            const dxOTarget = (originalTarget[0] - bx);
            const dyOTarget = (originalTarget[1] - by);
            const dO = sqrt((dxOTarget * dxOTarget) + (dyOTarget * dyOTarget));
           
            let s = min(min(dStart, dO), dTarget) * 0.2;
            C = createCurvedLine([ax,ay], [bx,by], s);
            // C = clipCurveAgainstRect(C, aR);
            // C = clipCurveAgainstRect(C, bR);

            // C = clipCurveAgainstRect(C, [ax, ay, ax, ay]);
            // C = clipCurveAgainstRect(C, [bx, by, bx, by]);
            // C = resampleCurve(C, 20);

            // lineWidth(2);

            // as a curved line with an arrow at the end.

            const n = C.length;
            mCurve(C);
            if (n >= 2) {
               mArrow(C[n - 2], C[n - 1], 0.5);
            }

            if (status.done) {
               if (pointee == null) {
                  self.pointee = {
                     getPtrOutPos : function() { return self.holder.getPtrOutPos(); }, 
                     getPtrInPos  : function() { return self.holder.getPtrInPos(); },
                  };
                  self._isNullptr = true;
               }
               else {
                  self.pointee = pointee;
                  self._isNullptr = false;
               }
            }

            return status;
         }

      }());

      return linkLike;
   }

   function VisualPointer(holder, pointee = null, label = "") {
      this.holder = holder;

      if (pointee == null) {
         this.pointee = {
            getPtrOutPos : function() { return holder.getPtrOutPos(); }, 
            getPtrInPos  : function() { return holder.getPtrInPos(); },
         };
         this._isNullptr = true;
      }
      else {
         this.pointee = pointee;
         this._isNullptr = false;
      }


      this.getOutPos = function() {
         return this.holder.getPtrOutPos();
      };
      this.getTargetPos = function() {
         return this.pointee.getPtrInPos();
      };
      this.getHolderContainer = function() {
         return (this.holder == null) ? null : this.holder.container;         
      }
      this.getPointeeContainer = function() {
         return (this.pointee == null) ? null : this.pointee.container;
      };

      this.label = label;

      this.colorManager = new ColorManager();

      this.operationMemory = {
         active : false,
         operation : null
      };
      this.drawMemory = {
         active : false,
         stack : [defaultDrawHandler]
      },
      this.isAcceptingInput = true;
   }


   VisualPointer.prototype = {
      doPendingOperation : function() {
         if (!this.operationMemory.active) {
            this.isAcceptingInput = true;
            return;
         }

         const status = this.operationMemory.operation();
         if (status.done) {
            this.operationMemory.active = false;
            this.operationMemory.operation = null;
            this.isAcceptingInput = true;
            return;
         }
         this.isAcceptingInput = false;
         return;
      },
      resetTemporaryGraphics : function() {
         this.colorManager.enableColor(false);
      },
      isNullptr : function() {
         return this._isNullptr;
      },
      traverse : function(duration) {
         if (this._isNullptr) {
            return;
         }
         if (!this.drawMemory.active) {
            this.drawMemory.stack.push(
               createTraversalDrawHandler({duration : (duration || 2.5)})
            );
            this.drawMemory.active = true;
         }
      },
      pointTo : function(pointee, duration) {
         const args = {};
         args.self = this;
         args.pointee = pointee;
         args.duration = duration;
         if (!this.drawMemory.active) {
            this.drawMemory.stack.push(
               createAssignmentDrawHandler(args)
            );
            this.drawMemory.active = true;
         }
      },
      pointToNoAnimation : function(pointee) {
         if (pointee == null) {
            const self = this;
            this.pointee = {
               getPtrOutPos : function() { return self.holder.getPtrOutPos(); }, 
               getPtrInPos  : function() { return self.holder.getPtrInPos(); },
            };
            this._isNullptr = true;
         }
         else {
            this.pointee = pointee;
            this._isNullptr = false;
         }
      },
      // pointTo : function(pointee) {
      //    const self = this;
      //    if (!this.operationMemory.active) {
      //       this.operationMemory.operation = (function() {
      //          const op = self._pointTo(pointee);

      //          return function(args) { return op.next(args); };

      //       }());
      //       this.operationMemory.active = true;
      //    }
      // },
      // _pointTo : function*(pointee) {
      //    this.pointee = pointee;
      // },
      draw : function() {
         if (!this.drawMemory.active) {
            this.drawMemory.stack[0](this);
            return;
         }
         const len = this.drawMemory.stack.length;
         const status = this.drawMemory.stack[len - 1](this);
         if (status.done) {
            this.drawMemory.stack.pop();
            this.drawMemory.active = false;
            this.isAcceptingInput = true;
            return;
         }

         this.isAcceptingInput = false;
         return;
      }
   }
   _vp.createPtr = function(holder, pointee) {
      return new VisualPointer(holder, pointee);
   };

   function VisualEdge(a, b, isDirected = false) {
      console.log("CREATING VISUAL EDGE");
      this.a = a;
      this.b = b;
      this.isDirected = isDirected;
      // TODO

   }
   VisualEdge.prototype = {
      pointTo : function() {

      },
      draw : function() {

      }
   }
   _vp.createEdge = function(a, b, isDirected = true) {
      return new VisualEdge(a, b, isDirected);
   };

   // TODO

   function Pointee(pIn, pOut) {
      this._ptrInPos = pIn || [0, 0, 0];
      this._ptrOutPos = pOut || [1, 1, 0];
      this.getPtrInPos = function() {
         return this._ptrInPos;
      };
      this.setPtrInPos = function(p) {
         this._ptrInPos = p;
      };
      this.getPtrOutPos = function() {
         return this._ptrOutPos;
      };
      this.setPtrOutPos = function(p) {
         this._ptrOutPos = p;
      };
      this.draw = function() {
      };
   }

   Pointee.prototype = {

   };

   _vp.Pointee = Pointee;
   _vp.createPointee = function(pIn, pOut) {
      return new Pointee(pIn, pOut);
   };

   return _vp;
}());

