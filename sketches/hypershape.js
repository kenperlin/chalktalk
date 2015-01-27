function Hypershape() {
   this.labels = ['hypercube','aerochoron'];
   this.is3D = true;

   var trackball = new Trackball(4);

   var T0 = newVec();
   this.onPress = function(T1) {
      T0.copy(T1);
   }
   this.onDrag = function(T1) {
      trackball.rotate( [T0.x,T0.y,T0.z,1], [T1.x,T1.y,T1.z,1] );
      T0.copy(T1);
   }

   function _bit(n, b) { return n >> b & 1; }
   function bit(n, b) { return n >> b & 1 ? 1 : -1; }
   var C = [];
   for (var n = 0 ; n < 16 ; n++)
      C.push([ bit(n, 0), bit(n, 1), bit(n, 2), bit(n, 3) ]);

   var A = [];
   for (var n = 0 ; n < 8 ; n++) {
      var axis = floor(n/2);
      A.push([ axis==0 ? bit(n  , 0) : 0, axis==1 ? bit(n-2, 0) : 0,
               axis==2 ? bit(n-4, 0) : 0, axis==3 ? bit(n-6, 0) : 0 ]);
   }

   var P = [];
   for (var n = 0 ; n < 16 ; n++)
       P.push(newVec());

   var tmp = [0,0,0,0];
   function project(a, b) {
      trackball.transform(a, tmp);
      var s = .9 + .1 * tmp[3];
      b.set(s * tmp[0], s * tmp[1], s * tmp[2]);
   }

   this.placeEdge = function(n, a, b) {
      var edge = this.mesh.children[n];
      edge.position.copy(a).lerp(b, 0.5);
      edge.lookAt(b);
      edge.scale.set(.03, .03, a.distanceTo(b) / 2);
   }

   var edges = [ [0,2,4,6,8,10,12,14],
                 [0,1,4,5,8, 9,12,13],
                 [0,1,2,3,8, 9,10,11],
                 [0,1,2,3,4, 5, 6, 7] ];

   this.render = function() {
      this.code = null;
      switch (this.labels[this.selection]) {
      case 'hypercube':
         if (this.glyphTransition < 1) {
            mClosedCurve([[-1 ,-1 ],[1 ,-1 ],[1 ,1 ],[-1 ,1 ]]);
            mClosedCurve([[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]]);
         }
         this.afterSketch(function() {
            var n = 0;
            for ( ; n < 16 ; n++) {
               var p = P[n];
               project(C[n], p);
               this.mesh.children[n].position.copy(p);
               this.mesh.children[n].scale.set(.1,.1,.1);
               this.extendBounds([[p.x,p.y,p.z]]);
            }
            for (var axis = 0 ; axis < 4 ; axis++)
               for (var i = 0 ; i < 8 ; i++) {
                  var j = edges[axis][i];
                  this.placeEdge(n++, P[j], P[j + (1<<axis)]);
               }
         });
         break;
      case 'aerochoron':
         if (this.glyphTransition < 1) {
            mClosedCurve([[0,-1],[1,0],[0,1],[-1,0]]);
            mLine([-1,0],[1,0]);
            mLine([0,-1],[0,1]);
         }
	 this.afterSketch(function() {
	    var n = 0;
            for ( ; n < 8 ; n++) {
               var p = P[n];
               project(A[n], p);
               this.mesh.children[n].position.copy(p);
               this.mesh.children[n].scale.set(.1,.1,.1);
               this.extendBounds([[p.x,p.y,p.z]]);
            }
	    for (var i = 0 ; i < 4 ; i++)
	    for (var j = i+1 ; j < 4 ; j++)
	    for (var k = 0 ; k < 4 ; k++)
	       this.placeEdge(n++, P[2*i + _bit(k,0)], P[2*j + _bit(k,1)]);
	 });
         break;
      }
   }

   this.createVertex = function(material) {
      var vertex = new THREE.Mesh();
      vertex.addGlobe(16, 8);
      vertex.scale.set(.001,.001,.001);
      return vertex.setMaterial(material);
   }

   this.createEdge = function(material) {
      var edge = new THREE.Mesh();
      edge.addOpenCylinder(8).rotation.x = Math.PI / 2;
      return edge.setMaterial(material);
   }

   this.createMesh = function() {
      var R = [1,1,0,0,2], G = [1,0,1,0,2], B = [1,0,0,1,0];
      var materials = [];
      for (var i = 0 ; i < R.length ; i++)
         materials.push(this.shaderMaterial(R[i], G[i], B[i]));

      var mesh = new THREE.Mesh();

      switch (this.labels[this.selection]) {
      case 'hypercube':
         for (var i = 0 ; i < 16 ; i++)
            mesh.add(this.createVertex(materials[0]));
         for (var i = 0 ; i < 32 ; i++)
	    mesh.add(this.createEdge(materials[1 + floor(i/8)]));
         break;

      case 'aerochoron':
         for (var i = 0 ; i < 8 ; i++)
	    mesh.add(this.createVertex(materials[1 + floor(i/2)]));
         for (var i = 0 ; i < 24 ; i++)
	    mesh.add(this.createEdge(materials[0]));
         break;
      }

      return mesh;
   }
}
Hypershape.prototype = new Sketch;
addSketchType('Hypershape');

