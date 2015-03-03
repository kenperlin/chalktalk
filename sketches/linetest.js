function() {
   this.label = 'linetest';
   this.keys = [[-1,-1],[0,1],[0,-1],[1,1],[1,-1]];

   function makeArray2(n) {
      var dst = [];
      for (var i = 0 ; i < n ; i++)
         dst.push([0,0]);
      return dst;
   }

   this.npts = 256;
   this.spline = makeArray2(splineSize(this.keys));
   this.curve = makeArray2(this.npts);
   this.data = new Float32Array(2 * this.npts); 

   this.render = function() {
      this.duringSketch(function() {
         mCurve(this.keys);
	 this.uScale = this.scale();
      });
      this.afterSketch(function() {
         this.setUniform('uThickness', isNumeric(this.xlo) ? 10 / (this.xhi - this.xlo) : 1 / 15);

         this.keys[0][1] = sin(PI * time);
         this.keys[2][0] = .5 * cos(PI * time);
         this.keys[2][1] = .5 * sin(PI * time) - .5;
         this.keys[4][0] = .2 * sin(PI * time * 2) + 1;

	 makeSpline(this.keys, this.spline);
         resampleCurve(this.spline, this.npts, this.curve);
         for (var i = 0 ; i < this.npts ; i++) {
            this.data[2*i  ] = this.curve[i][0];
            this.data[2*i+1] = this.curve[i][1];
         }

	 var gl = renderer.context;
	 var program = this.mesh.material.program;
	 var dataLocation = gl.getUniformLocation(program, 'uData');

	 gl.useProgram(program);
	 gl.uniform2fv(dataLocation, this.data);
      });
   }

   this.vertexShader = [
   ,'const int npts = 256;'
   ,'uniform vec2 uData[npts];'
   ,'uniform float uThickness;'
   ,'vec3 place(float f) {'
   ,'   float t = max(0., min(.999, f)) * (float(npts) - 1.);'
   ,'   int n = int(t);'
   ,'   return vec3(mix(uData[n], uData[n+1], t - float(n)), 0.);'
   ,'}'
   ,'vec3 place1(float t) {'
   ,'   return vec3(.5 * sin(5. * t * 6.283 - uTime * 3.), 2. * t - 1., 0.);'
   ,'}'
   ,'void main() {'
   ,'   float t = position.y + .5;'
   ,'   vec3 p = place(t);'
   ,'   vec3 d = p - place(t - .01);'
   ,'   p += normalize(vec3(d.y, -d.x, 0.)) * position.x * uThickness;'
   ,'   gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);'
   ,'}'
   ].join('\n');

   this.fragmentShader = [
   ,'uniform float uThickness;'
   ,'void main() {'
   ,'   gl_FragColor = vec4(1.,1.,1.,alpha);'
   ,'}'
   ].join('\n');

   this.createMesh = function() {
      var material = new THREE.MeshBasicMaterial();
      var geometry = new THREE.CylinderGeometry(.5, .5, 1, 3, this.npts);
      return new THREE.Mesh(geometry, this.shaderMaterial());
   }
}
