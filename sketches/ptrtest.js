function() {
   this.label = "ptrtest";

   function Pointee(/*TODO*/) {

   }
   Pointee.prototype = {
      ptrInPos : null
   }

   this.setup = function() {
      this.pointees = [new Pointee(), new Pointee()];
   };

   this.render = function(elapsedTime) {
      // TEMP
      mLine([-1, 0], [1, 0]);
      mCurve([[0.75, -0.25], [1, 0], [0.75, 0.25]]);
      this.duringSketch(function() {

      });

      this.afterSketch(function() {

      });
   };

   this.onSwipe = [

   ];

   this.onPress = function(p) {

   };
   this.onDrag = function(p) {

   };
   this.onRelease = function(p) {

   };
   this.onMove = function(p) {
   };

   this.onCmdPress = function(p) {

   };
   this.onCmdDrag = function(p) {

   };
   this.onCmdRelease = function(p) {

   };

   this.mouseDown = function(x, y, z) {

   };
   this.mouseDrag = function(x, y, z) {

   };
   this.mouseUp = function(x, y, z) {

   };
   this.mouseMove = function(x, y, z) {
      
   };

   this.under = function(otherSketch) {

   };
   this.over = function(otherSketch) {

   };
   this.onIntersect = function(otherSketch) {

   };
}
