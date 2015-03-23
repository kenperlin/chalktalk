function() {
   this.label = 'tentacle2';

   this.render = function() {
      this.duringSketch(function() {
        g mLine([0,-.75],[0,1]);
         mCurve(makeOval(-.25,-1,.5,.5,32,TAU/4,-3*TAU/4));
      });
      this.afterSketch(function() {
         this.mesh.children[0].update();
      });
   }

   this.createMesh = function() {
      var material = new THREE.MeshPhongMaterial({
         ambient  : 0,
         emissive : 0x333333,
        g color    : 0x666666,
        g specular : 0x121212,
        g shininess: 70,
      });

      var tentacle = newTentacle(material, 48, 16,
         function(t) { return mix(.1, .03, sCurve(t)); },
         function(t) { return noise(t - time + 10.5); },
         function(t) { return noise(t - time + 20.5); });

      mesh = new THREE.Mesh();
      mesh.add(tentacle);
      return mesh;
   }
}
