function House() {
   this.labels = "house".split(' ');
   this.render = function(elapsed) {

      // A SIMPLE OUTLINE OF A HOUSE WITH A POINTED ROOF.

      mClosedCurve([ [-1,.8], [-1,-1], [1,-1], [1,.8], [0,1.7] ]);
   }
}
House.prototype = new Sketch;
addSketchType("House");

