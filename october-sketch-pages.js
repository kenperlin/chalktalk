var sketchTypes = (
  "Abacus Ball Bird C2S Control Cyl1 Diagram F1D F2D Flower Teleg "
+ "Func Graph Lens Logic Grid Hammer IO Lattice Mat4 Motion NGon "
+ "Noises MothAndCandle OldCamera Physics Radio Reflect Rocket Ray1 Vec4 S2C "
+ "Scroll Spike Typewriter Tablet Telegraph Television Book1"
).split(' ');

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
	    <b>The Coming Age\
	    <br>of Computer Graphics\
	    <p>and the Evolution\
	    <br>of Language</b>\
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

var greenScreen = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=50></tr>\
      <tr>\
         <th><video style='-webkit-transform: scale(-1,-1); transform: scale(-1,-1);' class=vid width='60%' height='auto'>\
            <source src='videos/IMG_1239.MOV'>\
            </video></th>\
         </tr>\
      </table>\
   ",
   template: "videos/IMG_1239.MOV"
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

var cave_wall = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr>\
         <th width=600 height=800><img src=imgs/cave.jpg width=100% height=100%></th>\
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
         <th width= 50></th>\
         <th width=600><img src=imgs/weird_science2.jpg width=100%></th>\
         <th width= 50></th>\
         </tr>\
      </table>\
   "
};

var marble_vase = {
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

var long_nose = {
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

var gertie = {
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

var compose_perform = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/compose_perform.png width=1000></th>\
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

var gumball_machine = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=0></tr>\
      <tr><th><font size=10 color=black>This is the dawn of</font></th></tr>\
      <tr><th><font size=10 color=black>the age of computer graphics</font></th></tr>\
      <tr height=50></tr>\
      <tr>\
         <th><img src=imgs/gumball_machine.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var arcade = {
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

var smith_ar = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>A.R. today</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/david_smith_ar_device.png width=500></th>\
         </tr>\
      </table>\
   "
};

var valve_vr = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>V.R. today</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/valve_vr_room.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var eyeglasses = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>A.R. in 10 years</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/glasses2.jpg width=600></th>\
         </tr>\
      </table>\
   "
};

var contact_lens = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr><th><font size=10 color=white>&nbsp;<br>A.R. in 25 years</font></th></tr>\
      <tr height=100></tr>\
      <tr>\
         <th><img src=imgs/contact_lens.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var rainbows_end = {
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

var kids_talking1 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=30></tr>\
      <tr><th><font size=10 color=white><small>People don't use<br>\
                                        buttons, menus and sliders<br>\
                                        to talk with each other</small><p>&nbsp;<p></font></th></tr>\
      <tr>\
         <th><img src=imgs/kids_talking1.jpg width=550></th>\
         </tr>\
      </table>\
   "
};

var kids_talking2 = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=30></tr>\
      <tr><th><font size=10 color=white><small>Kids will evolve<br>\
                                        language using whatever<br>\
                                        is available.</small><p>&nbsp;<p></font></th></tr>\
      <tr>\
         <th><img src=imgs/kids_talking2.jpg width=550></th>\
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

var vi_hart = {
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

var ann_senghas = {
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

var child_gesture = {
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

var kwalado = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=170></tr>\
      <tr>\
         <th width=600><img src=imgs/kwalado.jpg width=500></th>\
         </tr>\
      </table>\
   "
};

var creolization = {
   availableSketches: sketchTypes,
   pan: 0,
   innerHTML: "\
      <table width=1280>\
      <tr height=100></tr>\
      <tr>\
         <th width=1000><img src=imgs/creolization.png width=1000></th>\
         </tr>\
      </table>\
   "
};

var sketchPages = [
   blankPage(), // (4) clay_tablet,abacus,scroll,book,telegraph,tv,rocket, ... (17) pendulum,oscillator,moth/candle,somewhere/rainbow
   title_page, // (1)
   gertie, // (2)
   compose_perform, // (2.5)
   cave_wall, // (3) flapping, bird ... (5) flapping animates, bird animates
   marble_vase, // (6)
   blankPage(), // (7) lathe, planet
   gumball_machine, // (8)
   kwalado, // (9)
   arcade, // (10)
   smith_ar, // (11)
   valve_vr, // (12)
   eyeglasses, // (13)
   contact_lens, // (14)
   blankPage(), // (15) eyeball, contact lens
   rainbows_end, // (16)
   compose_perform, // (16.5)
   kids_talking1, // (18)
   long_nose, // (19)
   ann_senghas, // (20)
   creolization, // (21)
   kids_talking2, // (22)
   child_gesture, // (23)
];
