"use strict";

/*
  To do:  Try tiny colored lightbulb.  Track white center with colored halo.
*/

function LightTracker(_canvas) {
   var canvas = _canvas, width = canvas.width, height = canvas.height,
       context = canvas.getContext('2d');

   var triggerMouseMove = screen.width == 1920
      ? function(x, y) { events_canvas.onmousemove({ clientX: 3 * width - x * 4.75 + 660, clientY: y * 3.5     }); }
      : function(x, y) { events_canvas.onmousemove({ clientX: 3 * width - x * 3.95 + 225, clientY: y * 3.0 - 5 }); };

   var xy = [];

   var c3 = [];
   for (let theta = 0 ; theta < TAU ; theta += TAU / 8)
      c3.push([ Math.round(3 * cos(theta)), Math.round(3 * sin(theta)) ]);

   var c30 = [];
   for (let theta = 0 ; theta < TAU ; theta += TAU / 20)
      c30.push([ Math.round(30 * cos(theta)), Math.round(30 * sin(theta)) ]);

   this.update = function(video) {
      function isLight(x, y) {
         if (x < 0 || y < 0 || x >= width || y >= height)
	    return false;
         let i = x + width * y << 2;
         let r = data[i], g = data[i + 1], b = data[i + 2];
         return min(r, g, b) == 255;
      }

      function isLightSpot(x, y) {
         if (! isLight(x, y))
	    return false;

         for (let n = 0 ; n < c3.length ; n++)
	    if (! isLight(x + c3[n][0], y + c3[n][1]))
	       return false;

         for (let n = 0 ; n < c30.length ; n++)
	    if (isLight(x + c30[n][0], y + c30[n][1]))
	       return false;

         let rx = 1, ry = 1;
	 while (isLight(x - rx, y) && isLight(x + rx, y)) rx++;
	 while (isLight(x, y - rx) && isLight(x, y + ry)) ry++;
	 if (max(rx, ry) > 20 || ry/rx > 2 || rx / ry > 2)
	    return false;

         return true;
      }

      // GET VIDEO DATA FROM THE CAMERA.

      context.drawImage(video, 0, 0, width, height);
      var image = context.getImageData(0, 0, width, height), data = image.data;

      // FIND CENTROID OF BRIGHT SPOT.

      var nc = 0, xc = 0, yc = 0;
      for (let y = 0 ; y < height ; y++)
      for (let x = 0 ; x < width  ; x++)
         if (isLightSpot(x, y)) {
            xc += x;
            yc += y;
            nc++;
         }
      xc /= nc;
      yc /= nc;

      // IF THERE IS A BRIGHT SPOT, SIMULATE A MOUSE MOVE EVENT.

      if (nc > 0) {

         // BUT FIRST SMOOTH THE PATH BY LOOKING AT THE PREVIOUS TWO POINTS.

         if (xy.length >= 2) {
            while (xy.length > 2)
               xy.shift();
            xc = mix(xc, 2 * xy[1][0] - xy[0][0], .5);
            yc = mix(yc, 2 * xy[1][1] - xy[0][1], .5);
         }
         xy.push([xc, yc]);

         triggerMouseMove(xc, yc);
      }

      // SHOW TO USER THE LIGHT AREAS IN DARK RED, AND RECOGNIZED LIGHT SPOTS IN WHITE

      if (isShowingCameraData) {
         mirrorFlip(data, width);
	 let i = 0, x = 0, y = 0, i0 = [], i1 = [];
         for (y = 0 ; y < height ; y++)
         for (x = 0 ; x < width  ; x++) {
	    if (isLight(x, y))
	       i0.push(i);
	    if (isLightSpot(x, y))
	       i1.push(i);
	    i += 4;
         }
         data.fill(0);
	 for (let n = 0 ; n < i0.length ; n++)
	    data[i = i0[n]] = data[i+3] = 128;
	 for (let n = 0 ; n < i1.length ; n++)
	    data[i = i1[n]] = data[i+1] = data[i+2] = data[i+3] = 255;
      }

      // OR JUST CLEAR INPUT IMAGE SO THAT IT WILL NOT SHOW UP ON THE SCREEN.

      else
         data.fill(0);

      context.putImageData(image, 0, 0);
   }
}

