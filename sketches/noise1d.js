   function() {
      this.label = 'noise1D';

      this.freqs = [1];
      this.mode = "none";
      this.mouseX = 0;
      this.mouseY = 0;
      this.t0 = 0;
      this.isAbs = false;

      this.under = function(sketch) {
         this.freqs = this.freqs.concat(sketch.freqs);
      }

      this.mouseDrag = function(x, y) {
         if (isDef(this.dragX))
            this.t0 -= 2 * (x - this.dragX) / (this.xhi - this.xlo);
         this.dragX = x;
      }

      this.onCmdClick = function(p) { this.isAbs = ! this.isAbs; }

      this.onSwipe[2] = ['double freq', function() {
         for (var n = 0 ; n < this.freqs.length ; n++)
            this.freqs[n] *= 2;
      }];

      this.onSwipe[6] = ['half freq', function() {
         for (var n = 0 ; n < this.freqs.length ; n++)
            this.freqs[n] /= 2;
      }];

      this.render = function(elapsed) {
         m.save();
            m.scale(this.size / 350);

            color(140,140,140);
            mLine([-1,0],[1,0]);
            color(this.color);

            var maxFreq = 1;
            for (var n = 0 ; n < this.freqs.length ; n++)
               maxFreq = max(maxFreq, this.freqs[n]);
            var stepSize = 0.03 / maxFreq;

            var c = [];
            for (var t = -1 ; t < 1 + stepSize ; t += stepSize) {
               if (t > 1)
                  t = 1;
               var signal = 0;
               for (var n = 0 ; n < this.freqs.length ; n++) {
                  var freq = this.freqs[n];
                  var f = noise2((this.t0 + t) * freq, 200 * freq) / freq;
                  signal += this.isAbs ? abs(f) : f;
               }
               c.push([t, signal]);
            }
            mCurve(c);

         m.restore();
      }
   }

