function() {
   this.label = 'seehand';
   var handShape = makeSpline([[-.70,-1.2],[-.71,-.95],[-.75,-.8],[-.92,-.4],[-.98,0],
                               [-.90,.33],[-.8,.33],[-.75,.25],[-.78,-.1],[-.70,-.3],
                               [-.60,-.3],[-.57,.82],[-.5,.87],[-.43,.82],[-.38,0],
                               [-.34, .0],[-.29,.90],[-.22,.95],[-.15,.90],[-.12,0],
                               [-.08, .0],[-.06,.78],[.01,.83],[0.08,.78],[0.13, -.1],
			       [0.15,-.1],[0.19,.18],[0.18,.48],[.25,.54],[0.32,.5],[0.37,0],
			       [0.29,-.5],[.14,-.9],[.10,-1.2],
			      ]);
   var hand0 = newVec3(), hand = newVec3(-2,0,0);
   this.onPress = function(point) { hand0.copy(point); }
   this.onDrag  = function(point) { hand.sub(hand0).add(point); hand0.copy(point); }
   this.render = function() {
      mClosedCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mCurve(arc(0,0,.5,PI/2,-3*PI/2));
      this.afterSketch(function() {
         this.extendBounds([[-abs(hand.x)-.7,-1],[abs(hand.x)+.7,1]]);
         m.translate(hand.x, hand.y, 0);
	 color(backgroundColor);
         mFillCurve(handShape);
	 color(defaultPenColor);
         mCurve(handShape);
      });
      this.setOutPortValue(hand.x < 0 ? 0 : 1);
   }
}
