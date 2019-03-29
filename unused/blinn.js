function() {
   this.label = "blinn";
   this.lx = -cos(PI/4);
   this.ly =  sin(PI/4);
   this.ex =  cos(PI/3);
   this.ey =  sin(PI/3);
   this.showNormal = false;

   this.onCmdClick = function() { this.showNormal = ! this.showNormal; }

   this.mouseDrag = function(x, y) {
      if (y > this.cy)
         return;
      var lx = 2 * (x - this.xlo + x - this.xhi) / this.wide;
      if (lx * lx < 1) {
         this.lx = lx;
         this.ly = sqrt(1 - lx * lx);
      }
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1,0],[1,0]);
         mLine([0,0],[this.lx,this.ly]);
         mLine([0,0],[this.ex,this.ey]);
      });
      this.afterSketch(function() {
         if (this.wide === undefined && isNumeric(this.xlo))
            this.wide = this.xhi - this.xlo;

         mLine([-1,0],[1,0]);
         mArrow([0,0],[this.lx,this.ly]);
         mArrow([0,0],[this.ex,this.ey]);

         var hx = (this.lx + this.ex) / 2;
         var hy = (this.ly + this.ey) / 2;
         mDot([hx,hy], .05);

         var h = sqrt(hx * hx + hy * hy);
         hx /= h;
         hy /= h;

         lineWidth(1);
         mArrow([0,0],[hx,hy]);
         if (this.showNormal)
            mArrow([0,0],[0,1]);

         lineWidth(.5);
         mLine([this.lx,this.ly], [this.ex,this.ey]);

	 textHeight(this.mScale(0.1));

         if (this.showNormal) {
            mText("N", [0, 1 * 1.1]);
            lineWidth(4);
            color('yellow');
            mCurve(makeOval(-.5,-.5,1,1, 30, atan2(hy,hx), PI/2));
            color(defaultPenColor);
         }
         mText("L", [this.lx * 1.1, this.ly * 1.1]);
         mText("E", [this.ex * 1.1, this.ey * 1.1]);
         mText("H", [     hx * 1.1,      hy * 1.1]);
      });
   }
}
