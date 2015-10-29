var _renderedStrokeUniqueShaderId = 0;

function RenderedStroke(size) {
   this.material = new THREE.ShaderMaterial({
      vertexShader :
         ['precision highp float;'
         ,'uniform int id' + _renderedStrokeUniqueShaderId++ + ';'
         ,'uniform vec3 uData[' + size + '];'
         ,'uniform float uNpts;'
         ,'vec4 place(float f) {'
         ,'   float t = max(0., min(.999, f)) * (uNpts - 1.);'
         ,'   int n = int(t);'
         ,'   return vec4(mix(uData[n], uData[n+1], t - float(n)), 1.);'
         ,'}'
         ,'void main() {'
         ,'   vec4 p0 = projectionMatrix * modelViewMatrix * place(position.y + .5 );'
         ,'   vec4 p1 = projectionMatrix * modelViewMatrix * place(position.y + .51);'
         ,'   gl_Position = p1 + normalize(vec4(p1.y-p0.y, p0.x-p1.x, 0., 0.)) * position.x * 1.5;'
         ,'}'
         ].join('\n'),
      fragmentShader :
         'precision highp float\n;uniform vec4 uColor\n;void main() { gl_FragColor = uColor; }',
   });
   this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1,2,1000), this.material);
   this.data = [];
}

RenderedStroke.prototype = {
   render : function(curve, rgba) {
      if (! this.mesh.material.program) {
         console.log('no material program');
         return;
      }

      this.glProgram = this.mesh.material.program.program;
      this.uData  = gl().getUniformLocation(this.glProgram, 'uData');
      this.uNpts  = gl().getUniformLocation(this.glProgram, 'uNpts');
      this.uColor = gl().getUniformLocation(this.glProgram, 'uColor');

      for (var i = 0 ; i < curve.length ; i++)
         for (var j = 0 ; j < 3 ; j++)
            this.data[3 * i + j] = curve[i][j];

      gl().useProgram(this.glProgram);
      gl().uniform3fv(this.uData , this.data);
      gl().uniform1f (this.uNpts , curve.length);
      gl().uniform4fv(this.uColor, rgba);
   },
};
