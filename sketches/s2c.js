function() {
   this.label = "s2c";
   this._scaleX = 1;
   this._scaleY = 1;
   this._p = newVec3();

   this.onPress = function(p) { this._p.copy(p); }
   this.onDrag = function(p) {
      this._scaleX += p.x - this._p.x;
      this._scaleY += p.y - this._p.y;
      this._p.copy(p);
   }

   this.render = function() {
      m.scale(this._scaleX, this._scaleY, 1);
      mCube();
      this.duringSketch(function() {
         mCurve([ [-1,-1,1],[1,-1,1],[1,1,1] ]);
         mCurve([ [1,1,1],[-1,1,1],[-1,-1,1] ]);
      });
   }
}
