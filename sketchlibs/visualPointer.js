"use strict";

let VisualPointer = (function() {
   let _vp = {};

   function VisualPointer(sketchCtx, holder, pointee) {
      this.sketchCtx = sketchCtx;
      this.holder = holder;
      this.pointee = (pointee != null) ? pointee : {getPtrOutPos : function() { return holder.getPtrOutPos(); }, getPtrInPos : function() { return holder.getPtrInPos(); }};
      // TODO
      console.log("CREATING VISUAL POINTER");
   }
   function _defaultDrawFunc(self) {
      mLine(self.holder.getPtrInPos(), self.pointee.getPtrOutPos());
   }

   VisualPointer.prototype = {
      operationMemory : {
         active : false,
         operation : null
      },
      isAcceptingInput : true,

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
      // TEMP
      assign : function(pointee) {
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
      _drawFunc : _defaultDrawFunc,
      draw : function() {
         this._drawFunc(this);
      }
   }
   _vp.createPtr = function(sketchCtx, holder, pointee) {
      return new VisualPointer(sketchCtx, holder, pointee);
   };

   function VisualEdge(a, b, isDirected = true) {
      this.a = a;
      this.b = b;
      this.isDirected = isDirected;
      // TODO
      console.log("CREATING VISUAL EDGE");
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

