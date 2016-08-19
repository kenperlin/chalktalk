function() {
   this.label = 'score';
   this.downKeys = {};
   this.render = function() {

      var curve1 = buildCurve([[.15,-.5],-1,[.06,-.38],2,[.31,-.23],1,[.36,-.58],
                                -1,[.13,-.33],.8,[.54,.07],-3,[.5,.25]]);

      var curve2 = buildCurve([[.27,.25],[.4,-.78],2,[.26,-.92],3.5,[.19,-.71]]);

      var curve3 = buildCurve([[-.18,-1.83],4,[-.09,-1.76],2,[.04,-1.63],.5,[-1.09,-2.48]]);
      var curve4 = buildCurve([[.32,-1.73],4,[.36,-1.69]]);
      var curve5 = buildCurve([[.32,-1.93],4,[.36,-1.89]]);
			        
      mCurve(curve1);
      mCurve(curve2);

      this.afterSketch(function() {
         mCurve(curve3);
         mCurve(curve4);
	 mCurve(curve5);

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

