function() {
   this.label = 'pulse';

   this.onClick = ['degree', () => degree = (degree + 1) % 4];

   var isConvolve = false;
   var degree = 0;

   var mDrawPolynomial = (x0, x1, coeffs) => {
      let C = [];
      for (let t = 0 ; t <= 1.001 ; t += 1/10)
         C.push([mix(x0, x1, t), evalPolynomial(t, coeffs)]);
      mCurve(C);
   }

   this.render = function() {
      switch (degree) {
      case 0:
	 mCurve([[-.5,0],[-.5,1],[.5,1],[.5,0]]);
	 break;
      case 1:
         mDrawPolynomial(-1, 0, [ 1, 0]);
         mDrawPolynomial( 0, 1, [-1, 1]);
	 break;
      case 2:
         mDrawPolynomial(-1.5, -.5, [ 1/2,  0, 0  ]);
         mDrawPolynomial( -.5,  .5, [-1  ,  1, 1/2]);
         mDrawPolynomial(  .5, 1.5, [ 1/2, -1, 1/2]);
	 break;
      case 3:
         mDrawPolynomial( 1,  2, [-1/6, 3/6,-3/6, 1/6]);
         mDrawPolynomial( 0,  1, [ 3/6,-6/6, 0  , 4/6]);
         mDrawPolynomial(-1,  0, [-3/6, 3/6, 3/6, 1/6]);
         mDrawPolynomial(-2, -1, [ 1/6, 0  , 0  , 0  ]);
	 break;
      }

   }
}

