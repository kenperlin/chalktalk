
function newTentacle(material, nBones, nRadial, radiusFunction, xRotateFunction, zRotateFunction) {
   function bone(parent) {
      return { pos:[0,0,0], rot:[0,0,0], scl:[1,1,1], rotq:[0,0,0,1], parent:parent };
   }

   var geometry = new THREE.CylinderGeometry(1,1,2,8,nBones,true);

   var capRadius = radiusFunction(1);

   // ADD FLAT CAP ON BOTTOM

   var cap = new THREE.CircleGeometry(1, 8);
   for (var i = 0 ; i < cap.vertices.length ; i++) {
      var v = cap.vertices[i];
      v.set(v.x, -1, v.y);
   }
   THREE.GeometryUtils.merge(geometry, cap);

   // ADD HEMISPHERICAL CAP ON TOP

   var cap = new THREE.SphereGeometry(1, 8,8, 0,TAU, 0,PI/2);
   for (var i = 0 ; i < cap.vertices.length ; i++) {
      var v = cap.vertices[i];
      v.set(v.x, capRadius * v.y + 1, v.z);
   }
   THREE.GeometryUtils.merge(geometry, cap);

   geometry.skinIndices = [];
   geometry.skinWeights = [];
   for (var i = 0 ; i < geometry.vertices.length ; i++) {
      var v = geometry.vertices[i];
      var t = (1 + v.y) / 2;

      // TAPER THE RADIUS ALONG THE TENTACLE LENGTH

      var s = radiusFunction(t);
      v.x *= s;
      v.z *= s;

      // CREATE THE BONE DATA

      var tnb = t * nBones;
      var n = floor(tnb);
      var f = tnb % 1;
      geometry.skinIndices.push(new THREE.Vector4(n,n-1,0,0));
      geometry.skinWeights.push(new THREE.Vector4(f,1-f,0,0));
   }

   geometry.computeFaceNormals();
   geometry.computeVertexNormals();

   // REMOVE ANNOYING SEAM IN THREE.JS CYLINDER.

   function adjustNormal(a, b) {
      var theta = atan2(b.x, b.z);
      var r = sqrt(a.x * a.x + a.z * a.z);
      a.x = r * cos(theta);
      a.z = r * sin(theta);
      a.normalize();
   }
   for (var i = 0 ; i < geometry.faces.length ; i++) {
      var face = geometry.faces[i];
      adjustNormal(face.vertexNormals[0], geometry.vertices[face.a]);
      adjustNormal(face.vertexNormals[1], geometry.vertices[face.b]);
      adjustNormal(face.vertexNormals[2], geometry.vertices[face.c]);
   }

   // CREATE THE ARRAY OF NESTED BONES

   geometry.bones = [];
   for (var n = 0 ; n <= nBones ; n++)
      geometry.bones.push(bone(n-1));

   // MAKE THE MATERIAL SKINNABLE

   material.skinning = true;
   var tentacle = new THREE.SkinnedMesh(geometry, material, false);

   tentacle.nBones = nBones;
   tentacle.xRotateFunction = xRotateFunction;
   tentacle.zRotateFunction = zRotateFunction;
   tentacle.update = function() {
      var node = this.children[0];
      for (var n = 0 ; n <= this.nBones ; n++) {
         if (n > 0) {
            var t = n / this.nBones;

            var xRot = this.xRotateFunction(t) * 12.3 / this.nBones;
            var zRot = this.zRotateFunction(t) * 12.3 / this.nBones;
            var y = 2 * t - 1;

	    // ADJUST CENTER OF ROTATION FOR THIS Y VALUE

            node.position.x =   - y * -sin(zRot) * cos(xRot);
            node.position.y = y - y *  cos(zRot) * cos(xRot);
            node.position.z =   - y *              sin(xRot);

            node.rotation.x = xRot;
            node.rotation.z = zRot;
         }
         node = node.children[0];
      }
   };

   return tentacle;
}

