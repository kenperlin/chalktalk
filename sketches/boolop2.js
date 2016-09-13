
function() {
  this.label = 'Boolop2';
  this.state = 15;
  this.showStateNames = false;

  this.stateNames = [
     "false",
     "a nor b",
     "a and \u00acb",
     "\u00acb",

     "\u00aca and b",
     "\u00aca",
     "a xor b",
     "a nand b",

     "a and b",
     "a = b",
     "a",
     "a or \u00acb",

     "b",
     "\u00aca or b",
     "a or b",
     "true",
  ];

  this.onClick = function(p) {
     this.flipBit((p.x + p.y < 0 ? 1 : 0) + (p.y - p.x < 0 ? 2 : 0));
  }

  this.onCmdClick = function(p) {
     this.showStateNames = ! this.showStateNames;
  }

  this.onSwipe[0] = [ 'a == b', function() { this.state = 9; } ];
  this.onSwipe[2] = [ 'true', function() { this.state = 15; } ];
  this.onSwipe[4] = [ 'a != b', function() { this.state = 6; } ];
  this.onSwipe[6] = [ 'false', function() { this.state = 0; } ];

  this.flipBit = function(i) { var b = 1 << i; this.state = this.state & ~b | (this.state & b ? 0 : 1 << i); }

  this.render = function() {
     m.rotateZ(- 3 * Math.PI / 4);
     this.duringSketch(function() {
        mCurve([[-1,-1],[1,-1],[1,1]]);
        mCurve([[-1,-1],[-1,1],[1,1]]);
     });
     this.afterSketch(function() {
        for (var i = 0 ; i < 4 ; i++) {
	   var b = this.state >> i & 1;
	   color(fadedColor(b ? 1 : 0.1));
	   var x = i == 0 || i == 2 ? -.52 : .52;
	   var y = i == 0 || i == 1 ? -.52 : .52;
	   mFillRect([x-.48,y-.48],[x+.48,y+.48]);
	}

	if (this.showStateNames) {
	   textHeight(this.mScale(.6));
	   color(fadedColor(1));
	   m.rotateZ(3 * Math.PI / 4);
	   mText(this.stateNames[this.state], [0,1.5], .5,1.3);
	}
     });
     this.output = function() {
        var a = def(this.inValue[0]) ? 1 : 0;
        var b = def(this.inValue[1]) ? 1 : 0;
	return this.state & 1 << (a | b << 1) ? 1 : 0;
     }
  }
}

