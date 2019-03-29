function() {
/*
   TODO:  Add chords.
*/
   this.label = 'piano';
   this.minOctave = 3;
   this.maxOctave = 3;
   this.pt = newVec3(-100,0,0);
   this.onCmdSwipe[0] = ['add left octave', function() { this.maxOctave++; }];
   this.onCmdSwipe[2] = ['seven octaves', function() { this.minOctave = 0; this.maxOctave = 6; }];
   this.onCmdSwipe[4] = ['add right octave', function() { this.minOctave = max(0, this.minOctave - 1); }];
   this.onCmdSwipe[6] = ['only one octave', function() { this.minOctave = this.maxOctave = 3; }];
   this.notePressed = null;
   this.onPress = function(p) { this.pt.copy(p); };
   this.onDrag = function(p) { this.pt.copy(p); };
   this.onRelease = function(p) { this.pt.copy(-100,0,0); }
   var whiteNotes = [0,2,4,5,7,9,11];
   var blackNotes = [1,3,6,8,10];
   this.render = function() {
      var w = 7/8;
      var h = 0.6;
      this.duringSketch(function() {
         mLine([-w,h],[ w, h]);
         mLine([-w,h],[-w,-h]);
         mLine([ w,h],[ w,-h]);
      });
      this.afterSketch(function() {
         this.drawKey = function(x, type, note) {
	    var x1 = type==1 ? x + 3/16+.007 : x + 1 / 8;
	    var x0 = type==1 ? x + 1/16-.007 : x - 1 / 8;
	    var y1 = h;
	    var y0 = type==1 ? -h*.27 : -h;
	    var isPressed = x0 <= this.pt.x && x1 > this.pt.x &&
	                    (type == 0 ? y0 <= this.pt.y && -h*.27 > this.pt.y
			               : -h*.27 <= this.pt.y && y1 > this.pt.y);
            if (isPressed) {
	       type += 2;
	       this.notePressed = note;
            }
	    else if (note == this.notePressed)
	       this.notePressed = null;

	    var z = type==0 ? 0 : type==1 ? .15 : type==2 ? -.1 : .05;
	    color(type==3 ? 'rgb(8,8,8)' : type==2 ? 'rgb(160,160,160)' : type==1 ? 'rgb(32,32,32)' : 'white');
	    mFillRect([x0,y0,z],[x1,y1,z]);
	    color('black');
	    mLine([x0,y1,z],[x0,y0,z]);
	    mLine([x1,y1,z],[x1,y0,z]);
	    mLine([x0,y0,z],[x1,y0,z]);
	 }
	 for (var octave = this.minOctave ; octave <= this.maxOctave ; octave++) {
            for (var k = 0 ; k < 7 ; k++) {
	       var x = mix(-1, 1, (7 * (octave-3) + k + 1) / 8);
	       this.drawKey(x, 0, 12 * (octave-3) + whiteNotes[k]);
	    }
            for (var k = 0 ; k < 5 ; k++) {
	       var key = k + 1 + (k >= 2);
	       var x = (octave-3) * 7 / 4 + mix(-1, 1, key / 8) + (key<3?.06*(key-1.5) : .03*(key-5));
	       this.drawKey(x, 1, 12 * (octave-3) + blackNotes[k]);
	    }
	 }
         mLine([-7/8, h],[7/8, h]);
         mLine([-7/8,-h],[7/8,-h]);
      });
   }
   this.noteToPitch = function(note) {
      return 261.6 * pow(2, note / 12);
   }
   this.output = function() {
      return this.notePressed == null ? 0 : this.noteToPitch(this.notePressed);
   }
}

