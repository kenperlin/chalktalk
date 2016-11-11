function() {
   this.label = 'hand';
   var thumbShape = makeSpline([
      [-.65,-1.2],[-.66,-.95],[-.7 , -.8 ],[-.92,-.4 ],[-.98, .0 ],
      [-.9 , .33],[-.8 , .33],[-.75,  .25],[-.78,-.1 ],[-.70,-.3 ],
   ]);
   var fingersShape = makeSpline([
      [-.67,-.3 ],[-.60, .0 ],[-.57,  .82],[-.5 , .87],[-.43, .82],[-.38,0],
      [-.34, .0 ],[-.29, .9 ],[-.22,  .95],[-.15, .9 ],[-.12, .0 ],
      [-.08, .0 ],[-.06, .78],[ .01,  .83],[ .08, .78],[ .13,-.1 ],
      [0.15,-.1 ],[ .19, .18],[ .18,  .48],[ .25, .54],[ .32, .5 ],[ .37,0],
      [0.29,-.5 ],[ .14,-.9 ],[ .1 ,-1.2 ],
   ]);
   this.render = function() {
      m.translate(.32,.7,0);
      this.afterSketch(function() {
         color(backgroundColor);
         mFillCurve(thumbShape.concat(fingersShape));
         color(defaultPenColor);
      });
      mCurve(thumbShape);
      mCurve(fingersShape);
   }
}
