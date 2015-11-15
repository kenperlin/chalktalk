
function StrokeShader(gl) {
   this._gl = gl;
   this.matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.radius0 = 0.1;
   this.radius1 = 0.1;

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

   this._program = gl.createProgram();
   this._addShader(gl.VERTEX_SHADER, this._vertexShader);
   this._addShader(gl.FRAGMENT_SHADER, this._fragmentShader);
   gl.linkProgram(this._program);
   this._buffer = gl.createBuffer();
   this._aPos = gl.getAttribLocation(this._program, 'aPos');
}

StrokeShader.prototype = {
   setMatrix : function(value) { this.matrix = value; },

   setLineWidth : function(width0, width1) {
      this.radius0 = width0 / 2;
      this.radius1 = def(width1, width0) / 2;
   },

   useProgram : function() {
      var gl = this._gl;
      gl.useProgram(this._program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this._aPos);
      gl.vertexAttribPointer(this._aPos, 2, gl.FLOAT, false, 0, 0);
   },

   draw : function(path, rgba) {
      var gl = this._gl, program = this._program;
      function address(name) { return gl.getUniformLocation(program, name); }

      if (rgba   === undefined) rgba = [1,1,1,1];

      gl.uniformMatrix4fv(address('uMatrix' ), false, this.matrix);
      gl.uniform1f       (address('uNpts'   ), path.length / 3);
      gl.uniform3fv      (address('uPath'   ), path);
      gl.uniform1f       (address('uRadius0'), this.radius0);
      gl.uniform1f       (address('uRadius1'), this.radius1);
      gl.uniform4fv      (address('uRgba'    ), [pow(rgba[0],.45),pow(rgba[1],.45),pow(rgba[2],.45),rgba[3]]);
      gl.uniform1f       (address('uScaleY' ), gl.canvas.width / gl.canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vertices.length / 2);
   },

   _vertexShader :
      ['precision highp float;'
      ,'attribute vec2 aPos;'
      ,'uniform mat4  uMatrix;'
      ,'uniform float uNpts;'
      ,'uniform vec3  uPath[1000];'
      ,'uniform float uRadius0;'
      ,'uniform float uRadius1;'
      ,'uniform float uScaleY;'
      ,'vec3 P(int i) { return (uMatrix * vec4(uPath[i], 1.)).xyz; }'
      ,'vec3 place(float f) {'
      ,'   float t = (.5 + .5 * max(-.9999, min(.9999, f))) * (uNpts - 1.);'
      ,'   int n = int(t);'
      ,'   return mix(P(n), P(n+1), t - float(n));'
      ,'}'
      ,'void main() {'
      ,'   vec3 pos;'
      ,'   if (aPos.y < -1.) {'
      ,'      vec3 p0 = P(0);'
      ,'      vec3 p1 = mix(p0, P(1), 0.001);'
      ,'      vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'      vec2 dp = aPos.x * u + (aPos.y + 1.) * v;'
      ,'      pos = p0 + vec3(uRadius0 * dp, 0.);'
      ,'   }'
      ,'   else if (aPos.y > 1.) {'
      ,'      int n = int(uNpts);'
      ,'      vec3 p0 = P(n-2);'
      ,'      vec3 p1 = mix(p0, P(n-1), 0.001);'
      ,'      vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'      vec2 dp = aPos.x * u + (aPos.y - 1.) * v;'
      ,'      pos = P(n-1) + vec3(uRadius1 * dp, 0.);'
      ,'   }'
      ,'   else {'
      ,'      vec3 p0 = place(aPos.y - .001);'
      ,'      vec3 p1 = place(aPos.y + .001);'
      ,'      float radius = mix(uRadius0, uRadius1, .5 + .5 * aPos.y);'
      ,'      float x = radius * aPos.x;'
      ,'      vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      pos = p1 + x * vec3(u, 0.);'
      ,'   }'
      ,'   gl_Position = vec4(1.,uScaleY,1.,1.) * vec4(pos, 1.);'
      ,'}'
      ].join('\n'),

   _fragmentShader :
      ['precision highp float;'
      ,'uniform vec4 uRgba;'
      ,'void main() {'
      ,'   gl_FragColor = uRgba;'
      ,'}'
      ].join('\n'),

   _vertices : (function() {
      var vertices = [];

      for (var a = Math.PI/2 ; a > 0 ; a -= 0.1) {
         var x = Math.cos(a);
         var y = Math.sin(a);
         vertices.push(-x); vertices.push(-y - 1);
         vertices.push( x); vertices.push(-y - 1);
      }
      for (var y = -1 ; y <= 1 ; y += 2 / 1000) {
         vertices.push(-1); vertices.push(y);
         vertices.push( 1); vertices.push(y);
      }
      for (var a = 0.1 ; a <= Math.PI/2 ; a += 0.1) {
         var x = Math.cos(a);
         var y = Math.sin(a);
         vertices.push(-x); vertices.push( y + 1);
         vertices.push( x); vertices.push( y + 1);
      }

      return new Float32Array(vertices);
   })(),

   _addShader : function(type, str) {
      var gl = this._gl;
      var s = gl.createShader(type);
      gl.shaderSource(s, str);
      gl.compileShader(s);
      gl.attachShader(this._program, s);
   },
}

