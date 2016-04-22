function() {
   var P = [
      "abcdefghi",
      "z  C #  j",
      "y       k",
      "x'     -l",
      "B       S",
      "w<     >m",
      "v       !",
      "u  ? P  n",
      "t.,Rsrqpo",
   ];
   var zoneToCol = [2,2,1,0,0,0,1,2];
   var zoneToRow = [1,0,0,0,1,2,2,2];
   var innerRadius = 0.5;
   
   this.label = 'qw';
   this.zone = -2;
   this.message = '';
   this.isCap = 0;
   this.sequence = [];
   this.onEnter = function(p) { window.isWritingToTextSketch = true;  }
   this.onExit  = function(p) { window.isWritingToTextSketch = false; }
   this.onMove = function(p) {
      var radius = sqrt(p.x * p.x + p.y * p.y);
      if (radius > 1.3) {
         console.log("AHA");
         this.sequence = [];
         this.zone = -2;
         return;
      }
      var isOuter = radius > innerRadius;
      var zone = isOuter ? pieMenuIndex(p.x, -p.y, 8) : -1;
      if (this.zone == -2 && zone != -1)
         return;
      if (zone != this.zone) {
         this.zone = zone;
         if (zone != -1) 
            this.sequence.push(zone);
         else
            this.rowAndColToChar();
      }
   }
   this.sequenceToColAndRow = function() {
      if (this.sequence.length == 0) {
         this.col = this.row = -1;
         return;
      }
      var zone0 = this.sequence[0];
      var zone1 = this.sequence[this.sequence.length - 1];
      this.col = 3 * zoneToCol[zone0] + zoneToCol[zone1];
      this.row = 3 * zoneToRow[zone0] + zoneToRow[zone1];
   }
   this.rowAndColToChar = function() {
      if (this.col < 0)
         return;
      this.sequence = [];
      var s = P[this.row].substring(this.col, this.col + 1);
      switch (s) {
      case '<':
         s = L_ARROW;
         break;
      case '>':
         s = R_ARROW;
         break;
      case 'B':
         s = '\b';
         break;
      case 'C':
         this.isCap = ! this.isCap;
         return;
      case 'R':
         s = '\n';
         break;
      case 'S':
         s = ' ';
         break;
      default:
         if (this.isCap)
            s = s.toUpperCase();
         break;
      }
      if (currentTextSketch) {
         var SAVED_index = sketchPage.index;
         sketchPage.index = sketchPage.findIndex(currentTextSketch);
         sketchPage.handleTextChar(s);
         sketchPage.index = SAVED_index;
      }
   }
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-.5,1],[.5,-1],[.5,1],[-.5,-1]]);
      });
      this.afterSketch(function() {
         lineWidth(this.mScale(0.02));
         for (var i = 0 ; i < 8 ; i++) {
            var theta = (i + .5) * TAU / 8;
            var c = cos(theta), s = sin(theta);
            mLine([c * innerRadius,s * innerRadius],[c * 1.05, s * 1.05]);
         }
         lineWidth(this.mScale(0.01));
	 this.sequenceToColAndRow();
         for (var col = 0 ; col < 9 ; col++)
         for (var row = 0 ; row < 9 ; row++) {
            var s = P[row].substring(col, col+1);
            var fh = .18;
            switch (s) {
            case '<': s = '\u8592'; break;
            case '>': s = '\u8594'; break;
            case '#': s = 'NUM '  ; fh = .1; break;
            case 'B': s = ' DEL'  ; fh = .1; break;
            case 'C': s = ' CAP'  ; fh = .1; break;
            case 'P': s = 'ALT '  ; fh = .1; break;
            case 'R': s = 'NL'    ; fh = .1; break;
            case 'S': s = 'SPC '  ; fh = .1; break;
            }
            textHeight(this.mScale(fh));
            if (s != ' ') {
               if (this.isCap)
                  s = s.toUpperCase();
               var x = (4 * floor(col/3) + (col % 3) + 1) / 12;
               var y = (4 * floor(row/3) + (row % 3) + 1) / 12;
               x = 2 * x - 1;
               y = 1 - 2 * y;

               // CHANGE LETTER ARRANGEMENT FROM SQUARE TO CIRCULAR.

               if (col == 1) x += .1;
               if (row == 1) y -= .1;
               if (col == 7) x -= .1;
               if (row == 7) y += .1;
               var r = sqrt(x * x + y * y);
               if (row > 0 && row < 8 && col > 0 && col < 8 ||
                   row == 2 || row == 6 || col == 2 || col == 6)
                  r *= 1.25;
               x /= r;
               y /= r;

               if (col == this.col && row == this.row)
	          mDrawOval([x - .1, y - .1], [x + .1, y + .1]);
               mText(s, [x, y], .5, .5);
            }
         }
         textHeight(this.mScale(.3));
         mText(this.message, [0,1.5], .5,.5);
      });
   }
}
