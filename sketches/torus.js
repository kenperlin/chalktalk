function Torus() {
   this.label = "torus";
   this.r = .4;

   this.meshBounds = [];
   var r = this.r;
   for (var theta = 0 ; theta < TAU ; theta += TAU / 8) {
      var x = (1 + r) * cos(theta);
      var y = (1 + r) * sin(theta);
      this.meshBounds.push([x, y, -r]);
      this.meshBounds.push([x, y,  r]);
   }

   this.render = function() {
      this.duringSketch(function() {
         var r = this.r;
         mCurve(makeOval(-1-r, -1-r, 2+2*r, 2+2*r, 20, -PI/2, 3*PI/2));
         mCurve(makeOval(-1+r, -1+r, 2-2*r, 2-2*r, 20, -PI/2, 3*PI/2));
      });
   }

   this.createMesh = function() {
      return new THREE.Mesh(torusGeometry(this.r, 80, 80), this.shaderMaterial());
   }
}
Torus.prototype = new Sketch;
addSketchType("Torus");

