function() {
   this.label = 'reflRay';
   var ax = -1, ay = -.5;
   var sx = .3, sy = 0, sr = .5;
   var cx = -.75, cy = .25, cr = .15;
   this.labelMode = 0;

   this.onCmdClick = function() { this.labelMode++; }

   this.render = function() {
      mLine([ax,ay], [sx-sr,sy]);
      mCurve(makeOval(sx-sr,sy-sr,2*sr,2*sr, 32, TAU/4, 5*TAU/4));
      mLine([sx-sr,sy],[cx+cr,cy]);
      mCurve(makeOval(cx-cr,cy-cr,2*cr,2*cr, 32, TAU/4, 5*TAU/4));
      textHeight(this.mScale(0.1));
      if (this.labelMode >= 1) {
         mText("V", [ax,ay-.1]);
         mText("W", [(ax+sx-sr)/2,(ay+sy)/2-.1]);
      }
      if (this.labelMode == 1) {
         mText("S", [sx-sr+.05,sy], 0, .5);
      }
      if (this.labelMode == 2) {
         mText("V'", [sx-sr+.05,sy], 0, .5);
         mText("W'", [(cx+sx-sr)/2+.03,(cy+sy)/2+.06]);
      }
      if (this.labelMode >= 3) {
         mText("V' = S + \u03B5 W'", [sx-sr/3,sy], .5, .5);
         mText("W'", [(cx+sx-sr)/2+.03,(cy+sy)/2+.06]);
      }
   }
   this.onDrag = function(point) {
      cx = point.x;
      cy = point.y;
   }
}
