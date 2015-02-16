
function Leviathan() {
   this.label = 'leviathan';
   this.velocity = 0;

   var n = 20;

   var a = [];
   for (var i = 0 ; i < n ; i++)
      a.push(newVec());

   var b = [];
   for (var i = 0 ; i < n ; i++)
      b.push(newVec());

   var c = [];
   for (var i = 0 ; i < n ; i++)
      c.push(newVec());

   var d = [];
   for (var i = 0 ; i < n ; i++)
      d.push(newVec());

   var e = [newVec(), newVec()];

   var eyeFragmentShader = [
   ,'uniform float uFoggy;'
   ,'void main() {'
   ,'   vec3 color = vec3(1.,.0,.0);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), uAlpha);'
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

   this.getEyeMaterial = function() {
      if (this._eyeMaterial === undefined) {
         this.fragmentShader = eyeFragmentShader;
         this._eyeMaterial = this.shaderMaterial();
      }
      return this._eyeMaterial;
   }

   this.getBodyMaterial = function() {
      if (this._bodyMaterial === undefined) {
         this.fragmentShader = myFragmentShader;
         var r = 1, g = .5, b = .25;
         this._bodyMaterial = this.shaderMaterial([r/200,g/200,b/200],
                                                [r/ 30,g/ 30,b/ 30],
                                                [r/  2,g/  2,b/  2, 2]);
      }
      return this._bodyMaterial;
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

   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 0: this.velocity += .1; break;
      case 2: this.velocity -= .1; break;
      }
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1,0], [1, .2]);
         mLine([-1,0], [1,-.2]);
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
	          var tube = new THREE.Mesh(new THREE.CylinderGeometry(0, s, 2, 16, 1, true), this.getBodyMaterial());
	          tube.rotation.x = Math.PI / 2;
	          var spike = new THREE.Mesh();
	          spike.add(tube);
	          body.add(spike);
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

         for (var i = 0 ; i < n ; i++) {
	    var t = i / (n - 1);
	    var s = mix(.01, .15, t);
	    var theta = TAU * t + time;
	    var phi = .2 * cos(theta);

	    var node = body.children[i];
	    node.position.copy(a[i]);
	    node.rotation.z = phi;
	    node.scale.set(s, s, s * .95);
         }

         for (var i = 0 ; i < n-1 ; i++)
	    body.children[n + i].placeLink(a[i], a[i+1]);

         for (var i = 0 ; i < n ; i++) {
	    body.children[n + n-1 + 3 * i    ].placeLink(a[i], b[i]);
	    body.children[n + n-1 + 3 * i + 1].placeLink(a[i], c[i]);
	    body.children[n + n-1 + 3 * i + 2].placeLink(a[i], d[i]);
         }

	 var leftEye  = body.children[body.children.length - 2];
	 var rightEye = body.children[body.children.length - 1];

	 leftEye .position.copy(e[0]);
	 rightEye.position.copy(e[1]);

	 leftEye .scale.set(.007,.007,.007);
	 rightEye.scale.set(.007,.007,.007);

         body.position.x += this.velocity * elapsed;

         var foggy = exp(-this.scale() * .03);
         this._eyeMaterial .setUniform('uFoggy', foggy);
         this._bodyMaterial.setUniform('uFoggy', foggy);
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
Leviathan.prototype = new Sketch;
addSketchType("Leviathan");

