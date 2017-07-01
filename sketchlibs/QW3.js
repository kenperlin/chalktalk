
function QW3() {
   var NWORDS = 15426;

   var C = [
      "yxz ab de",
      "wv   c gf",
      "  rqlm  h",
      "utsponkji",
   ];
   var zoneToCol = [2,1,0,0,1,2];
   var zoneToRow = [0,0,0,1,1,1];
   this.zones = (function() {
      var z = [[0, 0, .4]];
      for (var i = 0 ; i < 6 ; i++)
         z.push([.8 * cos((i+.5) * TAU / 6), .8 * sin((i+.5) * TAU / 6), .4]);
      return z;
   })();

   this.zone = -2;
   this.message = '';
   this.sequence = [];

   var letterToZones = function(letter) {
      var row, col, rows, cols, zones, i;

      for (row = 0 ; row < C.length ; row++)
         if ((col = C[row].indexOf(letter)) >= 0)
            break;
      if (row >= C.length || col == -1)
         return null;

      rows = [Math.floor(row / 2), row % 2];
      cols = [Math.floor(col / 3), col % 3];
      zones = [];
      for (i = 0 ; i < 2 ; i++)
         for (z = 0 ; z < 6 ; z++)
            if ( zoneToCol[z] == cols[i] &&
                 zoneToRow[z] == rows[i] ) {
               zones.push(z);
               break;
            }
      if (zones.length == 2 && zones[0] == zones[1])
         zones.pop();
      return zones;
   }

   function addToDictionary(word, stroke) {
       dictionary.push({
          word  : word,
          stroke: resampleCurve(stroke, 100)
       });
   }

   function zoneToXY(zone) {
      return [ .8 * Math.cos((zone + .5) * Math.PI / 3),
               .8 * Math.sin((zone + .5) * Math.PI / 3) ];
   }

   var dictionary = [];
   for (let n = 0 ; n < NWORDS ; n++) {
      let word = wordList[n];

      var stroke = [], prevZones;
      for (let i = 0 ; i < word.length ; i++) {
         let zones = letterToZones(word.substring(i, i+1));

         if (i > 0 && zones[0] == prevZones[prevZones.length-1]) {
            let xy = zoneToXY(zones[0]);
            stroke.push([xy[0]/2, xy[1]/2]);
            if (i == word.length - 1 && zones.length == 1)
               continue;
         }
         prevZones = zones;

         for (let j = 0 ; j < zones.length ; j++)
            stroke.push(zoneToXY(zones[j]));
      }

      addToDictionary(' ' + word, stroke);
   }

   addToDictionary('DEL', [[0,0],[-.8,  0]]);
   addToDictionary('\n' , [[0,0],[  0,-.8]]);
   addToDictionary('.'  , [[0,0],[ .6,-.6]]);
   addToDictionary(','  , [[0,0],[-.6,-.6]]);
   addToDictionary('?'  , [[0,0],[ .6, .6]]);
   addToDictionary('!'  , [[0,0],[  0, .8]]);

   this.sequenceToColAndRow = function() {
      if (this.sequence.length == 0) {
         this.col = this.row = -1;
         return;
      }
      var zone0 = this.sequence[0];
      var zone1 = this.sequence[this.sequence.length - 1];
      this.col = 3 * zoneToCol[zone0] + zoneToCol[zone1];
      this.row = 2 * zoneToRow[zone0] + zoneToRow[zone1];
   }

   this.rowAndColToChar = function(row, col) {
      return C[row].substring(col, col+1);
   }

   this.rowAndColToXY = function(row, col) {
      var c1 = floor(col / 3), c2 = col % 3;
      var r1 = floor(row / 2), r2 = row % 2;

      function toAngle(row, col) {
         return PI / 3 * (([2, 1, 0, 3, 4, 5])[3 * row + col] + .5);
      }

      var angle1 = toAngle(r1, c1);
      var angle2 = toAngle(r2, c2);

      return [ .8 * cos(angle1) + .27 * cos(angle2),
               .8 * sin(angle1) + .23 * sin(angle2) ];
   }

   this.lookupWord2 = function(stroke) {
      stroke = resampleCurve(stroke, 100);
      var lowScore = [1000000], I = [0];
      for (let i = 0 ; i < dictionary.length ; i++) {
         let s = dictionary[i].stroke, score = 0;
         for (let j = 0 ; j < s.length ; j++) {
            let x = stroke[j][0] - s[j][0];
            let y = stroke[j][1] - s[j][1];
            score += x * x + y * y;
         }
	 if (score < 1.1 * lowScore[I.length-1]) {
	    let n = I.length;
	    while (--n > 0) {
	    }
	 }
      }
   }

   this.lookupWord = function(stroke) {
      stroke = resampleCurve(stroke, 100);
      var lowScore = [1000000, 1000000], I = [0,0];
      for (let i = 0 ; i < dictionary.length ; i++) {
         let s = dictionary[i].stroke, score = 0;
         for (let j = 0 ; j < s.length ; j++) {
            let x = stroke[j][0] - s[j][0];
            let y = stroke[j][1] - s[j][1];
            score += x * x + y * y;
         }
         if (score < lowScore[0]) {
            lowScore[1] = lowScore[0];
            I[1] = I[0];
            lowScore[0] = score;
            I[0] = i;
         }
         else if (score < lowScore[1]) {
            lowScore[1] = score;
            I[1] = i;
         }
      }
      if (lowScore[1] >= lowScore[0] * 1.1)
         return [ dictionary[I[0]] ];
      else
         return [ dictionary[I[0]], dictionary[I[1]] ];
   }

   this.findConflicts = function() {
      var vowels = 'aeiouy';
      var consonents = 'bcdfghjklmnpqrstvwxz';

      for (let i1 = 0 ; i1 < vowels.length ; i1++) {
	 let v1 = vowels.substring(i1, i1+1);
         for (let i2 = 0 ; i2 < vowels.length ; i2++) {
	    let v2 = vowels.substring(i2, i2+1);
            for (let j1 = 0 ; j1 < consonents.length ; j1++) {
	       let c1 = consonents.substring(j1, j1+1);
	       let a = v1 + c1;
	       let s = '';
               for (let j2 = 0 ; j2 < consonents.length ; j2++)
                  if (j2 !== j1) {
	             let c2 = consonents.substring(j2, j2+1);
	             let b = c2 + v2;
	             let count = 0;
	             for (let n1 = 0 ; n1 < NWORDS ; n1++) {
	                let word1 = dictionary[n1].word;
	                if (word1.includes(a)) {
		           let i = word1.indexOf(a);
		           let word2 = word1.substring(0, i) + b + word1.substring(i + 2, word1.length);
	                   for (let n2 = 0 ; n2 < NWORDS ; n2++)
	                      if (dictionary[n2].word === word2)
			         count++;
		        }
	             }
	             if (count == 0)
	                s += c2;
                  }
               if (s.length)
	          console.log(a + ' -' + v2 + ' ' + s);
            }
         }
      }
   }
   //this.findConflicts();
}

