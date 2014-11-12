function Torus() {
   this.labels = "torus".split(' ');
   this.r = .4;

   this.render = function() {
      this.duringSketch(function() {
         var r = this.r;
         mCurve(makeOval(-1-r, -1-r, 2+2*r, 2+2*r, 20, -PI/2, 3*PI/2));
         mCurve(makeOval(-1+r, -1+r, 2-2*r, 2-2*r, 20, -PI/2, 3*PI/2));
      });
   }
   this.createMesh = function() {
      var r = this.r;
      this.meshBounds = [[-1-r,-1-r], [1+r,1+r]];
      return new THREE.Mesh(torusGeometry(r, 40,40), this.shaderMaterial());
   }
}
Torus.prototype = new Sketch;
addSketchType("Torus");

