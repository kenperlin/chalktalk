
function Tentacle2() {
   this.label = 'tentacle2';

   this.render = function() {
      this.duringSketch(function() {
	 mLine([0,-.75],[0,1]);
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
	 color    : 0x666666,
	 specular : 0x121212,
	 shininess: 70,
      });

      var tentacle = newTentacle(material, 48, 16,
         function(t) { return mix(.1, .03, sCurve(t)); },
         function(t) { return noise(t - .2*time + 10.5); },
         function(t) { return noise(t - .2*time + 20.5); });

      mesh = new THREE.Mesh();
      mesh.add(tentacle);
      return mesh;
   }
}
Tentacle2.prototype = new Sketch;
addSketchType('Tentacle2');

