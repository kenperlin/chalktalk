"use strict";

let VisualPointer = (function() {
   let _vp = {};

   function VisualPointer(self, pointee) {
      this.self = self;
      this.pointee = pointee;
      // TODO
      console.log("CREATING VISUAL POINTER");
   }
   VisualPointer.prototype = {
      assign : function() {

      },
      draw : function() {

      }
   }
   _vp.createPtr = VisualPointer;

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
   _vp.createEdge = VisualEdge;

   // TODO

   return _vp;
}());

