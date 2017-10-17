"use strict";

   var M4 = function() {
      this._mS = [];
      this._to = 0;
      this._mS[0] = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      this._m = function(arg) {
         if (! (arg === undefined))
            this._mS[this._to] = arg;
         return this._mS[this._to];
      };
      this.aimX = function(mat) {
         var A = this._m();
         var B = mat._m();
         var X = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var Z = [A[8], A[9], A[10]];
         var Y = cross(Z, X);
         cross(X, Y, Z);
         return this.setOrientation(X, Y, Z);
      };
      this.aimY = function(mat) {
         var A = this._m();
         var B = mat._m();
         var Y = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var X = [A[0], A[1], A[2]];
         var Z = cross(X, Y);
         cross(Y, Z, X);
         return this.setOrientation(X, Y, Z);
      };
      this.aimZ = function(mat) {
         var A = this._m();
         var B = mat._m();
         var Z = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var Y = [A[4], A[5], A[6]];
         var X = cross(Y, Z);
         cross(Z, X, Y);
         return this.setOrientation(X, Y, Z);
      };
      this.copy = function(m) {
         for (var i = 0 ; i < 16 ; i++)
            this._m()[i] = m._m()[i];
	 return this;
      };
      this.identity = function() {
         this._m(this._id());
         return this;
      };
      this._invert_tmp = newArray(16);
      this.invert = function() {
         var src = this._m();
         var tmp = this._invert_tmp;
         simpleInvert(src, tmp);
         for (var i = 0 ; i < 15 ; i++)
            src[i] = tmp[i];
      };
      this.normalMatrix = function(m) {
         var a = m[0]*m[0] + m[1]*m[1] + m[ 2]*m[ 2],
             b = m[4]*m[4] + m[5]*m[5] + m[ 6]*m[ 6],
             c = m[8]*m[8] + m[9]*m[9] + m[10]*m[10];
         return [m[0]/a,m[1]/a,m[ 2]/a,0,
                 m[4]/b,m[5]/b,m[ 6]/b,0,
                 m[8]/c,m[9]/c,m[10]/c,0,
                 0,0,0,1];
      };
      this.normalize = function(v) {
         var x = v[0],y = v[1],z = v[2],r = Math.sqrt(x*x + y*y + z*z);
         v[0] /= r;
         v[1] /= r;
         v[2] /= r;
      };
      this.perspective = function(x,y,z) {
         this._xf(this._pe(def(x),def(y),def(z)));
         return this;
      };
      this.restore = function() {
         --this._to;
      };
      this.rotateX = function(a) {
         this._xf(this._rX(def(a)));
         return this;
      };
      this.rotateY = function(a) {
         this._xf(this._rY(def(a)));
         return this;
      };
      this.rotateZ = function(a) {
         this._xf(this._rZ(def(a)));
         return this;
      };
      this.save = function() {
         this._mS[this._to+1] = this._mS[this._to++];
      };
      this.scale = function(x,y,z) {
         x = def(x);
         if (y === undefined)
            z = y = x;
         this._xf(this._sc(x,y,z));
         return this;
      };
      this.setOrientation = function(X, Y, Z) {
         this.normalize(X);
         this.normalize(Y);
         this.normalize(Z);

         var v = this._m();

	 var s0 = len(v[0], v[1], v[ 2]);
	 var s1 = len(v[4], v[5], v[ 6]);
	 var s2 = len(v[8], v[9], v[10]);

         v[0] = s0 * X[0]; v[1] = s0 * X[1]; v[ 2] = s0 * X[2];
         v[4] = s1 * Y[0]; v[5] = s1 * Y[1]; v[ 6] = s1 * Y[2];
         v[8] = s2 * Z[0]; v[9] = s2 * Z[1]; v[10] = s2 * Z[2];
         return this;
      }
      this.toString = function() {
         var str = "";
         for (var i = 0 ; i < 16 ; i++)
            str += (i==0 ? "[" : ",") + roundedString(this._m()[i]);
         return str + "]";
      }
      this.translate = function(x,y,z) {
         if (isDef(x) && Array.isArray(x))
            this._xf(this._tr(def(x[0]),def(x[1]),def(x[2])));
	 else
            this._xf(this._tr(def(x),def(y),def(z)));
         return this;
      };
      this.transpose = function(m) {
         return [m[0],m[4],m[ 8],m[12],
                 m[1],m[5],m[ 9],m[13],
                 m[2],m[6],m[10],m[14],
                 m[3],m[7],m[11],m[15]];
      };
      this._xf = function(m) {
         return this._m(this._mm(m,this._m()));
      };
      this._xf_ = function(m) {
         return this._m(this._mm(this._m(), m));
      };
      this._id = function() {
         return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
      };
      this._tr = function(x,y,z) {
         return [1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
      };
      this._rX = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
         return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];
      };
      this._rY = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
         return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];
      };
      this._rZ = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
         return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];
      };
      this._sc = function(x,y,z) {
         return [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
      };
      this._pe = function(x,y,z) {
         var rr = x*x + y*y + z*z;
         return [1,0,0,x/rr, 0,1,0,y/rr, 0,0,1,z/rr, 0,0,0,1];
      };
      this._d = function(a,b) {
         if (b instanceof THREE.Vector2) return a[0] * b.x + a[1] * b.y + a[3];
         if (b instanceof THREE.Vector3) return a[0] * b.x + a[1] * b.y + a[2] * b.z + a[3];
         if (b instanceof THREE.Vector4) return a[0] * b.x + a[1] * b.y + a[2] * b.z + a[3] * b.w;

         return a[0] * b[0] +
                a[1] * b[1] +
                ( b.length < 3 ? 0    : a[2] * b[2] ) +
                ( b.length < 4 ? a[3] : a[3] * b[3] ) ;
      };
      this._x = function(m) {
         return [m[0],m[1],m[2],m[3]];
      };
      this._y = function(m) {
         return [m[4],m[5],m[6],m[7]];
      };
      this._z = function(m) {
         return [m[8],m[9],m[10],m[11]];
      };
      this._w = function(m) {
         return [m[12],m[13],m[14],m[15]];
      };
      this._mm = function(a,b) {
         var t = this.transpose(b);

         var x = this._x(a), y = this._y(a), z = this._z(a), w = this._w(a);
         var X = this._x(t), Y = this._y(t), Z = this._z(t), W = this._w(t);

         return [this._d(x, X), this._d(x, Y), this._d(x, Z), this._d(x, W),
                 this._d(y, X), this._d(y, Y), this._d(y, Z), this._d(y, W),
                 this._d(z, X), this._d(z, Y), this._d(z, Z), this._d(z, W),
                 this._d(w, X), this._d(w, Y), this._d(w, Z), this._d(w, W)];
      };
      this._mv = function(m,src,dst) {
         if (dst === undefined)
	    dst = newArray(src.length);
         var M = this._m();
         var x = this._d( [M[0],M[4],M[ 8],M[12]] , src );
         var y = this._d( [M[1],M[5],M[ 9],M[13]] , src );
         var z = this._d( [M[2],M[6],M[10],M[14]] , src );
         var w = this._d( [M[3],M[7],M[11],M[15]] , src );
	 if (src.length == 4) {
	    dst[0] = x;
	    dst[1] = y;
	    dst[2] = z;
	    dst[3] = w;
	 }
	 else {
	    dst[0] = x / w;
	    dst[1] = y / w;
	    dst[2] = z / w;
	 }
	 return dst;
      };
      this.transform = function(src, dst) {
         if (dst === undefined)
	    dst = [];
         if (src === undefined)
	    return dst = [0,0,0];
         if (src[0] instanceof Array) {
            for (let n = 0 ; n < src.length ; n++)
               dst.push(this.transform(src[n]));
            return dst;
         }
         else
            return this._mv(this._m(), src, dst);
      }
   };
   function cross(a,b,c) {
      if (c === undefined)
         c = [0,0,0];
      c[0] = a[1] * b[2] - a[2] * b[1];
      c[1] = a[2] * b[0] - a[0] * b[2];
      c[2] = a[0] * b[1] - a[1] * b[0];
      return c;
   };
   function dot(a,b) {
      if (a.length < 3 || b.length < 3)
         return a[0] * b[0] + a[1] * b[1];
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
   };
   function norm(v) {
      return sqrt(normSqr(v));
   };
   function normSqr(v) {
      return dot(v, v);
   };
   function normalize(v) {
      var s = norm(v);
      for (let i = 0 ; i < v.length ; i++)
         v[i] /= s;
      return v;
   };
   function vecDiff(a, b) {
      return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
   };
   function vecScale(v, s) {
      return [v[0] * s, v[1] * s, v[2] * s];
   };
   function vecSum(a, b) {
      return [a[0] + b[0],a[1] + b[1],a[2] + b[2]];
   };

   function drawUnitDisk(rgb) { renderUnitDisk(mDrawFace, rgb); }
   function fillUnitDisk(rgb) { renderUnitDisk(mFillFace, rgb); }
   function renderUnitDisk(renderFunction, rgb) {
      var p = [];
      for (var i = 0 ; i < 20 ; i++) {
         var t =  i * TAU / 20 + PI;
         p.push([cos(t), sin(t), 0]);
      }
      renderFunction(p);
   }
   function drawUnitTube(rgb) { renderUnitTube(mDrawFace, rgb); }
   function fillUnitTube(rgb) { renderUnitTube(mFillFace, rgb); }
   function renderUnitTube(renderFunction, rgb) {
      for (var i = 0 ; i < 20 ; i++) {
         var t0 =  i    * TAU / 20 + PI;
         var t1 = (i+1) * TAU / 20 + PI;
         var s0 = sin(t0), c0 = cos(t0);
         var s1 = sin(t1), c1 = cos(t1);
         renderFunction([[c0,s0,1],[c0,s0,-1],[c1,s1,-1],[c1,s1,1]]);
      }
   }
   function drawUnitCube(rgb) { renderUnitCube(mDrawFace, rgb); }
   function fillUnitCube(rgb) { renderUnitCube(mFillFace, rgb); }
   var pCube = [[-1,-1,-1],[ 1,-1,-1],[-1, 1,-1],[ 1, 1,-1],
                [-1,-1, 1],[ 1,-1, 1],[-1, 1, 1],[ 1, 1, 1]];
   function renderUnitCube(renderFunction, rgb) {
      var p = pCube;
      var f = [[0,1,5,4],[0,2,3,1],[0,4,6,2],[1,3,7,5],[2,6,7,3],[6,4,5,7]];
      for (var i = 0 ; i < f.length ; i++)
         renderFunction([p[f[i][0]],p[f[i][1]],p[f[i][2]],p[f[i][3]]], rgb);
   }
   function drawUnitSquare() {
      mCurve([[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]);
   }
   function fillUnitSquare() {
      mFillFace([[-1,-1],[1,-1],[1,1],[-1,1]]);
      mDrawFace([[-1,-1],[1,-1],[1,1],[-1,1]]);
   }
   function standardView(x,y,phi,theta,psi,s, mat) {
      if (mat === undefined)
         mat = m;

      mat.identity();

      mat.translate(width()*x,height()*(1-y),0);

      mat.rotateX(phi);
      mat.rotateY(theta);
      mat.rotateZ(psi);

      s *= width();
      mat.scale(s,-s,s);
   };
   function standardViewInverse(x,y,phi,theta,psi,s, mat) {
      if (mat === undefined)
         mat = m;

      mat.identity();

      s *= width();
      mat.scale(1/s,-1/s,1/s);

      mat.rotateZ(-psi);
      mat.rotateY(-theta);
      mat.rotateX(-phi);

      mat.translate(-width()*x,-height()*(1-y),0);
   }
   function mDot(a, r, isOutlineOnly) {
      if (r === undefined) r = 0.1;
      var x = def(a.x, a[0]);
      var y = def(a.y, a[1]);
      var z = def(a.z, a[2]);
      r /= 5;
      var curve = [], n, theta, _m = m._m(), c, s;
      var X = normalize([_m[0], _m[4], _m[8]]);
      var Y = normalize([_m[1], _m[5], _m[9]]);
      for (n = 0 ; n < 20 ; n++) {
         theta = 2 * Math.PI * n / 20;
	 c = r * Math.cos(theta);
	 s = r * Math.sin(theta);
	 curve.push(mTransform([ x + c * X[0] + s * Y[0],
	                         y + c * X[1] + s * Y[1],
	                         z + c * X[2] + s * Y[2] ]));
      }
      if (isOutlineOnly)
         drawClosedCurve(curve);
      else
         fillCurve(curve);
   }
   function mSquareDot(a,r) {
      if (r === undefined) r = 0.1;
      if (a.x !== undefined)
         mFillRect([a.x-r,a.y-r],[a.x+r,a.y+r]);
      else
         mFillRect([a[0]-r,a[1]-r],[a[0]+r,a[1]+r]);
   }
   function mLineWidth(r) {
      lineWidth(mSizeOf(r))
   };
   function mSizeOf(r) {
      return norm(mTransform([r,0,0,0]));
   };
   (function() {
      var A = [0,0,0];
      var B = [0,0,0];
      window.mLine = function(a, b) {
         mTransform(a, A);
         mTransform(b, B);
         drawCurve([A, B]);
      }
   })();
   function mLines(lines) {
      for (var i = 0 ; i < lines.length - 1 ; i++)
         mLine(lines[i], lines[i+1]);
   };
   function mDraw(type, a, b) {
      var cx = a[0], cy = a[1], rx = a[2], ry = a[3];
      switch(type) {
      case 'line':
         mLine( [ cx - rx, cy - ry ], [ cx + rx, cy + ry ] );
	 if (isk())
	    sk().extendBounds([ [ cx - rx, cy - ry ], [ cx + rx, cy + ry ] ]);
	 break;
      case 'arc':
         var arc = [], t0 = 0, t1 = 360, t;
	 if (isDef(b) && Array.isArray(b)) {
	     t0 = def(b[0], 0);
	     t1 = def(b[1], 360);
         }
         function add(t) {
            arc.push( [ cx + rx * cos(t * PI / 180), cy + ry * sin(t * PI / 180) ] );
         }
         if (t0 < t1)
            for (t = t0 ; t <= t1 ; t += 10)
               add(min(t, t1));
         else
            for (t = t0 ; t >= t1 ; t -= 10)
               add(max(t, t1));
         mCurve(arc);
	 if (isk())
	    sk().extendBounds(arc);
         break;
      }
   };
   function mDrawFace(c, rgb) {
      if (rgb === undefined) rgb = 'black';
      var P = [];
      for (let n = 0 ; n < c.length ; n++)
         P.push(mTransform(c[n]));
      if (polygonArea(P) > 0)
         drawPolygon(P);
   };
   var mFillBackFaces = false;
   function mFillFace(c, rgb) {
      var P = [];
      for (let n = 0 ; n < c.length ; n++)
         P.push(mTransform(c[n]));
      if (mFillBackFaces || polygonArea(P) > 0)
         if (rgb === undefined)
            fillPolygon(P);
         else {
            var saveColor = color();
            color(rgb);
            fillPolygon(P);
            color(saveColor);
         }
   };
   function mCurves(c) {
      for (let n = 0 ; n < c.length ; n++)
         mCurve(c[n]);
   }
   function mCurve(c) {
      var cc = [];
      for (let n = 0 ; n < c.length ; n++)
         cc.push( isNumeric(c[n]) ? c[n] : mTransform(c[n]) );
      drawCurve(cc);
   };
   function mClosedCurve(c) {
      var cc = [];
      for (let n = 0 ; n < c.length ; n++)
         cc.push(mTransform(c[n]));
      drawClosedCurve(cc);
   };
   function mFillCurve(c) {
      var cc = [];
      for (let n = 0 ; n < c.length ; n++)
         cc.push(mTransform(c[n]));
      fillCurve(cc);
   };
   function mArrow(a, b, r) {
      if (r === undefined) r = 0.1;

      a[2] = def(a[2]);
      b[2] = def(b[2]);

      var A = mTransform(a);
      var B = mTransform(b);

      var U = [ r * (B[0] - A[0]), r * (B[1] - A[1]), r * (B[2] - A[2]) ];

      _g_beginPath();
      _g_sketchTo(A, 0);
      _g_sketchTo(B, 1);
      _g_stroke();

      _g_beginPath();
      _g_sketchTo([ B[0]-U[0]+U[1], B[1]-U[1]-U[0], B[2]-U[2] ], 0);
      _g_sketchTo(B, 1);
      _g_sketchTo([ B[0]-U[0]-U[1], B[1]-U[1]+U[0], B[2]-U[2] ], 1);
      _g_stroke();
   };
   function mParamCurves(params, curves) {
      var n, pcurves = buildParamCurves(params, curves);
      for (n = 0 ; n < pcurves.length ; n++)
         mCurve(pcurves[n]);
   };
   function mSpline(c) {
      mCurve(makeSpline(c));
   };
   (function() {
      var q = [0,0,0];
      window.mText = function(str,p,ax,ay) {
         mTransform(p, q);
         text(str, q, 0, ax, ay, undefined, m);
      };
   })();
   function mDrawRect(a, b) {
      mClosedCurve([a, [b[0], a[1], def(a[2])], b, [a[0], b[1], def(b[2])]]);
   };
   function mDrawRoundRect(a, b, r) {
      var curve = createRoundRect(min(a[0],b[0]), min(a[1],b[1]), abs(b[0]-a[0]), abs(b[1]-a[1]), r);
      curve.push(curve[0]);
      mCurve(curve);
   };
   function mFillRect(a, b) {
      var c = a.length == 2 ? [b[0],a[1]] : [b[0],a[1],a[2]];
      var d = b.length == 2 ? [a[0],b[1]] : [a[0],b[1],b[2]];
      mFillCurve([a, c, b, d]);
   };
   function mDrawDisk(center, r) {
      var x = center[0], y = center[1];
      mDrawOval([x - r, y - r], [x + r, y + r]);
   };
   function mXYZ(p, r) {
      var x = p[0], y = p[1], z = p[2];
      mLine([x-r, y, z], [x+r, y, z]);
      mLine([x, y-r, z], [x, y+r, z]);
      mLine([x, y, z-r], [x, y, z+r]);
   };
   function mFillDisk(center, r) {
      var x = center[0], y = center[1];
      mFillOval([x - r, y - r], [x + r, y + r]);
   };
   function mTransCube(rgb) {
      rgb = rgb ? rgb : [1,1,1];
      m.save();
         m.translate(0,0,-1);
         mSquare().setOpacity(.4).color(rgb);
         m.translate(0,0,1);

         m.rotateY(PI/2);
         m.translate(0,0,-1);
         mSquare().setOpacity(.4).color(rgb);
         m.translate(0,0,2);
         mSquare().setOpacity(.4).color(rgb);
         m.translate(0,0,-1);
         m.rotateY(-PI/2);

         m.rotateX(PI/2);
         m.translate(0,0,-1);
         mSquare().setOpacity(.4).color(rgb);
         m.translate(0,0,2);
         mSquare().setOpacity(.4).color(rgb);
         m.translate(0,0,-1);
         m.rotateX(-PI/2);

         m.translate(0,0,1);
         mSquare().setOpacity(.4).color(rgb);
      m.restore();
   };
   function createOval(a, b, n, theta0, theta1) {
      if (n      === undefined) n = 32;
      if (theta0 === undefined) theta0 = 0;
      if (theta1 === undefined) theta1 = TAU;
      var cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
      var rx = (b[0] - a[0]) / 2, ry = (b[1] - a[1]) / 2;
      var curve = [];
      for (var i = 0 ; i <= n ; i++) {
         var theta = mix(theta0, theta1, i / n);
         curve.push([cx + rx * cos(theta), cy + ry * sin(theta)]);
      }
      return curve;
   }
   function mDrawOval(a, b, n, theta0, theta1) {
      mCurve(createOval(a, b, n, theta0, theta1));
   };
   function mFillOval(a, b, n, theta0, theta1) {
      var curve = createOval(a, b, n, theta0, theta1);
      curve.push(mix(a, b, .5));
      mFillCurve(curve);
   };
   function mStickFigure(xyz, ht, isFemale) {
      var x = def(xyz[0]), y = def(xyz[1]), z = def(xyz[2]);
      ht = def(ht, 1);
      m.save();
      m.translate(x, y + .7 * ht, z);
      m.scale(3.5 * ht);
      mDrawOval([-.05,0], [.05,.1]);
      if (isFemale) {
         mLine([  0 ,  0 ], [  0 ,-.2 ]);
         mLine([  0 ,-.05], [-.15,-.15]);
         mLine([  0 ,-.05], [ .15,-.15]);
         mLine([-.05,.05 ],[-.06,-.02]);
         mLine([ .05,.05 ],[ .06,-.02]);
         mLine([  0 ,-.2 ],[-.1 ,-.35]);
         mLine([  0 ,-.2 ],[ .1 ,-.35]);
         mLine([-.1 ,-.35],[ .1 ,-.35]);
         mLine([-.03,-.35],[-.05,-.5 ]);
         mLine([ .03,-.35],[ .05,-.5 ]);
      }
      else {
         mLine([0,  0 ], [  0 ,-.2 ]);
         mLine([0,-.05], [-.15,-.15]);
         mLine([0,-.05], [ .15,-.15]);
         mLine([0,-.2 ], [-.1 ,-.5 ]);
         mLine([0,-.2 ], [ .1 ,-.5 ]);
      }
      m.restore();
   };
   function mTransform(v, dst) {
      return m.transform(v.x !== undefined ? [v.x, v.y, def(v.z)] : v, dst);
   };

var m = new M4();
