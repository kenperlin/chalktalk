
function FillShader(gl) {
   this._gl = gl;
   this.matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

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

FillShader.prototype = {
   setMatrix : function(value) { this.matrix = value; },

   doDepthTest : function(yes) {
      var gl = this._gl;
      if (yes) {
	 gl.enable(gl.DEPTH_TEST);
         gl.depthFunc(gl.LEQUAL);
      }
      else
	 gl.disable(gl.DEPTH_TEST);
   },

   useProgram : function() {
      var gl = this._gl;
      gl.useProgram(this._program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this._aPos);
      gl.vertexAttribPointer(this._aPos, 2, gl.FLOAT, false, 0, 0);
   },

   draw : function(p, rgba) {
      var gl = this._gl, program = this._program;
      function address(name) { return gl.getUniformLocation(program, name); }

      if (rgba === undefined) rgba = [1,1,1,1];

      var centroid = [0,0,0];
      for (var i = 0 ; i < p.length ; i += 3)
         for (var j = 0 ; j < 3 ; j++)
            centroid[j] += p[i + j] / (p.length / 3);

      gl.uniformMatrix4fv(address('uMatrix'  ), false, this.matrix);
      gl.uniform3fv      (address('uPath'    ), p.concat([p[0],p[1],p[2]]));
      gl.uniform3f       (address('uCentroid'), centroid[0], centroid[1], centroid[2]);
      gl.uniform4fv      (address('uRgba'    ), [pow(rgba[0],.45),pow(rgba[1],.45),pow(rgba[2],.45),rgba[3]]);
    //gl.uniform4fv      (address('uRgba'    ), rgba);
      gl.uniform1f       (address('uScaleY'  ), gl.canvas.width / gl.canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * (p.length / 3 + 1));
   },

   _vertexShader :
      ['precision highp float;'
      ,'attribute vec2 aPos;'
      ,'uniform mat4  uMatrix;'
      ,'uniform vec3  uPath[1000];'
      ,'uniform vec3  uCentroid;'
      ,'uniform float uScaleY;'
      ,'void main() {'
      ,'   vec3 pos = mix(uCentroid, uPath[int(aPos.y)], aPos.x);'
      ,'   gl_Position = uMatrix * vec4(pos, 1.) * vec4(1.,uScaleY,1.,1.);'
      ,'}'
      ].join('\n'),

   _fragmentShader :
      ['precision highp float;'
      ,'   uniform vec4 uRgba;'
      ,'   void main() {'
      ,'   gl_FragColor = uRgba;'
      ,'}'
      ].join('\n'),

   _vertices : (function() {
      var vertices = [];
      for (var y = 0 ; y <= 1000 ; y++) {
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

