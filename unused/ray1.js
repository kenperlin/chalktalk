function() {
   this.label = "ray1";
   this.is3D = true;
   this.rayX = 0;
   this.rayY = 0;
   this.showLabels = false;
   this.onClick = ['show labels', function() { this.showLabels = ! this.showLabels; }];
   this.mouseDrag = function(x, y) {
      this.rayX = 1 - 2 * (x-this.xlo) / (this.xhi - this.xlo);
      this.rayY = 2 * (y-this.yhi) / (this.ylo - this.yhi) - 1;
   }
   this.render = function(elapsed) {
      m.rotateY(2);

      var a = [-1,.75], b = [1,.75], c = [1,-.75], d = [-1,-.75];
      mClosedCurve([a, b, c, d]);
      mLine([0,0,-2],[this.rayX,this.rayY,2]);

      this.afterSketch(function() {
         mArrow([0,0,-2],[this.rayX,this.rayY,2],.1);
         if (this.showLabels) {
            lineWidth(0.5);
            mLine([this.rayX/2,.75],[this.rayX/2,-.75]);
            mLine([1,this.rayY/2],[-1,this.rayY/2]);
            textHeight(this.mScale(.1));
            mText("V = (0,0,0)", [0,.1,-2], .5, -1.2);
            mText("W", [this.rayX/4,this.rayY/4 + .1,-1]);
         }
         else
            mDot([this.rayX/2, this.rayY/2], .1);
      });
   }
}
