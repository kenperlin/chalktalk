function Flyers() {
   this.label = 'flyers';

   var nf = 50;

   var bodyFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform float uR;'
   ,'uniform float uG;'
   ,'uniform float uB;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 15.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   vec3 color = vec3(.2,.2,.2);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .55 * max(0.,D) + pow(max(0., S), 10.) );'
   ,'   }'
   ,'   color *= vec3(uR, uG, uB);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), 1.);'
   ,'}'
   ].join("\n");

   var wingFragmentShader = [
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

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([0,-1],[0,1]);
         mCurve([[0,0],[-.5,.5],[-1,0]]);
         mCurve([[0,0],[ .5,.5],[ 1,0]]);
      });
      this.afterSketch(function() {
	 for (var n = 0 ; n < nf ; n++) {

	    var t = .7 * TAU * time + 100. * noise2(.1 * n, 100.1 * n);

            var bird = this.mesh.children[n];
	    var body = bird.children[0];

/*
	    bird.position.x = 20 * noise(100. * n, .1 * time, 10.5);
	    bird.position.y = 20 * noise(100. * n, .1 * time, 20.5);
	    bird.position.z = 20 * noise(100. * n, .1 * time, 30.5);
*/
	    bird.rotation.z += elapsed;

	    var perspective = 33 / (33 + bird.position.y - bird.position.z);
	    //perspective = 1;

	    body.position.z += .05 * sin(t);
	    body.scale.x = body.scale.y = body.scale.z = perspective;

	    var foggy = exp(-this.scale() * perspective * .5);

	    for (var i = 0 ; i < 2 ; i++) {
	       var sgn = i == 0 ? -1 : 1;
               var wing1 = body.children[i];
               var wing2 = wing1.children[0];
	       wing1.rotation.y = .2 * cos(t) * sgn;
	       wing2.rotation.y = .4 * sin(t) * sgn;

	       var wing3 = wing2.children[0];
	       if (wing3 !== undefined)
	          wing3.rotation.y = -.2 * cos(t) * sgn;

               if (window.isFog !== undefined)
                  wing1.material.setUniform('uFoggy', foggy);
            }
            if (window.isFog !== undefined)
               body.material.setUniform('uFoggy', foggy);
         } 
      });
   }
   this.createMesh = function() {

      var mesh = new THREE.Mesh();

      for (var n = 0 ; n < nf ; n++) {

         var bird = new THREE.Mesh();
         var body = new THREE.Mesh();
	 bird.add(body);
         mesh.add(bird);

	 bird.position.x = 20 * noise(100. * n, .1 * time, 10.5);
	 bird.position.y = 20 * noise(100. * n, .1 * time, 20.5);
	 bird.position.z = 20 * noise(100. * n, .1 * time, 30.5);

	 bird.rotation.z = mix(0, TAU, n/nf);

	 body.position.x = 8;

         for (var i = 0 ; i < 2 ; i++) {
            var sgn = i == 0 ? -1 : 1;

            var wing1 = new THREE.Mesh();
            var wing2 = new THREE.Mesh();
            var wing3 = new THREE.Mesh();
            wing2.add(wing3);
            wing1.add(wing2);
            body.add(wing1);

            wing1.addQuadrangle(newVec(        0, .25),
                                newVec(sgn *  .3, .5 ),
                                newVec(sgn *  .3,-.25),
                                newVec(sgn * .03,  0 ));
            wing1.position.x = 0.05 * sgn;

            wing2.addQuadrangle(newVec(       0, .5 ),
                                newVec(sgn * .6, .3 ),
                                newVec(sgn * .6, .0 ),
                                newVec(       0,-.25));
            wing2.position.x = 0.3 * sgn;

            wing3.addQuadrangle(newVec(       0, .3 ),
                                newVec(sgn * .4, .1 ),
                                newVec(sgn * .2, .0 ),
                                newVec(       0, .0 ));
            wing3.position.x = 0.6 * sgn;
         }

         var bodyGeometry = globeGeometry(16, 8);
         var vertices = bodyGeometry.vertices;
         for (var i = 0 ; i < vertices.length ; i++) {
            var v = vertices[i];
            if (v.y < .5) {
               var r = sCurve((v.y + 1) / 1.5);
               v.x *= r;
               v.z *= r;
            }
         }
         bodyGeometry.computeCentroids();
         bodyGeometry.computeVertexNormals();

         var bodyShape = new THREE.Mesh(bodyGeometry);
         bodyShape.position.set(0,-.3,0);
         bodyShape.scale.set(.1,.7,.1);
         body.add(bodyShape);

         this.fragmentShader = bodyFragmentShader;
         body.setMaterial(this.shaderMaterial());

         function sr() { return sCurve(random()); }
	 colorVec.set(sr(), sr(), sr()).normalize();
	 body.material.setUniform('uR', colorVec.x);
	 body.material.setUniform('uG', colorVec.y);
	 body.material.setUniform('uB', colorVec.z);

         this.fragmentShader = wingFragmentShader;
         for (var i = 0 ; i < 2 ; i++)
            body.children[i].setMaterial(this.shaderMaterial());
      }

      return mesh;
   }

   var colorVec = newVec();
}
Flyers.prototype = new Sketch;
addSketchType('Flyers');

