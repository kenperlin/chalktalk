function() {

   this.label = "POLY";

   this.setup = function() {
   
   };

   let V1 = [-1,0,0, 1,0,0, 0,-1,0, 0,1,0, 0,0,-1, 0,0,1];
   let T1 = [0,2,4, 1,2,4, 0,3,4, 1,3,4, 0,2,5, 1,2,5, 0,3,5, 1,3,5];

   let V2 = [-1,0,0, 0,0,0, 0,1,0, 0,0,1];
   let T2 = [0,1,2, 2,1,3];

   let V = V1;
   let T = T1;
   this.render = function(elapsedTime) {
      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([-1, 1], [1, -1]);
      });

      this.afterSketch(function() {
         

         if (sin(time / 4) < 0) {
            V = V2;
            T = T2;
         }
         else {
            V = V1;
            T = T1;
         }

         //V1[0] += 0.1;
         //V2[0] += 0.1;
         m.save();
            //m.translate(sin(time), sin(time), sin(time));
            mPolyhedron(V1, T1);
         m.restore();
            //m.rotateX(time);
            //mPolyhedron(V, T); 
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
