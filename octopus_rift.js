var sketchTypes = (
//"Ball Teleg Lens Grid Hammer Lattice Motion "
  "Lens Grid Lattice Motion "
+ "Noises MothAndCandle OldCamera Radio "
+ "Scroll Spike Typewriter Tablet Telegraph Television Book1"
).split(' ');

function blankPage() {
   return {
      availableSketches: sketchTypes,
      pan: 0,
      innerHTML: ""
   }
}

var magnet = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=120></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/magnet.png width=800></th>\
         </center>\
         </tr>\
      </table>\
   ",
};
var optitrack = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=120></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/optitrack.jpg width=800></th>\
         </center>\
         </tr>\
      </table>\
   ",
};

var theta = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=150></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/phd_students.jpg width=1280></th>\
         </center>\
         </tr>\
      </table>\
   ",
};

var tactonic1 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=120></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/tactonic2.jpg width=900></th>\
         </center>\
         </tr>\
      </table>\
   ",
};

var valvevr = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=150></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/valvevr.jpg width=800></th>\
         </center>\
         </tr>\
      </table>\
   ",
};

var heart = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=150></tr>\
      <tr>\
         <center>\
         <th><img src=imgs/heart.png width=800></th>\
         </center>\
         </tr>\
      </table>\
   ",
};

var or_background = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/OR_background.png width=1551 height=800></th>\
         </tr>\
      </table>\
   ",
};

var or_background_down = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/OR_background_down.png width=1551 height=800></th>\
         </tr>\
      </table>\
   ",
};

var text_page_template = {
   availableSketches: sketchTypes, pan: 0, innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=200></tr>\
      <tr>\
         <td>\
            <center>\
            <font color=white size=10>\
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

var sketchPages = [
   blankPage(),
   magnet,
   optitrack,
   theta,
   tactonic1,
   valvevr,
   heart,
   or_background,
   blankPage(),
];
