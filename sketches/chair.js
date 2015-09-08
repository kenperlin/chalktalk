function() {
   this.label = "chair";
   this.state = 0;
   this.swipe[2] = ['stand\nup', function() { this.state = 0; }];
   this.swipe[6] = ['sit\ndown', function() { this.state = 1; }];
   this.render = function(elapsed) {
      mCurve(makeSpline([ [-.4,1], [-.32, .5             ], [-.3,0] ]).concat([[-.4,-1]]));
      mCurve(makeSpline([ [-.3,0], [ .1 ,-.1 * this.state], [ .5,0] ]).concat([[ .6,-1]]));
   }
   this.output = function() { return this.state; }
}
