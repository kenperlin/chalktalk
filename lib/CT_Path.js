
// A PATH, EITHER FILLED OR RENDERED AS TAPERED STROKES.

CT.ShapePath = function() {
   this._draw = function() {
      var path = this.getProperty('_path');
      for (var i = 3 ; i < path.length ; i += 3) // REMOVE ANY REPEATED POINTS BEFORE RENDERING.
         if ( path[i    ] == path[i - 3] &&
              path[i + 1] == path[i - 2] &&
              path[i + 2] == path[i - 1] ) {
            path.splice(i, 3);
	    i -= 3;
	 }
      if (! path)
         return;
      var gl      = this._gl,
          isFill  = this.getProperty('_isFill', false),
          program = this._program,
          rgba    = this.getProperty('_rgba', [1,1,1,1]);
      gl.uniform1f(this._address('uFill'), isFill ? 1 : 0);
      gl.uniformMatrix4fv(this._address('uMatrix' ), false, this._renderMatrix);
      gl.uniform4fv      (this._address('uRgba'   ), [pow(rgba[0],.45),
                                                      pow(rgba[1],.45),
                                                      pow(rgba[2],.45), rgba[3]]);
      if (isFill) {
	 path = path.splice(0, 999);
         var centroid = [0,0,0];
         for (var i = 0 ; i < path.length ; i += 3)
             for (var j = 0 ; j < 3 ; j++)
                centroid[j] += path[i + j] / (path.length / 3);
         gl.uniform3fv(this._address('uCentroid'), centroid);
         gl.uniform3fv(this._address('uPath'), path.concat([path[0],path[1],path[2]]));
         this._drawArrays(2 * (path.length / 3 + 1));
      }
      else {
         while (path.length) {
	    var p = path.splice(0, 999);
            gl.uniform1f (this._address('uNpts'   ), p.length / 3);
            gl.uniform3fv(this._address('uPath'   ), p);
            gl.uniform1f (this._address('uRadius0'), this.getProperty('_radius0', 0.1));
            gl.uniform1f (this._address('uRadius1'), this.getProperty('_radius1', 0.1));
            this._drawArrays(2 * (p.length / 3 + 10));
         }
      }
   };
   this._useProgram = function() {
      if (! this._isLoaded())
	 this._attrib('_aPos', 2, 0);
   };
   this._vertices = (function() {
      var vertices = [];
      for (var y = 0 ; y < 1000 ; y++)
         for (var x = 0 ; x <= 1 ; x++)
            vertices.push(x, y);
      return new Float32Array(vertices);
   })();
   this._defaultVertexShader =
      ['precision highp float;'
      ,'attribute vec2 aPos;'
      ,'uniform mat4  uCamMatrix, uMatrix;'
      ,'uniform vec3  uCentroid, uPath[1000];'
      ,'uniform float uFill, uNpts, uRadius0, uRadius1, uEye;'
      ,'vec3 P(int i) { return (uMatrix * vec4(uPath[i], 1.)).xyz; }'
      ,'void main() {'
      ,'   vec3 p0;'
      ,'   vec4 pos;'
      ,'   if (uFill > 0.5) {'
      ,'      p0 = mix(uCentroid, uPath[int(aPos.y)], aPos.x);'
      ,'      pos = uMatrix * vec4(p0, 1.);'
      ,'   }'
      ,'   else {'
      ,'      float x = mix(-1., 1., aPos.x);'
      ,'      float radius = mix(uRadius0, uRadius1, clamp((aPos.y - 5.) / uNpts, 0., 1.));'
      ,'      vec2 dp;'
      ,'      if (aPos.y <= 5.) {'
      ,'         p0 = P(0);'
      ,'         vec3 p1 = mix(p0, P(1), 0.01);'
      ,'         vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'         vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'         float a = 3.14159 / 2. * aPos.y / 5.;'
      ,'         dp = x * sin(a) * u - cos(a) * v;'
      ,'      }'
      ,'      else if (aPos.y >= uNpts + 5.) {'
      ,'         int n = int(uNpts);'
      ,'         p0 = P(n-1);'
      ,'         vec3 p1 = mix(p0, P(n-2), -0.01);'
      ,'         vec2 u = normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'         vec2 v = normalize(vec2(p1.x - p0.x, p1.y - p0.y));'
      ,'         float a = 3.14159 / 2. * (uNpts + 10. - aPos.y) / 5.;'
      ,'         dp = x * sin(a) * u + cos(a) * v;'
      ,'      }'
      ,'      else {'
      ,'         int n = int(min(uNpts - 2., aPos.y - 5.));'
      ,'         p0 = P(n);'
      ,'         vec3 p1 = mix(p0, P(n+1), 0.01);'
      ,'         dp = x * normalize(vec2(p0.y - p1.y, p1.x - p0.x));'
      ,'      }'
      ,'      pos = vec4(p0 + vec3(radius * dp, 0.), 1.);'
      ,'   }'
      ,'   pos = uCamMatrix * pos;'
      ,'   pos = vec4(mix(pos.xy, vec2(uEye*max(0., .5*uEye*pos.x + .16*pos.z + .5), .5*pos.y), uEye*uEye), pos.zw);'
      ,'   gl_Position = vec4(pos.xy, pos.z / 10. + .2, pos.w);'

      ,'}'
      ].join('\n');

   this._defaultFragmentShader =
      ['precision highp float;'
      ,'uniform vec4 uRgba;'
      ,'void main() {'
      ,'   gl_FragColor = uRgba;'
      ,'}'
     ].join('\n');
}; CT.ShapePath.prototype = new CT.Shape;

CT.Path = function() {
   this.setFill = function(isFill) {
      this._isFill = isFill;
   };
   this.setLineWidth = function(width0, width1) {
      this._radius0 = width0 / 2;
      this._radius1 = def(width1, width0) / 2;
   };
   this.setPath = function(src) {
      function P(_i) { return path[path.length - _i]; }
      function setP(_i, value) { path[path.length - _i] = value; }
      var path = [];
      for (var i = 0 ; i < src.length ; i += 3) {
         var x = src[i], y = src[i + 1], z = src[i + 2];
         if (path.length >= 6) {
            var ax = P(3) - P(6), ay = P(2) - P(5), bx = x - P(3), by = y - P(2);
	    if ( (ax*bx+ay*by) * (ax*bx+ay*by) < .9 * (ax*ax+ay*ay) * (bx*bx+by*by) ) {
               path.push(P(3), P(2), P(1));             //
               setP(6, P(6) - .01 * ax);                // INSERT EXTRA POINTS
               setP(5, P(5) - .01 * ay);                // AT SHARP BENDS
               x += .01 * bx;                           // IN THE PATH.
               y += .01 * by;                           //
	    }
         }
         path.push(x, y, z);
      }
      if (path.length == 6) {
         path.push(P(3), P(2), P(1));
         path.push(P(3), P(2), P(1));
         for (var j = 1 ; j <= 3 ; j++) {
            setP(6 + j, mix(P(9 + j), P(j), .01));
            setP(3 + j, mix(P(9 + j), P(j), .99));
         }
      }
      this._path = path;
   };
   this.setRGBA = function(rgba) {
      this._rgba = cloneArray(rgba);
   };
   this.init(new CT.ShapePath());
};
CT.Path.prototype = new CT.Object;

