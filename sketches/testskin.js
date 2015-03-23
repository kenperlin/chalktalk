function() {
   this.label = 'testskin';
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,-1],[1,-1]);
         mLine([ 0,-1],[0, 1]);
         mLine([-1, 1],[1, 1]);
      });
      this.afterSketch(function() {
         var s = .8 + .2 * sin(PI * time);
         this.mesh.children[0].children[0].scale.set(s,s,s);
      });
   }
   function bone(parent) { return { pos:[0,0,0], rot:[0,0,0], scl:[1,1,1], rotq:[0,0,0,1], parent:parent }; }
   this.createMesh = function() {
      var geometry = new THREE.SphereGeometry(1,40,20);
      geometry.skinIndices = [];
      geometry.skinWeights = [];
      for (var i = 0 ; i < geometry.vertices.length ; i++) {
         var v = geometry.vertices[i];
         var t = sCurve(.5 + .5 * sin(2 * PI * v.x) * sin(2 * PI * v.y) * sin(2 * PI * v.z));
         geometry.skinIndices.push(new THREE.Vector4(1,0,0,0));
         geometry.skinWeights.push(new THREE.Vector4(t,1-t,0,0));
      }
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.bones = [bone(-1), bone(0)];
      var material = new THREE.MeshPhongMaterial({
         ambient :new THREE.Color(0,0,0),
         emissive:new THREE.Color(.2,0,0),
         color   :new THREE.Color(.4,0,0),
         specular:new THREE.Color(.07,.07,.07),
         shininess:70,
         skinning:true
      });
      var mesh = new THREE.SkinnedMesh(geometry, material, false);
      return mesh;
   }
}
