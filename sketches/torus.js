function Torus() {
   this.labels = "torus".split(' ');
   this.r = .4;

   var R = 1 + this.r;
   this.meshBounds = [];
   for (var theta = 0 ; theta < TAU ; theta += TAU / 8) {
      this.meshBounds.push([R * cos(theta), R * sin(theta), -this.r]);
      this.meshBounds.push([R * cos(theta), R * sin(theta),  this.r]);
   }

   this.render = function() {
      this.duringSketch(function() {
         var r = this.r;
         mCurve(makeOval(-1-r, -1-r, 2+2*r, 2+2*r, 20, -PI/2, 3*PI/2));
         mCurve(makeOval(-1+r, -1+r, 2-2*r, 2-2*r, 20, -PI/2, 3*PI/2));
      });
   }
   this.createMesh = function() {
      return new THREE.Mesh(torusGeometry(this.r, 40, 40), this.shaderMaterial());
   }
}
Torus.prototype = new Sketch;
addSketchType("Torus");

