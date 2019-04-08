window.armature = new (function() {

   var mt0 = new M4(), mt1 = new M4(), mTmp = new M4();

   this.evalHalfSpace = function(v, loc, dir, radius) {
      let d = dot(subtract(v, loc), dir);
      return sCurve(.5 + .5 * d / radius);
   }

   var aA = new M4();
   var bB = new M4();

   function computeBezier(am, bm, dir, A, B) {
      aA.copy(am).translate(def(A, [0,0,0]));
      bB.copy(bm).translate(def(B, [0,0,0]));
      let a  = aA.T(),
          d  = bB.T(),
          ad = distance(a, d),
          b  = aA.transform(scale(dir,  ad/3)),
          c  = bB.transform(scale(dir, -ad/3));
      return [a, b, c, d];
   }

   this.computeBezier = (am, bm, dir, A, B) => computeBezier(am, bm, dir, A, B);

   this.rope = (nu, nv, curve, radius, color) => {
      if (color === undefined)
         color = 'white';
      for (let t = 0 ; t < 1 - .001 ; t += 1/nv) {
         let A = sample(curve, t),
             B = sample(curve, t + 1/nv),
             D = subtract(B, A),
             L = norm(D);
         m.save();
            mTmp.identity().translate(A).aimAt(2, D, 0, [0,1,0]);
            m.multiply(mTmp);
            if (t > 0)
               mSphere(nu, nu).size(radius).color(color);
            mCylinder(nu).move(0,0,L/2).size(radius,radius,L/2).color(color);
         m.restore();
      }
   }

   this.snake = function(am, bm, dir, r, n, A, B) {
      let b = computeBezier(am, bm, dir, A, B);
      for (let t = 0 ; t <= 1 ; t += 1/n) {
	 mt1.identity().translate(evalBezier(t, b));
	 if (t > 0)
	    this.rod(mt0, mt1, r);
         mt0.copy(mt1);
      }
   }

   this.snakePart = function(am, bm, dir, t, drawFunc) {
      let b = computeBezier(am, bm, dir);
      mt0.identity().translate(evalBezier(t      , b));
      mt1.identity().translate(evalBezier(t + .01, b));
      mt0.aim(mt1, dir);
      this.part(mt0, drawFunc);
   }

   this.rod = function(a, b, r, A, B, color) {
      let d = distance(a.transform([0,0,0]),
                       b.transform([0,0,0]));
      aA.copy(a).translate(def(A, [0,0,0]));
      bB.copy(b).translate(def(B, [0,0,0]));
      mTmp.copy(aA).aimAt(2,subtract(bB.T(),aA.T())).scale(r,r,d/2).translate(0,0,1);
      this.part(mTmp, function() { mOpenCylinder(4).color(color); });
   }

   this.axes = function(mat, l, r) {
      this.part(mat, function() {
         mCube().move(l,0,0).size(l,r,r).color(1,0,0);
         mCube().move(0,l,0).size(r,l,r).color(0,1,0);
         mCube().move(0,0,l).size(r,r,l).color(0,0,1);
      });
   }

   this.limb = function(a, b, r, drawFunc) {
      this.part(mTmp.identity()
                    .translate(mix(a, b, .5))
                    .aimZ(b)
                    .scale(r, r, distance(a, b) / 2), drawFunc);
   }

   this.part = function(mat, drawFunc) {
      m.save();
         m.multiply(mat);
         drawFunc();
      m.restore();
   }

   this.curve = function(L, r, color) {
      for (let n = 1 ; n < L.length ; n++) {
         m.save();
            m.translate(mix(L[n-1], L[n], .5));
            m.multiply(mTmp.identity().aimAt(2, subtract(L[n], L[n-1]), 0, [0,1,0]));
            mOpenCylinder(4).size(r, r, distance(L[n-1], L[n]) * .5).color(color);
         m.restore();
      }
   }

   this.axesCurve = function(L, r, sep, color) {
      for (let n = 1 ; n < L.length ; n++) {
         m.save();
            m.translate(mix(L[n-1], L[n], .5));
            m.multiply(mTmp.identity().aimAt(2, subtract(L[n], L[n-1]), 0, [0,1,0]));
            mOpenCylinder(4).size(r, r, distance(L[n-1], L[n]) * .5).color(color);
	    m.translate(sep, 0, 0);
            mOpenCylinder(4).size(r, r, distance(L[n-1], L[n]) * .5).color([10,0,0]);
	    m.translate(-sep, sep, 0);
            mOpenCylinder(4).size(r, r, distance(L[n-1], L[n]) * .5).color([0,10,0]);
         m.restore();
      }
   }

   this.stroke = function(points, W, color) {
      color = def(color, [1,1,1]);
      let N = points.length - 1;
      if (N < 2)
         return;
      for (let t = 0 ; t <= 1.001 ; t += 1/N) {
         m.save();
            let p = sample(points, t);
            m.translate(p);
            mDisk().color(color).size(W/2);
            if (t < 1) {
               let d = scale(subtract(sample(points, t + 1/N), p), 1/2);
               m.translate(d);
               m.rotateZ(atan2(d[1], d[0]));
               m.scale(norm(d), W/2, 1);
               mSquare().color(color);
            }
         m.restore();
      }
   }

})();
