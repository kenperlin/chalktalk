function() {
   this.label = 'glasses';
   this.is3D = true;
   this.render = function() {
      m.translate(0,0,.5);

      mCurve(arc(-.4,  0, .3, PI/2  ,PI/2-TAU));
      mCurve(arc( .4,  0, .3, PI/2  ,PI/2-TAU));
      mCurve(arc(  0,-.1, .3, PI*2/3, PI/3));

      this.afterSketch(function() {
         for (var sign = -1 ; sign <= 1 ; sign += 2) {
	    m.save();
	    m.translate(sign * 0.62, 0.2, 0);
	    m.rotateY(PI / 2);
	    mCurve([[0,0]].concat(arc(1,-.2,.2,PI/2,-PI/3)));
	    m.restore();
         }
      });
   }
}

