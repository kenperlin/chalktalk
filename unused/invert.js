function() {
   this.label = 'invert';
   this.render = function() {
      mCurve([[1,1],[1,-1],[-1,-1]]);
      mLine([-.6,-.6],[.6,.6]);
      this.afterSketch(function() {
         mCurve([[-1,-1],[-1,1],[1,1]]);
         mLine([-.3,.5],[-.3,.1]);
	 mCurve([[.2,-.6],[.2,-.2],[.4,-.4],[.6,-.2],[.6,-.6]]);
      });
   }
   this.output = function() {
      return isMatrixArray(this.inValue[0]) ? CT.matrixInverse(this.inValue[0])
                                            : CT.matrixIdentity();
   }
}
