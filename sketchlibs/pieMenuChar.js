function PieMenuChar() {

   let lookup = [
      [ '   ' , 'utv' , '   ' ],
      [ '   ' , 's a' , '   ' ],
      [ '   ' , 'r b' , '   ' ],

      [ ' pq' , '   ' , 'cdw' ],
      [ 'o  ' , '   ' , '  e' ],
      [ 'Dnm' , '   ' , 'gfx' ],

      [ '   ' , 'l h' , '   ' ],
      [ '   ' , 'k j' , '   ' ],
      [ '   ' , 'ziy' , '   ' ],
   ];

   let col = [2,2,1,0,0,0,1,2],
       row = [1,0,0,0,1,2,2,2];

   this.getChar = (dir1, dir2) => {
      let col1 = col[dir1], row1 = row[dir1],
          col2 = col[dir2], row2 = row[dir2];
      return lookup[3 * row1 + row2][col1].charAt(col2);
   }

   // NEED TO TRACK THE N NEAREST MATCHES, THEN FACTOR IN PRIVILEGING SHORTER WORDS.

   this.find = C => {
      let glyph = new SketchGlyph('', [C]);
      let angleCurve = this.angleCurveFromCurve(C);
      let bestScore = 1000000, bestMatch = -1;
      let bestAngleScore = 1000000;
      for (let i = 0 ; i < glyphs.length ; i++) {
         let shapeScore = glyph.compare(glyphs[i]);
	 let angleScore = 50 * angleCurveDistance(angleCurve, angleCurves[glyphs[i].name]);
         let score = shapeScore + angleScore;
         if (score < bestScore) {
            bestScore = score;
            bestMatch = i;
         }
      }
      this.bestGlyph = glyphs[bestMatch];
      return this.bestGlyph.name;
   }

   this.angleCurve = name => angleCurves[name];
   this.curve = name => curves[name];
   this.nGlyphs = () => glyphs.length;

   let sizes = {};
   let curves = {};
   let angleCurves = {};

   let createCurve = (dir1, dir2) => {
      let angle = TAU * dir1 / 8,
          c = cos(angle),
          s = sin(angle);

      // CREATE THE SHAPE

      let C = [];
      let type = (12 + dir2 - dir1) % 8 - 4;
      switch (abs(type)) {
      case  0: C = [[0,0],[1,0]]; break; // LINE
      case  1: C = makeSpline([[0,0],[.5,.1],[.7,.6],[.6,.95],[.4,.95],[.3,.6],[.5,.1],[1,0]]); break; // LOOP
      case  2: C = makeSpline([[0,0],[.5,.1],[.9,.5],[1,1]]); break; // 90 DEGREE CURVE
      case  3: C = makeSpline([[0,0],[.8,.2],[1,.5],[.8,.8],[0,1]]); break; // 180 DEGREE CURVE
      }
      if (type < 0)
         for (let n = 0 ; n < C.length ; n++)
            C[n][1] *= -1;

      // ROTATE THE SHAPE INTO THE PROPER ORIENTATION

      for (let n = 0 ; n < C.length ; n++) {
         let x = C[n][0], y = C[n][1];
         C[n] = [c * x - s * y, s * x + c * y];
      }

      return C;
   }

   let curveSize = curve => {
      let xlo = 100, ylo = 100, xhi = -100, yhi = -100;
      for (let n = 0 ; n < curve.length ; n++) {
         xlo = min(xlo, curve[n][0]);
         xhi = max(xhi, curve[n][0]);
         ylo = min(ylo, curve[n][1]);
         yhi = max(yhi, curve[n][1]);
      }
      return max(xhi-xlo, yhi-ylo);
   }

   let addGlyph = (name, curve) => {
      curves[name] = curve;
      angleCurves[name] = this.angleCurveFromCurve(curve);
      glyphs.push(new SketchGlyph(name, [ curve ]));
      sizes[name] = curveSize(curve);
   }

   let concat = curves => {
      let dst = [], offset = [0,0];
      for (let n = 0 ; n < curves.length ; n++) {
         let C = curves[n];
         for (let i = 0 ; i < C.length ; i++)
            dst.push([C[i][0] + offset[0],
                      C[i][1] + offset[1]]);
         offset[0] += C[C.length-1][0];
         offset[1] += C[C.length-1][1];
      }
      return dst;
   }

   let updateDictionary = () => {
      let nWords1 = min(nWords, nWords0 + 100);
      for (let n = nWords0 ; n < nWords1 ; n++) {
         let word = wordList[n];
         if (word.length >= 2) {
            let C = [];
            for (let i = 0 ; i < word.length ; i++)
               C.push(curves[word.charAt(i)]);
            addGlyph(word, concat(C));
         }
      }
      nWords0 = nWords1;
   }

   this.isDictionaryComplete = () => nWords0 == nWords;

   this.update = () => {
      if (! this.isDictionaryComplete())
         updateDictionary();
   }

   this.angleCurveFromCurve = C => {
      C = resampleCurve(C, 64);

      let D = [];
      for (let n = 0 ; n < C.length - 1 ; n++)
         D.push([C[n+1][1] - C[n][1], C[n+1][0] - C[n][0]]);

      let A = [];
      for (let n = 0 ; n < D.length  ; n++)
         A.push(atan2(D[n][0], D[n][1]));

      return A;
   }

   let diff = (a,b) => min(abs(a-b), abs(a+TAU-b), abs(a-TAU-b));

   let angleCurvePointDistance = (A, B, i) => {
      let d = 10000;
      let j0 = max(i - 3, 0);
      let j1 = min(i + 4, A.length);
      for (let j = j0 ; j < j1 ; j++)
         d = min(d, diff(A[i], B[j]));
      return d * d;
   }

   let angleCurveDistance = (A, B) => {
      let score = 0, d0 = 0;
      for (let i = 0 ; i < A.length ; i++) {
         let d1 = angleCurvePointDistance(A, B, i);
         score += abs(d1 - d0);
	 d0 = d1;
      }
      return score;
   }

   this.angleCurvePointDistance = (A,B,i) => angleCurvePointDistance(A,B,i);

   let glyphs = [];

   for (let dir1 = 0 ; dir1 < 8 ; dir1++)
   for (let dir2 = 0 ; dir2 < 8 ; dir2++) {
      let ch = this.getChar(dir1, dir2);
      if (ch != ' ') {
         curves[ch] = createCurve(dir1, dir2);
         addGlyph(ch, curves[ch]);
      }
   }

   let D = [[-1,-1],[-1,1],[1,-1],[1,1]];
   for (let i = 0 ; i < 4 ; i++)
   for (let j = 0 ; j < 4 ; j++)
      addGlyph('S' + i + j, [ [0,0], D[i], add(D[i],D[j]) ]);

   let nWords = 0, nWords0 = 0;
   for (let n = 0 ; n < wordList.length ; n++)
      if (wordList[n].length > 7) {
         nWords = n;
         break;
      }
}

