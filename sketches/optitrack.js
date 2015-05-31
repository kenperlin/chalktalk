function() {
   this.label = 'optitrack';
   this.render = function() {
      mClosedCurve([[-.7,1],[.7,1],[.7,-1],[-.7,-1]]);
      mCurve([[.35,-1],[.35,-1.5],[-.35,-1.5],[-.35,-1]]);
   }
}
