"use strict";

function createTentacle(nSegments, nRadial, radiusFunction, updateFunction) {
   var tentacle = new THREE.Mesh();
   tentacle.nSegments = nSegments;
   tentacle._updateFunction = updateFunction;
   tentacle.update = function() {
      var node = this;
      for (var i = 0 ; i < this.nSegments ; i++) {
         if (i > 0)
            this._updateFunction(node, i / this.nSegments);
         node = node.children[1];
      }
   };
   var node = tentacle;
   for (var i = 0 ; i < nSegments ; i++) {
      var dt = 1 / nSegments;
      var t = i * dt;
      var part = new THREE.Mesh();
      var link = new THREE.Mesh();
      node.add(part);
      node.add(link);

      var r0 = radiusFunction(t);
      var r1 = radiusFunction(t + dt);

      if (i == 0) {
         var cap = new THREE.Mesh(new THREE.CircleGeometry(r0, nRadial));
         cap.rotation.x = PI/2;
         part.add(cap);
      }

      var tube = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, dt, nRadial, 1, true));
      part.add(tube);
      tube.position.y = dt/2;

      var tangent = (r0 - r1) / dt;
      var theta = atan(tangent);
      var tip = i == nSegments - 1;
      var cap = new THREE.Mesh(new THREE.SphereGeometry(r1 / cos(theta), nRadial, tip ? 8 : 2, 0, TAU,
                               tip ? 0 : PI/3, tip ? PI/2 - theta : PI/6 - theta));
      cap.position.y = dt - r1 * tangent;
      part.add(cap);

      link.position.y = dt;

      node = link;
   }
   return tentacle;
}
