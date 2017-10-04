"use strict";

// A PATH, EITHER FILLED OR RENDERED AS TAPERED STROKES.

CT.LINE_BUF_SIZE = 200;

CT.ShapePath = function() {
   this.draw = function() {
      this.setRGBA([1,0,0,1]);
      this.prototype.draw();
   }
   this._draw = function() {

      var path = this.getProperty('_path');
      for (var i = 4 ; i < path.length ; i += 4) // REMOVE ANY REPEATED POINTS BEFORE RENDERING.
         if ( path[i    ] == path[i - 4] &&
              path[i + 1] == path[i - 3] &&
              path[i + 2] == path[i - 2] &&
	      path[i + 3] == path[i - 1] ) {
            path.splice(i, 4);
	    i -= 4;
	 }
      if (! path)
         return;
      var gl      = this._gl,
          isFill  = this.getProperty('_isFill', false),
          program = this._program,
          rgba    = this.getProperty('_rgba', [1,1,1,1]);

      if (sketchPage.isFuzzyLines())
         gl.depthMask(false);

      gl.uniform1f       (this._address('uFill'  ), isFill ? 1 : 0);
      gl.uniform4fv      (this._address('uRgba'     ), [pow(rgba[0],.45),
                                                        pow(rgba[1],.45),
                                                        pow(rgba[2],.45), rgba[3]]);

      if (isFill) {                                   //------------- FILL ---------------
         var centroid = [0,0,0];
         for (var i = 0 ; i < path.length ; i += 4)
             for (var j = 0 ; j < 3 ; j++)
                centroid[j] += path[i + j] / (path.length / 4);
         gl.uniform3fv(this._address('uCentroid'), centroid);

	 var p, p0 = path.slice(0, 4), p1;            // REMEMBER VERY FIRST POINT.
         for (var i = 0 ; path.length ; i++) {        // KEEP GOING UNTIL PATH IS EMPTY.
	    p = path.splice(0, CT.LINE_BUF_SIZE);     // EACH SEGMENT IS A BUFFERFUL OF POINTS.
	    if (i > 0)
	       p = p1.concat(p);                      // PREPEND LAST POINT FROM PREV SEGMENT, IF ANY.
	    p1 = p.slice(p.length - 4, p.length);     // REMEMBER LAST POINT OF THIS SEGMENT.
	    if (path.length == 0)
	       p = p.concat(p0);                      // APPEND VERY FIRST POINT TO LAST SEGMENT.
            gl.uniform4fv(this._address('uPath'), p);
            this._drawArrays(2 * (p.length / 4));
         }
      }
      else {                                          //------------- STROKE --------------
         while (path.length) {
	    var p = path.splice(0, CT.LINE_BUF_SIZE);
            gl.uniform1f (this._address('uNpts'   ), p.length / 4);
            gl.uniform4fv(this._address('uPath'   ), p);
            gl.uniform1f (this._address('uRadius0'), this.getProperty('_radius0', 1));
            gl.uniform1f (this._address('uRadius1'), this.getProperty('_radius1', 1));
            this._drawArrays(2 * (p.length / 4 + 10));
	    if (path.length > 0) {
	       var n = p.length;
	       path.unshift(p[n-4], p[n-3], p[n-2], p[n-1]);
            }
         }
      }

      gl.depthMask(true);
   };
   this._useProgram = function() {
      if (! this._isLoaded())
	 this._attrib('_aPos', 2, 0);
   };
   this._vertices = (function() {
      var vertices = [];
      for (var y = 0 ; y < CT.LINE_BUF_SIZE ; y++)
         for (var x = 0 ; x <= 1 ; x++)
            vertices.push(x, y);
      return new Float32Array(vertices);
   })();
   this._defaultVertexShader =
      ['precision highp float;'
      ,'attribute vec2 aPos;'
      ,'uniform mat4  uMatrix;'
      ,'uniform vec4  uPath[' + CT.LINE_BUF_SIZE + '];'
      ,'uniform vec3  uCentroid;'
      ,'uniform float uFill, uNpts, uRadius0, uRadius1, uEye, uAspect, uTime;'
      ,'varying float vClipX;'
      ,'varying vec4 pos;'
      ,'varying vec2 dp;'
      ,'vec4 P(int i) { return uMatrix * vec4(uPath[i].xyz, 1.); }'
      ,'void main() {'
      ,'   if (uFill > 0.5)'
      ,'      pos = uMatrix * vec4(mix(uCentroid, uPath[int(aPos.y)].xyz, aPos.x), 1.);'
      ,'   else {'
      ,'      float x = mix(-1., 1., aPos.x);'
      ,'      float radius = mix(uRadius0, uRadius1, clamp((aPos.y - 5.) / uNpts, 0., 1.));'
      ,'      int n;'
      ,'      if (aPos.y <= 5.) {'
      ,'         n = 0;'
      ,'         pos = P(n);'
      ,'         vec4 p1 = mix(pos, P(n+1), 0.01);'
      ,'         vec2 u = normalize(vec2(pos.y - p1.y, p1.x - pos.x));'
      ,'         vec2 v = normalize(vec2(p1.x - pos.x, p1.y - pos.y));'
      ,'         float a = 3.14159 / 2. * aPos.y / 5.;'
      ,'         dp = x * sin(a) * u - cos(a) * v;'
      ,'      }'
      ,'      else if (aPos.y >= uNpts + 5.) {'
      ,'         n = int(uNpts) - 1;'
      ,'         pos = P(n);'
      ,'         vec4 p1 = mix(pos, P(n-1), -0.01);'
      ,'         vec2 u = normalize(vec2(pos.y - p1.y, p1.x - pos.x));'
      ,'         vec2 v = normalize(vec2(p1.x - pos.x, p1.y - pos.y));'
      ,'         float a = 3.14159 / 2. * (uNpts + 10. - aPos.y) / 5.;'
      ,'         dp = x * sin(a) * u + cos(a) * v;'
      ,'      }'
      ,'      else {'
      ,'         n = int(min(uNpts - 2., aPos.y - 5.));'
      ,'         pos = P(n);'
      ,'         vec4 p1 = mix(pos, P(n+1), 0.01);'
      ,'         float dx = p1.x - pos.x;'
      ,'         float dy = p1.y - pos.y;'
      ,'         dx = sign(dx) * max(abs(dx), 0.00001);'
      ,'         dy = sign(dy) * max(abs(dy), 0.00001);'
      ,'         dp = x * normalize(vec2(-dy, dx));'
      ,'      }'
      ,'      pos += vec4(radius * dp * uPath[n].w, 0., 0.);'
      ,'   }'
      ,    CT._vertexShaderPerspective
      ,'}'
      ].join('\n');

   this._defaultFragmentShader =

sketchPage.isFuzzyLines() ?

      ['precision highp float;'
      ,'uniform vec4  uRgba;'
      ,'uniform float uTime;'
      ,'varying vec4  pos;'
      ,'varying vec2  dp;'
      ,'varying float vClipX;'
      ,'void main() {'
      ,'   if (vClipX < 0.) discard;'
      ,'   float f = 1. - dot(dp, dp);'
      ,'   float g = f * f;'
      ,'   float h = g * g;'
      ,'   float i = h * h;'
      ,'   i *= fract(sin(uTime + dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453);'
      ,'   gl_FragColor = vec4(f,h,f,i+.3*f) * uRgba;'
      ,'}'
     ].join('\n')
:
      ['precision highp float;'
      ,'uniform vec4  uRgba;'
      ,'varying float vClipX;'
      ,'void main() {'
      ,'   if (vClipX < 0.) discard;'
      ,'   gl_FragColor = uRgba;'
      ,'}'
     ].join('\n');

}; CT.ShapePath.prototype = new CT.Shape;

CT.Path = function() {

// TODO: COMBINE MULTIPLE CALLS TO SINGLE draw() CALLS WHEREVER POSSIBLE
//       THAT IS: WHEN rgba MATCHES AND NOT isFill.

   this.drawsPerFrame = 0;

   this.drawPath = function() {
      this.draw();
      this.drawsPerFrame++;
   };

   this.sendToServer = function(isFill, path, rgba) {
      if (this._pathsData === undefined)
         this._pathsData = [];

      this._pathsData.push([isFill, path, rgba]);
   };
   this.setFill = function(isFill) {
      this._isFill = isFill;
   };
   this.setLineWidth = function(width0, width1) {
      var scale = isPhone() ? 1 : 0.5;
      this._radius0 = scale * width0;
      this._radius1 = scale * def(width1, width0);
   };
   this.setPath = function(src) {
      function P(_i) { return path[path.length - _i]; }
      function setP(_i, value) { path[path.length - _i] = value; }

      function addPointsAtSharpBends(src) {
         path = [];
         for (var i = 0 ; i < src.length ; i += 4) {
            var x = src[i], y = src[i + 1], z = src[i + 2], w = src[i + 3];
            if (path.length) {
               var ax = P(4) - P(8), ay = P(3) - P(7), az = P(2) - P(6),
	           bx = x    - P(4), by = y    - P(3), bz = z    - P(2);
	       var aa = ax * ax + ay * ay + az * az,
	           ab = ax * bx + ay * by + az * bz,
		   bb = bx * bx + by * by + bz * bz;
	       if (ab * ab < .9 * aa * bb) {
                  path.push(P(4), P(3), P(2), P(1));
                  setP(8, P(8) - .01 * ax);                // INSERT EXTRA POINTS
                  setP(7, P(7) - .01 * ay);                // AT SHARP BENDS
                  setP(6, P(6) - .01 * az);                // IN THE PATH.
		  if (i < src.length - 4) {
                     x += .01 * bx;
                     y += .01 * by;
                     z += .01 * bz;
                  }
	       }
            }
            path.push(x, y, z, w);
         }
	 return path;
      }

      var path = this._isFill ? src : addPointsAtSharpBends(src);
      if (path.length == 8) {
         path.push(P(4), P(3), P(2), P(1));
         path.push(P(4), P(3), P(2), P(1));
         for (var j = 1 ; j <= 4 ; j++) {
            setP(8 + j, mix(P(12 + j), P(j), .01));
            setP(4 + j, mix(P(12 + j), P(j), .99));
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

