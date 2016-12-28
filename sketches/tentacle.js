function() {
   this.label = 'tentacle';
   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve(makeOval(-.25,-1,.5,.5,32,TAU/4,-3*TAU/4));
         mLine([0,-.75],[0,1]);
      });
      this.afterSketch(function() {
         this.mesh.children[0].update();
      });
   }
   this.createMesh = function() {
      var mesh = new THREE.Mesh();
      var tentacle = createTentacle(40, 16, function(t) { return mix(.05,.015,sCurve(t)); },
                                            function(node, t) { node.rotation.x = .3 * noise(t - .2*time + 10.5);
                                                                node.rotation.z = .3 * noise(t - .2*time + 20.5); });
      tentacle.position.y = -1;
      tentacle.scale.set(2,2,2);
      mesh.add(tentacle);
      mesh.setMaterial(this.shaderMaterial());
      return mesh;
   }
}
