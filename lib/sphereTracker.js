"use strict";

function SphereTracker(canvas) {

   this.canvas = canvas;

   this.update = function(video) {
      var canvas = this.canvas, width = canvas.width, height = canvas.height;
      var context, image, x, y, z, i, n, radius, r, g, b, a, s, data, xSum, ySum, count;
      var center = [[0,0], [0,0], [0,0]];

      function set(i, r, g, b, a) {
         i = max(0, min(i, width * height - 1 << 2));
         data[i    ] = r;
         data[i + 1] = g;
         data[i + 2] = b;
         data[i + 3] = a;
      }

      function I(x,y) {
         x = floor(x);
         y = floor(y);
         return max(0, min(x, width-1)) + width * max(0, min(y, height-1)) << 2;
      }

      function n2r(n) { return n == 0 ? 255 : 0; }
      function n2g(n) { return n == 1 ? 255 : 0; }
      function n2b(n) { return n != 1 ? 255 : 0; }

      function classifyPixel(r, g, b) {
         return r > 180 && b > 100 && r > 1.2 * g && b >       g ? 1 :
                g > 100 &&            g >       r && g > 1.2 * b ? 2 :
                b > 100 &&            b >       r && b >       g ? 3 : 0;
      }

      context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, width, height);
      image = context.getImageData(0, 0, width, height);
      data = image.data;

      // FIND WHAT PIXELS ARE THE COLOR OF A TRACKABLE SPHERE.

      i = 0;
      for (y = 0 ; y < height ; y++)
      for (x = 0 ; x < width ; x++) {
         data[i] = data[i+1] = classifyPixel(data[i], data[i+1], data[i+2]);
         i += 4;
      }

      // IDENTIFY OUTLIERS TO REMOVE SPECKLE.

      i = 0;
      for (y = 0 ; y < height ; y++)
      for (x = 0 ; x < width ; x++) {
         if (data[i])
            for (var dx = -3 ; dx <= 3 ; dx++)
            for (var dy = -3 ; dy <= 3 ; dy++)
               if (data[I(x+dx,y+dy)] == 0) {
                  data[i+1] = 0;
                  dx = dy = 100;
               }
         i += 4;
      }

      // REMOVE OUTLIERS.

      i = 0;
      for (y = 0 ; y < height ; y++)
      for (x = 0 ; x < width ; x++) {
         if (data[i] != data[i+1])
            data[i] = 0;
         i += 4;
      }

      // COMPUTE XYZ POSITION OF SPHERE.

      for (n = 0 ; n < 3 ; n++) {
         xSum = ySum = count = 0;
         var xAvg = 0, yAvg = 0;

         i = 0;
         for (y = 0 ; y < height ; y++)
         for (x = 0 ; x < width ; x++) {
            if (data[i] == n+1) {
               xSum += x;
               ySum += y;
               count++;
            }
            i += 4;
         }

         if (count > 10) {
            xAvg = xSum / count;
            yAvg = ySum / count;

            x =  xAvg / width  - 0.5;
            y = (yAvg / height - 0.5) * height / width;
            z = 1.5 * Math.sqrt((height * width) / count);

            tracked[n] = [ -1.5 * x * z, -1.5 * y * z, z ];
         }
         else {
            xAvg = yAvg = 0;
            tracked[n] = [ 0, 0, 0 ];
         }
         center[n][0] = xAvg;
         center[n][1] = yAvg;
      }

      // SHOW RESULTS ON THE CANVAS.

      for (i = 0 ; i < data.length ; i++)
         data[i] = 0;

      for (n = 0 ; n < 2 ; n++)
         if (tracked[n][2]) {
            for (i = 0 ; i < 3 ; i++)
               tracked[n][i] = rounded(tracked[n][i], 3);

            x = width - 1 - center[n][0];
            y =             center[n][1];
            radius = height / tracked[n][2];
            r = n2r(n);
            g = n2g(n);
            b = n2b(n);
            for (a = 0 ; a < 2 * PI ; a += .03) {
               var c = cos(a);
               var s = sin(a);
               for (i = radius/2 ; i < radius ; i++)
                  set(I(x + i * c, y + i * s), r, g, b, 255);
            }
         }

      context.putImageData(image, 0, 0);

      // SEND THE RESULTS TO OTHER CLIENTS.

      server.broadcastGlobal('tracked');
   }
}

