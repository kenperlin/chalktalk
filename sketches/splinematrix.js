function() {
   var data = [
      [[2,-3,0,1],[-2,3,0,0],[1,-2,1,0],[1,-1,0,0]],
      [[-1,3,-3,1],[3,-6,3,0],[-3,3,0,0],[1,0,0,0]],
   ];
   this.labels = 'Hermite Bezier'.split(' ');
   this.render = function() {
      var s = this.selection;
      this.duringSketch(function() {
         switch (this.labels[s]) {
	 case 'Hermite':
            mLine([-1, 1],[-1,-1]);
            mLine([-1, 0],[ 1, 0]);
            mLine([ 1, 1],[ 1,-1]);
            break;
	 case 'Bezier':
            mLine([-1, 1],[-1,-1]);
	    mCurve( [[-1,1],[-.5,1]].concat(makeOval(-1,0,1,1,16,PI/2,-PI/2))
	                            .concat([[-.5,0],[-1,0]]) );
	    mCurve( [[-1,0],[-.25,0]].concat(makeOval(-.75,-1,1,1,16,PI/2,-PI/2))
	                             .concat([[-.25,-1],[-1,-1]]) );
            break;
         }
      });
      this.afterSketch(function() {
         for (var i = 0 ; i <= 4 ; i++) {
	    var t = i / 2 - 1;
	    mLine([-1,t],[1,t]);
	    mLine([t,-1],[t,1]);
         }
	 textHeight(this.mScale(.2));
	 for (var i = 0 ; i < 4 ; i++)
	 for (var j = 0 ; j < 4 ; j++) {
	    var x = i / 2 - 1 + .25;
	    var y = j / 2 - 1 + .25;
	    mText(data[s][i][j], [x,-y], .5,.5);
	 }
      });
   }
}
