function() {
   this.label = 'svm';
   var C = [];
   for (var t = 0 ; t <= 1 ; t += .03)
      C.push([1.2 * (t - .5), 1.2 * (.5 - t * t * (3 - t - t))]);
   var D = [];
   for (var n = 0 ; n < 24 ; n++) {
      var x = -1, y = -1;
      while (x + y < 0) {
         x = 0.9 * random();
         y = 0.9 * random();
      }
      var sign = n < 12 ? -1 : 1;
      D.push([sign * x, sign * y]);
   }
   this.render = function() {
      mClosedCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
      mCurve(C);
      this.afterSketch(function() {
         for (var n = 0 ; n < D.length ; n++) {
            color(n < 12 ? 'rgb(255,128,128)' : 'rgb(128,128,255)');
            var x = D[n][0], y = D[n][1];
            if (x + y > 0)
               mDot(D[n], 0.08);
            else {
               mLine([x + .03, y - .03], [x - .03, y + .03]);
               mLine([x - .03, y - .03], [x + .03, y + .03]);
            }
         }
         color(backgroundColor);
         mFillRect([-.2,-.1],[.2,.1]);
         color(defaultPenColor);
         textHeight(this.mScale(.16));
         mText("SVM", [0, 0], .5, .5);
      });
   }
}
