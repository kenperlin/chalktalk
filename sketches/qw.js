function() {
   this.label = 'qw';
   this.onEnter   = function(p) { window.isWritingToTextSketch = true; }
   this.onExit    = function(p) { window.isWritingToTextSketch = false; }
   this.onDelete  = function(p) { window.isWritingToTextSketch = false; }
   this.mouseMove = function(x, y) { this.qw.trackXY(this.xyToSketchPoint(x, y)); }
   this.qw = new QW();
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[.5,1],[-.5,-1],[-.5,1],[.5,-1]]);
      });
      this.afterSketch(function() {
         var faded = backgroundColor == 'white' ? .3 : .1;
         color(palette.color[this.colorId]);
         for (var i = 0 ; i < this.qw.zones.length ; i++) {
            var z = this.qw.zones[i];
	    if (i == this.qw.zone + 1) {
                color(fadedColor(faded, this.colorId));
                mFillDisk(z, z[2]);
                color(palette.color[this.colorId]);
	    }
            lineWidth(this.mScale(i==0 && this.qw.sequence.length == 0 ? .03 : .01));
            mDrawDisk(z, z[2]);
         }
	 this.workingChar = '';
         this.qw.sequenceToColAndRow();
         for (var col = 0 ; col < 9 ; col++)
         for (var row = 0 ; row < 9 ; row++) {
            var s = this.qw.toVisibleChar(this.qw.A(row, col));
            var fh = s.length == 1 ? .18 : .1;
            textHeight(this.mScale(fh));
            if (s != ' ') {
               var xy = this.qw.rowAndColToXY(row, col);
               mText(s, xy, .5, .5);
               if (col == this.qw.col && row == this.qw.row) {
                  mDrawDisk(xy, .1);
	          this.workingChar = s;
               }
            }
         }
	 s = this.qw.selectedChar.length > 0 ? this.qw.selectedChar : this.workingChar;
         textHeight(this.mScale(s.length == 1 ? .3 : .17));
	 color(fadedColor(s == this.qw.selectedChar ? 1 : 2 * faded, this.colorId));
         mText(s.trim(), [0,0], .5,.5);
      });
   }
}

function QW() {

   var C = [
      "abcdefghi",
      "z  C N  j",
      "y       k",
      "x'     -l",
      "B       S",
      "wL     Rm",
      "v       !",
      "u  , A  n",
      "tE.srq?po",
   ];
   var N = [
      "23`456~78",
      "1  = N  9",
      "#       ^",
      "0+     -@",
      "B       S",
      "{;     _}",
      "$       &",
      "[  * A  ]",
      "<E.\\|/:%>",
   ];
   this.zoneToCol = [2,2,1,0,0,0,1,2];
   this.zoneToRow = [1,0,0,0,1,2,2,2];
   this.zones = (function() {
      var z = [[0, 0, .54]];
      for (var i = 0 ; i < 8 ; i++)
         z.push([.87 * cos(i * TAU / 8), .87 * sin(i * TAU / 8), .33]);
      return z;
   })();

   this.zone = -2;
   this.message = '';
   this.isAlt = 0;
   this.isCap = 0;
   this.isNum = 0;
   this.workingChar = '';
   this.selectedChar = '';
   this.sequence = [];

   this.trackXY = function(xy) {
      var radius = sqrt(xy[0] * xy[0] + xy[1] * xy[1]);
      if (radius > 1.2) {
         this.sequence = [];
         this.zone = -2;
         return;
      }

      var zone = -3;
      for (var i = 0 ; i < this.zones.length && zone == -3 ; i++) {
         var xyr = this.zones[i], dx = xy[0] - xyr[0], dy = xy[1] - xyr[1];
         if (dx * dx + dy * dy <= xyr[2] * xyr[2])
            zone = i - 1;
      }

      if (zone == -3 || this.zone == -2 && zone != -1)
         return;

      if (zone != this.zone) {
         this.zone = zone;
         if (zone != -1)  {
            this.sequence.push(zone);
            this.selectedChar = '';
         }
         else
            this.selectedChar = this.toVisibleChar(this.rowAndColToChar());
      }
   }

   this.sequenceToColAndRow = function() {
      if (this.sequence.length == 0) {
         this.col = this.row = -1;
         return;
      }
      var zone0 = this.sequence[0];
      var zone1 = this.sequence[this.sequence.length - 1];
      this.col = 3 * this.zoneToCol[zone0] + this.zoneToCol[zone1];
      this.row = 3 * this.zoneToRow[zone0] + this.zoneToRow[zone1];
   }

   this.rowAndColToChar = function() {
      if (this.col < 0)
         return '';
      this.sequence = [];
      var sa = this.A(this.row, this.col);
      if (sa === undefined)
         return '';
      var s = sa;
      switch (s) {
      case ' ':
         return;
      case 'A':
         this.isAlt = ! this.isAlt;
         return sa;
      case 'B':
         s = '\b';
         break;
      case 'C':
         this.isCap = (this.isCap + 1) % 3;
         return sa;
      case 'E':
         s = '\n';
         break;
      case 'L':
         s = L_ARROW;
         break;
      case 'N':
         this.isNum = ! this.isNum;
         return sa;
      case 'R':
         s = R_ARROW;
         break;
      case 'S':
         s = ' ';
         break;
      default:
         s = this._handleShift(s);
      }
      if (this.isCap == 1)
         this.isCap = 0;
      if (currentTextSketch) {
         var SAVED_index = sketchPage.index;
         sketchPage.index = sketchPage.findIndex(currentTextSketch);
         sketchPage.handleTextChar(s);
         sketchPage.index = SAVED_index;
      }
      return sa;
   }

   this.A = function(row, col) {
      var S = this.isNum ? N : C;
      return S[row].substring(col, col+1);
   }

   this.toVisibleChar = function(s) {
      switch (s) {
      case 'A': s = 'ALT '  ; break;
      case 'B': s = ' DEL'  ; break;
      case 'C': s = ' CAP'  ; break;
      case 'E': s = 'NL'    ; break;
      case 'L': s = '\u8592'; break;
      case 'N': s = 'NUM '  ; break;
      case 'R': s = '\u8594'; break;
      case 'S': s = 'SPC '  ; break;
      }
      return this._handleShift(s);
   }

   this.rowAndColToXY = function(row, col) {
      var x = (4 * floor(col/3) + (col % 3) + 1) / 12;
      var y = (4 * floor(row/3) + (row % 3) + 1) / 12;
      x = 2 * x - 1;
      y = 1 - 2 * y;

      // MAKE LETTER ARRANGEMENT CIRCULAR.

      if (col == 1) x += .07;
      if (row == 1) y -= .07;
      if (col == 7) x -= .07;
      if (row == 7) y += .07;
      var r = sqrt(x * x + y * y);
      if (row > 0 && row < 8 && col > 0 && col < 8 ||
          row == 2 || row == 6 || col == 2 || col == 6)
         r *= 1.2;
      if (row % 4 == 0 && col % 4 == 0)
         r *= 0.92;
      return [x / r, y / r];
   }

   this._handleShift = function(s) {
      if (this.isCap)
         s = s.toUpperCase();
      return s;
   }
}

