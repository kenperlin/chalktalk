function() {
   this.label = 'leviathan';
   this.velocity = 0;

   this.onSwipe[0] = ['faster', function() { this.velocity += .1; }];
   this.onSwipe[4] = ['slower', function() { this.velocity -= .1; }];

   var n = 20;
   var nt = 40;

   var a = [];
   for (var i = 0 ; i < n ; i++)
      a.push(newVec3());

   var b = [];
   for (var i = 0 ; i < n ; i++)
      b.push(newVec3());

   var c = [];
   for (var i = 0 ; i < n ; i++)
      c.push(newVec3());

   var d = [];
   for (var i = 0 ; i < n ; i++)
      d.push(newVec3());

   var e = [newVec3(), newVec3()];

   var eyeFragmentShader = [
   ,'uniform float uFoggy;'
   ,'void main() {'
   ,'   vec3 color = vec3(1.,.0,.0);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), uAlpha);'
   ,'}'
   ].join("\n");

   var bodyFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 10.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + .5 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 24.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + pow(max(0., S), 10.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.2,.1);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), uAlpha);'
   ,'}'
   ].join("\n");

   var tentacleFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 10.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + .5 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 24.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + pow(max(0., S), 10.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.5,.5);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), 1.);'
   ,'}'
   ].join("\n");

   this.getEyeMaterial = function() {
      if (this._eyeMaterial === undefined) {
         this.fragmentShader = eyeFragmentShader;
         this._eyeMaterial = this.shaderMaterial();
      }
      return this._eyeMaterial;
   }

   this.getBodyMaterial = function() {
      if (this._bodyMaterial === undefined) {
         this.fragmentShader = bodyFragmentShader;
         this._bodyMaterial = this.shaderMaterial();
      }
      return this._bodyMaterial;
   }

   this.getTentacleMaterial = function() {
      if (this._tentacleMaterial === undefined) {
         this.fragmentShader = tentacleFragmentShader;
         this._tentacleMaterial = this.shaderMaterial();
      }
      return this._tentacleMaterial;
   }

   this.getLinkMaterial = function() {
      if (this._linkMaterial === undefined) {
         var r = 1, g = .5, b = .25;
         this._linkMaterial = new phongMaterial().setAmbient (.05*r,.05*g,.05*b)
                                                 .setDiffuse (.20*r,.20*g,.20*b)
                                                 .setSpecular(.17*r,.17*g,.17*b,30);
      }
      return this._linkMaterial;
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1,0], [1.0,  0]);
         mLine([ 1,0], [2.5, .3]);
         mLine([ 1,0], [2.5,  0]);
         mLine([ 1,0], [2.5,-.3]);
      });

      this.afterSketch(function() {
         var body = this.mesh.children[0];
         if (body.children.length == 0) {
            for (var i = 0 ; i < n ; i++) {
               var node = new THREE.Mesh(globeGeometry(32,16), this.getBodyMaterial());
               body.add(node);
            }
            for (var i = 0 ; i < n-1 ; i++) {
               var t0 = i / (n - 1);
               var t1 = (i+1) / (n - 1);
               var s0 = mix(.01, .15, t0);
               var s1 = mix(.01, .15, t1);
               var tube = new THREE.Mesh(new THREE.CylinderGeometry(s1, s0, 2, 24, 1, true), this.getBodyMaterial());
               tube.rotation.x = Math.PI / 2;
               var link = new THREE.Mesh();
               link.add(tube);
               body.add(link);
            }
            for (var i = 0 ; i < n ; i++) {
               var t = i / (n - 1);
               var s = mix(.007, .07, t);
               for (var j = 0 ; j < 3 ; j++) {
                  var tube = new THREE.Mesh(new THREE.CylinderGeometry(0, s, 2, 16, 1, true), this.getTentacleMaterial());
                  tube.rotation.x = Math.PI / 2;
                  var spike = new THREE.Mesh();
                  spike.add(tube);
                  body.add(spike);
               }
            }

            var tentacles = new THREE.Mesh();
            body.add(tentacles);
            for (var k = 0 ; k < 3 ; k++)
               tentacles.add(new THREE.Mesh());

            for (var k = 0 ; k < 3 ; k++) {
               var tentacle = tentacles.children[k];

               var firstNode = new THREE.Mesh();
               tentacle.add(firstNode);

               var node = firstNode;
               for (var i = 0 ; i < nt ; i++) {
                  var blob = new THREE.Mesh(globeGeometry(32,16), this.getTentacleMaterial());
                  node.add(blob);

                  var child = new THREE.Mesh();
                  node.add(child);
                  node = child;
               }
            }

            var leftEye  = new THREE.Mesh(globeGeometry(32,16), this.getEyeMaterial())
            var rightEye = new THREE.Mesh(globeGeometry(32,16), this.getEyeMaterial())

            body.add(leftEye );
            body.add(rightEye);
         }
         for (var i = 0 ; i < n ; i++) {
            var t = i / (n - 1);
            var s = mix(.01, .15, t);
            var theta = TAU * t + time;
            a[i].set(mix(-1,1,t), .1 * sin(theta), .1 * cos(theta));

            var phi = .2 * cos(theta);

            if (i == 1) s = .02;
            if (i == 0) s = .03;

            b[i].copy(a[i]);
            b[i].x += -2 * s * sin(phi);
            b[i].y +=  2 * s * cos(phi);
            b[i].z +=  s;

            c[i].copy(a[i]);
            c[i].x +=  2 * s * sin(phi);
            c[i].y += -2 * s * cos(phi);
            c[i].z +=  s;

            d[i].copy(a[i]);
            d[i].z -= 2 * s;

            if (i <= 1) {
               b[i].x -= 2*s;
               c[i].x -= 2*s;
               d[i].x -= 2*s;
            }

            if (i == n-1) {
               var phi0 = phi - PI / 16;
               var phi1 = phi + PI / 16;

               e[0].copy(a[i]);
               e[0].x += s * cos(phi0);
               e[0].y += s * sin(phi0);

               e[1].copy(a[i]);
               e[1].x += s * cos(phi1);
               e[1].y += s * sin(phi1);
            }
         }

         this.myExtendBounds = function(a) {
            var p = [0,0,0];
            for (var i = 0 ; i < a.length ; i++) {
               p[0] = a[i].x + body.position.x;
               p[1] = a[i].y;
               p[2] = a[i].z;
               this.extendBounds([p]);
            }
         }

         this.myExtendBounds(a);
         this.myExtendBounds(b);
         this.myExtendBounds(c);
         this.myExtendBounds(d);
         this.myExtendBounds(e);
         this.extendBounds([[2.2,0,0]]);

         for (var i = 0 ; i < n ; i++) {
            var t = i / (n - 1);
            var s = mix(.01, .15, t);
            var theta = TAU * t + time;
            var phi = .2 * cos(theta);

            var node = body.children[i];
            node.position.copy(a[i]);
            node.rotation.z = phi;
            node.scale.set(s, s, s * .95);

            if (i == n-1) {
               var head = node;
               var tentacles = body.children[body.children.length - 3];
               tentacles.position.copy(head.position);
               tentacles.rotation.copy(head.rotation);
               for (var k = 0 ; k < 3 ; k++) {
                  var tentacle = tentacles.children[k];

                  tentacle.rotation.x = TAU * k / 3;
                  tentacle.rotation.y = .5;
                  tentacle.scale.set(1.1,1.1,1.1);

                  var firstNode = tentacle.children[0];
                  firstNode.position.x = .1;
                  firstNode.rotation.y = -.2;

                  var node = firstNode;
                  for (var j = 0 ; j < nt ; j++) {
                     var t = j / (nt - 1);
                     var s = mix(.05, .01, t);
                     var blob = node.children[0];
                     blob.scale.set(s, s, s);
                     node = node.children[1];
                     node.position.x = s;
                     node.rotation.x =      noise(10 * k, .2 * time, 4 * TAU * t);
                     node.rotation.z = .5 * noise(10 * k, .2 * time, 4 * TAU * t + 10);
                  }
               }
            }
         }

         for (var i = 0 ; i < n-1 ; i++)
            body.children[n + i].placeStick(a[i], a[i+1]);

         for (var i = 0 ; i < n ; i++) {
            body.children[n + n-1 + 3 * i    ].placeStick(a[i], b[i]);
            body.children[n + n-1 + 3 * i + 1].placeStick(a[i], c[i]);
            body.children[n + n-1 + 3 * i + 2].placeStick(a[i], d[i]);
         }

         var leftEye  = body.children[body.children.length - 2];
         var rightEye = body.children[body.children.length - 1];

         leftEye .position.copy(e[0]);
         rightEye.position.copy(e[1]);

         leftEye .scale.set(.007,.007,.007);
         rightEye.scale.set(.007,.007,.007);

         body.position.x += this.velocity * elapsed;

         if (isFog) {
            var foggy = exp(-this.scale() * .07);
            this._eyeMaterial .setUniform('uFoggy', foggy);
            this._bodyMaterial.setUniform('uFoggy', foggy);
            this._tentacleMaterial.setUniform('uFoggy', foggy);
         }
      });
   }

   this.createMesh = function() {
      var body = new THREE.Mesh();
      var mesh = new THREE.Mesh();
      mesh.add(body);
      mesh.setMaterial(this.getBodyMaterial());
      return mesh;
   }
}
