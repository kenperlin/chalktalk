function S2C() {
   this.label = "s2c";

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ]);
      });
   }
   this.createMesh = function() {
      return new THREE.Mesh(cubeGeometry(), this.shaderMaterial());
   }
}
S2C.prototype = new Sketch;
addSketchType("S2C");

