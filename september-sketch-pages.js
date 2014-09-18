var sketchTypes =
"Bird Control Diagram Graph Logic Func Physics IO Grid Lattice Motion Noises MothAndCandle Rocket Ray1 Vec4 Mat4 Cyl1 F1D F2D".split(' ');

function blankPage() {
   return {
      availableSketches: sketchTypes,
      pan: 0,
      innerHTML: ""
   }
}

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
            <b>Thinking procedurally</b>\
            <p>\
            <small>from textures\
            <br>\
            to magic blackboards</small>\
            <br>&nbsp;<p>\
            <i><small>Ken Perlin</small></i>\
            </font>\
            </center>\
            </td>\
         </tr>\
      </table>\
      <tr height=1000></tr>\
      </center>\
   ",
   template: [
      ["Early experiences and<br>current influences<br>in computer graphics"],
      ["<i><small>Ken Perlin</small></i>"]
   ]
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
   ",
   template: [
      ["&nbsp;<p><big><b>My Textured Life</b></big>"],
      ["<i><small>Ken Perlin</small></i>"]
   ]
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
   ",
   template: "videos/modestDevil.mp4"
};

var page2 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=140></tr>\
      <tr>\
         <th><img src=imgs/lightcycles.jpg width=700></th>\
         </tr>\
      </table>\
   ",
   template: "imgs/lightcycles.jpg"
};

var page3 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=70></tr>\
      <tr>\
         <th width=600><img src=imgs/cad.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var page4 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=70></tr>\
      <tr>\
         <th><img src=imgs/blinn_02.jpg width=400></th>\
         <th width=600></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page5 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=70></tr>\
      <tr>\
         <th><img src=imgs/blinn_02.jpg width=400></th>\
         <th width=600><img src=imgs/saturn.jpg width=600></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page6 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <center>\
      <table width=1280 cellpadding=0 cellspacing=0>\
      <tr height=150></tr>\
      <tr>\
        <td width=300></th>\
        <th>\
           <font color=white size=10>\
   	Artist:\
           </th>\
        <td width=50>\
           </td>\
        <td>\
           <font color=white size=10>\
           <small><i>Use programs<br>to make art.</i></small>\
           </td>\
        <td width=300></th>\
        </tr>\
      <tr height=100><th></th><th><hr></th><th><hr></th><th><hr></th></tr>\
      <tr>\
        <td width=300></th>\
        <th>\
           <font color=white size=10>\
   	Programmer:\
           </th>\
        <td width=50>\
           </td>\
        <td>\
           <font color=white size=10>\
           <small><i>Write programs<br>for others.</i></small>\
           </td>\
        <td width=300></th>\
        </tr>\
      </table>\
      <tr height=1000></tr>\
      </center>\
   "
};

var page7 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=160></tr>\
      <tr>\
         <th width=600><img src=imgs/candle_wsr.jpg width=650></th>\
         <th width=500></th>\
         </tr>\
      </table width=1280>\
   "
};

var page8 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=250></tr>\
      <tr>\
        <th width=300></th>\
        <th>\
           <font color=white size=10>\
   	Artist<br>Programmer:\
           </th>\
        <th width=50>\
           </th>\
        <td>\
           <font color=white size=8>\
           <i>Write programs<br>to make art!</i>\
           </td>\
        <th width=300></th>\
        </tr>\
      </table>\
      </center>\
   "
};

var page10 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <div style='padding-left:240px;padding-top:50px'>\
         <table width=800>\
         <tr>\
            <th><img src=imgs/fant-bb-1.jpg width=400></th>\
            <th><img src=imgs/fantasia-recr013.jpg width=400></th>\
            </tr>\
         <tr>\
            <th><img src=imgs/fanta2004.jpg width=400></th>\
            <th><img src=imgs/fant-ggt.jpg width=400></th>\
            </tr>\
         </table>\
      </div>\
   "
};

var page11 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=140></tr>\
      <tr>\
         <th width=600><img src=imgs/noise_sheet.png width=800></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page13 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th width=600><img src=imgs/weird_science2.jpg width=100%></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page14 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=20></tr>\
      <tr>\
         <th width=600><img src=imgs/vase.png width=420></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page16 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <td><center><font color=white size=8>&nbsp;<br>movement</font></center></td>\
         </tr>\
      </table>\
   "
};

var page17 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th width=600><img src=imgs/long_nose.jpg width=600></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var page19 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=0></tr>\
      <tr>\
         <th><video class=vid width='100%' height='auto'>\
             <source src='videos/movieCut.mp4'>\
           </video></th>\
         </tr>\
      </table>\
   "
};

var page100 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=120></tr>\
      <tr>\
         <th><img src=imgs/ken_at_blackboard.png></th>\
         </tr>\
      </table>\
   "
};

var page101 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <center>\
      <table width=1280>\
      <tr height=20></tr>\
      <tr>\
         <th><img src=imgs/coursepage_screenshot.png></th>\
         </tr>\
      </table>\
      </center>\
   "
};

var page102a = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>1914</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/gertie.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var page102b = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>1955</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/harold.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var page102c = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>1963</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/whoopee.png width=600></th>\
         </tr>\
      </table>\
   "
};

var page102 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=200></tr>\
      <tr>\
         <th><img src=imgs/gertie.jpg  height=200></th>\
         <th><img src=imgs/harold.jpg  height=200></th>\
         <th><img src=imgs/whoopee.png height=200></th>\
         </tr>\
      </table>\
   "
};

var page103 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr><th><font size=10 color=black>This is the dawn of</font></th></tr>\
      <tr><th><font size=10 color=black>the age of computer graphics</font></th></tr>\
      <tr height=50></tr>\
      <tr>\
         <th><img src=imgs/gumball_machine.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var page104 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2011</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/arcade.png width=670></th>\
         </tr>\
      </table>\
   "
};

var page104a = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2012</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/sony_glasses.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var page104b = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2013</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/david_smith_ar_device.png width=500></th>\
         </tr>\
      </table>\
   "
};

var page104c = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2014</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/valve_vr_room.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var page104d = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2019-2021</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/glasses2.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var page104e = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>2025-2030</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/contact_lens.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var page104f = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/rainbows_end.jpg width=350></th>\
         </tr>\
      </table>\
   "
};

var page104g = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr><th><font size=10 color=white><small>People don't need a GUI<br>\
                                        to talk with each other</small><p>&nbsp;<p></font></th></tr>\
      <tr>\
         <th><img src=imgs/kids-talking.jpg width=550></th>\
         </tr>\
      </table>\
   "
};

var page104h = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/ken-perlin-at-the-cdm.jpg width=700></th>\
         </tr>\
      </table>\
   "
};

var page104i = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/vihartDragon.png width=700></th>\
         </tr>\
      </table>\
   "
};

var page105 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=80></tr>\
      <tr>\
         <th><img src=imgs/senghas.jpg width=400></th>\
         </tr>\
      </table>\
   "
};

var page106 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=180></tr>\
      <tr>\
         <th><img src=imgs/child_gesture.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var pagemarg1 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/1.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg2 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/2.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg3 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/3.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg4 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/4.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg5 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/5.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg6 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/6.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var pagemarg7 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th><img src=imgs/7.jpg width=1200></th>\
         </tr>\
      </table>\
   "
};

var page106a = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr><th><font size=10 color=white><small>In the future:<p>\
                                        <small>&bull; Any wall can be a display<p>\
                                        &bull; High quality touch everywhere</small>\
					</small></font></th></tr>\
      </table>\
   "
};

var page106b = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr><th><font size=10 color=white><small>In the future:<p>\
                                        <small>Language will extend to<br>\
                                        the very air between us.</small><p>\
					&nbsp;</small></font></th></tr>\
      <tr>\
         <th><img src=imgs/whoopee_fire.png width=500></th>\
         </tr>\
      </table>\
   "
};

var page107 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr>\
        <td>\
           <center>\
           <font color=white size=10>\
   	<br>&nbsp;<p>\
   	<small><small>\
   	<small><i>Special thanks to</i></small>\
   	<p>\
	<big>NYU Media Research Lab\
	<br>\
	The Centre for Digital Media\
   	<br>\
   	David Lobser\
   	<br>\
   	Evan Moore</big>\
   	</small></small>\
           </font>\
           </center>\
           </td>\
        </tr>\
      </table>\
   "
};

var sketchPages = [
   blankPage(),
   title_page,
   page1,
   page2,
   page3,
   page4,
   page5,
   page6,
   page7,
   page8,
   blankPage(),
   page10,
   page11,
   blankPage(),
   page13,
   page14,
   blankPage(),
   page16,
   page17,
   blankPage(),
   page19,
   page100,
   page101,
   page102a,
   page102b,
   page102c,
   page103,
   page104,
   page104a,
   page104b,
   page104c,
   page104d,
   page104e,
   page104f,
   page104g,
   page104h,
   page104i,
   page106b,
   page106,
];
