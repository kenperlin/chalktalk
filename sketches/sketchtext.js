function() {
   this.label = 'sketchtext';

   // NEED TO ADD UPPER CASE AND ALT KEYBOARDS

   let lcCharTable = [
     '     !|     |?     ',
     '   a b|d e f|h i   ',
     ' 1 z 2|c 3 g|4 j 5 ',
//     -----+-----+----- 
     '   x y|     |C k   ',
     '   D W|     |- l   ',
     '   w v|     |A m   ',
//     -----+-----+----- 
     ' 0 u 9|, 8 .|7 n 6 ',
     '   t E|s r q|p o   ',
     '     (|     |)     ',
   ];

   let d2c = [1,2,2,1,0,0,0,1,2];
   let d2r = [1,1,0,0,0,1,2,2,2];
   let dir = (a,b) => pieMenuIndex(b[0]-a[0],a[1]-b[1],8);
   let isAlt = false;
   let isCaps = false;
   let isVerbose = true;
   let line = 0;
   let lookUp = (a,b) => {
      let R = d2r[a], C = d2c[a], r = d2r[b], c = d2c[b];
      return lcCharTable[3*R + r].charAt(6 * C + 2 * c + 1);
   }
   let P = [];
   let text = [''];

   this.onCmdClick = [ 'verbose', () => isVerbose = ! isVerbose ];

   this.onPress = [ '', p => P = [[p.x,p.y]] ];
   this.onDrag  = [ '', p => {
        let p0 = P[P.length-1], p1 = [p.x,p.y];
        if (distance(p0, p1) > .1)
           P.push(p1);
      }];
   this.onRelease = [ '', p => {
      let N = P.length;
      if (N <= 1) {
         text[line] += ' ';
         P = [];
         return;
      }
      let D = [];
      for (let n = 0 ; n < N-1 ; n++)   
         D.push(normalize([ P[n+1][0] - P[n][0], P[n+1][1] - P[n][1] ]));

      let d = [];
      for (let n = 0 ; n < D.length-1 ; n++)
         d.push(dot(D[n], D[n+1]));

      let dMin = 1, nMin = 0;
      for (let n = 0 ; n < d.length ; n++)
         if (d[n] < dMin) {
            dMin = d[n];
            nMin = n;
         }

      let c = dMin > .8
         ? lookUp(1 + dir(P[0], P[N-1]), 0)
         : lookUp(1 + dir(P[0], P[nMin-1]), 1 + dir(P[nMin+1], P[N-1]));

      let lastChar   = () => text[line].charAt(text[line].length - 1);
      let deleteChar = () => text[line] = text[line].substring(0, text[line].length - 1);

      switch (c) {
      case 'A':
         isAlt = true;
	 break;
      case 'C':
         isCaps = true;
	 break;
      case 'W':
         while (text[line].length > 0 && lastChar() != ' ')
            deleteChar();
         if (line > 0)
            line--;
         break;
      case 'D':
         if (text[line].length > 0)
            deleteChar();
         else if (line > 0)
            line--;
         break;
      case 'E':
         text[++line] = '';
         break;
      default:
         if (isCaps && c >= 'a' && c <= 'z')
	    c = c.toUpperCase();
         isCaps = false;
         isAlt = false;
         text[line] += c;
      }
      P = [];
   }];

   this.output = () => text.join('\n');

   this.render = function() {
      mCurve([[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]);
      this.afterSketch(() => {
         if (isVerbose) {
            mCurve(P);
            textHeight(this.mScale(.15));
	    color(isWhiteBackground() ? 'black' : 'gray');
	    for (let row = 0 ; row < 9 ; row++) {
	       let y = .02 + floor(row/3) * .7 + (row%3) * .18;
	       for (let col = 1 ; col < 16 ; col += 6) {
	          let c = lcCharTable[row].substring(col, col+5);
		  c = c.replace(/C/, U_ARROW);
		  c = c.replace(/A/, BULLET);
	          mText(c, [-.88 + .125 * col,.9 - y], .5,.5);
               }
            }
         }
      });
   }
}
