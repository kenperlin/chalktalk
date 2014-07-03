var sketchTypes = ( "Bird Control Diagram Graph Logic Func Physics Shape3D IO Marker Grid Lattice PVase Noises" ).split(' ');

var title_page = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=200></tr>\
      <tr>\
        <td>\
           <center>\
           <font color=white size=10>\
           Early experiences and\
   	<br>\
           current influences\
   	<br>\
           in computer graphics\
           <br>&nbsp;<p>\
           <i><small>Ken Perlin</small></i>\
           </font>\
           </center>\
           </td>\
        </tr>\
      </table>\
      <tr height=1000></tr>\
      </center>\
   "
};

var page0 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=218></tr>\
      <tr>\
        <td>\
           <center>\
           <font color=white size=10>\
           <big><b>My Textured Life</b></big>\
           <p>&nbsp;<p>\
           <i><small>Ken Perlin</small></i>\
           </font>\
           </center>\
           </td>\
        </tr>\
      </table>\
      <tr height=1000></tr>\
      </center>\
   "
};

var page1 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr>\
         <th><video class=vid width='60%' height='auto'>\
             <source src='videos/modestDevil.mp4'>\
             </video></th>\
         </tr>\
      </table>\
   "
};

var sketchPages = [
   title_page,
   page0,
   page1
];
