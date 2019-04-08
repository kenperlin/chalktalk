function() {
   var p = [];
   for (let n = 0 ; n < 25 ; n++)
      p.push([2 * random() - 1, 2 * random() - 1]);
   this.label = 'crowd';
   this.render = function() {
      mCurve([[0,1],[-1,1],[-1,-1],[0,-1]]);
      mCurve([[0,1],[ 1,1],[ 1,-1],[0,-1]]);
      this.afterSketch(function() {
         for (let n = 0 ; n < p.length ; n++) {
	    let x = p[n][0], y = p[n][1];
	    if (x >  .8) x -= .003;
	    if (x < -.8) x += .003;
	    if (y >  .8) y -= .003;
	    if (y < -.8) y += .003;
	    p[n][0] = x + .001 * (random() - .5);
	    p[n][1] = y + .001 * (random() - .5);
         }
         for (let a = 0 ; a < p.length-1 ; a++)
         for (let b = a+1 ; b < p.length ; b++) {
	    let ax = p[a][0], ay = p[a][1];
	    let bx = p[b][0], by = p[b][1];
	    let x = bx - ax, y = by - ay, d = x * x + y * y;
	    if (d < .2) {
	       d *= 3000 * (.5 + .5 * random());
	       ax -= x / d;
	       ay -= y / d;
	       bx += x / d;
	       by += y / d;
	       p[a][0] = ax;
	       p[a][1] = ay;
	       p[b][0] = bx;
	       p[b][1] = by;
	    }
	 }
         for (let n = 0 ; n < p.length ; n++) {
	    m.save();
	       m.translate(p[n][0], p[n][1], 0);
	       m.rotateZ(n * .123 + sin(.3 * time + n));
	       mDrawRoundRect([-.1,-.03], [.1,.03], .03);
	       mFillOval([-.03,-.04], [.03,.04]);
	    m.restore();
	 }
      });
   }
}
