function() {

   this.label = "hmm";

   this.setup = function() {
      this.onCurve = [];
      this.mouseCurve = [];   
   };

   this.render = function(elapsedTime) {

      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([-1, -1], [1, 1]);      
      });

      this.afterSketch(function() {
         mLine([-1, 1], [1, 1]);
         mLine([-1, -1], [1, -1]);

         color("red");
         mCurve(this.onCurve);
         color("cyan");
         mCurve(this.mouseCurve);
      });
   };


   this.onPress = function(p) {
      console.log("ONPRESS");
   };
   this.onDrag = function(p) {
      console.log("ONDRAG");
   };
   this.onRelease = function(p) {
      console.log("ONRELEASE");
   };
   this.onMove = function(p) {
   };

   this.onCmdPress = function(p) {
      console.log("ONCMDPRESS");
      this.onCmdDrag(p);
   };
   this.onCmdDrag = function(p) {
      console.log("ONCMDDRAG");
      this.onCurve.push([p.x, p.y]);
   };
   this.onCmdRelease = function(p) {
      console.log("ONCMDRELEASE");
   };

   this.mouseDown = function(x, y, z) {
      console.log("MOUSEDOWN");
      this.mouseDrag(x, y);
   };
   this.mouseDrag = function(x, y, z) {
      console.log("MOUSEDRAG");
      this.mouseCurve.push(this.inverseTransform([x, y, 0]));
   };
   this.mouseRelease = function(x, y, z) {
      console.log("MOUSERELEASE");
   };
   this.mouseMove = function(x, y, z) {
      console.log("MOUSEMOVE");
   };
}
