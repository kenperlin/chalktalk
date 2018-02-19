function() {
   this.labels = 'Matrix bezier bspline hermite'.split(' ');
   this.inLabel = ['', '\u2715'];
   function rounded(x) { return floor(x * 100) / 100; }
   var c = "cos";
   var s = "sin";
   var nc = "-cos";
   var ns = "-sin";
   this.row = -1;
   this.col = -1;
   this.identityMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.xyztLabel = [
      'x\u2080 y\u2080 z\u2080 t\u2080'.split(' '),
      'x\u2081 y\u2081 z\u2081 t\u2081'.split(' '),
      'x\u2082 y\u2082 z\u2082 t\u2082'.split(' '),
      'x\u2083 y\u2083 z\u2083 t\u2083'.split(' '),
   ];
   this.p = newVec3();
   this.vals = [
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,   'A','B','C', 1 ],
       [ 1 , 0 , 0 , 0,   0 ,'A','B', 0,    0 ,'C','A', 0,    0 , 0 , 0 , 1 ],
       ['A', 0 ,'C', 0,   0 , 1 , 0 , 0,   'B', 0 ,'A', 0,    0 , 0 , 0 , 1 ],
       ['A','B', 0 , 0,  'C','A', 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       ['A', 0 , 0 , 0,   0 ,'B', 0 , 0,    0 , 0 ,'C', 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 ,'A',  0 , 1 , 0 ,'B',   0 , 0 , 1 ,'C',   0 , 0 , 0 , 1 ],
    ];
   this.mode = 0;
   this.is_xyzt = false;
   this.onClick = ['next type', function() { this.mode = (this.mode + 1) % this.vals.length; }];
   this.cmdMode = 0;
   this.onCmdClick = function() { this.cmdMode = (this.cmdMode + 1) % 2; }
   this.onCmdSwipe[2] = ['show labels', function() { this.is_xyzt = ! this.is_xyzt; }];
   this.onCmdSwipe[6] = ['show labels', function() { this.is_xyzt = ! this.is_xyzt; }];
   this.onPress = function(p) { this.p.copy(p); }

   this.onSwipe[0] = ['select\nrow'   , function() { this.row = max(0, min(3, floor((1 - this.p.y) / 2 * 4))); }];
   this.onSwipe[2] = ['select\ncolumn', function() { this.col = max(0, min(3, floor((1 + this.p.x) / 2 * 4))); }];
   this.onSwipe[4] = ['no\nrow'       , function() { this.row = -1; }];
   this.onSwipe[6] = ['no\ncolumn'    , function() { this.col = -1; }];

   this.render = function(elapsed) {

      this.afterSketch(function() {
         var x, y;

         if (this.cmdMode == 1) {
            color(fadedColor(0.15, this.colorId));
            mFillRect([-1,-.5], [.5,1]);
            color(defaultPenColor);
         }

         if (this.row >= 0) {
            color(fadedColor(.33, this.colorId));
            y = 1 - 2 * (this.row / 4);
            mFillCurve([ [-1,y], [1,y], [1,y-.5], [-1,y-.5], [-1,y] ]);
            color(defaultPenColor);
         }

         if (this.col >= 0) {
            color(fadedColor(.33, this.colorId));
            x = 2 * (this.col / 4) - 1;
            mFillCurve([ [x,-1], [x,1], [x+.5,1], [x+.5,-1], [x,-1] ]);
            color(defaultPenColor);
         }

      });

      var type = this.labels[this.selection];

      this.duringSketch(function() {
         mCurve([[1,1],[1,-1],[-1,-1]]);
         switch (type) {
         case 'Matrix':
            mCurve([[1,1],[1,-1],[-1,-1]]);
            break;
         case 'bezier':
            mCurve([[-.5,1],[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]]);
            break;
         case 'bspline':
            mCurve([[-.5,1],[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]);
            break;
         case 'hermite':
            mCurve([[-.5,1],[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]]);
            break;
         }
      });

      this.afterSketch(function() {
         var i, x, y, z, sub, val, vals, value, col, row, out;

         for (let t = -.5 ; t <= .5 ; t += .5) {
            mLine([-1, t],[1, t]);
            mLine([ t,-1],[t, 1]);
         }
         lineWidth(2);
         mClosedCurve([[-1,-1],[-1,1],[1,1],[1,-1]]);

         out = [];

         switch (type) {

         case 'bezier':
            out = [ -1,3,-3,1 , 3,-6,3,0 , -3,3,0,0 , 1,0,0,0 ];
            break;

         case 'bspline':
            out = [ '-1/6', ' 3/6', '-3/6', ' 1/6',
	            ' 3/6', '-6/6', '   0', ' 4/6',
		    '-3/6', ' 3/6', ' 3/6', ' 1/6',
		    ' 1/6', '   0', '   0', '   0' ];
            break;

         case 'hermite':
            out = [ 2,-3,0,1 , -2,3,0,0 , 1,-2,1,0 , 1,-1,0,0 ];
            break;

         case 'Matrix':
            if (isMatrixArray(this.inValue[0])) {
               for (var i = 0 ; i < 16 ; i++)
                  out.push(roundedString(this.inValues[i]));
            }
            else {
               sub = ["x","y","z"];
               switch (this.mode) {
               case 1: sub = ["tx","ty","tz"]; break;
               case 2:
               case 3:
               case 4: sub = ["cos","sin","-sin"]; break;
               case 5: sub = ["sx","sy","sz"]; break;
               case 6: sub = ["px","py","pz"]; break;
               }

               if (isDef(this.inValue[0])) {
		  if (this.inValue[0] instanceof Array) {
                     x = rounded(this.inValue[0][0], 0);
                     y = rounded(this.inValue[0][1], x);
                     z = rounded(this.inValue[0][2], y);
                  }
		  else {
		     value = parseFloat(this.inValue[0]);
                     if (isNumeric(value))
                        x = y = z = rounded(value, 0);
                  }

                  switch (this.mode) {
                  case 1:
                  case 5:
                  case 6:
                     sub[0] = x;
                     sub[1] = y;
                     sub[2] = z;
                     break;
                  case 2:
                  case 3:
                  case 4:
                     sub[0] = rounded(cos(x));
                     sub[1] = rounded(sin(y));
                     sub[2] = -sub[1];
                     break;
                  }
               }
            }

            vals = this.vals[this.mode];

            for (col = 0 ; col < 4 ; col++)
            for (row = 0 ; row < 4 ; row++) {
               val = "" + vals[row + 4 * col];
               if (val == "A") val = sub[0];
               if (val == "B") val = sub[1];
               if (val == "C") val = sub[2];
               out.push(val);
            }

            break;
         }

         for (col = 0 ; col < 4 ; col++)
         for (row = 0 ; row < 4 ; row++) {
            x = (col - 1.5) / 2;
            y = (1.5 - row) / 2;
            val = this.is_xyzt ? this.xyztLabel[row][col] : out[row + 4 * col];
	    if (isNumeric(val))
	       val = rounded(val);
            textHeight(max(this.xhi - this.xlo, this.yhi - this.ylo) / 9 / pow(("" + val).length, 0.4));
            mText(val, [x, y], .5, .5);
         }

         for (i = 0 ; i < 16 ; i++) {
            value = parseFloat(out[i]);
            this.matrixValues[i] = isNumeric(value) ? value : out[i];
         }
      });
   }

   this.output = function() {
      var type = this.labels[this.selection];
      var outValue = type != 'Matrix' || this.inValues.length > 0 ? this.matrixValues :
                     isMatrixArray(this.inValue[0]) ? this.inValue[0] : this.identityMatrix;
      var i = this.labels[this.selection] == 'Matrix' ? 1 : 0;
      if (isDef(this.inValue[i]))
         outValue = mult(outValue, this.inValue[i]);
      return outValue;
   }

   this.matrixValues = newArray(16);
}

