function() {
   window.spike_wander = false;
   this.labels = 'spiky1 spiky2'.split(' ');
   this.noise = new Noise();

   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 0: window.spike_wander = true; break;
      }
   }

   var myVertexShader = [
   ,'varying vec3 vPosition;'
   ,'varying vec3 vNormal;'
   ,'float displace(vec3 p) { return 0.2 * noise(vec3(p.x, p.y, p.z + 1.5 * uTime)); }'
   ,'void main() {'
   ,'   vNormal = normalize((modelViewMatrix * vec4(normal, 0.)).xyz);'
   ,'   vPosition = position;'
   ,'   float _d = displace(position);'
   ,'   float _x = displace(position + vec3(.001, 0., 0.));'
   ,'   float _y = displace(position + vec3(0., .001, 0.));'
   ,'   float _z = displace(position + vec3(0., 0., .001));'
   ,'   vNormal = normalize(vNormal + vec3(_x - _d, _y - _d, _z - _d) / .001);'
   ,'   gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1. - _d), 1.);'
   ,'}'
   ].join("\n");

   var myFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 15.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + .5 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 12.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + pow(max(0., S), 10.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.15,.05);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), alpha);'
   ,'}'
   ].join("\n");

   var p = (1 + sqrt(5)) / 2;
   var P = [ [-1, p, 0], [ 1, p, 0], [-1,-p, 0], [ 1,-p, 0],
             [0, -1, p], [0,  1, p], [0, -1,-p], [0,  1,-p],
             [ p, 0,-1], [ p, 0, 1], [-p, 0,-1], [-p, 0, 1] ];

   var V = [], T = [];

   var a = newVec();
   var b = newVec();

   this.render = function(elapsed) {

      this.duringSketch(function() {
         switch (this.labels[this.selection]) {

	 case 'spiky1':

	    if (V.length == 0) {
               V = [newVec(-1,0,0), newVec(1,0,0),
                    newVec(0,-1,0), newVec(0,1,0),
                    newVec(0,0,-1), newVec(0,0,1)];

               for (var i = 0 ; i <= 1 ; i++)
               for (var j = 2 ; j <= 3 ; j++)
               for (var k = 4 ; k <= 5 ; k++)
                  T.push([i,j,k]);
	    }
            mCurve([[0,-1],[ 1,0],[0, 1]]);
            mCurve([[0, 1],[-1,0],[0,-1]]);
            break;

	 case 'spiky2':

	    if (V.length == 0) {
               for (var i = 0 ; i < P.length ; i++)
                  V.push(newVec(P[i][0]*.6,P[i][1]*.6,P[i][2]*.6));

               T = [ [0, 11, 5],  [0,  5,  1],  [ 0,  1,  7],  [ 0, 7, 10],  [0, 10, 11],
                     [1,  5, 9],  [5, 11,  4],  [11, 10,  2],  [10, 7,  6],  [7,  1,  8],
                     [3,  9, 4],  [3,  4,  2],  [ 3,  2,  6],  [ 3, 6,  8],  [3,  8,  9],
                     [4,  9, 5],  [2,  4, 11],  [ 6,  2, 10],  [ 8, 6,  7],  [9,  8,  1], ];
	    }
            mCurve([[.5,-1],[1,0],[.5,1]]);
            mCurve([[.5,1],[-.5,1],[-1,0]]);
            mCurve([[-1,0],[-.5,-1],[.5,-1]]);
            break;
         }
      });

      this.vertexShader = myVertexShader;
      this.fragmentShader = myFragmentShader;

      this.afterSketch(function() {
         var body = this.mesh.children[0];
	 if (window.spike_wander) {
	    var s = elapsed / this.scale();
	    var freq = this.selection == 0 ? 2 : 1;

	    body.position.x += 2 * s;
	    body.position.y += 4 * s * noise2(freq * time, this.id);
	    body.position.z += 4 * s * noise2(freq * time, this.id + 10);

	    body.rotation.y += 4 * s * freq * noise2(freq * time, this.id + 30);
	    body.rotation.x +=     s * freq * noise2(freq * time, this.id + 40);
         }
         for (var i = 0 ; i < V.length ; i++) {
            var spike = body.children[T.length + i];
	    var v = V[i];
	    a.copy(v).multiplyScalar(.8 * (1 - .2 * this.noise.noise([v.x, v.y, v.z + 1.5 * time])));
	    b.copy(a).multiplyScalar(1.8);
            spike.placeStick(a, b);
         }
	 if (isFog)
	    this.setUniform('uFoggy', exp(-this.scale() * (this.selection == 0 ? 2 : 1)));
      });
   }

   this.createMesh = function() {

      var mesh = new THREE.Mesh();

      var body = new THREE.Mesh();
      mesh.add(body);

      for (var n = 0 ; n < T.length ; n++)
         body.addTriangle(V[T[n][0]], V[T[n][1]], V[T[n][2]]);

      for (var i = 0 ; i < V.length ; i++) 
         body.addStick(this.selection==0 ? .05 : .1, 0);

      mesh.setMaterial(this.shaderMaterial());
      return mesh;
   }
}
