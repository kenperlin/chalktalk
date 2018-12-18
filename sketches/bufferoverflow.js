function() {

   this.label = "overflow";

   this.iterations = 10;

   this.setup = function() {
      window["ITERATIONS"] = this.iterations;
   };

   this.render = function(elapsedTime) {

      this.duringSketch(function() {
         mCurve([[-1, -1], [0, 1], [1, -1]]);
         mCurve([[-1, -1], [0, 1], [1, -1]]);
      });

      this.lineCurve = [
         [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
      ];
      this.afterSketch(function() {
         let iterations = window["ITERATIONS"];
         let scale = 1;
         let tSin = sin(time);
         for (let i = 0; i < iterations; i += 1) {
            this.lineCurve[0][0] = -1 * scale + tSin;
            this.lineCurve[0][1] =  1 * scale;

            this.lineCurve[1][0] =  1 * scale + tSin;
            this.lineCurve[1][1] =  1 * scale;
            
            this.lineCurve[2][0] =  1 * scale + tSin;
            this.lineCurve[2][1] = -1 * scale;

            this.lineCurve[3][0] = -1 * scale + tSin;
            this.lineCurve[3][1] = -1 * scale;

            this.lineCurve[4][0] = -1 * scale + tSin;
            this.lineCurve[4][1] =  1 * scale;

            scale = (scale + 1) % 11;

            mCurve(this.lineCurve);
         }
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
