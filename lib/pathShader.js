
function PathShader(gl) {
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

PathShader.prototype = {
   setMatrix : function(value) {
      this.matrix = value;
   },

   doDepthTest : function(yes) {
      var gl = this._gl;
      if (yes) {
         gl.enable(gl.DEPTH_TEST);
         gl.depthFunc(gl.LEQUAL);
      }
      else
         gl.disable(gl.DEPTH_TEST);
   },

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

   draw : function(path, rgba, isFill) {
      var gl = this._gl, program = this._program;
      function address(name) { return gl.getUniformLocation(program, name); }

      if (! rgba) rgba = [1,1,1,1];

      gl.uniform1f(address('uFill'), isFill ? 1 : 0);
      if (isFill) {
         var centroid = [0,0,0];
         for (var i = 0 ; i < path.length ; i += 3)
             for (var j = 0 ; j < 3 ; j++)
                centroid[j] += path[i + j] / (path.length / 3);
         gl.uniform3fv(address('uCentroid'), centroid);
         gl.uniform3fv(address('uPath'), path.concat([path[0],path[1],path[2]]));
      }
      else {
         gl.uniform1f (address('uNpts'   ), path.length / 3);
         gl.uniform3fv(address('uPath'   ), path);
         gl.uniform1f (address('uRadius0'), this.radius0);
         gl.uniform1f (address('uRadius1'), this.radius1);
      }
      gl.uniformMatrix4fv(address('uMatrix' ), false, this.matrix);
      gl.uniform4fv      (address('uRgba'    ), [pow(rgba[0],.45),pow(rgba[1],.45),pow(rgba[2],.45),rgba[3]]);
      gl.uniform1f       (address('uScaleY' ), gl.canvas.width / gl.canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * (path.length / 3 + (isFill ? 1 : 10)));
   },

   _vertexShader :
      ['precision highp float;'
      ,'attribute vec2 aPos;'
      ,'uniform float uFill;'
      ,'uniform mat4  uMatrix;'
      ,'uniform float uNpts;'
      ,'uniform vec3  uCentroid;'
      ,'uniform vec3  uPath[1000];'
      ,'uniform float uRadius0;'
      ,'uniform float uRadius1;'
      ,'uniform float uScaleY;'
      ,'vec3 P(int i) { return (uMatrix * vec4(uPath[i], 1.)).xyz; }'
      ,'void main() {'
      ,'   vec3 p0;'
      ,'   if (uFill > 0.5) {'
      ,'      p0 = mix(uCentroid, uPath[int(aPos.y)], aPos.x);'
      ,'      gl_Position = uMatrix * vec4(p0, 1.) * vec4(1.,uScaleY,1.,1.);'
      ,'      return;'
      ,'   }'
      ,'   float x = 2. * aPos.x - 1.;'
      ,'   float radius = mix(uRadius0, uRadius1, clamp((aPos.y - 5.) / uNpts, 0., 1.));'
      ,'   vec2 dp;'
      ,'   if (aPos.y <= 5.) {'
      ,'      p0 = P(0);'
      ,'      vec3 p1 = mix(p0, P(1), 0.01);'
      ,'      vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'      float a = 3.14159 / 2. * aPos.y / 5.;'
      ,'      dp = x * sin(a) * u - cos(a) * v;'
      ,'   }'
      ,'   else if (aPos.y >= uNpts + 5.) {'
      ,'      int n = int(uNpts);'
      ,'      p0 = P(n-1);'
      ,'      vec3 p1 = mix(p0, P(n-2), -0.01);'
      ,'      vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'      float a = 3.14159 / 2. * (uNpts + 10. - aPos.y) / 5.;'
      ,'      dp = x * sin(a) * u + cos(a) * v;'
      ,'   }'
      ,'   else {'
      ,'      int n = int(min(uNpts - 2., aPos.y - 5.));'
      ,'      p0 = P(n);'
      ,'      vec3 p1 = mix(p0, P(n+1), 0.01);'
      ,'      dp = x * normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'   }'
      ,'   gl_Position = vec4(p0 + vec3(radius * dp, 0.), 1.) * vec4(1.,uScaleY,1.,1.);'
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
      for (var y = 0 ; y < 1000 ; y++) {
         vertices.push(0); vertices.push(y);
         vertices.push(1); vertices.push(y);
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

