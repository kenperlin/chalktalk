function() {

   this.label = "POLY";

   this.setup = function() {
   
   };

   //let V = [-1,0,0, 1,0,0, 0,-1,0, 0,1,0, 0,0,-1, 0,0,1];
   //let T = [0,2,4, 1,2,4, 0,3,4, 1,3,4, 0,2,5, 1,2,5, 0,3,5, 1,3,5];

   let V = [-1,0,0, 0,0,0, 0,1,0, 0,0,1];
   let T = [0,1,2, 2,1,3];
   this.render = function(elapsedTime) {
      console.log(time);

      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([-1, 1], [1, -1]);
      });

      this.afterSketch(function() {
         m.rotateX(time);
         mPolyhedron(V, T);         
      });
   };
   
   this.output = function() {
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
