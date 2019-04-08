"use strict";

let imageLibrary_adjustVertical = 0;
let imageLibrary_alpha = 0;
let imageLibrary_bgImages = [];
let imageLibrary_captions = [];
let imageLibrary_currentLevel = 1;
let imageLibrary_fontHeight = 80;
let imageLibrary_imageLevel = [];
let imageLibrary_imageNames = [];
let imageLibrary_images = [];
let imageLibrary_index = 0;
let imageLibrary_isShowingImage = true;
let imageLibrary_isShowingLibrary = false;
let imageLibrary_rowHeight = 100;
let imageLibrary_scaleImage = 0.8;
let imageLibrary_backgroundColor = 'black';

function imageLibrary_value(i) {
   i = i === undefined ? imageLibrary_index : i;
   return imageLibrary_images[i];
}

function imageLibrary_name(i) {
   i = i === undefined ? imageLibrary_index : i;
   return imageLibrary_imageNames[i];
}

function imageLibrary_type(i) {
   return typeof imageLibrary_value(i) == 'function'   ? 'function' :
          typeof imageLibrary_value(i) == 'string'     ? 'string' :
          ! imageLibrary_name(i)                       ? 'null' :
          imageLibrary_name(i).substring(0,3) == 'bg:' ? 'bg' :
                                                         'image' ;
}

function imageLibrary_toggle() {
   if (imageLibrary_alpha == 1)
      imageLibrary_alpha = 0.99;
   else
      imageLibrary_isShowingLibrary = ! imageLibrary_isShowingLibrary;
}

function imageLibrary_toggleLevel() {
   imageLibrary_currentLevel = 1 - imageLibrary_currentLevel;
   imageLibrary_createCanvasImage();
}

function imageLibrary__previousImage_() {
   do {
      imageLibrary_index = (imageLibrary_index + imageLibrary_images.length - 1) % imageLibrary_images.length;
   }
   while (imageLibrary_imageLevel[imageLibrary_index] > imageLibrary_currentLevel || imageLibrary_type() == 'function');
}

function imageLibrary__nextImage_() {
   do {
      imageLibrary_index = (imageLibrary_index + 1) % imageLibrary_images.length;
   }
   while (imageLibrary_imageLevel[imageLibrary_index] > imageLibrary_currentLevel);
}

function imageLibrary_setBgImage(image) {
   if (imageLibrary_bgImages[imageLibrary_index])
      window.bgImage = imageLibrary_bgImages[imageLibrary_index];
   else
      delete window.bgImage;
}

function imageLibrary_previousImage() {
   if (imageLibrary_index >= 0) {
      imageLibrary_isShowingImage = true;
      imageLibrary__previousImage_();
      imageLibrary_alpha = 1;
      imageLibrary_setBgImage();
   }
}

function imageLibrary_nextImage() {
   if (imageLibrary_index >= 0) {
      imageLibrary_isShowingImage = true;
      imageLibrary__nextImage_();
      imageLibrary_alpha = 1;
      imageLibrary_setBgImage();

      if (imageLibrary_type() == 'function')
         imageLibrary_value()();
   }
}

function imageLibrary_load() {
   function loadImages(ls) {
      let bgImage = null;
      for (let n = 0 ; n < ls.length ; n++) {
         let value = ls[n];

         let isArray = Array.isArray(value);

         let level = 0;
         if (typeof value == 'string' && value.substring(0, 2) == '- ') {
            level = 1;
            value = value.substring(2, value.length);
         }

         imageLibrary_imageLevel.push(level);
         imageLibrary_imageNames.push(isArray ? value[0] : value);

         if (typeof value == 'function' || isArray) {
            imageLibrary_images.push(isArray ? value[1] : value);
         }
         else if (value.length >= 5 && value.substring(0, 6) == 'title:') {
            let message = value.substring(6, value.length);
            imageLibrary_images.push(message);
         }
         else if (value.length >= 4 && value.substring(0, 5) == 'html:') {
            imageLibrary_images.push(value);
         }
         else if (value.length >= 3 && value.substring(0, 3) == 'bg:') {
	    bgImage = null;
            let fileName = value.substring(3, value.length);
	    if (fileName.length) {
               bgImage = new Image();
               bgImage.src = "images/" + fileName;
	    }
            imageLibrary_images.push(bgImage);
         }
         else {
            if (value.length >= 8 && value.substring(0, 8) == 'caption:') {
               let i = value.indexOf(';');
               imageLibrary_captions[imageLibrary_images.length] = value.substring(8, i);
               value = value.substring(i + 1, value.length);
            }
            let image = new Image();
            image.src = "images/" + value;
            imageLibrary_images.push(image);
         }
         imageLibrary_bgImages.push(bgImage);
      }
      imageLibrary_backgroundColor = backgroundColor;
      setTimeout(imageLibrary_createCanvasImage, 5000);
   }
   if (window.imageSequence !== undefined) {
      loadImages(imageSequence);
      return;
   }
   try {
      let lsRequest = new XMLHttpRequest();
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

let fontStyle = new FontStyle();

function imageLibrary_createCanvasImage() {

   let i, x = 0, y = 0, dy = imageLibrary_rowHeight,
       dx = dy * width() / height(), margin = 5,
       canvas, context, iw, ih, xlo, xhi, ylo, yhi, lines, str, n;

   canvas = document.createElement('canvas');
   canvas.width = width();
   canvas.height = height();
   context = canvas.getContext('2d');

   let fh = imageLibrary_fontHeight * (dy - 2 * margin) / height();
   for (i = 0 ; i < imageLibrary_images.length ; i++) {
      if (imageLibrary_imageLevel[i] > imageLibrary_currentLevel)
         continue;

      let value = imageLibrary_value(i);
      let type  = imageLibrary_type(i);

      if (type == 'string' || type == 'function') {

         let _fh = fontStyle.isSmall ? fh/2 : fh;
         if (x + dx > width()) {
            x = 0;
            y += dy;
         }

         if (type == 'function') {
            let name = imageLibrary_imageNames[i];
            value = typeof name == 'string' ? name : value.toString();
         }

         value = fontStyle.parse(value);
         lines = value.split('\n');

         context.font = fontStyle.createFont(fh);
         context.fillStyle = type == 'function' ? isBlackBackground() ? 'pink' : 'red'
                                                : isBlackBackground() ? scrimColor(0.7) : 'black';
         for (n = 0 ; n < lines.length ; n++) {
            str = lines[n];
            context.fillText(str, x + dx / 2 - context.measureText(str).width / 2,
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
      else if (value instanceof Image || type == 'bg') {
         if (value && value.width == 0) {
            context.drawImage(value, 0, 0, context.width, context.height);
         }
         else {
            iw = value ? dy * min(2, value.width / value.height) * imageLibrary_scaleImage : dx;
            if (x + iw > width()) {
               x = 0;
               y += dy;
            }
            if (value) {
               if (type == 'bg')
                  context.drawImage(value, x, y, dx, dy);
               else {
                  ih = iw * value.height / value.width;
                  xlo = x + (dx - iw) / 2;
                  xhi = xlo + iw;
                  ylo = y + (dy - ih) / 2;
                  yhi = y + (dy + ih) / 2;
                  context.drawImage(value, xlo + margin,
                                           ylo + margin,
                                           xhi - xlo - 2 * margin,
                                           yhi - ylo - 2 * margin);
               }
            }
            if (type == 'bg') {
               context.strokeStyle = 'green';
               context.lineWidth = 2;
               context.beginPath();
               context.moveTo(x     , y     );
               context.lineTo(x + dx, y     );
               context.lineTo(x + dx, y + dy);
               context.lineTo(x     , y + dy);
               context.lineTo(x     , y     );
               context.stroke();
            }
            x += dx;
         }
      }
   }
   window.imageLibrary_canvasImage = context.getImageData(0, 0, width(), height());
}

function imageLibrary_selectAction() {
   if (imageLibrary_type() == 'function') {
      imageLibrary_value()();
      imageLibrary__nextImage_();
   }
}

function imageLibrary_update() {
   if (imageLibrary_backgroundColor != backgroundColor) {
      imageLibrary_backgroundColor = backgroundColor;
      imageLibrary_createCanvasImage();
   }

   let canvas = document.getElementById('slide_canvas');
   let context = canvas.getContext('2d');
   context.clearRect(0, 0, canvas.width, canvas.height);

   if (! window.imageLibrary_canvasImage) {
      context.fillStyle = 'violet';
      context.font = '20px Arial';
      context.fillText("Loading...", 2, 20);
   }

   else if (imageLibrary_isShowingLibrary) {
      imageLibrary_index = -1;
      imageLibrary_alpha =  0;
      (function() {
         let i, x = 0, y = 0, image, dy = imageLibrary_rowHeight;
         let dx = dy * width() / height(), iw, ih, xlo, xhi, ylo, yhi;
         let sx = sketchPage.x + _g.panX;
         let sy = sketchPage.y + _g.panY;

         context.putImageData(imageLibrary_canvasImage, 0, 0);

         for (i = 0 ; i < imageLibrary_images.length ; i++) {
            if (imageLibrary_imageLevel[i] > imageLibrary_currentLevel)
               continue;

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
            xhi = x + dx;
            ylo = y + (dy - ih) / 2;
            yhi = y + (dy + ih) / 2;
            if ( xlo <= sx && xhi > sx && ylo <= sy && yhi > sy ) {

               annotateStart(context);
               context.lineWidth = 6;
               context.strokeStyle = 'blue';
               context.beginPath();
               context.moveTo(xlo, ylo);
               context.lineTo(xhi, ylo);
               context.lineTo(xhi, yhi);
               context.lineTo(xlo, yhi);
               context.lineTo(xlo, ylo);
               context.stroke();
               annotateEnd(context);

               imageLibrary_index = i;
               imageLibrary_alpha = 1;

               break;
            }
            x += dx;
         }
      })();
   }
   else if (imageLibrary_index >= 0 && imageLibrary_isShowingImage && ! isShowingGif) {
      (function() {
         let scale = imageLibrary_scaleImage;
         let y0 = height() * mix(0.5, 0.69, sCurve(imageLibrary_adjustVertical));

         let i = imageLibrary_index, w, h;
         while (imageLibrary_type(i) == 'function' || imageLibrary_type(i) == 'bg')
            i = (i + imageLibrary_images.length - 1) % imageLibrary_images.length;
         let value = imageLibrary_value(i);

         context.save();

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

         if (imageLibrary_alpha < 1) {
            context.globalAlpha = sCurve(imageLibrary_alpha);
            imageLibrary_alpha -= 0.03;
            if (sketchPage.mageLibrary_alpha < 0.03)
               imageLibrary_alpha = 0;
         }

         window.isImageSlide = false;

         if (value instanceof Image) {
            window.isImageSlide = true;
            context.drawImage(value, width() * .5 - w/2, y0 - h/2, w, h);

            let caption = imageLibrary_captions[imageLibrary_index];
            if (caption) {
                context.fillStyle = isBlackBackground() ? scrimColor(0.7) : 'black';
                let fh = imageLibrary_fontHeight / 2;
                context.font = fontStyle.createFont(fh);
                let sw = context.measureText(caption).width;
                context.fillText(caption, (width() - sw) / 2, fh);
            }
         }
         else if (value) {
            let x = width() * .5;
            let y = y0;
            let dy = imageLibrary_rowHeight;
            context.fillStyle = isBlackBackground() ? scrimColor(0.5) : 'black';
            let fh = imageLibrary_fontHeight;

            value = fontStyle.parse(value);
            context.font = fontStyle.createFont(fh);

            if (fontStyle.isSmall)
               fh /= 2;
            let lines = value.split('\n');
            for (let n = 0 ; n < lines.length ; n++) {
               let str = lines[n];
               context.fillText(str, x - context.measureText(str).width / 2,
                                     y + (1 - lines.length/2 + n) * fh * 1.1);
            }
         }

         context.restore();
      })();

      imageLibrary_setBgImage();

      if (isSpeakerNotes) {
         let i = imageLibrary_index;
         let value = imageLibrary_imageNames[(i + 1) % imageLibrary_imageNames.length];
         if (typeof value == 'function') {
            let name = imageLibrary_imageNames[i];
            value = typeof name == 'string' ? name : value.toString();
         }
         if (value.indexOf('title:') == 0)
            value = value.substring('title:'.length, value.length);
         while ((i = value.indexOf('<')) == 0)
            value = value.substring(value.indexOf('>') + 1, value.length);
         if ((i = value.indexOf('\n')) >= 0)
            value = value.substring(0, i);
         speakerNotes = value;
      }
      else
         speakerNotes = undefined;
   }
}

