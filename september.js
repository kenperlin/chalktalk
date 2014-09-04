
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

   function Mat4() {
      this.labels = "mat4".split(' ');
      this.mode = 0;
      this.onClick = function(x, y) {
         this.mode++;
      }
      this.render = function(elapsed) {
         m.save();
	 mCurve([[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]]);
	 mLine([-.5,1],[-.5,-1]);
	 mLine([  0,1],[  0,-1]);
	 mLine([ .5,1],[ .5,-1]);
	 mLine([-1, .5],[1, .5]);
	 mLine([-1,  0],[1,  0]);
	 mLine([-1,-.5],[1,-.5]);
	 this.afterSketch(function() {
	    if (this.mode > 0) {
	       var vals = (this.mode % 2) == 1 ? [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
	                                       : [0,1,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,1] ;
	       textHeight((this.xhi - this.xlo) / 10);
	       for (var i = 0 ; i < 4 ; i++)
	       for (var j = 0 ; j < 4 ; j++) {
	          var x = (i - 1.5) / 2;
	          var y = (1.5 - j) / 2;
	          mText(vals[i + 4 * j], [x, y], .5, .5);
	       }
	    }
	 });
         m.restore();
      }
   }
   Mat4.prototype = new Sketch;

   function Cyl1() {
      this.labels = "cyl1".split(' ');
      this.is3D = true;
      this.nSteps = 8;
      this.mouseDrag = function(x, y) {
         if (this.y0 === undefined)
	    this.y0 = y;
         var i0 = floor(this.y0 / 20);
         var i1 = floor(     y  / 20);
	 if (i1 != i0) {
	    this.nSteps = max(4, this.nSteps + (i1 < i0 ? 1 : -1));
	    this.y0 = y;
	 }
      }
      this.mouseUp = function(x, y) {
         delete this.y0;
      }
      this.render = function(elapsed) {
         m.save();
	 this.duringSketch(function() {
	    mCurve([[1,-1],[-1,-1],[-1,1],[1,1],[1,-1]]);
	 });
	 this.afterSketch(function() {
	    var C0 = [], C1 = [], C2 = [], C3 = [], C4 = [];
	    for (var theta = 0 ; theta <= TAU + .0001 ; theta += TAU / this.nSteps) {
	       var c = cos(theta);
	       var s = sin(theta);
	       C0.push([s, 1,c]);
	       C1.push([s,-1,c]);
	       C2.push([0, 1,0]);
	       C2.push([s, 1,c]);
	       C3.push([0,-1,0]);
	       C3.push([s,-1,c]);
	       C4.push([s, 1,c]);
	       if (theta < TAU)
	          C4.push([s,-1,c]);
	    }
	    mCurve(C0);
	    mCurve(C1);
	    lineWidth(.5);
	    mCurve(C2);
	    mCurve(C3);
	    mCurve(C4);
	 });
         m.restore();
      }
    }
   Cyl1.prototype = new Sketch;

