function() {
   this.label = "s2c";

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ]);
      });
      this.useInputColors();
   }
   this.createMesh = function() {
      return new THREE.Mesh(cubeGeometry(), this.shaderMaterial());
   }
}
