
   function Ray1() {
      this.labels = "ray1".split(' ');
      this.is3D = true;
      this.rayX = 0;
      this.rayY = 0;
      this.mouseDrag = function(x, y) {
         this.rayX = 1 - 2 * (x-this.xlo) / (this.xhi - this.xlo);
         this.rayY = 2 * (y-this.yhi) / (this.ylo - this.yhi) - 1;
      }
      this.render = function(elapsed) {
         m.save();
         m.rotateY(2);

	 mCurve([[-1,.75],[1,.75],[1,-.75],[-1,-.75],[-1,.75]]);
	 mLine([0,0,-2],[this.rayX,this.rayY,2]);

	 this.afterSketch(function() {
	    mArrow([0,0,-2],[this.rayX,this.rayY,2],.3);
	    lineWidth(0.5);
	    mLine([this.rayX/2,.75],[this.rayX/2,-.75]);
	    mLine([1,this.rayY/2],[-1,this.rayY/2]);
	 });

         m.restore();
      }
   }
   Ray1.prototype = new Sketch;

