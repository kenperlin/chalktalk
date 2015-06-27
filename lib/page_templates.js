
function blankPage_(t, defaultImage) {
   setPageTiming(t);
   blankPage(defaultImage);
}

function textPage_(t, text, spacing) {
   setPageTiming(t);
   blankPage(text, spacing);
}

function imagePage_(t, file, spacing, imageWidth, caption) {
   setPageTiming(t);
   imagePage(file, spacing, imageWidth, caption);
}

function setPageTiming(t) {
   var tMin, tMax;

   if (isNumeric(t)) {
      tMin = 0;
      tMax = t;
   }

   else if (t instanceof Array) {
      tMin = t[0];
      tMax = t[1];
   }

   else {
      console.log('setPageTiming: Badly formed argument ' + t);
      return;
   }

   // STILL NEED TO IMPLEMENT THIS PART.

}


function blankPage(defaultImage) {
   return {
      availableSketches: sketchTypes,
      defaultImage: defaultImage,
      pan: 0,
      innerHTML: ""
   }
}

function textPage(text, spacing) {
   return {
      availableSketches: sketchTypes, pan: 0, innerHTML: '\
         <center>\
         <table width=1280>\
         <tr height=' + (spacing === undefined ? 100 : spacing) + '></tr>\
         <tr>\
            <td>\
               <center>\
               <font size=10>\
	       ' + text + '\
               </font>\
               </center>\
               </td>\
            </tr>\
         </table>\
         <tr height=1000></tr>\
         </center>\
      ',
   };
}

function imagePage(file, spacing, imageWidth, caption) {
   return {
      availableSketches: sketchTypes,
      pan: 0,
      innerHTML: '\
         <table width=1280>\
         <tr height=' + (spacing === undefined ? 100 : spacing) + '></tr>\
         <tr>\
            <th><img src="' + file + '" width=' + imageWidth + '></th>\
            </tr>\
	 ' + (caption === undefined ? '' : '<tr><th><font size=7>' + caption + '</th></tr>') + '\
         </table>\
      ',
   };
}

var text_page_template = {
   availableSketches: sketchTypes, pan: 0, innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=200></tr>\
      <tr>\
         <td>\
            <center>\
            <font size=10>\
	    <b>This is a text page example</b>\
	    <p>\
            </font>\
            </center>\
            </td>\
         </tr>\
      </table>\
      <tr height=1000></tr>\
      </center>\
   ",
};

var image_page_template = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=140></tr>\
      <tr>\
         <th><img src=course_imgs/lightcycles.jpg width=700></th>\
         </tr>\
      </table>\
   ",
};

var video_page_template = {
   availableSketches: sketchTypes, pan: 0, innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr>\
         <th><video class=vid width='60%' height='auto'>\
            <source src='videos/modestDevil.mp4'>\
            </video></th>\
         </tr>\
      </table>\
   ",
   template: "videos/modestDevil.mp4"
};

