function() {
   this.labels = 'larrow rarrow uarrow darrow'.split(' ');
   this.render = function() {
      lineWidth(6);
      switch (this.labels[this.selection]) {
      case 'larrow':
         mCurve([[-.5,.5],[-1,0],[-.5,-.5]]);
         mLine([-1,0],[1,0]);
	 break;
      case 'rarrow':
         mCurve([[.5,.5],[1,0],[.5,-.5]]);
         mLine([1,0],[-1,0]);
	 break;
      case 'uarrow':
         mCurve([[-.5,.5],[0,1],[.5,.5]]);
	 mLine([0,1],[0,-1]);
	 break;
      case 'darrow':
         mCurve([[-.5,-.5],[0,-1],[.5,-.5]]);
	 mLine([0,-1],[0,1]);
	 break;
      }
   }
}
