
var imageLibrary_adjustVertical = 0;
var imageLibrary_fontHeight = 80;
var imageLibrary_imageNames = [];
var imageLibrary_images = [];
var imageLibrary_isShowingImage = true;
var imageLibrary_isShowingLibrary = false;
var imageLibrary_rowHeight = 100;

function imageLibrary_toggle() {
   if (sketchPage.imageLibrary_alpha == 1)
      sketchPage.imageLibrary_alpha = 0.99;
   else
      imageLibrary_isShowingLibrary = ! imageLibrary_isShowingLibrary;
}

function imageLibrary_load() {
   function loadImages(ls) {
      for (var n = 0 ; n < ls.length ; n++) {
         var str = ls[n];
         imageLibrary_imageNames.push(str);

         if (str.length >= 5 && str.substring(0, 6) == 'title:') {
            var message = str.substring(6, str.length);
            imageLibrary_images.push(message);
         }
         else {
            var image = new Image();
            image.src = "images/" + str;
            imageLibrary_images.push(image);
         }
      }
      setTimeout(imageLibrary_createCanvasImage, 5000);
   }
   if (window.imageSequence !== undefined) {
      loadImages(imageSequence);
      return;
   }
   try {
      var lsRequest = new XMLHttpRequest();
      lsRequest.open("GET", "ls_images");

      lsRequest.onloadend = function () {
         if (lsRequest.responseText != "")
            loadImages(lsRequest.responseText.trim().split("\n"));
      }
      lsRequest.send();
   } catch (e) { }
}

function FontStyle() {
   this.isSmall = false;
   this.isItalic = false;
   this.isBold = false;

   this.parse = function(value) {
      this.isSmall = this.isItalic = this.isBold = false;
      while (value.indexOf('<') == 0) {
	 if (value.indexOf('<small>') == 0) {
	    this.isSmall = true;
	    value = value.substring('<small>'.length, value.length);
         }
	 if (value.indexOf('<i>') == 0) {
	    this.isItalic = true;
	    value = value.substring('<i>'.length, value.length);
         }
	 if (value.indexOf('<b>') == 0) {
	    this.isBold = true;
	    value = value.substring('<b>'.length, value.length);
         }
      }
      return value;
   }

   this.createFont = function(height) {
      return (this.isItalic ? 'italic ' : '')
           + (this.isBold ? 'bold ' : '')
	   + (this.isSmall ? height / 2 : height) + 'px Arial';
   }
}

var fontStyle = new FontStyle();

function imageLibrary_createCanvasImage() {

   var i, x = 0, y = 0, dy = imageLibrary_rowHeight, value,
       dx = dy * width() / height(), margin = 5,
       canvas, context, iw, ih, xlo, xhi, ylo, yhi, lines, str, n;

   canvas = document.createElement('canvas');
   canvas.width = width();
   canvas.height = height();
   context = canvas.getContext('2d');

   var fh = imageLibrary_fontHeight * (dy - 2 * margin) / height();
   for (i = 0 ; i < imageLibrary_images.length ; i++) {
      value = imageLibrary_images[i];
      if (typeof value === 'string') {

         value = fontStyle.parse(value);

	 var _dy = fontStyle.isSmall ? dy/2 : dy;
	 var _fh = fontStyle.isSmall ? fh/2 : fh;
         if (x + dx > width()) {
            x = 0;
            y += _dy;
         }
         context.fillStyle = scrimColor(0.7);

         context.font = fontStyle.createFont(fh);

         lines = value.split('\n');
         for (n = 0 ; n < lines.length ; n++) {
            str = lines[n];
            context.fillText(str, x + dx / 2 - textWidth(str, context) / 2,
                                  y + dy / 2 + (1 - lines.length/2 + n) * _fh * 1.1);
         }
         context.strokeStyle = defaultPenColor;
         context.lineWidth = 0.5;
         context.beginPath();
         context.moveTo(x      + margin, y      + margin);
         context.lineTo(x + dx - margin, y      + margin);
         context.lineTo(x + dx - margin, y + dy - margin);
         context.lineTo(x      + margin, y + dy - margin);
         context.lineTo(x      + margin, y      + margin);
         context.stroke();
         x += dx;
      }
      else if (value instanceof Image) {
         iw = dy * min(2, value.width / value.height);
         ih = iw * value.height / value.width;
         if (x + iw > width()) {
            x = 0;
            y += dy;
         }
         xlo = x;
         xhi = x + iw;
         ylo = y + (dy - ih) / 2;
         yhi = y + (dy + ih) / 2;
         context.drawImage(value, xlo + margin,
	                          ylo + margin,
	                          xhi - xlo - 2 * margin,
				  yhi - ylo - 2 * margin);
         x += iw;
      }
   }
   imageLibrary_canvasImage = context.getImageData(0, 0, width(), height());
}

function imageLibrary_update() {
   var canvas = document.getElementById('slide');
   var context = canvas.getContext('2d');
   context.clearRect(0, 0, canvas.width, canvas.height);

   if (isDef(window.imageLibrary_canvasImage) && imageLibrary_isShowingLibrary) {
      sketchPage.imageLibrary_index = -1;
      sketchPage.imageLibrary_alpha =  0;
      (function() {
         var i, x = 0, y = 0, image, dy = imageLibrary_rowHeight, iw, ih, xlo, xhi, ylo, yhi;
         var sx = sketchPage.x + _g.panX;
         var sy = sketchPage.y + _g.panY;

         context.putImageData(imageLibrary_canvasImage, 0, 0);

         for (i = 0 ; i < imageLibrary_images.length ; i++) {
            image = imageLibrary_images[i];
            if (! (image instanceof Image)) {
               iw = dy * width() / height();
               ih = dy;
            }
            else {
               iw = dy * min(2, image.width / image.height);
               ih = iw * image.height / image.width;
            }
            if (x + iw > width()) {
               x = 0;
               y += dy;
            }
            xlo = x;
            xhi = x + iw;
            ylo = y + (dy - ih) / 2;
            yhi = y + (dy + ih) / 2;
            if ( xlo <= sx && xhi > sx && ylo <= sy && yhi > sy ) {

               annotateStart(context);
               context.lineWidth = 6;
               context.strokeStyle = 'rgba(0,0,255,.5)';
               context.beginPath();
               context.moveTo(xlo, ylo);
               context.lineTo(xhi, ylo);
               context.lineTo(xhi, yhi);
               context.lineTo(xlo, yhi);
               context.lineTo(xlo, ylo);
               context.stroke();
               annotateEnd(context);

               sketchPage.imageLibrary_index = i;
               sketchPage.imageLibrary_alpha = 1;
               break;
            }
            x += iw;
         }
      })();
   }
   else if (sketchPage.imageLibrary_index >= 0 && imageLibrary_isShowingImage) {
      (function() {
	 var scale = 0.85;
         imageLibrary_adjustVertical = max(0, min(1, imageLibrary_adjustVertical + (isVideoLayer() ? .03 : -.03)));
         var y0 = height() * mix(0.5, 0.69, sCurve(imageLibrary_adjustVertical));

         context.save();

         var value = imageLibrary_images[sketchPage.imageLibrary_index], w, h;
         if (value instanceof Image) {
            if (value.width / value.height > width() / height()) {
               w = scale * width();
               h = w * value.height / value.width;
            }
            else {
               h = scale * height();
               w = h * value.width / value.height;
            }
         }

         if (sketchPage.imageLibrary_alpha < 1) {
            context.globalAlpha = sCurve(sketchPage.imageLibrary_alpha);
            sketchPage.imageLibrary_alpha -= 0.03;
            if (isketchPage.mageLibrary_alpha < 0.03)
               sketchPage.imageLibrary_alpha =  0;
         }

         if (value instanceof Image)
            context.drawImage(value, width() * .5 - w/2, y0 - h/2, w, h);
         else {
            x = width() * .5;
            y = y0;
            dy = imageLibrary_rowHeight;
            context.fillStyle = scrimColor(0.5);
            var fh = imageLibrary_fontHeight;

	    value = fontStyle.parse(value);
	    context.font = fontStyle.createFont(fh);

	    if (fontStyle.isSmall)
	       fh /= 2;
            lines = value.split('\n');
            for (n = 0 ; n < lines.length ; n++) {
               str = lines[n];
               context.fillText(str, x - textWidth(str, context) / 2,
                                     y + (1 - lines.length/2 + n) * fh * 1.1);
            }
         }

         context.restore();
      })();
   }
}

