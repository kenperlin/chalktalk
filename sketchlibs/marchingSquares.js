var marchingSquares = {
eval : function(image, width, Z) {
   var L = 0, R = 1, T = 2, B = 3, height = image.length / width, tag = [], C = [], m;
   var S = [[],[L,T],[T,R],[L,R],[B,L],[B,T],[T,L,B,R],[B,R],[R,B],[T,R,B,L],[T,B],[L,B],[R,L],[R,T],[T,L],[]];
   function I(x, y) { return image[x + width * y]; }
   function P(x, y) { return I(x, y) > Z; }
   function dehash(h) { return [ (h>>1) % width , Math.floor((h>>1) / width) , h & 1 ]; }
   function hash(x, y, s) { return (s==R?x+1:x) + width * (s==B?y+1:y) << 1 | s >> 1; }
   function join(a, b) { if (C[a].slice(-1)[0]>>1 == C[b][0]>>1) { C[a] = C[a].concat(C[b]); C[b] = []; } }
   for (let y = 0 ; y < height - 1 ; y++)
   for (let x = 0 ; x < width  - 1 ; x++) {
      let s = S[P(x,y) | P(x+1,y) << 1 | P(x,y+1) << 2 | P(x+1,y+1) << 3];
      if (s.length > 0)
         for (let n = 0 ; n < s.length ; n += 2) {
            let a = hash(x, y, s[n  ]), ta = tag[a],
	        b = hash(x, y, s[n+1]), tb = tag[b];
            tag[a] = tag[b] = true;
            if (tb) {
               for (m = 0 ; C[m][0] != b ; m++) ;
               C[m].unshift(a);
            }
            if (ta) {
               for (m = 0 ; C[m].slice(-1)[0] != a ; m++) ;
               C[m].push(b);
            }
            if (! ta && ! tb)
               C.push([a, b]);
         }
   }
   for (let m = 0 ; m < C.length-1 ; m++)
   for (let n = m+1 ; n < C.length ; n++) {
      join(m, n);
      join(n, m);
   }
   for (let m = 0 ; m < C.length ; m++)
      if (C[m].length == 0)
         C.splice(m--, 1);
   for (let m = 0 ; m < C.length ; m++)
   for (let i = 0 ; i < C[m].length ; i++) {
      let c = dehash(C[m][i]);
      let a = I(c[0], c[1]), b = I(c[0] + c[2], c[1] + 1-c[2]);
      let t = (Z - a) / (b - a);
      C[m][i] = [ c[0] + t * c[2], c[1] + t * (1-c[2]) ];
   }
   return C;
}
}; try { module.exports = marchingSquares; } catch(e) {}
