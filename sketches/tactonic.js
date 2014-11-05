function Tactonic() {
   this.labels = "tactonic".split(' ');

   this.nc = 48;
   this.nr = 72;

   this.S = [];
   var s = 1 / (this.nr/2);
   for (var c = 0 ; c < this.nc ; c++) {
      var x = (c - this.nc/2) * s;
      for (var r = 0 ; r < this.nr ; r++) {
         var y = (r - this.nr/2) * s;
         this.S.push([[x,y],[x+s*1.1,y],[x+s*1.1,y+s*1.1],[x,y+s*1.1]]);
      }
   }

   this.C = [];
   for (var i = 0 ; i < 255 ; i++)
      this.C.push('rgb(' + i + ',' + i + ',' + i + ')');

   this.ttMesh = null;

   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,1],[1,1]);
         mLine([0,1],[0,-1]);
      });
      this.afterSketch(function() {
/*
         if (this.ttMesh == null) {
	    this.ttMesh = root.addPlane();
	    this.ttMesh.setMaterial(whiteMaterial);
	 }
	 var xx = this.xyz[2] * this.tx() + this.xyz[0];
	 var yy = this.xyz[2] * this.ty() + this.xyz[1];
	 var tx =  xx / pixelsPerUnit;
	 var ty = -yy / pixelsPerUnit;
	 var sc = m._m()[0] / pixelsPerUnit * this.xyz[2];
	 this.ttMesh.getMatrix().identity().translate(tx, ty, 0).scale(sc);
	 console.log(this.xyz);
*/
         var n = 0;
         for (var c = 0 ; c < this.nc ; c++) {
            var x = (c - this.nc/2) * s;
            for (var r = 0 ; r < this.nr ; r++) {
               var y = (r - this.nr/2) * s;
               var f = .5 + .5 * sin(5 * x - time) * sin(5 * y);
               color(this.C[floor(255 * max(0, min(1, f)))]);
               mFillCurve(this.S[n]);
	       n++;
            }
         }
      });
   }
}
Tactonic.prototype = new Sketch;
addSketchType("Tactonic");
