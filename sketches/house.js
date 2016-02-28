function() {
   this.label = 'house';
   this.render = function() {
      mCurve([[-1,.8],[-1,-1],[1,-1],[1,.8]]);
      mCurve([[1,.8],[0,1.7],[-1,.8]]);
   }
}
