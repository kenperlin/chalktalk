function Hypercube() {
   this.label = 'hypercube';
   this.is3D = true;

   var trackball = new Trackball(4);

   var T0 = newVec();
   this.onPress = function(T1) {
      T0.copy(T1);
   }
   this.onDrag = function(T1) {
      trackball.rotate([T0.x,T0.y,T0.z,1], [T1.x,T1.y,T0.z,1]);
      T0.copy(T1);
   }

   function bit(n, b) { return n >> b & 1 ? 1 : -1; }
   var C = [];
   for (var n = 0 ; n < 16 ; n++)
      C.push([bit(n,0), bit(n, 1), bit(n, 2), bit(n, 3)]);

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
      edge.scale.set(.05, .05, a.distanceTo(b) / 2);
   }
   var edges = [[0,2,4,6,8,10,12,14],
                [0,1,4,5,8, 9,12,13],
                [0,1,2,3,8, 9,10,11],
                [0,1,2,3,4, 5, 6, 7]];
   this.render = function() {
      this.code = null;
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
   }
   this.createMesh = function() {
      var materials = [ this.shaderMaterial(1,1,1),
                        this.shaderMaterial(1,0,0),
                        this.shaderMaterial(0,1,0),
                        this.shaderMaterial(0,0,1),
                        this.shaderMaterial(1,0,1) ];
      var mesh = new THREE.Mesh();
      for (var i = 0 ; i < 16 ; i++)
         mesh.addGlobe(16, 8).scale.set(.001,.001,.001);
      mesh.setMaterial(materials[0]);
      for (var i = 0 ; i < 32 ; i++) {
         var edge = new THREE.Mesh();
	 edge.addOpenCylinder(8).rotation.x = Math.PI / 2;
	 edge.setMaterial(materials[1 + floor(i/8)]);
         mesh.add(edge);
      }
      return mesh;
   }
}
Hypercube.prototype = new Sketch;
addSketchType("Hypercube");

