function() {
   var NW =  8;
   var NH =  2;
   var NR =  5;
   var NC = 32;

   var DX = (NC - NW) / NC;
   var DY = (NR - NH) / NR * 0.5;
   this.label = 'bookshelf';
   this.bx = 0;
   this.by = 0;
   this.p = newVec3();
   this.onPress = function(p) { this.isDown = true; this.p.copy(p); }
   this.onDrag = function(p) {
       this.bx = max(-DX, min(DX, this.bx + p.x - this.p.x));
       this.by = max(-DY, min(DY, this.by + p.y - this.p.y));
       this.p.copy(p);
   }
   this.onRelease = function(p) { this.isDown = undefined; }
   this.render = function() {
      mLine([-1, .5],[ 1, .5]);
      mLine([-1, .5],[-1,-.5]);
      mLine([-1,-.5],[ 1,-.5]);
      mLine([ 1, .5],[ 1,-.5]);
      this.afterSketch(function() {
         var col = min(NC-NW, floor((NC-NW) * (this.bx + DX) / (2*DX) + .5));
         var row = min(NR-NH, floor((NR-NH) * (this.by + DY) / (2*DY) + .5));

         if (! isDef(this.isDown)) {
	    this.bx = mix(this.bx, mix(-DX, DX, col / (NC-NW)), 0.1);
	    this.by = mix(this.by, mix(-DY, DY, row / (NR-NH)), 0.1);
         }

         lineWidth(.25);
	 for (var i = 1 ; i < NC ; i++) {
	    var x = mix(-1, 1, i/NC);
	    mLine([x,-.5],[x,.5]);
         }
	 for (var i = 1 ; i < NR ; i++) {
	    var y = mix(-0.5, 0.5, i/NR);
	    mLine([-1,y],[1,y]);
         }

	 var eps = 0.005;
         m.translate(this.bx, 0);
	 color(backgroundColor);
         mFillRect([-.04,-.5],[.04,.5]);
	 color(defaultPenColor);
         lineWidth(2);
         mDrawRect([-.04,-.5],[.04,.5]);
         lineWidth(1);
         mDrawRect([-.01,-.5+.03],[.01,.5-.03]);
         m.translate(0, this.by);
	 var xx = NW / NC;
	 var yy = NH / NR * .5;
	 color(backgroundColor);
         mFillRect([-xx+eps,-yy+eps],[xx-eps,yy-eps]);

	 color(defaultPenColor);
         lineWidth(1);
	 var dx = NW / NC;
	 var dy = NH / NR;
	 for (var i = 0 ; i < NW ; i++)
	 for (var j = 0 ; j < NH ; j++) {
	    var x0 = mix(-xx, xx, (i  )/NW) + eps;
	    var x1 = mix(-xx, xx, (i+1)/NW) - eps;
	    var y0 = mix(-yy, yy, (j  )/NH) + eps;
	    var y1 = mix(-yy, yy, (j+1)/NH) - eps;
	    mDrawRect([x0,y0],[x1,y1]);
	    mDrawRect([mix(x0,x1,.3),mix(y0,y1,.75)],
	              [mix(x0,x1,.7),mix(y0,y1,.77)]);
	    mDrawRect([mix(x0,x1,.4),mix(y0,y1,.65)],
	              [mix(x0,x1,.6),mix(y0,y1,.67)]);
	 }
      });
   }
}
