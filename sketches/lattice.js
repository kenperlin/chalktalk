function Lattice() {
   this.labels = "lattice".split(' ');
   this.is3D = true;
   this.showLattice = false;
   this.showCube = false;
   this.onClick = function() {
      if (this.showLattice)
         this.showCube = true;
      else
         this.showLattice = true;
   }
   this.render = function(elapsed) {
      m.save();
         m.scale(this.size / 400);
         m.rotateY(-.2);
         m.rotateX( .2);
	 if (this.showLattice)
	    lineWidth(1);
         mCurve([[-1, 0, 0], [ 1, 0, 0]]);
         mCurve([[ 0,-1, 0], [ 0, 1, 0]]);
         mCurve([[ 0, 0,-1], [ 0, 0, 1]]);
	 if (this.showLattice) {
	    m.scale(.5);
	    for (var x = -2 ; x <= 2 ; x++)
	    for (var y = -2 ; y <= 2 ; y++)
	    for (var z = -2 ; z <= 2 ; z++) {
	       mCurve([[x-.03,y,z],[x+.03,y,z]]);
	       mCurve([[x,y-.03,z],[x,y+.03,z]]);
	    }
	    if (this.showCube) {
	       color('pink');
	       mLine([-2, 2, 2],[-1, 2, 2]);
	       mLine([-2, 2, 2],[-2, 1, 2]);
	       mLine([-2, 2, 2],[-2, 2, 1]);

          mLine([-1, 2, 2],[-1, 2, 1]);
          mLine([-2, 2, 1],[-1, 2, 1]);
          mLine([-1, 2, 2],[-1, 1, 2]);

          mLine([-1, 2, 1],[-1, 1, 1]);
          mLine([-1, 1, 2],[-1, 1, 1]);

          mLine([-2, 1, 2],[-1, 1, 2]);
          mLine([-2, 1, 1],[-1, 1, 1]);

          mLine([-2, 1, 2],[-2, 1, 1]);
          mLine([-2, 1, 1],[-2, 2, 1]);
	    }
	 }
      m.restore();
   }
}
Lattice.prototype = new Sketch;
