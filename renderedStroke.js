var _renderedStrokeUniqueShaderId = 0;

function RenderedStroke(gl) {
   this.material = new THREE.ShaderMaterial({
      vertexShader :
         ['precision highp float;'
         ,'uniform int id' + _renderedStrokeUniqueShaderId++ + ';'
         ,'uniform vec3 uData[1000];'
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
   this.gl = gl;
}

RenderedStroke.prototype = {
   render : function(curve, rgba) {
      if (this.glProgram === undefined) {
         this.glProgram = this.mesh.material.program.program;
         this.uData  = this.gl.getUniformLocation(this.glProgram, 'uData');
         this.uNpts  = this.gl.getUniformLocation(this.glProgram, 'uNpts');
         this.uColor = this.gl.getUniformLocation(this.glProgram, 'uColor');
      }

      for (var i = 0 ; i < curve.length ; i++)
         for (var j = 0 ; j < 3 ; j++)
            this.data[3 * i + j] = curve[i][j];

      this.gl.useProgram(this.glProgram);
      this.gl.uniform3fv(this.uData , this.data);
      this.gl.uniform1f (this.uNpts , curve.length);
      this.gl.uniform4fv(this.uColor, rgba);
   },
};
