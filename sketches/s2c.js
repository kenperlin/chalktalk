function S2C() {
   this.labels = "s2c".split(' ');

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ]);
      });
   }
   this.createMesh = function() {
      return new THREE.Mesh(cubeGeometry(), this.shaderMaterial());
   }
}
S2C.prototype = new SketchTo3D;
addSketchType("S2C");

