function() {
   this.label = 'interp';
   var S = [[-1,-1],[0,1],[1,-1]];
   var n = 3, xy0 = newVec3(), xy1 = newVec3(), p = newVec3(-100,-100,0);
   this.onPress = function(point) {
      xy0.copy(point).applyMatrix4(this.pointToPixelMatrix);
      for (n = 0 ; n < 3 ; n++) {
         xy1.set(S[n][0], S[n][1], 0).applyMatrix4(this.pointToPixelMatrix);
         if (xy1.distanceTo(xy0) < clickSize()) {
            S[n][0] = point.x;
            S[n][1] = point.y;
            return;
         }
      }
      p.copy(point);
   }
   this.onDrag = function(point) {
      if (n < 3) {
         S[n][0] = point.x;
         S[n][1] = point.y;
      }
      else
         p.copy(point);
   }
   this.render = function() {
      this.afterSketch(function() {
         var gridSize = width() / 60;

         color(backgroundColor);
         mFillCurve(S);

         color(fadedColor(.3));
         annotateStart();

         var P = [];
         for (var i = 0 ; i < 3 ; i++)
             P.push(this.toPixel(S[i]));


         function xSlice(x) {
            var y0 = Number.MAX_VALUE, y1 = -y0;
            for (var i = 0 ; i < 3 ; i++) {
               var j = (i + 1) % 3;
               var xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
               if (x > min(xi, xj) && x < max(xi, xj)) {
                  var y = mix(yi, yj, (x - xi) / (xj - xi));
                  y0 = min(y0, y);
                  y1 = max(y1, y);
               }
            }
            return y0 < y1 ? [y0, y1] : [];
         }

         function ySlice(y) {
            var x0 = Number.MAX_VALUE, x1 = -x0;
            for (var i = 0 ; i < 3 ; i++) {
               var j = (i + 1) % 3;
               var xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
               if (y > min(yi, yj) && y < max(yi, yj)) {
                  var x = mix(xi, xj, (y - yi) / (yj - yi));
                  x0 = min(x0, x);
                  x1 = max(x1, x);
               }
            }
            return x0 < x1 ? [x0, x1] : [];
         }

         var xlo = floor(min(P[0][0],P[1][0],P[2][0]) / gridSize) * gridSize;
         var xhi = floor(max(P[0][0],P[1][0],P[2][0]) / gridSize) * gridSize;
         var ylo = floor(min(P[0][1],P[1][1],P[2][1]) / gridSize) * gridSize;
         var yhi = floor(max(P[0][1],P[1][1],P[2][1]) / gridSize) * gridSize;

         for (var x = xlo ; x <= xhi ; x += gridSize) {
            var slice = xSlice(x);
            if (slice.length >= 2)
               line(x, slice[0], x, slice[1]);
         }

         for (var y = ylo ; y <= yhi ; y += gridSize) {
            var slice = ySlice(y);
            if (slice.length >= 2)
               line(slice[0], y, slice[1], y);
         }

         var q = this.toPixel([p.x,p.y]);
         var qx = floor(q[0] / gridSize) * gridSize;
         var qy = floor(q[1] / gridSize) * gridSize;

         var s0 = ySlice(qy);
         var s1 = ySlice(qy + gridSize);
         if (s0.length == 2 && s1.length == 2) {
            color(fadedColor(.2));
            fillCurve([[s0[0],qy],[s0[1],qy],[s1[1],qy+gridSize],[s1[0],qy+gridSize]]);
            if (s0[0] < qx + gridSize && s0[1] > qx) {
               color(defaultPenColor);
               fillRect(qx, qy, gridSize, gridSize);
            }
         }

         annotateEnd();

      });
      mLine(S[1],S[0]);
      mLine(S[1],S[2]);
      mLine(S[0],S[2]);
   }
}
