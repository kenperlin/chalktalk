function() {
   var that = this;
   this.label = 'microphone';
   this.tSignal = [];
   this.fSignal = [];
   this.onDelete = function() { stopMicrophone(); }
   this.render = function() {
      mLine([-.5,-1],[.5,-1]);
      mLine([0,-1],[0,-.5]);
      mCurve ( makeOval(-.5,-.5,1,1,10,-PI/2,-PI)
      .concat( [[-.5,  0],[-.5, .5]]
      .concat( makeOval(-.5, 0,1,1,10,-PI,-2*PI)
      .concat( [[ .5, .5],[ .5,  0]]
      .concat( makeOval(-.5,-.5,1,1,10,0,-PI/2)
      )))));
      if ( this.isMakingGlyph === undefined &&
           this.isMicrophone  === undefined ) {
         this.isMicrophone = true;
         startMicrophone(this.getData);
      }
      this.afterSketch(function() {
         lineWidth(.5);
         mLine([-.5,.25],[.5,.25]);
         if (this.tSignal !== undefined) {
            lineWidth(this.mScale(.005));
            var n = this.tSignal.length;
            for (var i = n - 256 ; i < n ; i++)
               if (i >= 0) {
                  var x = .5 - (n - i) / 256;
                  mLine([x,0.25], [x, 0.25 + 2 * this.tSignal[i]]);
               }
         }
      });
   }
   this.getData = function(t) {
      var sum = 0;
      for (var i = 0 ; i < t.length ; i++)
         sum += abs(t[i]);
      that.tSignal.push(sum / t.length);
   }
}
