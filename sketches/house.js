function() {
   this.label = 'house';
   var curve = [ newVec3(-1, 0.8),
                 newVec3(-1,-1  ),
		 newVec3( 1,-1  ),
		 newVec3( 1, 0.8),
		 newVec3( 0, 1.7) ];
   this.render = function(elapsed) {
      mClosedCurve(curve);
   }
}
