function SpotTracker(canvas) {
   this.getThreshold = () => threshold;
   this.setThreshold = t  => threshold = t;
   this.getColorMode = () => colorMode;
   this.setColorMode = c  => {
      colorMode = c = c % 3;
      targetColor = [c==0?1:0, c==1?1:0, c==2?1:0];
   }
   this.setColorFromCornerBegin = () => scfcMode = 1;
   this.setColorFromCornerEnd = () => scfcMode = 2;
   let scfcMode = 0,
       isGoodCamera = false,
       threshold = 0.1, colorMode = 0, xy = [],
       xs = x => screen.width == 1920 ? 3 * canvas.width - x * 4.75 + 660
                                      : 3 * canvas.width - x * 3.95 + 225,
       ys = y => screen.width == 1920 ? 3.5 * y : isGoodCamera ? 4 * y - 160 : 3 * y - 5,
       width = canvas.width,
       height = canvas.height,
       context = canvas.getContext('2d'),
       triggerMouseMove = (x,y) => events_canvas.onmousemove( { clientX: xs(x), clientY: ys(y) } ),
       targetColor = [255,0,0];
   this.update = function(video) {
      isGoodCamera = video.videoWidth / video.videoHeight < 1.5;
      context.drawImage(video, 0,0,width,height);
      let image = context.getImageData(0,0,width,height), data = image.data, nc = 0, xc = 0, yc = 0;

      let scc = test_canvas.getContext('2d');
      //scc.fillStyle = rgbToColor(scale(targetColor, 256));
      scc.fillStyle = rgbaToColor([255,128,255,32]);
      scc.clearRect(0,0,3*width,3*height);

      if (scfcMode == 2)
         targetColor = [0,0,0];
      for (let y = 0 ; y < height ; y++)
      for (let x = 0 ; x < width  ; x++) {
         let i = x + width * y << 2, r = data[i], g = data[i+1], b = data[i+2],
	     color = [max(r, 16), max(g, 16), max(b, 16)];
	 normalize(color);
	 if (distance(color, targetColor) < threshold) {
            nc++;
            xc += x;
            yc += y;
            scc.fillRect(xs(x), ys(y), 3, 3);
         }
	 if (scfcMode) {
	    let dx = (x - width /2) * 0.13,
	        dy = (y - height/2) * 0.10;
	    if (dx * dx + dy * dy < 1) {
	       scc.fillRect(xs(x), ys(y), 3, 3);
	       if (scfcMode == 2) {
	          targetColor[0] += r;
	          targetColor[1] += g;
	          targetColor[2] += b;
	       }
	    }
	 }
      }
      if (scfcMode == 2) {
         normalize(targetColor);
         scfcMode = 0;
      }
      if (nc > 10) {
         xc /= nc;
         yc /= nc;
         if (xy.length >= 2) {        // SMOOTH PATH BY LOOKING AT PREVIOUS TWO POINTS.
            while (xy.length > 2)
               xy.shift();
            xc = mix(xc, 2 * xy[1][0] - xy[0][0], .5);
            yc = mix(yc, 2 * xy[1][1] - xy[0][1], .5);
         }
         xy.push([xc, yc]);
         triggerMouseMove(xc, yc);

/* TO DO:
      Create proper looking image of glowing light cursor.
*/
      }
   }
}

