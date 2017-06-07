function() {
   this.label = 'qw';
   this.onEnter   = function(p) { window.isWritingToTextSketch = true; }
   this.onExit    = function(p) { window.isWritingToTextSketch = false; }
   this.onDelete  = function(p) { window.isWritingToTextSketch = false; }
   this.mouseMove = function(x, y, z) {
      if (this._isRespondingToMouseMove)
         this.qw.trackXY(this.inverseTransform([x, y, def(z)]));
   }
   this._isRespondingToMouseMove = true;
   this._isStartOfSentence = true;
   this._counter = 0;
   this.mouseDown = function(x, y, z) {
      if (! this.isChoosingWord) {
         this._isRespondingToMouseMove = false;
         this._stroke = [ this.inverseTransform([x, y, def(z)]) ];
      }
   }
   this.mouseDrag = function(x, y, z) {
      if (! this.isChoosingWord) {
         this._stroke.push(this.inverseTransform([x, y, def(z)]));
         if (this._counter++ % 10 == 0)
            this._words = qwLookupWord(this._stroke);
      }
   }
   this.mouseUp = function(x, y, z) {
      if (this.isChoosingWord) {
         this.isChoosingWord = false;
         var p = this.inverseTransform([x, y, def(z)]);
         this.outputWord(this._words[p[1] > 0 ? 0 : 1]);
	 this._words = null;
      }
      else if (this._stroke.length > 5) {
         this._words = qwLookupWord(this._stroke);
	 if (this._words.length == 1) {
	    this.outputWord(this._words[0]);
	    this._words = null;
         }
	 else
	    this.isChoosingWord = true;
         this._stroke = null;
      }
   }
   this.outputWord = function(word) {
      if (word.indexOf('DEL') == 0)
         sketchPage.handleTextSketchChar('del');
      else
         for (let i = 0 ; i < word.length ; i++) {
            let ch = word.substring(i, i+1);
            if (ch.indexOf('.') == 0)
               this._isStartOfSentence = true;
            else if (i == 1 && this._isStartOfSentence) {
               ch = ch.toUpperCase();
               this._isStartOfSentence = false;
            }
            if (word === ' i' && ch === 'i')
               ch = 'I';
            sketchPage.handleTextSketchChar(ch);
         }
   }
   this.qw = new QW2();
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[.5,1],[-.5,-1],[-.5,1]]);
         mCurve([[-.5,1],[.5,-1]]);
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

	 if (this._stroke) {
	    color('red');
	    lineWidth(4);
	    mCurve(this._stroke);
         }
      });
      if (this._words)
         if (this._words.length == 1)
            mText(this._words[0], [0,0], .5, .5);
         else {
            mText(this._words[0], [0,0], .5, 1.5);
            mText(this._words[1], [0,0], .5,-0.5);
	 }
   }
}

var qwDictionary = (function() {
   function addToDictionary(word, stroke) {
       dictionary.push({
          word  : word,
          stroke: resampleCurve(stroke, 100)
       });
   }
   var dictionary = [];
   var qw = new QW2();
   function zoneToXY(zone) {
      return [ .85 * Math.cos(zone * Math.PI / 4),
               .85 * Math.sin(zone * Math.PI / 4) ];
   }
   for (let n = 0 ; n < 7697 ; n++) {
      let word = wordList[n];

      var stroke = [], prevZones;
      for (let i = 0 ; i < word.length ; i++) {
         let zones = qw.letterToZones(word.substring(i, i+1));

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
   addToDictionary('DEL', [[0,0],[-.85, 0 ]]);
   addToDictionary('\n' , [[0,0],[  0,-.85]]);
   addToDictionary('.'  , [[0,0],[ .6,-.6 ]]);
   addToDictionary(','  , [[0,0],[-.6,-.6 ]]);
   return dictionary;
})();

function qwLookupWord(stroke) {
   stroke = resampleCurve(stroke, 100);
   var lowScore = [1000000, 1000000], I = [0,0];
   for (let i = 0 ; i < qwDictionary.length ; i++) {
      let s = qwDictionary[i].stroke, score = 0;
      for (let j = 0 ; j < 100 ; j++) {
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
   if (lowScore[1] >= lowScore[0] * 1.2)
      return [ qwDictionary[I[0]].word ];
   else
      return [ qwDictionary[I[0]].word, qwDictionary[I[1]].word ];
}

function computeBigramConflicts() {
   var N = 5000;
   var conflicts = [];
   for (let b = 0 ; b < bigramCount.length ; b++) {

      let c = [];
      for (let l = 0 ; l < 26 ; l++)
         c.push(0);
      conflicts.push(c);

      let bigram = bigramCount[b][0];

      for (let l = 0 ; l < 26 ; l++) {
         let ch = String.fromCharCode(97 + l);
	 if (bigram.indexOf(ch) < 0)
            for (let w1 = 0 ; w1 < N ; w1++) {
               let word1 = wordList[w1];
	       let i = word1.indexOf(bigram);
               if (i >= 0) {
	          let word2 = word1.substring(0, i) + ch + word1.substring(i+2, word1.length);
                  for (let w2 = 0 ; w2 < N ; w2++)
	             if (wordList[w2] === word2)
	                c[l]++;
               }
            }
      }
   }
   return conflicts;
}
/*
var conflicts = computeBigramConflicts();

var str = 'var conflicts = [\n';
for (let n = 0 ; n < bigramCount.length ; n++) {
   str += '   [\'' + bigramCount[n][0] + '\',[';
   for (let l = 0 ; l < 26 ; l++) {
      let s = conflicts[n][l] + ',';
      while (s.length < 3)
         s = ' ' + s;
      str += s;
   }
   str += ']],\n';
}
str += '];\n';

console.log(str);
*/

