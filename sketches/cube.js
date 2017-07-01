function() {
   this.label = 'cube';
   this.is3D = true;
   this._isSolid = true;

   this._scaleX = 1;
   this._scaleY = 1;
   this._p = newVec3();
   this.onCmdClick = [ 'toggle wireframe' , function(p) { this._isSolid = ! this._isSolid; } ];
   this.onPress = function(p) { this._p.copy(p); }
   this.onDrag = function(p) {
      this._scaleX += p.x - this._p.x;
      this._scaleY += p.y - this._p.y;
      this._p.copy(p);
   }

   function s(i) { return i ? 1 : -1; }

   var v = [];
   for (var n = 0 ; n < 8 ; n++)
      v.push([s(n&1), s(n&2), s(n&4)]);

   v.edges = [ [0,1], [2,3], [4,5], [6,7],
               [0,2], [1,3], [4,6], [5,7],
	       [0,4], [1,5], [2,6], [3,7] ];

   this.render = function(elapsed) {
      m.scale(this._scaleX, this._scaleY, 1);
      this.duringSketch(function() {
         mCurve([[-1,-1],[ 1,-1],[ 1, 1]]);
         mCurve([[ 1, 1],[-1, 1],[-1,-1]]);
      });
      this.afterSketch(function() {
         if (this._isSolid)
	    mCube();
         else
            for (var n = 0 ; n < v.edges.length ; n++)
               mLine(v[v.edges[n][0]], v[v.edges[n][1]]);
      });
   }

   this.output = function() {
      v.color = palette.color[this.colorId];
      return v;
   }
}


