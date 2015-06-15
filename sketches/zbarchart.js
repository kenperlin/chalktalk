function() {
   this.labels = 'barcharth barchartv'.split(' ');
   this.onCmdClick = function() { this.selection = 1 - this.selection; }
   this.isHorizontal = function() { return this.getLabel() == 'barcharth'; }
   this.onPress = function(p) {
      if (! this.isInValueAt(0)) {
         var u = this.isHorizontal() ? -p.y : p.x;
         this.valueIndex = floor(this.nValues * (.5 + .499 * u));
      }
   }
   this.onDrag = function(p) {
      if (this.valueIndex >= 0) {
         var v = this.isHorizontal() ? p.x : p.y;
	 this.values[this.valueIndex] = max(-1, min(1, v));
      }
   }
   this.onRelease = function(p) {
      this.valueIndex = -1;
   }
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
   this.onCmdSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 1:
         this.isLines = isDef(this.isLines) ? undefined : true;
         break;
      case 3:
         this.isNoise = isDef(this.isNoise) ? undefined : true;
	 break;
      }
   }
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
      switch (this.getLabel()) {
      case 'barcharth':
         mLine([1,1],[-1,1]);
         mLine([-1,1],[-1,-1]);
	 break;
      case 'barchartv':
         mLine([-1,1],[-1,-1]);
         mLine([-1,-1],[1,-1]);
	 break;
      }
      this.duringSketch(function() {
         switch (this.getLabel()) {
         case 'barcharth':
	    mCurve([[-1,.5],[0,.5],[0,-.5],[-1,-.5]]);
	    break;
         case 'barchartv':
	    mCurve([[-.5,-1],[-.5,0],[.5,0],[.5,-1]]);
	    break;
	 }
      });
      this.afterSketch(function() {
         var isInput = this.isInValueAt(0);
         var v  = isInput ? this.inValues : this.values;
         var n  = isInput ? v.length : this.nValues;
	 var ii = isInput ? this.displayMode() > 0 ? this.displayIndex() : -1 : this.valueIndex;

	 if (isDef(this.isNoise)) {
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
	       v[i] = max(-1, min(1, 3 * noise2(this.noiseT, i + i / 10)));
         }

	 function _v(i) { i=max(0,min(n-1,i)); return max(-1, min(1, isNumeric(v[i]) ? v[i] : 0)); }

	 for (var i = 0 ; i < n ; i++) {
	    color(i==ii ? liveDataColor : scrimColor(i % 2 == 0 ? 0.5 : 0.3));
	    if (isDef(this.isLines)) {
	       var t0 = mix(-1, 1,        (i  ) / (n-1) );
	       var t1 = mix(-1, 1, min(1, (i+1) / (n-1)));
               switch (this.labels[this.selection]) {
	       case 'barcharth': mFillCurve([[-1,-t0],[_v(i),-t0],[_v(i+1),-t1],[-1,-t1]]); break;
	       case 'barchartv': mFillCurve([[ t0,-1],[ t0,_v(i)],[ t1,_v(i+1)],[ t1,-1]]); break;
	       }
	    }
	    else {
	       var t0 = mix(-1, 1, (i+.25) / n);
	       var t1 = mix(-1, 1, (i+.75) / n);
               switch (this.labels[this.selection]) {
	       case 'barcharth': mFillCurve([[-1,-t0],[_v(i),-t0],[_v(i),-t1],[-1,-t1]]); break;
	       case 'barchartv': mFillCurve([[ t0,-1],[ t0,_v(i)],[ t1,_v(i)],[ t1,-1]]); break;
	       }
	    }
	 }

	 if (this._opv === undefined || this._opv.length != n)
	    this._opv = newArray(n);
         for (var i = 0 ; i < n ; i++)
	    this._opv[i] = v[i];
         this.setOutPortValue(this._opv);

	 if (isDef(this.isChangingN)) {
	    textHeight(this.mScale(.7));
	    color(scrimColor(.2));
	    mText(n, [0,0], .5, .5);
	 }
      });
   }
}
