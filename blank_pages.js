var sketchTypes = (
  "Ball Teleg "
+ "Lens Grid Hammer Lattice Motion "
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
   blankPage(),
   blankPage(),
   blankPage(),
   blankPage(),
   blankPage(),
   blankPage(),
   blankPage(),
];
