function() {
   this.label = "chair";

   this.swipe[2] = ['stand\nup', function() { this.isOccupied = undefined; }];
   this.swipe[6] = ['sit\ndown', function() { this.isOccupied = true; }];

   this.render = function(elapsed) {
      var value = isDef(this.isOccupied) ? 1 : 0;
      mCurve(makeSpline([ [-.4,1], [-.32, .5        ], [-.3,0] ]).concat([[-.4,-1]]));
      mCurve(makeSpline([ [-.3,0], [ .1 ,-.1 * value], [ .5,0] ]).concat([[ .6,-1]]));
      this.setOutPortValue(value);
   }
}
