function() {
   this.label = 'ray2';
   var a = [-1,0,0], b = [0,0,0], c = [1,0,0];
   this.onDown = function(point) { c[0] = point.x; }
   this.onDrag = function(point) { c[0] = point.x; }
   this.render = function() {
      this.duringSketch(function() {
         mLine(a, c);
         mCurve([[c[0]-.2,c[1]+.2],c,[c[0]-.2,c[1]-.2]]);
      });
      this.afterSketch(function() {
         textHeight(this.mScale(0.1));
         mArrow(a, b);
         lineWidth(1);
         mLine(b,c);

         mText("V", a, 0, 2);
         mText("W", b, 0, 2);
         mText("t", c, 0, 2);

         mDot(c, .1);
      });
   }
}
