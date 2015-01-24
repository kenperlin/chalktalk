function Chair() {
   this.label = "chair";
   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 3: this.isOccupied = true; break;
      case 1: this.isOccupied = undefined; break;
      }
   }
   this.render = function(elapsed) {
      var value = isDef(this.isOccupied) ? 1 : 0;
      mCurve(makeSpline([ [-.4,1], [-.32, .5        ], [-.3,0] ]).concat([[-.4,-1]]));
      mCurve(makeSpline([ [-.3,0], [ .1 ,-.1 * value], [ .5,0] ]).concat([[ .6,-1]]));
      this.setOutPortValue(value);
   }
}
Chair.prototype = new Sketch;
addSketchType("Chair");

