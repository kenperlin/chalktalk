"use strict";

let VisualPointer = (function() {
   let _vp = {};

   let defaultDrawHandler = (function() {

      return function(self) {
         if (self.colorManager.colorIsEnabled()) {
            self.colorManager.activateColor();
         }
         mLine(self.getOutPos(), self.getTargetPos());
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

            const start = self.getOutPos();
            const end = self.getTargetPos();
            const mid = LerpUtil.Type.LINE({
               start : {x : start[0], y : start[1], z : start[2]},
               end   : {x : end[0],   y : end[1],   z : end[2]},
            })(status.fracDone);

            self.colorManager.enableColor(true).setColor("green");
            self.colorManager.activateColor();
            mLine(start, mid);
            self.colorManager.deactivateColor();
            mLine(mid, end);

            if (status.done) {
               self.colorManager.activateColor();
            }
            return status;
         }

      }());

      return handler;
   }

   function VisualPointer(sketchCtx, holder, pointee, label = "") {
      console.log("CREATING VISUAL POINTER");

      this.sketchCtx = sketchCtx;
      this.holder = holder;


      this.pointee = (pointee != null) ? pointee : {
         getPtrOutPos : function() { return holder.getPtrOutPos(); }, 
         getPtrInPos  : function() { return holder.getPtrInPos(); }
      };

      this.getOutPos = function() {
         return this.holder.getPtrOutPos();
      };
      this.getTargetPos = function() {
         return this.pointee.getPtrInPos();
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
      this.isAcceptingInput = true
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

      traverse : function(duration) {
         if (!this.drawMemory.active) {
            this.drawMemory.stack.push(
               createTraversalDrawHandler({duration : (duration || 2.5)})
            );
            this.drawMemory.active = true;
         }
      },
      assign : function(pointee) {
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._assign(pointee);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },
      _assign : function(pointee) {

      },
      assignNoAnimation : function(pointee) {
         this.pointee = pointee;
      },
      // assign : function(pointee) {
      //    const self = this;
      //    if (!this.operationMemory.active) {
      //       this.operationMemory.operation = (function() {
      //          const op = self._assign(pointee);

      //          return function(args) { return op.next(args); };

      //       }());
      //       this.operationMemory.active = true;
      //    }
      // },
      // _assign : function*(pointee) {
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
   _vp.createPtr = function(sketchCtx, holder, pointee) {
      return new VisualPointer(sketchCtx, holder, pointee);
   };

   function VisualEdge(a, b, isDirected = false) {
      console.log("CREATING VISUAL EDGE");
      this.a = a;
      this.b = b;
      this.isDirected = isDirected;
      // TODO

   }
   VisualEdge.prototype = {
      assign : function() {

      },
      draw : function() {

      }
   }
   _vp.createEdge = function(a, b, isDirected = true) {
      return new VisualEdge(a, b, isDirected = true);
   };

   // TODO

   return _vp;
}());

