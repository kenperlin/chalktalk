imageScanning = function() {
   let nCols = 6, nRows = 4, nPixels = nRows * nCols;
   let px = -1, py = -1, col = -1, row = -1;

   this.onMove = p => {
      px = p.x;
      py = p.y;
   }

   this.render = () => {
      this.duringSketch(() => {
         mCurve([[-.6,-.3],[.6,-.3],[.6,.3],[-.6,.3],[-.6,-.3]]);
	 mLine([-.8,-.3],[.8,-.3]);
      });
      this.afterSketch(() => {
         let setPixel = false;
         let s = 1 / nCols;
         for (let j = 0 ; j < nRows ; j++)
         for (let i = 0 ; i < nCols ; i++) {
            let x = s * (i-1 - nCols/2) + .5;
            let y = s * (nRows/2 - j-1) + .1;
            if (px >= x && px < x+s && py >= y && py < y+s) {
               col = i;
               row = j;
               setPixel = true;
            }
            if (col == i && row == j)
               mFillRect([x,y], [x+s,y+s]);
            mDrawRect([x,y], [x+s,y+s]);
         }
         let pixel = row * nCols + col;

         mTextHeight(.05);
         let x = -.9;
         mText('col:', [x,.32]);
         mText('row:', [x,.13]);
         mText('pixel:', [x,-.21]);
         if (col >= 0 && row >= 0) {
            mText(col  , [x+.42,.32]);
            mText(row  , [x+.42,.13]);
            mText(pixel, [x+.42,-.21]);
         }

         s = 1 / 12.2;
         for (let n = 0 ; n < nPixels ; n++) {
            let x = s * (n - nPixels/2);
            let y = -.48;
            if (px >= x && px < x+s && py >= y && py < y+s) {
               col = n % nCols;
               row = (n - col) / nCols;
               setPixel = true;
            }
            if (n == row * nCols + col)
               mFillRect([x,y],[x+s,y+s]);
            mDrawRect([x,y],[x+s,y+s]);
         }

         if (! setPixel)
            row = col = -1;
      });
   }
}
