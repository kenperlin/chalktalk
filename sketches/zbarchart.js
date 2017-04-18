function() {
   this.label = 'barchart';
   this.onCmdClick = function() { this.isVertical = ! this.isVertical; }
   this.isVertical = false;
   this.isLines = false;
   this.isNoise = false;
   this.fixedIndexLo =  1000;
   this.fixedIndexHi = -1000;

   // DRAG ON A BAR TO CHANGE ITS VALUE.

   this._computeIndex = function(p) {
      var u = this.isVertical ? -p.y : p.x;
      return floor(this.nValues * (.5 + .499 * u));
   }

   this.onPress = function(p) {
      this.xDown = p.x;
      this.yDown = p.y;
      this.indexLo =  1000;
      this.indexHi = -1000;
      if (! this.isInValueAt(0)) {
         this.valueIndex = this._computeIndex(p);
      }
   }
   this.onDrag = function(p) {
      if (this.valueIndex >= 0) {
         if (! this.isVertical) {
	    if (abs(p.y - this.yDown) > abs(p.x - this.xDown))
               this.values[this.valueIndex] = max(-1, min(1, p.y));
            else if (abs(p.x - this.xDown) > 0.1) {
	       var index = this._computeIndex(p);
	       this.indexLo = min(this.indexLo, index);
	       this.indexHi = max(this.indexHi, index);
	    }
	 }
	 else {
            this.values[this.valueIndex] = max(-1, min(1, p.x));
	 }
      }
   }
   this.onRelease = function(p) {
      if (this.indexLo < this.indexHi) {
         this.fixedIndexLo = this.indexLo;
         this.fixedIndexHi = this.indexHi;
      }
      this.valueIndex = -1;
   }

   // CMD-DRAG HORIZONTALLY TO CHANGE THE NUMBER OF BARS.

   this.onCmdPress = function(p) {
      if (this.pDrag === undefined)
         this.pDrag = newVec3();
      this.pDrag.copy(p);
   }
   this.onCmdDrag = function(p) {
      var dx = p.x - this.pDrag.x;
      if (abs(dx) > 0.4) {
         this.nValues += dx > 0 ? 1 : this.nValues > 1 ? -1 : 0;
         this.pDrag.copy(p);
         this.isChangingN = true;
      }
   }
   this.onCmdRelease = function(p) {
      this.isChangingN = undefined;
   }

   // CMD-SWIPE UP TO TOGGLE BETW BAR CHART AND LINE CHART.
   // CMD-SWIPE DOWN TO TOGGLE NOISE VALUES.

   this.onCmdSwipe[2] = ['bar/line', function() { this.isLines = ! this.isLines; }];
   this.onCmdSwipe[6] = ['noise', function() { this.isNoise = ! this.isNoise; }];

   this.nValues = 1;
   this.valueIndex = -1;
   this.values = newArray(100);
   this.displayMode = function() {
      var link = this.findInLink(0);
      if (isDef(link))
         return link.displayMode();
      return 0;
   }
   this.displayIndex = function() {
      var link = this.findInLink(0);
      if (isDef(link))
         return link.displayIndex();
      return 0;
   }
   this.render = function() {
      if (this.isVertical) {
         mLine([1,1],[-1,1]);
         mLine([-1,1],[-1,-1]);
      }
      else {
         mLine([-1,1],[-1,-1]);
         mLine([-1,-1],[1,-1]);
      }
      this.duringSketch(function() {
         if (this.isVertical)
            mCurve([[-1,.5],[0,.5],[0,-.5],[-1,-.5]]);
         else
            mCurve([[-.5,-1],[-.5,0],[.5,0],[.5,-1]]);
      });
      this.afterSketch(function() {
         var isInput = this.isInValueAt(0);
         var v  = isInput ? this.inValues : this.values;
         var n  = isInput ? v.length : this.nValues;
         var ii = isInput ? this.displayMode() > 0 ? this.displayIndex() : -1 : this.valueIndex;

         if (this.isNoise) {
            v = this.values;
            n = this.nValues;
            var freq = isInput ? this.inValues[0] : 1;

            if (! isDef(this.noiseTime)) {
               this.noiseTime = time;
               this.noiseT = 0;
            }
            this.noiseT += freq * (time - this.noiseTime);
            this.noiseTime = time;

            for (var i = 0 ; i < n ; i++)
	       if (i >= this.fixedIndexLo && i <= this.fixedIndexHi)
                  v[i] = 0;
	       else
                  v[i] = max(-1, min(1, 3 * noise2(this.noiseT, i + i / 10)));
         }

         function _v(i) { i=max(0,min(n-1,i)); return max(-1, min(1, isNumeric(v[i]) ? v[i] : 0)); }

         for (var i = 0 ; i < n ; i++) {
            color(i==ii ? liveDataColor : fadedColor(i % 2 == 0 ? 0.5 : 0.3, this.colorId));
            if (this.isLines) {
               var t0 = mix(-1, 1,        (i  ) / (n-1) );
               var t1 = mix(-1, 1, min(1, (i+1) / (n-1)));
               if (this.isVertical)
                  mFillCurve([[-1,-t0],[_v(i),-t0],[_v(i+1),-t1],[-1,-t1]]);
               else
                  mFillCurve([[ t0,-1],[ t0,_v(i)],[ t1,_v(i+1)],[ t1,-1]]);
            }
            else {
               var t0 = mix(-1, 1, (i+.25) / n);
               var t1 = mix(-1, 1, (i+.75) / n);
               if (this.isVertical)
                  mFillCurve([[-1,-t0],[_v(i),-t0],[_v(i),-t1],[-1,-t1]]);
               else
                  mFillCurve([[ t0,-1],[ t0,_v(i)],[ t1,_v(i)],[ t1,-1]]);
            }
         }

         if (this.outputValue === undefined || this.outputValue.length != n)
            this.outputValue = newArray(n);
         for (var i = 0 ; i < n ; i++)
            this.outputValue[i] = v[i];

         if (isDef(this.isChangingN)) {
            textHeight(this.mScale(.2));
            color(fadedColor(.5, this.colorId));
            mText(n, [-1,1], -.5, 0);
         }
      });
   }

   this.output = function() { return this.outputValue; }
}

