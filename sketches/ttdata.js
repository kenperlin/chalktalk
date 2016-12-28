function() {
   var NCOLS = 32;
   var NROWS = 32;

   var CUTOFF = 200;
   this.label = 'ttdata';
   this.data = [];

   this.lineDrawing = [];
   this.wasLineDrawing = false;

   this.onClick = function() { this.lineDrawing = []; }
      
   this.render = function() {
      var h = NROWS / NCOLS;
      color('white');
      mClosedCurve([[-1, h*1.3], [1, h*1.3], [1, -h], [-1, -h]]);
      mLine( [-1, h], [1, h] );
      this.afterSketch(function() {
	 function get(row, col) { return data[row * NCOLS + col]; }
	 function set(row, col, f) { data[row * NCOLS + col] = f; }
	 function colToX(col) { return (col - NCOLS / 2) / (NCOLS / 2); }
	 function rowToY(row) { return (row - NROWS / 2) / (NCOLS / 2); }
         var data = [], i, row, col, x, y, f, s;

         while (ttData.length > 0) {
            data = ttData.shift();

            if (data.length == 1)
	       continue;

	    // PARSE DATA INTO NCOLSxNROWS ARRAY.

            data = data.split(' ').map(function(s) { return Number(s); });
	    data = uncompressData(data, NCOLS * NROWS);

	    // FIND CENTER OF PRESSURE.

            var f, sx = 0, sy = 0, sf = 0, mf = 0;
            for (col = 0 ; col < NCOLS ; col++)
	    for (row = 0 ; row < NROWS ; row++)
	       if ((f = get(row, col)) > CUTOFF) {
	          sx += f * colToX(col);
	          sy += f * rowToY(row);
	          sf += f;
	          mf = max(mf, f);
               }

            // IF HIGH MAX PRESSURE, THEN EXTEND LINE DRAWING.

            if (mf >= 3000) {
	       if (! this.wasLineDrawing)
	          this.lineDrawing.push([]);
	       this.lineDrawing[this.lineDrawing.length-1].push([sx / sf, sy / sf]);
	       this.wasLineDrawing = true;
            }
	    else
	       this.wasLineDrawing = false;
         }

	 // DISPLAY DATA.

	 var r = 0.5 / NCOLS;
         for (col = 0 ; col < NCOLS ; col++)
	 for (row = 0 ; row < NROWS ; row++)
	    if ((f = get(row, col)) > CUTOFF) {
	       x = colToX(col);
	       y = rowToY(row);
	       color(fractionToGray(f / 4000));
	       mFillRect([x-r,y-r], [x+r,y+r]);
            }

	 // DRAW LINE DRAWING
/*
	 color('white');
	 lineWidth(4);
         for (var i = 0 ; i < this.lineDrawing.length ; i++)
	    mCurve(this.lineDrawing[i]);
*/
         // DISPLAY OUTLINES OF HIGH PRESSURE REGIONS.

	 lineWidth(0.5);

         function drawEdges(a, b, c, fa, fb, fc) {
	    if (min(fa, fb, fc) < 0 && max(fa, fb, fc) > 0) {
               var C = [];
	       if (fa * fb < 0) C.push(mix(a, b, -fa / (fb - fa)));
	       if (fb * fc < 0) C.push(mix(b, c, -fb / (fc - fb)));
	       if (fc * fa < 0) C.push(mix(c, a, -fc / (fa - fc)));
	       mCurve(C);
	    }
	 }
	 imageBlur(cloneArray(data), NCOLS, data);
	 for (row = 0 ; row <  NROWS - 1 ; row++)
         for (col = 0 ; col <  NCOLS - 1 ; col++) {
	    var f00 = get(row    , col    ) - CUTOFF,
	        f01 = get(row + 1, col    ) - CUTOFF,
	        f10 = get(row    , col + 1) - CUTOFF,
	        f11 = get(row + 1, col + 1) - CUTOFF;
	    if (max(f00,f10,f01,f11) > 0 && min(f00,f10,f01,f11) < 0) {
	       x0 = colToX(col +  .5);
	       y0 = rowToY(row +  .5);
	       x1 = colToX(col + 1.5);
	       y1 = rowToY(row + 1.5);
	       drawEdges([x0,y0], [x1,y0], [x1,y1], f00, f10, f11);
	       drawEdges([x0,y0], [x0,y1], [x1,y1], f00, f01, f11);
            }
         }
      });
   };
}

