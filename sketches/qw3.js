function() {
   this.label = 'qw3';
   this.onEnter   = function(p) { window.isWritingToTextSketch = true; }
   this.onExit    = function(p) { window.isWritingToTextSketch = false; }
   this.onDelete  = function(p) { window.isWritingToTextSketch = false; }
   this._isStartOfSentence = true;
   this._counter = 0;
   this._deleteStack = [];
   this.setRecognizedStroke = function(stroke) {
      if (stroke == null)
         this._recognizedStroke = null;
      else {
         stroke = resampleCurve(stroke, 100);
	 let strokeLength = computeCurveLength(stroke);
	 for (let i = 0 ; i < stroke.length ; i++) {
	    stroke[i][0] += .1 * noise2(10, .02 * i * strokeLength);
	    stroke[i][1] += .1 * noise2(20, .02 * i * strokeLength);
         }
         this._recognizedStroke = stroke;
      }
   }
   this.mouseDown = function(x, y, z) {
      this.setRecognizedStroke(null);
      if (! this.isChoosingWord)
         this._stroke = [ this.inverseTransform([x, y, def(z)]) ];
   }
   this.mouseDrag = function(x, y, z) {
      if (! this.isChoosingWord) {
         this._stroke.push(this.inverseTransform([x, y, def(z)]));
         if (this._counter++ % 10 == 0)
            this._words = this.qw.lookupWord(this._stroke);
      }
   }
   this.mouseUp = function(x, y, z) {
      if (this.isChoosingWord) {
         this.isChoosingWord = false;
         var p = this.inverseTransform([x, y, def(z)]);
         var choice = this._words[p[1] > 0 ? 0 : 1];
         this.outputWord(choice.word);
	 this.setRecognizedStroke(choice.stroke);
	 this._words = null;
      }
      else if (this._stroke.length > 5) {
         this._words = this.qw.lookupWord(this._stroke);
	 if (this._words.length == 1) {
	    this.outputWord(this._words[0].word);
	    this.setRecognizedStroke(this._words[0].stroke);
	    this._words = null;
         }
	 else
	    this.isChoosingWord = true;
         this._stroke = null;
      }
   }
   this.outputWord = function(word) {
      if (word.indexOf('DEL') == 0) {
         if (this._deleteStack.length) {
            let wordLength = this._deleteStack.pop();
            for (let i = 0 ; i < wordLength ; i++)
               sketchPage.handleTextSketchChar('del');
         }
	 else
            this._isStartOfSentence = true;
      }
      else {
         for (let i = 0 ; i < word.length ; i++) {
            let ch = word.substring(i, i+1);
            if (ch.includes('.') || ch.includes('?') || ch.includes('!'))
               this._isStartOfSentence = true;
            else if (i == 1 && this._isStartOfSentence) {
               ch = ch.toUpperCase();
               this._isStartOfSentence = false;
            }
            if (word === ' i' && ch === 'i')
               ch = 'I';
            sketchPage.handleTextSketchChar(ch);
         }
	 this._deleteStack.push(word.length);
      }
   }
   this.qw = new QW3();
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-.5,1],[.5,-1],[.5,1]]);
         mCurve([[.5,1],[-.5,-1]]);
      });
      this.afterSketch(function() {
         var faded = isWhiteBackground() ? .3 : .1;
         color(palette.color[this.colorId]);
         lineWidth(this.mScale(.007));
         for (var i = 0 ; i < this.qw.zones.length ; i++) {
            var z = this.qw.zones[i];
            mDrawDisk([z[0],z[1]], z[2]);
         }
         this.workingChar = '';
         this.qw.sequenceToColAndRow();
         textHeight(this.mScale(.22));
         for (var col = 0 ; col < 9 ; col++)
         for (var row = 0 ; row < 4 ; row++) {
            var s = this.qw.rowAndColToChar(row, col);
            if (s != ' ') {
               var xy = this.qw.rowAndColToXY(row, col);
               mText(s, xy, .5, .5);
               if (col == this.qw.col && row == this.qw.row) {
                  mDrawDisk(xy, .1);
                  this.workingChar = s;
               }
            }
         }
         s = this.workingChar;
         textHeight(this.mScale(s.length == 1 ? .3 : .17));
         color(fadedColor(2 * faded, this.colorId));
         mText(s.trim(), [0,0], .5,.5);

	 if (this._stroke) {
	    color('red');
	    lineWidth(4);
	    mCurve(this._stroke);
         }

         if (this._words) {
	    let n = this._words.length;
	    for (let i = 0 ; i < n ; i++)
               mText(this._words[i].word, [0,0], .5, (.5 - i) * n);
         }

         if (this._recognizedStroke) {
	    color('cyan');
	    mCurve(this._recognizedStroke);
	 }
      });
   }
}

