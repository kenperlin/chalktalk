function() {
   function rounded(x) { return floor(x * 100) / 100; }
   var c = "cos";
   var s = "sin";
   var nc = "-cos";
   var ns = "-sin";
   this.row = -1;
   this.col = -1;
   this.identityMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.mxy = [0,0];
   this.computeMxy = function(x,y) { this.mxy = m.transform([x,y]); }
   this.label = "matrix";
   this.showText = true;
   this.vals = [
       [1  ,0  ,0  ,0,   0  ,1  ,0  ,0,    0  ,0  ,1  ,0,    0  ,0  ,0  , 1],
       [1  ,0  ,0  ,0,   0  ,1  ,0  ,0,    0  ,0  ,1  ,0,    "A","B","C", 1],
       [1  ,0  ,0  ,0,   0  ,"A","B",0,    0  ,"C","A",0,    0  ,0  ,0  , 1],
       ["A",0  ,"C",0,   0  ,1  ,0  ,0,    "B",0  ,"A",0,    0  ,0  ,0  , 1],
       ["A","B",0  ,0,   "C","A",0  ,0,    0  ,0  ,1  ,0,    0  ,0  ,0  , 1],
       ["A",0  ,0  ,0,   0  ,"B",0  ,0,    0  ,0  ,"C",0,    0  ,0  ,0  , 1],
       [1  ,0  ,0  ,"A", 0  ,1  ,0  ,"B",  0  ,0  ,1  ,"C",  0  ,0  ,0  , 1],
   ];
   this.mode = 0;
   this.onClick = function() { this.mode = (this.mode + 1) % this.vals.length; }
   this.cmdMode = 0;
   this.onCmdClick = function() { this.cmdMode = (this.cmdMode + 1) % 2; }
   this.mouseDown = function(x,y) { this.computeMxy(x, y); }
   this.mouseDrag = function(x,y) { this.computeMxy(x, y); }
   this.mouseUp   = function(x,y) { this.computeMxy(x, y); }

   this.swipe[0] = ['select\nrow'   , function() { this.row = max(0, min(3, floor((1 + this.mxy[0]) / 2 * 4))); }];
   this.swipe[2] = ['select\ncolumn', function() { this.col = max(0, min(3, floor((1 - this.mxy[1]) / 2 * 4))); }];
   this.swipe[4] = ['no\nrow'       , function() { this.row = -1; }];
   this.swipe[6] = ['no\ncolumn'    , function() { this.col = -1; }];

   this.render = function(elapsed) {
      mCurve([[1,1],[1,-1],[-1,-1]]);
      lineWidth(1);
      mLine([ .5,1],[ .5,-1]);
      mLine([-1,-.5],[1,-.5]);

      this.afterSketch(function() {

         if (this.cmdMode == 1) {
	    color(scrimColor(0.3));
	    mFillRect([-1,-.5], [.5,1]);
	    color(defaultPenColor);
	 }

         mLine([-1, .5],[1,  .5]);
         mLine([-1,  0],[1,   0]);
         mLine([-.5, 1],[-.5,-1]);
         mLine([  0, 1],[  0,-1]);
         lineWidth(2);
         mCurve([[-1,-1],[-1,1],[1,1]]);

         var out = [];

         if (this.inValues.length == 16) {
            for (var i = 0 ; i < 16 ; i++)
               out.push(roundedString(this.inValues[i]));
         }
         else {
            var sub = ["x","y","z"];
            switch (this.mode) {
            case 1: sub = ["tx","ty","tz"]; break;
            case 2:
            case 3:
            case 4: sub = ["cos","sin","-sin"]; break;
            case 5: sub = ["sx","sy","sz"]; break;
            case 6: sub = ["px","py","pz"]; break;
            }

            if (this.inValues.length > 0) {
               var x = rounded(this.getInValue(0, 0));
               var y = rounded(this.getInValue(1, x));
               var z = rounded(this.getInValue(2, y));

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

            var vals = this.vals[this.mode];

            for (var col = 0 ; col < 4 ; col++)
            for (var row = 0 ; row < 4 ; row++) {
               var val = "" + vals[row + 4 * col];
               if (val == "A") val = sub[0];
               if (val == "B") val = sub[1];
               if (val == "C") val = sub[2];
               out.push(val);
            }
         }

         if (this.showText)
            for (var col = 0 ; col < 4 ; col++)
            for (var row = 0 ; row < 4 ; row++) {
               var x = (col - 1.5) / 2;
               var y = (1.5 - row) / 2;
               var val = out[row + 4 * col];
               textHeight((this.xhi - this.xlo) / 9 / pow(("" + val).length, 0.4));
               mText(val, [x, y], .5, .5);
            }

         if (this.row >= 0) {
            color(scrimColor(.33));
            var y = 1 - 2 * (this.row / 4);
            mFillCurve([ [-1,y], [1,y], [1,y-.5], [-1,y-.5], [-1,y] ]);
         }

         if (this.col >= 0) {
            color(scrimColor(.33));
            var x = 2 * (this.col / 4) - 1;
            mFillCurve([ [x,-1], [x,1], [x+.5,1], [x+.5,-1], [x,-1] ]);
         }

         for (var i = 0 ; i < 16 ; i++) {
            var value = parseFloat(out[i]);
            this.matrixValues[i] = isNumeric(value) ? value : out[i];
         }

         this.setOutPortValue(this.inValues.length > 0 ? this.matrixValues : this.identityMatrix);
      });
   }

   this.matrixValues = newArray(16);
}
