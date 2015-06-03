function() {
   this.labels = 'barcharth barchartv'.split(' ');
   this.onClick = function() { this.selection = 1 - this.selection; }
   this.render = function() {
      mLine([-1,1],[-1,-1]);
      mLine([-1,-1],[1,-1]);
      this.duringSketch(function() {
         switch (this.labels[this.selection]) {
         case 'barcharth': mCurve([[-1,.25],[.1,.25],[.1,-.25],[-1,-.25]]); break;
         case 'barchartv': mCurve([[-.25,-1],[-.25,.1],[.25,.1],[.25,-1]]); break;
	 }
      });
      this.afterSketch(function() {
         var v = this.inValues;
         var n = v.length;
	 for (var i = 0 ; i < n ; i++) {
	    color(scrimColor(i % 2 == 0 ? 0.2 : 0.4));
	    var t0 = mix(-1, 1, (i+.1) / n);
	    var t1 = mix(-1, 1, (i+.9) / n);
            switch (this.labels[this.selection]) {
	    case 'barcharth': mFillCurve([[-1,-t0],[v[i],-t0],[v[i],-t1],[-1,-t1]]); break;
	    case 'barchartv': mFillCurve([[ t0,-1],[ t0,v[i]],[ t1,v[i]],[ t1,-1]]); break;
	    }
	 }
      });
   }
}
