function() {
   this.label = 'shadowRay';
   var sx = -.5, sy = 0, lx = .5, ly = 1, cx = .5, cy = 0, r = .25;

   this.render = function() {
      mCurve(makeOval(-1,-1,1,1, 32, TAU/4, 5*TAU/4));

      var V = [sx,sy], W = [lx-sx,ly-sy];
      var t = rayIntersectCircle(V, W, [cx, cy, r]);

      var p = t.length == 0 ? [lx,ly] : [V[0]+t[0]*W[0], V[1]+t[0]*W[1]];
      mArrow([sx,sy], p, .1);
      mCurve(makeOval(cx-r,cy-r,2*r,2*r, 32, TAU/4, 5*TAU/4));
   }
   this.onDrag = function(point) {
      cx = point.x;
      cy = point.y;
   }
}
