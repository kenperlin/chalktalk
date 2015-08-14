function() {
   this.label = 'cube4d';
   this.is3D = true;
   this.mode = 3;
   var trackball = new Trackball(4);

// TRACKBALL CONTROLLED BY MOUSE DRAG

   var T0 = newVec3();
   this.onCmdClick = function() { this.mode++; }
   this.onClick = function() { trackball.identity(); }
   this.onPress = function(T1) { T0.copy(T1); }
   this.onDrag = function(T1) { trackball.rotate( [T0.x,T0.y,T0.z,1], [T1.x,T1.y,T1.z,1] ); T0.copy(T1); }

// VERTICES

   function _bit(n, b) { return n >> b & 1; }
   function bit(n, b) { return n >> b & 1 ? 1 : -1; }

   var C = [];
   for (var n = 0 ; n < 16 ; n++)
      C.push([ bit(n, 0), bit(n, 1), bit(n, 2), bit(n, 3) ]);

   var T = [];
   for (var n = 0 ; n < 16 ; n++)
      T.push([0,0,0,0]);

   var P = [];
   for (var n = 0 ; n < 16 ; n++)
      P.push([0,0,0]);

   var F1 = [[-1,0,0,0],[1,0,0,0],[0,-1,0,0],[0,1,0,0],[0,0,-1,0],[0,0,1,0],[0,0,0,-1],[0,0,0,1]];

   var F2 = [];
   for (var n = 0 ; n < 8 ; n++)
      F2.push([0,0,0,0]);

// PROJECTING FROM 4D TO 3D

   var tmp = [0,0,0,0];
   project = function(c, t, p) {
      trackball.transform(c, t);
      for (var i = 0 ; i < 3 ; i++)
         p[i] = t[i];
   }

   var S = [0,0,0,0];

   this.drawHyperface = function(rgb, C, a,b,c,d,e,f,g,h) {

      function myFillFace(a,b,c,d, rgb) {
         for (var j = 0 ; j < 4 ; j++)
            S[j] = (T[a][j] + T[b][j] + T[c][j] + T[d][j]) / 4 - C[j];

         var s = max(.1, min(1, (.75 + .5 * (S[0] + S[1] + S[2] + S[3]))));
         var R = floor(255 * rgb[0] * s);
         var G = floor(255 * rgb[1] * s);
         var B = floor(255 * rgb[2] * s);
         mFillFace([P[a],P[b],P[c],P[d]], 'rgba(' + R + ',' + G + ',' + B + ',.1)');
      }

      if ((this.mode % 5) < 4) {
         var zw = T[a][2] + T[b][2] + T[c][2] + T[d][2] + T[e][2] + T[f][2] + T[g][2] + T[h][2] +
                  T[a][3] + T[b][3] + T[c][3] + T[d][3] + T[e][3] + T[f][3] + T[g][3] + T[h][3] ;
         if (zw < 0)
            return;
      }

      mFillBackFaces = true;
      myFillFace(a,b,d,c, rgb);
      myFillFace(e,f,h,g, rgb);
      myFillFace(a,c,g,e, rgb);
      myFillFace(b,d,h,f, rgb);
      myFillFace(a,b,f,e, rgb);
      myFillFace(c,d,h,g, rgb);
      mFillBackFaces = false;
   }

   this._tmp = [0,0,0,0];

   this.render = function() {
      var r = 0.8;
      this.duringSketch(function() {
         mClosedCurve([[-1,-1],[-1,1],[1,1],[1,-1]]);
         mClosedCurve([[-r,-r],[-r,r],[r,r],[r,-r]]);
      });
      this.afterSketch(function() {
         for (var n = 0 ; n < 16 ; n++)
            project(C[n], T[n], P[n]);

         for (var n = 0 ; n < 8 ; n++)
            project(F1[n], F2[n], this._tmp);

         for (var i = 0 ; i < 4 ; i++)
            switch (this.mode % 5) {
            case 4:
               this.drawHyperface([1,1,1], F2[6], 0,1,2,3,4,5,6,7);
               this.drawHyperface([0,0,1], F2[4], 0,1,2,3,8,9,10,11);
               this.drawHyperface([0,1,0], F2[2], 0,1,4,5,8,9,12,13);
               this.drawHyperface([1,0,0], F2[0], 0,2,4,6,8,10,12,14);
               break;
            case 3:
               this.drawHyperface([1,1,1], F2[6], 0,1,2,3,4,5,6,7);
               this.drawHyperface([1,1,1], F2[7], 8,9,10,11,12,13,14,15);
            case 2:
               this.drawHyperface([0,0,1], F2[4], 0,1,2,3,8,9,10,11);
               this.drawHyperface([0,0,1], F2[5], 4,5,6,7,12,13,14,15);
            case 1:
               this.drawHyperface([0,1,0], F2[2], 0,1,4,5,8,9,12,13);
               this.drawHyperface([0,1,0], F2[3], 2,3,6,7,10,11,14,15);
            case 0:
               this.drawHyperface([1,0,0], F2[0], 0,2,4,6,8,10,12,14);
               this.drawHyperface([1,0,0], F2[1], 1,3,5,7,9,11,13,15);
            }

        this.extendBounds(P);
      });
   }
}
