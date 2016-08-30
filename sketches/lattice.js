function() {
   this.labels = 'lattice';
   this.is3D = true;
   this.showLattice = false;
   this.showCube = false;
   this.showNoise = false;
   this.pts = [];
   this.noise = new Noise();
   this.onClick = function() {
      if (this.showNoise)
         ;
      else if (this.showCube) {
         this.showNoise = true;
	 var d = 1/16
	 for (var dz = 0 ; dz < .99 ; dz += d)
	 for (var dy = 0 ; dy < .99 ; dy += d)
	 for (var dx = 0 ; dx < .99 ; dx += d) {
             var x = -2 + dx;
             var y =  1 + dy;
             var z =  1 + dz;
	     var c = floor(255 * pow(.5 + .5 * this.noise.noise([x,y,z+4]), 4));
	     this.pts.push([
		'rgba(' + c + ',' + c + ',' + c + ',' + (.2 * (2 - dx*dx) * (2 - dy*dy)) + ')' ,
	        [ [x,y,z], [x+d,y,z], [x+d,y+d,z], [x,y+d,z] ]
	     ]);
         }
      }
      else if (this.showLattice)
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

               if (this.showNoise) {
                  for (var n = 0 ; n < this.pts.length ; n++) {
                     color(this.pts[n][0]);
		     mFillCurve(this.pts[n][1]);
/*
		     var P = [];
		     for (var i = 0 ; i < this.pts[n][1].length ; i++)
		        P.push(m.transform(this.pts[n][1][i]));
                     fillPolygon(P);
*/
                  }
               }
            }
         }
      m.restore();
   }
}
