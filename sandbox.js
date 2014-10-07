
function Example1() {
   this.labels = "example1".split(' ');
   this.render = function(elapsed) {
      m.save();

      // A SIMPLE OUTLINE OF A HOUSE WITH A POINTED ROOF.

      mClosedCurve([ [-1,.8], [-1,-1], [1,-1], [1,.8], [0,1.7] ]);
      m.restore();
   }
}
Example1.prototype = new Sketch;

