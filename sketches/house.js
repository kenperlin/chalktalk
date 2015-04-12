function() {
   this.label = 'house';
   var walls = [ newVec3(-1, 0.8),
                 newVec3(-1,-1  ),
                 newVec3( 1,-1  ),
                 newVec3( 1, 0.8) ];
   var roof  = [ newVec3( 1, 0.8),
                 newVec3( 0, 1.7),
                 newVec3(-1, 0.8) ];
   this.render = function(elapsed) {
      mCurve(walls);
      mCurve(roof );
   }
}
