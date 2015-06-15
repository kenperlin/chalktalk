
   // ALL THE POSSIBLE DRAWING COLORS.

   var paletteRGB = [
      [255,255,255],        // CHANGES BETWEEN WHITE AND BLACK, WHENEVER USER TOGGLES WITH '-' KEY.
      [255,128,120],        // PINK
      [255,  0,  0],        // RED
      [255,128,  0],        // ORANGE
      [255,255,  0],        // YELLOW
      [  0,255,  0],        // GREEN
      [  0,220,220],        // CYAN
      [  0,  0,255],        // BLUE
      [255,  0,255],        // MAGENTA
   ];

   var palette = [];
   for (var i = 0 ; i < paletteRGB.length ; i++)
      palette.push('rgb(' + paletteRGB[i][0] + ',' +
                            paletteRGB[i][1] + ',' +
                            paletteRGB[i][2] + ')' );

   function colorToRGB(colorName) {
      var R = 0, G = 0, B = 0;
      switch (colorName) {
      case 'white'  : R = 0.9; G = 0.9; B = 0.9; break;
      case 'black'  : R = 0.7; G = 0.7; B = 0.7; break;
      case 'red'    : R = 1.0; G = 0.0; B = 0.0; break;
      case 'orange' : R = 1.0; G = 0.5; B = 0.0; break;
      case 'green'  : R = 0.0; G = 0.6; B = 0.0; break;
      case 'cyan'   : R = 0.0; G = 0.8; B = 1.0; break;
      case 'blue'   : R = 0.0; G = 0.0; B = 1.0; break;
      case 'magenta': R = 1.0; G = 0.0; B = 1.0; break;
      default       : R = 0.5; G = 0.2; B = 0.1; break;
      }
      return [R, G, B];
   }

   function drawPalette(context) {
      if (context == undefined)
         context = _g;

      var w = width(), h = height(), nc = palette.length;

      annotateStart(context);
      for (var n = 0 ; n < nc ; n++) {
         var x = paletteX(n);
         var y = paletteY(n);
         var r = paletteR(n);

         context.fillStyle = palette[n];
         context.beginPath();
         context.moveTo(x - r, y - r);
         context.lineTo(x + r, y - r);
         context.lineTo(x + r, y + r);
         context.lineTo(x - r, y + r);
         context.fill();
      }
      annotateEnd(context);
   }

// GIVEN A CURSOR POSITION, FIND THE INDEX OF THE CORRESPONDING COLOR SWATCH IN THE PALETTE.

   function findPaletteColorIndex(x, y) {
      for (var n = 0 ; n < palette.length ; n++) {
         var dx = x - paletteX(n);
         var dy = y - paletteY(n);
            if (dx * dx + dy * dy < 20 * 20)
               return n;
      }
      return -1;
   }

// POSITION AND SIZE OF THE COLOR PALETTE ON THE UPPER LEFT OF THE SKETCH PAGE.

   function paletteX(i) { return 30 - _g.panX; }
   function paletteY(i) { return 30 + i * 30 - _g.panY; }
   function paletteR(i) {
      var index = paletteColorId >= 0 ? paletteColorId : sketchPage.colorId;
      return i == index ? 12 : 8;
   }

