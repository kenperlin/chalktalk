
function QW2() {

   var C = [
/*
      "abc efh i",
      "   d g  j",
      "        k",
      "z      lm",
      "y       n",
      "xw       ",
      "v        ",
      "u  s q   ",
      "t   r  po",
*/
/*
      "yxz ab de",
      "w    c  f",
      "v       g",
      "         ",
      "         ",
      "         ",
      "s        ",
      "t  p l  h",
      "urqnomkji",
*/
      "yxz ab de",
      "         ",
      "wv   c gf",
      "         ",
      "         ",
      "         ",
      "  rq ml h",
      "         ",
      "utsponkji",
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

   this.letterToZones = function(letter) {
      var row, col, rows, cols, zones, i;

      for (row = 0 ; row < C.length ; row++)
         if ((col = C[row].indexOf(letter)) >= 0)
	    break;
      if (row >= C.length || col == -1)
         return null;

      rows = [Math.floor(row / 3), row % 3];
      cols = [Math.floor(col / 3), col % 3];
      zones = [];
      for (i = 0 ; i < 2 ; i++)
         for (z = 0 ; z < 8 ; z++)
            if ( this.zoneToCol[z] == cols[i] &&
                 this.zoneToRow[z] == rows[i] ) {
               zones.push(z);
	       break;
	    }
      if (zones.length == 2 && zones[0] == zones[1])
         zones.pop();
      return zones;
   }

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
      sketchPage.handleTextSketchChar(s);
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
      var c1 = floor(col / 3), c2 = col % 3;
      var r1 = floor(row / 3), r2 = row % 3;

      function toAngle(row, col) {
         return PI / 4 * ([3, 2, 1, 4, 0, 0, 5, 6, 7])[3 * row + col];
      }

      var angle1 = toAngle(r1, c1);
      var angle2 = toAngle(r2, c2);

      return [ .85 * cos(angle1) + .22 * cos(angle2),
               .85 * sin(angle1) + .22 * sin(angle2) ];
   }

   this._handleShift = function(s) {
      if (this.isCap)
         s = s.toUpperCase();
      return s;
   }
}

