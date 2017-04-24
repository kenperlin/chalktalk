
function() {
   this._buffer = newArray(100);

   this._blur = function(x, d) {
      var B = this._buffer, n = max(2, floor(100 * d));

      if (B.length != n)
         this._buffer = B = resampleArray(B, n);

      B.push(x);
      B.splice(0, 1);

      if (B.length < n)
         return B[B.length - 1];

      let sum = 0, wgt = 0, i = 0;
      for ( ; i < n ; i++) {
         let w = .5 + .5 * cos(TAU * (i / n - .5));
         sum += w * B[i];
         wgt += w;
      }

      return sum / wgt;
   }

   this.label = 'blur';

   this.render = function(elapsed) {
      var y = max(-1, min(1, this.getInValue(1, 1))), C = [], x;

      for (x = -1 ; x <= 1.001 ; x += 1/30)
         C.push([x*y, cos(PI * x) * .5 + .5]);

      mLine([0,1],[0,0]);
      mCurve(C);
   }

   this.output = function() {
      let x = this.getInValue(0, 0);
      let y = this.getInValue(1, 1);
      return this._blur(x, y);
   }
}

