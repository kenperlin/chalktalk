humanColors = function() {
   let px = -1, py = -1;

   function drawCurve(pts) {
      for (let n = 0 ; n < pts.length - 2 ; n += 2) {
         let x0 = (pts[n    ] - .04) / .81;
         let y0 =  pts[n + 1] * 4/5;
         let x1 = (pts[n + 2] - .04) / .81;
         let y1 =  pts[n + 3] * 4/5;
         mLine([2 * x0-1, 1.6 * y0 - .6], [2 * x1-1, 1.6 * y1 - .6]);
      }
   }

   function evalCurve(pts, x) {
      for (let n = 0 ; n < pts.length - 2 ; n += 2) {
         let x0 = (pts[n    ] - .04) / .81;
         let y0 =  pts[n + 1] * 4/5;
         let x1 = (pts[n + 2] - .04) / .81;
         let y1 =  pts[n + 3] * 4/5;
         x0 = 2 * x0 - 1;
         x1 = 2 * x1 - 1;
         if (x0 < x && x1 > x) {
            y0 = 1.6 * y0 - .6;
            y1 = 1.6 * y1 - .6;
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
         }
      }
      return -.6;
   }

   let blueCurve = [
      .05,0, .09,.14, .18,.6, .192,.62, .208,.62, .22,.6,
      .3,.185, .33,.1, .37,.025, .4,0,
   ];

   let greenCurve = [
      .1,0, .2,.05, .25,.1, .3,.2, .4,.8, .43,.9, .45,.92, .47,.9,
      .54,.67, .62,.3, .67,.17, .70,.1, .77,.01, .82,0,
   ];

   let redCurve = [
      .05,0, .09,.08, .11,.08, .14,.05, .17,.04,
      .2,.045, .25,.08, .3,.12, .32,.15, .34,.2,
      .40,.54, .42,.62, .45,.70, .5,.8, .52,.82, .55,.8,
      .57,.75, .70,.23, .74,.12, .78,.05, .81,.02, .85,0,
   ];

   this.onMove = p => {
      px = p.x;
      py = p.y;
   }

   this.render = () => {
      this.duringSketch(() => {
         mLine([-1,-.6],[1,-.6]);
	 let C = [];
	 for (let n = 0 ; n < redCurve.length ; n += 2) {
	    let x = redCurve[n];
	    let y = redCurve[n+1];
	    C.push([2 * x - 1, 1.6 * y - .6]);
         }
         mCurve(C);
      });
      this.afterSketch(() => {
         let y = 0;
         mTextHeight(1/24);
         color(defaultPenColor);
         var ty = -.5;
         mText("420", [-3/4 - 1/10, ty]);
         mText("500", [-1/4 - 1/10, ty]);
         mText("580", [ 1/4 - 1/10, ty]);
         mText("660", [ 3/4 - 1/10, ty]);

         mTextHeight(1/15);

         let yy = .48;
         color('red');
         drawCurve(redCurve);
         let ry = evalCurve(redCurve, px);
         mFillRect([-.9, yy], [-.9 + (ry+.6) / 3, yy+.05]);

         yy -= .1;
         color('#00e000');
         drawCurve(greenCurve);
         let gy = evalCurve(greenCurve, px);
         mFillRect([-.9, yy], [-.9 + (gy+.6) / 3, yy+.05]);

         yy -= .1;
         color('blue');
         drawCurve(blueCurve);
         let by = evalCurve(blueCurve, px);
         mFillRect([-.9, yy], [-.9 + (by+.6) / 3, yy+.05]);

         color(defaultPenColor);
         mDrawRect([-.99,-3/5],[.99,3/5]);
         if (px >= -.97 && px <= .97) {
            color('red');
            mFillOval([px-.03, ry-.03], [px+.03, ry+.03]);
            color('#00e000');
            mFillOval([px-.03, gy-.03], [px+.03, gy+.03]);
            color('blue');
            mFillOval([px-.03, by-.03], [px+.03, by+.03]);
            ry += .6;
            gy += .6;
            by += .6;
            let s = 255 / Math.max(ry, Math.max(gy, by));
	    px = Math.max(-.97, Math.min(.97, px));
            if (px < -.9) s *= (px + 1) * 10;
            if (px >  .9) s *= (1 - px) * 10;
            color('rgb(' + Math.floor(ry * s) + ',' +
                           Math.floor(gy * s) + ',' +
                           Math.floor(by * s) + ')');
            mFillOval([.5,.1],[.9,.5]);
            color(defaultPenColor);
            mLine([px,-.6],[px,.6]);
         }
      });
   }
}

