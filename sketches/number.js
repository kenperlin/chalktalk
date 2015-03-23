function() {
   this.labels = '0 1 2 3 4 5 6 7 8 9'.split(' ');

   this.render = function() {
      this.duringSketch(function() {
         switch (this.selection) {
         case 0: mDrawOval([-.7,-1],[.7,1],32,PI,3*PI);
                 break;
         case 1: mCurve([[-.6,.4],[0,1],[0,-1]]);
                 break;
         case 2: mCurve(makeOval(-.6,-0.2, 1.2,1.0, 16, PI,0)
                .concat(makeOval(-.6,-0.2, 1.2,1.0, 16, 0,-PI/2))
                .concat(makeOval(-.6,-1.4, 1.2,1.2, 16, PI/2,PI))
                .concat(       [[-.6,-1],  [.6,-1]]));
                 break;
         case 3: mCurve(makeOval(-.6, 0.1, 1.2,0.9, 16, PI,-PI/2)
                .concat(makeOval(-.6,-1.0, 1.2,1.1, 16, PI/2,-PI)));
                 break;
         case 4: mCurve([[.7,-.1],[-.7,-.1],[.2,1],[.2,-1]]);
                 break;
         case 5: mCurve([[.7,1],[-.65,1],[-.65,0]]
                .concat(makeOval(-1.1,-1,1.8,1.2,16,PI*2/3,-PI*2/3)));
                 break;
         case 6: mCurve(makeOval(-.7, .0, 1.4,1.0, 8, PI/6,PI/2)
                .concat(makeOval(-.7,-.8, 1.4,1.8, 16, PI/2,PI))
                .concat(makeOval(-.7,-1, 1.4,1.2, 16, PI,3*PI)));
                 break;
         case 7: mCurve([[-.7,1]].concat(makeSpline([[.7,1],[.1,0],[-.2,-1]])));
                 break;
         case 8: mClosedCurve(makeOval(-.6, 0.1, 1.2,0.9, 16, PI/6,PI*3/2)
                .concat(makeOval(-.6,-1.0, 1.2,1.1, 16, PI/2,-PI)));
                 break;
         case 9: mCurve(makeSpline([[.5,.9],[0,1],[-.5,.8],[-.7,.5],[-.6,.2],[-.2,.2],[.3,.6],[.5,.9]])
                .concat([[-.2,-1]]));
                 break;
         }
      });
      this.afterSketch(function() {
         if (this.sketchTexts.length == 0)
            this.setSketchText(0, '' + this.selection, [0,0], 1);
         this.setOutPortValue(this.sketchTexts[0].value);
      });
   }
}
