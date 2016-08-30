var isShowingGuide = false;
var guides_index = 0;

var general_guides = [
  'click on the canvas,\nthen click above your last point\nto take a bird\'s eye view',
  'press space to see the complete commands',
  'good luck!'
];

var current_guides = general_guides;
var displayed_guide = current_guides[guides_index];
//function to display text
//set of tooltips


//fix it in one position

//alternate in that position between selected sketch and general tooltip

function showGuide(){

  if(isk()){
    if(sk().guide != null)
      current_guides = sk().guide;
    else
      current_guides = ['no tooltips available for current sketch'];
  }

  else if(!isk())
    current_guides = general_guides;


  textHeight(16);
  text(displayed_guide, 0, 0, .5, .5);
}

function increaseGuidesIndex(){
  if(guides_index < current_guides.length-1)
    guides_index++;
  else
      guides_index = 0;

  displayed_guide = current_guides[guides_index];
}

function decreaseGuidesIndex(){
  if(guides_index > 0)
    guides_index--;
  else
    guides_index = current_guides.length-1;

  displayed_guide = current_guides[guides_index];
}

//update array when finishing drawing sketch

//user level
