function() {
   var cursor = newVec3();
   this.label = "thermom";
   this.onPress = function(point) { cursor.copy(point); }
   this.onDrag  = function(point) { cursor.copy(point); }
   this.value = 0;
   this.render = function(elapsed) {
      mCurve([[-.1,-.6]].concat(arc(0,.9,.1,PI,0)).concat([[.1,-.6]]));
      mCurve(arc(0,-.78,.2,PI*2/3,PI*7/3));
      this.afterSketch(function() {
         this.value = max(0, min(1, this.getInValue(0, (cursor.y + .55) / 1.45)));
         mFillRect([-.05,-.8 ], [.05, 1.45 * this.value - .55]);
         mFillOval([-.15,-.93], [.15, -.63]);
      });
   }
   this.output = function() { return this.value; }
}
