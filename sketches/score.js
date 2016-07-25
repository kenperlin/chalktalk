function() {
   this.label = 'score';
   this.downKeys = {};
   this.render = function() {
      mCurve(buildCurve([[.15,-.5],-1,[-.09,.12],2,[.17,.15],1,[-.22,-.2],-1,[-.23,.25],.8,[.35,.4],-2,[.07,.2]]));
      mCurve(buildCurve([[.16,.44],-1.3,[-.07,-.2],[.18,-.93],2,[-.14,-.14],3.5,[.07,.07]]));
			        
      this.afterSketch(function() {
         mCurve(buildCurve([[-.18,-1.83],4,[.085,.075],2,[.22,.2],.5,[-1.35,-.65]]));
         mCurve(buildCurve([[.32,-1.73],4,[.04,.04]]));
	 mCurve(buildCurve([[.32,-1.93],4,[.04,.04]]));
	 lineWidth(this.mScale(.007));
         var i, y, key;
         for (i = 0 ; i < 5 ; i++) {
	    y = .2 * i - .58;
	    mLine([-.25, y], [5, y]);
	    y = .2 * i - 2.43;
	    mLine([-.25, y], [5, y]);
         }
	 for (key in midi.downKeys) {
	    if (! this.downKeys[key]) {
	       console.log('key ' + key + ' has been pressed.');
	       this.downKeys[key] = midi.downKeys[key];
            }
	 }
	 for (key in this.downKeys) {
	    if (! midi.downKeys[key]) {
	       console.log('key ' + key + ' has been lifted.');
	       delete this.downKeys[key];
            }
	 }
      });
   }
}
