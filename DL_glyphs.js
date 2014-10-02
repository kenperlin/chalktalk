[[-0.3705463965,0.1681142573],[-0.4401231997,0.2015217632],[-0.3831176681,0.3420273783],[-0.486678622,0.5292325585],[-0.42458884,0.7514859123],[-0.3054437766,0.9082298975],[-0.1004551006,0.9962111157],[0.1013220835,0.9999104678],[0.3051325426,0.9073956369],[0.4233779844,0.7519698322],[0.5162729479,0.5388859442],[0.4133142948,0.3451573407],[0.4282487591,0.163480801],[0.1898266722,0.1054116066],[0.01981768996,0.01535104439],[-0.1924553856,0.09529044749],],[[-0.3705463966,0.1681142574],[-0.3399492358,0.08943494051],[0,-1.034526944],[0.3612222715,0.1013154445],],
// registerGlyph("iceCreamCone()", ["PARBUCWCZB]A_?`<`:a7a5`2_0^.[,Z)X(V&T$R!P!M K H!F#D%B&@(?*>,</;1;4:6:9:;:>;@;C=E>G@IBKDLFNHNKNNNPOSOUOXPZQ]R_TaVbXcZd^e`eceeehekemdpcrbt`v_x[zY{W|U}R~P~M~J~H}F|C{Ay@w?u>r=p=m=k>h>f@dAaC`E_H_J`LbNcOfOh"]
// );
[[[-0.6156199438,0.8056861794],[-0.5351238768,0.7938771798],[-0.4579206793,0.7637829594],[-0.3871995484,0.7170199381],[-0.3262559886,0.6551060873],[-0.2780600551,0.5805349865],[-0.2441753787,0.4970564834],[-0.2259369887,0.408244764],[-0.2247871368,0.3178386003],[-0.2407775538,0.2299052976],[-0.2725601812,0.1481119186],[-0.3188900672,0.07596656714],[-0.3782979774,0.01714122783],[-0.447875367,-0.02602146701],[-0.5243632071,-0.05217163469],[-0.6046113487,-0.05985556685],[-0.6851074155,-0.04804658202],[-0.7623106396,-0.01795236098],[-0.8330317179,0.02881070351],[-0.8939752906,0.09072452863],[-0.9421712373,0.1652956224],[-0.9760559143,0.24877417],[-0.9942943172,0.3375858601],[-0.9954441691,0.4279920238],[-0.9794537391,0.5159253559],[-0.9476711112,0.5977186903],[-0.901341212,0.6698640488],[-0.8419332889,0.7286894138],[-0.7723559518,0.7718520654],[-0.6958680851,0.7980022324],[-0.6156199438,0.8056861794],],[[0.1653455104,0.7856448749],[0.2458415773,0.7738358752],[0.3230447749,0.7437416549],[0.3937659058,0.6969786336],[0.4547094257,0.6350647838],[0.5029053725,0.5604936826],[0.5367900489,0.4770151796],[0.5550284522,0.3882034598],[0.5561783041,0.2977972961],[0.5401878737,0.2098639937],[0.5084052464,0.1280706147],[0.4620753471,0.05592526362],[0.4026674768,-0.002900076706],[0.3330900872,-0.04606277155],[0.256602247,-0.07221293923],[0.1763541055,-0.07989687139],[0.09585802541,-0.06808788622],[0.01865482787,-0.03799366586],[-0.05206629694,0.008769399829],[-0.1130098569,0.07068322461],[-0.1612057898,0.1452543181],[-0.1950904668,0.2287328657],[-0.2133288564,0.3175445554],[-0.2144787083,0.4079507191],[-0.1984882916,0.4958840515],[-0.1667056637,0.577677386],[-0.1203757783,0.6498227448],[-0.06096786797,0.7086481101],[0.008609515598,0.7518107606],[0.08509735573,0.7779609282],[0.1653455104,0.7856448749],],[[0.3702792642,-0.4028015391],[0.3381344406,-0.3758413645],[0.3215435639,-0.3115517172],[0.3173958447,-0.2400035614],[0.3277651427,-0.1808985632],[0.3516145279,-0.1311259331],[0.376500843,-0.1134981266],[0.3951655793,-0.1176458458],[0.4428643498,-0.1238674245],[0.4708614542,-0.1197197053],[0.4957477693,-0.08861181152],[0.5227079439,-0.08964874131],[0.5486311888,-0.106239618],[0.5952930295,-0.111424267],[0.6326225021,-0.1197197053],[0.6523241682,-0.136310582],[0.6885443224,-0.1312199376],[0.7587408342,-0.1035107882],[0.8862029215,-0.07025980896],[0.9065229644,-0.09057985185],[0.908370241,-0.1663181936],[0.9065229644,-0.2993221107],[0.8880501981,-0.4249369213],[0.8714247085,-0.4748133903],[0.8474101123,-0.4840497734],[0.7864499836,-0.456340624],[0.6996279822,-0.4101587083],[0.6257369171,-0.4009223252],[0.6109587041,-0.4230896447],[0.6072641508,-0.4341733045],[0.5536931287,-0.4360205811],[0.5038166597,-0.4323260278],[0.4650238506,-0.4046168784]]]



function preLoadObjs(){

  preLoaded = {};

  preLoaded.objs = [];
  preLoaded.tex = [];

  var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader( manager );


  loader.load( 'assets/models/camBody.obj', function ( object ) { preLoaded.objs.push(object.children[0]);preLoaded.objs.camBody = object.children[0];});
  loader.load( 'assets/models/camLines.obj', function ( object ) {preLoaded.objs.push(object.children[0]);preLoaded.objs.camLines = object.children[0];});
  loader.load( 'assets/models/tv.obj', function ( object ) {      preLoaded.objs.push(object.children[0]);preLoaded.objs.tv = object.children[0];});
  loader.load( 'assets/models/scroll.obj', function ( object ) {  preLoaded.objs.push(object.children[0]);preLoaded.objs.scroll = object.children[0];});
  loader.load( 'assets/models/tablet.obj', function ( object ) {  preLoaded.objs.push(object.children[0]);preLoaded.objs.tablet = object.children[0];});
  loader.load( 'assets/models/typewriter3.obj', function ( object ) {preLoaded.objs.push(object.children[0]);preLoaded.objs.typewriter = object.children[0];});
  loader.load( 'assets/models/typewriterPaper.obj', function ( object ) {preLoaded.objs.push(object.children[0]);preLoaded.objs.typewriterPaper = object.children[0];});
  loader.load( 'assets/models/typewriterButtons.obj', function ( object ) {preLoaded.objs.push(object.children[0]);preLoaded.objs.typewriterButtons = object.children[0];});
  loader.load( 'assets/models/typewriterFrame.obj', function ( object ) {preLoaded.objs.push(object.children[0]);preLoaded.objs.typewriterFrame = object.children[0];});


  loader.load( 'assets/models/hammer.obj',  function ( object ) {preLoaded.objs.hammer = object.children[0] } );
  loader.load( 'assets/models/spike.obj',  function ( object ) {preLoaded.objs.spike = object.children[0] } );
 loader.load( 'assets/models/telegraph.obj',  function ( object ) {preLoaded.objs.telegraph = object.children[0] } );
 loader.load( 'assets/models/telegraphBase.obj',  function ( object ) {preLoaded.objs.telegraphBase = object.children[0] } );
 loader.load( 'assets/models/telegraphButton.obj',  function ( object ) {preLoaded.objs.telegraphButton = object.children[0] } );
 loader.load( 'assets/models/book.obj',  function ( object ) {preLoaded.objs.book = object.children[0] } );


  var imgLoader = new THREE.ImageLoader( manager );

  preLoaded.tex.stone = new THREE.Texture();
  imgLoader.load( 'assets/textures/stone.jpg', function ( image ) {  preLoaded.tex.stone.image = image;  preLoaded.tex.stone.needsUpdate = true;} );
  preLoaded.tex.papyrus = new THREE.Texture();
  imgLoader.load( 'assets/textures/papyrus.jpg', function ( image ) {  preLoaded.tex.papyrus.image = image;  preLoaded.tex.papyrus.needsUpdate = true;} );
  preLoaded.tex.book = new THREE.Texture();
   imgLoader.load( 'assets/textures/book.jpg', function ( image ) {  preLoaded.tex.book.image = image;  preLoaded.tex.book.needsUpdate = true;} );
 
  return preLoaded.objs;

}

 function OldCamera() {
    this.initSketchTo3D(
       "oldcamera",
 [
 [[-0.7097683977,-.6],[-0.7030480539,0.3187892845],[-0.4587086229,0.3779625343],[0.4888720014,0.3448804212],[0.500507355,-0.5699396967],[0.2998481145,-0.602654615],[-0.7097683977,-.6],],[[-0.6156199438,0.8056861794],[-0.5351238768,0.7938771798],[-0.4579206793,0.7637829594],[-0.3871995484,0.7170199381],[-0.3262559886,0.6551060873],[-0.2780600551,0.5805349865],[-0.2441753787,0.4970564834],[-0.2259369887,0.408244764],[-0.2247871368,0.3178386003],[-0.2407775538,0.2299052976],[-0.2725601812,0.1481119186],[-0.3188900672,0.07596656714],[-0.3782979774,0.01714122783],[-0.447875367,-0.02602146701],[-0.5243632071,-0.05217163469],[-0.6046113487,-0.05985556685],[-0.6851074155,-0.04804658202],[-0.7623106396,-0.01795236098],[-0.8330317179,0.02881070351],[-0.8939752906,0.09072452863],[-0.9421712373,0.1652956224],[-0.9760559143,0.24877417],[-0.9942943172,0.3375858601],[-0.9954441691,0.4279920238],[-0.9794537391,0.5159253559],[-0.9476711112,0.5977186903],[-0.901341212,0.6698640488],[-0.8419332889,0.7286894138],[-0.7723559518,0.7718520654],[-0.6958680851,0.7980022324],[-0.6156199438,0.8056861794],],[[0.1653455104,0.7856448749],[0.2458415773,0.7738358752],[0.3230447749,0.7437416549],[0.3937659058,0.6969786336],[0.4547094257,0.6350647838],[0.5029053725,0.5604936826],[0.5367900489,0.4770151796],[0.5550284522,0.3882034598],[0.5561783041,0.2977972961],[0.5401878737,0.2098639937],[0.5084052464,0.1280706147],[0.4620753471,0.05592526362],[0.4026674768,-0.002900076706],[0.3330900872,-0.04606277155],[0.256602247,-0.07221293923],[0.1763541055,-0.07989687139],[0.09585802541,-0.06808788622],[0.01865482787,-0.03799366586],[-0.05206629694,0.008769399829],[-0.1130098569,0.07068322461],[-0.1612057898,0.1452543181],[-0.1950904668,0.2287328657],[-0.2133288564,0.3175445554],[-0.2144787083,0.4079507191],[-0.1984882916,0.4958840515],[-0.1667056637,0.577677386],[-0.1203757783,0.6498227448],[-0.06096786797,0.7086481101],[0.008609515598,0.7518107606],[0.08509735573,0.7779609282],[0.1653455104,0.7856448749],],[[0.3702792642,-0.4028015391],[0.3381344406,-0.3758413645],[0.3215435639,-0.3115517172],[0.3173958447,-0.2400035614],[0.3277651427,-0.1808985632],[0.3516145279,-0.1311259331],[0.376500843,-0.1134981266],[0.3951655793,-0.1176458458],[0.4428643498,-0.1238674245],[0.4708614542,-0.1197197053],[0.4957477693,-0.08861181152],[0.5227079439,-0.08964874131],[0.5486311888,-0.106239618],[0.5952930295,-0.111424267],[0.6326225021,-0.1197197053],[0.6523241682,-0.136310582],[0.6885443224,-0.1312199376],[0.7587408342,-0.1035107882],[0.8862029215,-0.07025980896],[0.9065229644,-0.09057985185],[0.908370241,-0.1663181936],[0.9065229644,-0.2993221107],[0.8880501981,-0.4249369213],[0.8714247085,-0.4748133903],[0.8474101123,-0.4840497734],[0.7864499836,-0.456340624],[0.6996279822,-0.4101587083],[0.6257369171,-0.4009223252],[0.6109587041,-0.4230896447],[0.6072641508,-0.4341733045],[0.5536931287,-0.4360205811],[0.5038166597,-0.4323260278],[0.4650238506,-0.4046168784],]],

 
 function() {

    var Cam = root.addNode();

    var camObj = preLoaded.objs.camBody;

    camObj.rotation.x = 5* Math.PI / 180 ;
    camObj.rotation.y =-30* Math.PI / 180 ;
  
    Cam.add(camObj);

    var camObj = preLoaded.objs.camLines;

    camObj.rotation.x = 5* Math.PI / 180 ;
    camObj.rotation.y =-30* Math.PI / 180 ;
    camObj.material = new THREE.MeshLambertMaterial( {color:0x000000} );
 
    Cam.add(camObj);

    return Cam;
  

 }
    );
 }
 OldCamera.prototype = new SketchTo3D;

 function Television() {
    this.initSketchTo3D(
       "television",
   [
   [[-0.9223644594,-0.7355344194],[-0.9128330052,0.4225372691],[0.5883710355,0.4654288131],[0.8886118436,0.3653485437],[0.8886118436,-0.7974888719],[-0.612592197,-0.8546775972],[-0.9097377684,-0.7324106347],],[[-0.4934490192,-0.5449053349],[-0.4886832921,0.2033138219],[0.5454794914,0.2223767303],[0.5740738541,-0.5592025162],[-0.4886832921,-0.6116255145],],[[-0.2694598449,0.3844114522],[-0.526809109,0.9420015244],],[[-0.2360997551,0.4034743606],[0.04984387169,0.9372357973],],],

   
      function() {

        var Node = root.addNode();
        preLoaded.objs.tv.geometry.computeVertexNormals();
        Node.add(preLoaded.objs.tv);

        return Node;
      }
    );
 }
 Television.prototype = new SketchTo3D;


 function Scroll() {
    this.initSketchTo3D(
       "scroll",
   [
   [[-0.866929792,-0.2665993999],[-0.814264529,-0.3112566577],[-0.7807198875,-0.2776749314],[-0.8056282657,-0.2191416373],[-0.8694750758,-0.1856782882],[-0.9486245817,-0.1953576224],[-0.9379078272,-0.3051956559],[-0.8470920646,-0.3812179118],[-0.7256709105,-0.3709548013],[-0.7069641721,-0.2594838158],[-0.7923153177,-0.09915887049],[-0.958391834,-0.0613831454],[-1.010804784,-0.1741373576],[-0.9896944144,-0.3292164253],[-0.8724652354,-0.44371656],[-0.7063887192,-0.4814922851],[-0.459517744,-0.4594495005],[-0.2574420458,-0.4194516405],[-0.05518312272,-0.4741345399],[0.1533266116,-0.5436249883],[0.3894316608,-0.5669409008],[0.5199737877,-0.5614582687],[0.6062545187,-0.4797193294],[0.6052142731,-0.3787428024],[0.5334283886,-0.2558465603],[0.4432498329,-0.2227306816],[0.3762404489,-0.2833672848],[0.3981387506,-0.3820114095],[0.4857828668,-0.4658459965],[0.5349533438,-0.4537185862],[0.5512055417,-0.3864394595],[0.5279637717,-0.3401492497],[0.4823589073,-0.3162468575],[0.4499253379,-0.3579906401],[0.474833716,-0.4165239341],],[[-0.9461930949,-0.09216125915],[-0.8079870087,0.0365133729],[-0.6793123766,0.2366739117],[-0.5982950157,0.460663086],[-0.5744663801,0.5607433553],[-0.4743861108,0.5702748096],[-0.3552429329,0.5130860842],[-0.3075856618,0.4225372691],[-0.3123513889,0.3462856353],[-0.3647743872,0.2747997286],[-0.2980542076,0.2795654557],[-0.1360194857,0.2652682743],[0.1117983242,0.2700340014],[0.3929762238,0.2223767303],[0.5931367626,0.1556565507],[0.7027484862,0.1365936423],[0.736108576,0.1699537321],[0.77900012,0.293862637],[0.7837658471,0.3605828166],[0.864783208,0.3701142708],[0.9696292045,0.2843311828],[0.9982235672,0.1842509134],[0.9791606587,0.1127650067],[0.8695489351,-0.04926971513],[0.7170456675,-0.297087525],],],

   
      function() {

        var Node = root.addNode();
        var node = Node.addNode();
	node.getMatrix().translate(0,.05,0);

        node.add(preLoaded.objs.scroll);
        preLoaded.objs.scroll.geometry.computeVertexNormals();
        preLoaded.objs.scroll.material.map = preLoaded.tex.papyrus;

        preLoaded.tex.papyrus.wrapS = THREE.RepeatWrapping;
        preLoaded.tex.papyrus.wrapT = THREE.RepeatWrapping;
        preLoaded.tex.papyrus.repeat.x=3;
        preLoaded.tex.papyrus.repeat.y=1.1;

        return Node;
      }
    );
 }
 Scroll.prototype = new SketchTo3D;


 function Tablet() {
    this.initSketchTo3D(
       "tablet",
   [
   [[-0.4032651548,-0.8223859989],[-0.5693906583,-0.4739276257],[-0.7922419435,0.1095375572],[-0.9624192885,0.551188286],[-0.9056935068,0.8226616697],[-0.7557753695,0.8348171944],[-0.3586948978,0.8672319268],[0.07485214786,0.8672319268],[0.3949476302,0.883439293],[0.459777095,0.7740395712],[0.6096952322,0.3931664656],[0.7596133695,0.03660440937],[0.8852204575,-0.2672837068],[0.9743609716,-0.5347052489],[0.97030913,-0.6360012876],[0.9176351899,-0.7656602172],[0.8122873097,-0.8061786327],[0.3544292147,-0.8061786327],],[[-0.6828422217,0.6524843247],[-0.6620230895,0.6449171473],[-0.6331195878,0.613957874],[-0.5708123061,0.5543034611],[-0.5201727646,0.6312946513],[-0.4461319292,0.7047156914],[-0.3785196015,0.6167998724],[-0.3090021416,0.5185457991],[-0.2642643754,0.594637563],[-0.2387287483,0.6397178403],[-0.1915553786,0.6854455175],[-0.1196047655,0.6573315275],[-0.04900438358,0.6303719157],[0.01093043392,0.6748060167],[0.06428115712,0.7055470804],[0.1351376701,0.7089949766],[0.2140861077,0.6807700666],[0.2896022734,0.7190812388],],[[-0.5896498661,0.4012701487],[-0.5766100329,0.3412812105],[-0.4911373281,0.2065512227],[-0.3963727968,0.3218139638],[-0.3399674956,0.3948115971],[-0.2712361031,0.3617506123],[-0.2407246032,0.3067298891],[-0.2006245588,0.2515980004],[-0.1455581188,0.2220152592],[-0.0945342723,0.2535573914],[-0.06520548645,0.2934884767],[-0.0186985634,0.329082699],[0.04171610403,0.3947669651],[0.1495620893,0.2748707083],[0.176790806,0.3854544515],[0.2459008173,0.4811083884],],[[-0.4437835703,-0.007965847661],[-0.4264876389,-0.01851507775],[-0.3895763748,-0.04929369048],[-0.3148579497,-0.1097050705],[-0.2642894474,-0.04696266279],[-0.2353762637,0.002070311252],[-0.1660146752,0.02959152398],[-0.1051678155,-0.01373320281],[-0.06237550635,-0.05273484703],[-0.002329999027,-0.1098823334],[0.02366028849,-0.03160383477],[0.05972547208,0.009676939239],[0.1043921353,0.06559098824],[0.1850824365,0.03391908484],[0.2229374854,-0.01775437833],[0.2937649344,-0.03974378314],[0.3382656529,0.01928102179],[0.4014321258,0.05546800419],[0.4662701421,0.07229518386],[0.5699810039,0.02603833055],],[[-0.3141246408,-0.3078021222],[-0.3021687935,-0.3203009058],[-0.2806496366,-0.3487896607],[-0.2513566845,-0.3934592452],[-0.2094010441,-0.4340777276],[-0.1629219891,-0.4690339191],[-0.1018202342,-0.4504669242],[-0.07639602098,-0.4014922215],[-0.04621281363,-0.3499809901],[0.008523560149,-0.3092826015],[0.06274543571,-0.3538611045],[0.1162360572,-0.4138945306],[0.2006170533,-0.3658305712],[0.2831515101,-0.3231984667],[0.3379975834,-0.3763224097],[0.3950904678,-0.4124880022],[0.4500503311,-0.376758267],[0.5095804611,-0.3252978038],[0.5911637134,-0.4053935932],],],

   
      function() {

        var Node = root.addNode();
        preLoaded.objs.tablet.geometry.computeVertexNormals();
        preLoaded.objs.tablet.material.map = preLoaded.tex.stone;
       preLoaded.tex.stone.wrapS = THREE.RepeatWrapping;
       preLoaded.tex.stone.wrapT = THREE.RepeatWrapping;
       preLoaded.tex.stone.repeat.x=5;
       preLoaded.tex.stone.repeat.y=5;
        Node.add(preLoaded.objs.tablet);

        return Node;
      }
    );
 }
 Tablet.prototype = new SketchTo3D;


 function Typewriter() {
    this.initSketchTo3D(
       "typewriter",
   [[[-0.9991662596,-0.5995361438],[-1.025016935,-0.5004418869],[-0.8139030837,-0.2634773596],[-0.7578932863,-0.1083733054],[-0.7578932863,-0.01358749444],[-0.701883489,0.1587503436],[-0.6631074754,0.3224712897],[-0.4563020698,0.4474162223],[-0.2064122046,0.4086402087],[0.3709195528,0.3095459519],[0.7371374586,0.2793868302],[0.8879330669,0.2923121681],[0.9353259723,0.2707699383],[0.9482513102,0.04673074887],[0.9396344183,-0.1945422244],[0.9525597561,-0.3410293867],[0.8405401614,-0.3668800624],[0.5518742827,-0.5564516842],[0.3235266473,-0.7115557385],[0.2416661742,-0.7158641844],],[[-0.2710388939,0.4301824385],[-0.1977953127,0.7145398712],[-0.1590192992,0.8998030471],[-0.1245517316,0.9342706147],[-0.06423348826,0.9256537228],[0.09517901192,0.908419939],[0.3709195528,0.8739523714],[0.6208094179,0.8567185876],[0.7931472559,0.8394848038],[0.8017641478,0.7877834524],[0.7638341156,0.6866366998],[0.7129787455,0.4385012549],],],

   
      function() {

        var Node = root.addNode();

        Node.add(preLoaded.objs.typewriterButtons);
        Node.add(preLoaded.objs.typewriterFrame);
        Node.add(preLoaded.objs.typewriterPaper);

        return Node;
      }
    );
 }
 Typewriter.prototype = new SketchTo3D;


 function Hammer() {
    this.initSketchTo3D(
       "hammer",
   [[[-0.9803303763,-0.1854977118],[-0.9803303763,0.1825130855],[0.3576970607,0.1840867912],[0.3576970607,0.4959237157],[0.988862054,0.4959237157],[0.988862054,-0.4973346363],[0.3669045917,-0.4973346363],[0.3669045917,-0.1870714176],[-0.9803303763,-0.1854977118],],],

   
      function() {
        var Node = root.addNode();
        preLoaded.objs.hammer.material.color = new THREE.Color( 0xeeaa77 );
        Node.add(preLoaded.objs.hammer);
        return Node;
      }
    );

     this.render = function(elapsed) {
        Hammer.prototype.render.call(this, elapsed);

        this.count = 0;

        if (this.shapeSketch !== undefined) {
          var ham = this.shapeSketch.mesh;

            ham.update = function(elapsed) {
              if(!this.count)
                this.count=1;
              else
              this.count+=elapsed;
              // ham.getMatrix().identity();
              ham.getMatrix().rotateZ(Math.abs(Math.cos(time*4))*.5);
            }
        }
      }

 }
 Hammer.prototype = new SketchTo3D;


 function Book1() {
    this.initSketchTo3D(
       "book1",
   [[[-0.6661593447,-0.02114729705],[-0.6661593447,-1.007312912],[0.6892111311,-1.007312912],[0.6892111311,0.9893081115],[-0.6855911795,0.9893081115],[-0.6855911795,-0.01628933836],],],

   
      function() {
        var Node = root.addNode();
        preLoaded.objs.book.material.map = preLoaded.tex.book;
        Node.add(preLoaded.objs.book);
        return Node;
      }
    );

    this.render = function(elapsed) {
       Book1.prototype.render.call(this, elapsed);
       var sketch = this.shapeSketch;
       if (sketch !== undefined) {
          sketch.isBook = true;
          sketch.code = [
["page 1",
"               \n" +
"               \n" +
"               It is a truth universally acknowledged, that a single man in possession of a\n" +
"               good fortune, must be in want of a wife.\n" +
"               \n" +
"               However little known the feelings or views of such a man may be on his\n" +
"               first entering a neighbourhood, this truth is so well fixed in the minds of\n" +
"               the surrounding families, that he is considered the rightful property of some\n" +
"               one or other of their daughters.\n" +
"               \n" +
"               'My dear Mr.  Bennet,' said his lady to him one day, 'have you heard that\n" +
"               Netherfield Park is let at last?'\n" +
"               \n" +
"               Mr. Bennet replied that he had not.\n" +
"               \n" +
"               'But it is,' returned she; 'for Mrs.  Long has just been here, and she told me\n" +
"               all about it.'\n" +
"               \n" +
"               Mr.  Bennet made no answer.  'Do you not want to know who has taken it?'\n" +
"               cried his wife impatiently.\n" +
"               \n" +
"               'You want to tell me, and I have no objection to hearing it.'\n" +
"               \n" +
"               This was invitation enough.\n" +
"               \n" +
"               'Why, my dear, you must know, Mrs.  Long says that Netherfield is taken by\n" +
"               a young man of large fortune from the north of England; that he came down\n" +
"               on Monday in a chaise and four to see the place, and was so much delighted\n" +
"               with it, that he agreed with Mr.  Morris immediately; that he is to take\n" +
"               possession before Michaelmas, and some of his servants are to be in the\n" +
"               house by the end of next week.'\n" +
"               \n" +
"               'What is his name?'\n" +
"               \n" +
"               'Bingley.'\n" +
"               \n" +
"               \n" +
"               \n" +
""],
["page 2", ""],
["page 3", ""],
["page 4", ""],
["page 5", ""],
["page 6", ""],
["page 7", ""],
["page 8", ""],
["page 9", ""],
["page 10", ""],
           ];
       }
    }
 }
 Book1.prototype = new SketchTo3D;

  function Telegraph() {
    this.initSketchTo3D(
       "telegraph",
[[[-0.9953602138,-0.3121770153],[-0.9953602138,-0.06971190482],[1.010487519,-0.06971190482],[1.010487519,-0.3165854719],[-0.9953602138,-0.3165854719],],[[0.274275274,-0.09900632444],[0.274275274,0.4284436859],[0.1067539249,0.4284436859],[0.115570838,0.5298381867],[0.4550219927,0.5254297301],[0.4417966231,0.4284436859],[0.2875006437,0.4284436859],],[[0.7856562344,-0.06530344826],[0.7680224081,0.4284436859],[0.6093179722,0.4284436859],[0.6005010591,0.5430635563],[0.9311353007,0.5474720129],[0.9355437572,0.4284436859],[0.7768393213,0.4196267728],],[[0.9046845613,0.278556163],[-0.5060215362,0.2697392499],[-0.5148384493,0.2300631409],[-0.8498811475,0.2300631409],[-0.8498811475,0.3446830113],[-0.5148384493,0.3358660982],[-0.5060215362,0.2609223368],],],
   
      function() {
        var Node = root.addNode();
        var button = preLoaded.objs.telegraphButton;
        var base = preLoaded.objs.telegraphBase;

        Node.add(preLoaded.objs.telegraphButton);
        Node.add(preLoaded.objs.telegraphBase);

        preLoaded.objs.telegraphButton.material.color = new THREE.Color(0xeeaa88);
        preLoaded.objs.telegraphBase.material.color = new THREE.Color(0x665544);

        Node.button = preLoaded.objs.telegraphButton;
        Node.base = preLoaded.objs.telegraphBase;

        Node.button.position.x = .53;
        Node.base.position.x = .262;


        return Node;
      }
    );

    this.render = function(elapsed) {
        Telegraph.prototype.render.call(this, elapsed);

        this.count = 0;
       

        if (this.shapeSketch !== undefined) {
          var button = this.shapeSketch.mesh;
          button.up = this;


            button.update = function(elapsed) {

            var pressed = 0;

              if(isTelegraphKeyPressed)
                pressed = 1;

            button.button.getMatrix().identity();
            button.button.getMatrix().translate(.63,.161,0).rotateZ(pressed*.1);
            }
        }
      }
 }
 Telegraph.prototype = new SketchTo3D;

  function Spike() {
    this.initSketchTo3D(
       "spike",
   [[[-0.000952313946,-0.9381778461],[0.1623915114,0.6135988612],[0.3036618467,0.79434558],[0.2992471488,0.9265992766],[0.1447327194,0.9706838422],[-0.221687213,0.9574584725],[-0.2967370787,0.9177823635],[-0.3188105686,0.7899371234],[-0.1687108372,0.6180073178],[-0.000952313946,-0.9602201289],],],

   
      function() {
        var Node = root.addNode();
        preLoaded.objs.spike.material.color = new THREE.Color( 0x887766 );

        Node.add(preLoaded.objs.spike);
        return Node;
      }
    );
    this.render = function(elapsed) {
        Spike.prototype.render.call(this, elapsed);

        this.count = 0;

        if (this.shapeSketch !== undefined) {
          var spike = this.shapeSketch.mesh;

            spike.update = function(elapsed) {
              if(!this.count)
                this.count=1;
              else
              this.count+=elapsed;
              // spike.getMatrix().identity();
              spike.getMatrix().translate(0,Math.abs(Math.cos(time*4))*-.5,0);
            }
        }
      }
 }
 Spike.prototype = new SketchTo3D;



/*
registerGlyph("oldCamera()", 

["$*!/ 3 8 = A F!K!O#T$Y%^&c'g)l+p-t/y2|6}7x7t7o6j6f5a4[4W3R3M3I3D3?4;78::=>?C@GBKDPFTHXJ^LbNfQjSnWq[t`v`s_n]jZeYaW[VWTRSNRIQEP@P;P6Q3S7V;X?[C^G`KcOeSgWj]laodrhukyn}q}l}h{cz_wZuVsRpMnIlEjAi<g8e4d/c*a&_!",]
);

THREE.Object3D.prototype.addOldCamera = function() {

  var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader( manager );

  var that = this;

  var loaded = 0;

  var obj = new THREE.Object3D();

  var Cam = root.addNode();

 
  var camBody;
  var camLines;

  loader.load( 'assets/models/camBody.obj', function ( object ) {

      // that.add(object);
      // // object.children[0].geometry.computeCentroids();
      // // object.children[0].geometry.computeFaceNormals();
      // object.children[0].geometry.computeVertexNormals();
      // // object.children[0].material = new THREE.MeshLambertMaterial({color:0xffffff});
      // var sketch = geometrySketch(object.children[0]);
      // obj.add(object.children[0]);

      // loaded++;
      // console.log('hi');

       // that.add(object);
      // object.children[0].geometry.computeCentroids();
      // object.children[0].geometry.computeFaceNormals();
      object.children[0].geometry.computeVertexNormals();
      camBody = object.children[0];
      Cam.add(camBody);
      // var sketch = geometrySketch(object.children[0]);


    });
  loader.load( 'assets/models/camLines.obj', function ( object ) {

      // that.add(object);
      // // object.children[0].geometry.computeCentroids();
      // // object.children[0].geometry.computeFaceNormals();
      // object.children[0].geometry.computeVertexNormals();
      // object.children[0].material = new THREE.MeshLambertMaterial({color:0xffffff});
      // loaded++;
      // obj.add(object);

      object.children[0].geometry.computeVertexNormals();
      camLines = object.children[0];
      Cam.add(camLines);

      // var sketch = geometrySketch(object);

    });

    // var node = radio.addNode();
    // node.getMatrix().translate(0,.2,0);

    // var shape1 = node.addCylinder(32);
    // shape1.getMatrix().rotateX(PI/2).scale(1,.5,1);

    // var shape2 = node.addCube();
    // shape2.getMatrix().translate(0,-.7,0).scale(1,.7,.5);

    // var shapeMaterial = new phongMaterial().setAmbient(.1,.1,.1)
    //                              .setDiffuse(.9,.9,.9);
    // radio.setMaterial(shapeMaterial);

    // var dial1 = node.addCylinder(32);
    // dial1.getMatrix().rotateX(PI/2).translate(0,.2,0).scale(.7,.5,.7);
    // var dialMaterial = new phongMaterial().setAmbient(.1,.1,.1)
    //                             .setDiffuse(.5,.5,.5);
    // dial1.setMaterial(dialMaterial);

      return Cam;

  // console.log(loaded);
  // if(loaded>1){
  //   var sketch = geometrySketch(obj);
  // }
}

function oldCamera(){

    root.addOldCamera()
  
}
*/

registerGlyph("iceCream()", [[[-0.3705463965,0.1681142573],[-0.4401231997,0.2015217632],[-0.3831176681,0.3420273783],[-0.486678622,0.5292325585],[-0.42458884,0.7514859123],[-0.3054437766,0.9082298975],[-0.1004551006,0.9962111157],[0.1013220835,0.9999104678],[0.3051325426,0.9073956369],[0.4233779844,0.7519698322],[0.5162729479,0.5388859442],[0.4133142948,0.3451573407],[0.4282487591,0.163480801],[0.1898266722,0.1054116066],[0.01981768996,0.01535104439],[-0.1924553856,0.09529044749],],[[-0.3705463966,0.1681142574],[-0.3399492358,0.08943494051],[0,-1.034526944],[0.3612222715,0.1013154445],],]
);

THREE.Object3D.prototype.addIceCreamCone = function() {

  var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader( manager );

  var that = this;

  loader.load( 'assets/models/iceCreamCone.obj', function ( object ) {

      that.add(object);
      // object.children[0].geometry.computeCentroids();
      // object.children[0].geometry.computeFaceNormals();
      object.children[0].geometry.computeVertexNormals();
      var sketch = geometrySketch(object.children[0]);

    });
}

function iceCream(){

    root.addIceCreamCone()
  
}


registerGlyph("lathe()", [
   [[0, .5],[ 0,-.5]],
   [[0,-.5],[-1,-.5]],
   [[0,-.5],[ 1,-.5]],
   [[0, .5],[-1, .5],[-1,-.5],[0,-.5]]
]);

function lathe() {

    // PROFILE IS THE SECOND OF THE TWO STROKES, SCALED FROM SCREEN SPACE TO 3D SPACE.

    var trace = sketchToTrace(sk());
    var profile = [];
    for (var i = 0 ; i < trace[4].length ; i++)
       profile.push([ trace[4][i][0], 0, trace[4][i][1] ]);

    // SMOOTH OUT THE PROFILE CURVE.

    for (var n = 0 ; n < 3 ; n++)
       for (var i = 1 ; i < profile.length - 1 ; i++)
          for (var j = 0 ; j <= 2 ; j += 2)
             profile[i][j] = (profile[i-1][j] + profile[i+1][j]) / 2;

    // MOVE AND SCALE TO MATCH SCREEN POSITION OF DRAWN LINE.

    var xLo = 10000, xHi = -10000;
    var yLo = 10000, yHi = -10000;
    for (var i = 0 ; i < trace[1].length ; i++) {
       xLo = min(xLo, trace[1][i][0]);
       xHi = max(xHi, trace[1][i][0]);
       yLo = min(yLo, trace[1][i][1]);
       yHi = max(yHi, trace[1][i][1]);
    }
    var x = (xLo + xHi) / 2;
    var y = (yLo + yHi) / 2;
    var scale = 1.5 / (yHi - yLo + 2 * sketchPadding);

    for(var i = 0 ; i < profile.length ; i++){
       profile[i][0] = scale * (profile[i][0] - x);
       profile[i][2] = scale * (profile[i][2] - y);
    }
    profile[0][0] = profile[profile.length-1][0] = 0;

    // MAKE A LATHE OBJECT WITH A PRETTY MARBLE TEXTURE.

    var sketch = geometrySketch(root.addLathe(profile, 32));
    sketch.mesh.setMaterial(shaderMaterial(defaultVertexShader, pVaseFragmentShader2));

    sketch.update = function() {
      this.mesh.getMatrix().rotateX(PI/2);
    }

    sketch.onClick = function() {
       if (this.shaderCount === undefined)
          this.shaderCount = 0;
       var fragmentShader = this.shaderCount++ % 2 == 0 ? flameFragmentShader : pVaseFragmentShader2;
       this.mesh.setMaterial(shaderMaterial(defaultVertexShader, fragmentShader));
    }
}
lathe.prototype = new Sketch;


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_



registerGlyph("hose()", [
   [[0,-.5],[ 0, .5]],
   [[0,-.5],[-1,-.5]],
   [[0,-.5],[ 1,-.5]],
   [[0, .5],[-1, .5],[-1,-.5],[0,-.5]]
]);

function hose() {

    // PROFILE IS THE SECOND OF THE TWO STROKES, SCALED FROM SCREEN SPACE TO 3D SPACE.

    var trace = sketchToTrace(sk());
    var profile = [];
    for (var i = 0 ; i < trace[4].length ; i++)
       profile.push([ trace[4][i][0], 0, trace[4][i][1] ]);

    // SMOOTH OUT THE PROFILE CURVE.

    for (var n = 0 ; n < 3 ; n++)
       for (var i = 1 ; i < profile.length - 1 ; i++)
          for (var j = 0 ; j <= 2 ; j += 2)
             profile[i][j] = (profile[i-1][j] + profile[i+1][j]) / 2;

    // MOVE AND SCALE TO MATCH SCREEN POSITION OF DRAWN LINE.

    var xLo = 10000, xHi = -10000;
    var yLo = 10000, yHi = -10000;
    for (var i = 0 ; i < trace[1].length ; i++) {
       xLo = min(xLo, trace[1][i][0]);
       xHi = max(xHi, trace[1][i][0]);
       yLo = min(yLo, trace[1][i][1]);
       yHi = max(yHi, trace[1][i][1]);
    }
    var x = (xLo + xHi) / 2;
    var y = (yLo + yHi) / 2;
    var scale = 1.5 / (yHi - yLo + 2 * sketchPadding);

    for(var i = 0 ; i < profile.length ; i++){
       profile[i][0] = scale * (profile[i][0] - x);
       profile[i][2] = scale * (profile[i][2] - y);
    }
    // profile[0][0] = profile[profile.length-1][0] = 0;

    console.log(lineIntersectionCheck(profile));
    console.log(profile);

    // MAKE A LATHE OBJECT WITH A PRETTY MARBLE TEXTURE.

    var sketch = geometrySketch(root.addTube(profile, profile.length*9));
    sketch.mesh.setMaterial(shaderMaterial(defaultVertexShader, pVaseFragmentShader2));

    sketch.update = function() {
      this.mesh.getMatrix().rotateX(PI/2);
    }

    sketch.shaderCount = 0;
    sketch.onClick = function() {
       var fragmentShader = this.shaderCount++ % 2 == 0 ? flameFragmentShader : pVaseFragmentShader2;
       this.mesh.setMaterial(shaderMaterial(defaultVertexShader, fragmentShader));
    }
}
hose.prototype = new Sketch;

THREE.Object3D.prototype.addTube = function(p, nSegments) {
  var points = [];
  for (var i = 0 ; i < p.length ; i++)
     points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
  var geometry = tubeGeometry( points, nSegments);
  // THREE.TubeGeometry = function( path, segments, radius, radialSegments, closed ) {

  var mesh = new THREE.Mesh(geometry, bgMaterial());
  this.add(mesh);
  return mesh;
}

function tubeGeometry(points, n) { 
  var curve = new THREE.SplineCurve3(points);
   var closed = false;
  var dist = curve.points[0].distanceTo(curve.points[curve.points.length-1]);
  if(curve.points[0].distanceTo(curve.points[curve.points.length-1])<1)
    closed=true;
  console.log(dist);
 
  return new THREE.TubeGeometry(curve, n,.1,8,closed); 
}


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_


function ArbRevolveHandle() {

  this.labels = "can".split(' ');

  this.render = function(elapsed) {
    m.save();
    m.scale(this.size / 400);
    mCurve([ [0,1], [0,-1]]);
    mCurve([ [0,1], [-1,1], [-1,-1], [0,-1]]);
    mCurve([ [-1,1], [-1.5,1], [-1.5,0], [-1,0]]);
    m.restore();
  }

  this.onClick = function(x, y) {

    console.log(this);

    this.fadeAway = 1.0;

    glyphSketch.color = 'rgba(0,0,0,.01)';

    var tnode = new THREE.Mesh();

    var latheArray = [];
    var handleArray = [];

    if(globalStrokes!=undefined){
      latheArray = globalStrokes.returnCoord(2);
      handleArray = globalStrokes.returnPath(1,-.08);
    }

    var body = tnode.addLathe( 
        latheArray
      , 32);

    var geo = body.geometry;

    var sketch = addGeometryShaderSketch(geo, defaultVertexShader, pVaseFragmentShader);

    console.log(handleArray);

    var curve = new THREE.SplineCurve3(handleArray);

    sketch.mesh.add(new THREE.Mesh(new THREE.TubeGeometry(curve),new THREE.MeshLambertMaterial()));
    console.log(sketch);

    // for(var i = 0 ; i < body.geometry.faces.length ; i++){
    //   var face = body.geometry.faces[i];
    //   var temp = face.a;
    //   var temp2 = face.c;
    //   face.a = temp2;
    //   face.c = temp;
    // }
    // sketch.mesh.geometry.computeFaceNormals();
    // sketch.mesh.geometry.computeVertexNormals();

    sketch.startTime = time;

    sketch.update = function() {
      // var scale = (this.xhi - this.xlo) / 16 + sketchPadding;
      this.mesh.getMatrix().translate(0,0,0.0).
      rotateX(PI/2).rotateZ(PI*2).scale(2);
      this.setUniform('t', (time - this.startTime) / 0.5);
    }
  }
}

ArbRevolveHandle.prototype = new Sketch;


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

var boringSlicedFragmentShader = ["\
    uniform float spinAngle;\
    void main(void) {\
      float rr = dx*dx + dy*dy;\
      float dz = rr >= 1. ? 0. : sqrt(1. - rr);\
      float dzdx = -1.3;\
      float zp = dzdx * (dx - mx * 1.3 - .2);\
      if (zp < -dz)\
         rr = 1.;\
      vec3 color = vec3(0.);\
      if (rr < 1.) {\
         vec3 nn = vec3(dx, dy, dz);\
         if (zp < dz) {\
            dz = zp;\
            nn = normalize(vec3(-dzdx,0.,1.));\
         }\
         float s = rr >= 1. ? 0. : .4 + max(0., dot(vec3(.2), nn)) + max(0., dot(vec3(-.1), nn));\
         float X =  dx * cos(spinAngle) + dz * sin(spinAngle);\
         float Y =  dy;\
         float Z = -dx * sin(spinAngle) + dz * cos(spinAngle);\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\
         float tu = ( selectedIndex>1. ? noise(P) : turbulence(P) );\
         float c = pow(.5 + .5 * sin(7. * X + 4. * tu), .1);\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
          if (selectedIndex > -1.) {\
            float checker = .5;\
            color = vec3(s);\
          }\
          if (selectedIndex > 0.) {\
            float checker = mod(floor(5.*X)+floor(5.*X)+floor(5.*X),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if (selectedIndex > 1.) {\
            float checker = mod(floor(5.*X)+floor(5.*Y)+floor(5.*Z),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if(selectedIndex > 2.){\
            float tube = .5+.5*sin(X*20.)*sin(Y*20.)*sin(Z*20.);\
            color = vec3(tube);\
            color *= s;\
          }\
          if(selectedIndex > 3.){\
            float col = sin(X*30.+sin(sin(X*30.0)*2.0+Y*9.0)*2.0);\
             color = vec3(col);\
             color *= s;\
          }\
          if(selectedIndex > 4.){\
            vec3 rand = vec3(fract(sin((sin(X*6.3)*2.1)*cos(Z*3.14))*3.33));\
            color = vec3(rand);\
            color *= s;\
          }\
          else {\
             float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\
             color += vec3(h*0.4, h*.7, h);\
             color *= s;\
          }\
       }\
       gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

registerGlyph("bSliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0,  0, 1, 1, 32,  PI*2.0, PI*0.5),
]);

function bSliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, boringSlicedFragmentShader);
   if(!sketch.switcher)
      sketch.switcher = 0;
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;
    sketch.code = [
      ["sphere", "(X,Y,Z)"],
      ["stripes", "mod ( floor(X) , 2 )"],
      ["checker", "mod(floor(X)+floor(Y)+floor(Z), 2 )"],
      ["dots", "0.5 + 0.5 * sin(X)*sin(Y)*sin(Z)"],
      ["waves", "sin(X + sin(2 * sin(X) + 9*Y))"],
      ["cartoon wood", "fract(sin(sin(6 * X) * cos(3 * Z)))"],
   ];
   // sketch.onClick = function() {
   //    this.spinRate = -1 - this.spinRate;
   //    if(this.spinRate>=0)
   //      this.switcher++;
   //    if(this.switcher>3)
   //      this.switcher = 0;
   // }
   sketch.onSwipe = function(dx, dy) {

      switch (pieMenuIndex(dx, dy)) {
        case 1: 
          this.spinRate = -1 - this.spinRate;; 
          break;
        case 3: 
           if(this.spinRate>=0)
            this.switcher++;
          if(this.switcher>5)
            this.switcher = 0;
          break;
      }
   }
   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
   }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

var pVaseFragmentShader2 = ["\
   void main(void) {\
        vec3 point = 30. * vPosition;\
        float a = -atan(point.x,point.y);\
        float sweep = a > .1 && a < 0. || 4. > 3.14159 ? 1. : 0.;\
        sweep = 0. > 1. ? 1. :0.;\
        float ma = mx-1.;\
        vec3 normal = normalize(vNormal);\
        float s = .3 + max(0.,dot(vec3(.3), normal));\
        float tu = turbulence(point) ;\
        float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
        vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
        if (vNormal.x > 0.) {\
            float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
            color += vec3(h*.4, h*.7, h);\
        }\
        else {\
            float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
            color += vec3(h, h*.8, h*.6);\
        }\
      gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

var pVaseFragmentShader = ["\
   uniform float t;\
   void main(void) {\
        vec3 point = 200. * vPosition;\
        float a = -atan(point.x,point.y);\
        float sweep = a > .1 && a < t || t > 3.14159 ? 1. : 0.;\
        sweep = t > 1. ? 1. :0.;\
        float ma = mx-1.;\
        vec3 normal = normalize(vNormal);\
        float s = .3 + max(0.,dot(vec3(.3), normal));\
        float tu = turbulence(point) ;\
        float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
        vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
        if (vNormal.x > 0.) {\
            float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
            color += vec3(h*.4, h*.7, h);\
        }\
        else {\
            float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
            color += vec3(h, h*.8, h*.6);\
        }\
      gl_FragColor = vec4(color*sweep,alpha);\
   }\
"].join("\n");

function PVase() {

  this.labels = "can".split(' ');

  this.render = function(elapsed) {
    m.save();
    m.scale(this.size / 400);
    mCurve([ [-1,1], [0,-1], [1,1]]);
    m.restore();
  }

  this.onClick = function(x, y) {

    this.fadeAway = 1.0;

    glyphSketch.color = 'rgba(0,0,0,.01)';

    var tnode = new THREE.Mesh();

    var body = tnode.addLathe( [
      [-1.491413,0,13.880116],[-1.607697,0,14.306492],[-2.089839,0,14.531703],[-2.50689,0,14.640397],[-2.962928,0,14.636961],[-3.401649,0,14.481519],[-3.553996,0,14.045668],[-3.323561,0,13.653563],[-2.928067,0,13.421634],[-2.688131,0,13.034384],[-2.518976,0,12.617439],[-2.39687,0,12.182876],[-2.328739,0,11.73666],[-2.349396,0,11.285434],[-2.469646,0,10.849821],[-2.698869,0,10.458542],[-3.038561,0,10.160478],[-3.457801,0,9.988686],[-3.891258,0,9.866547],[-4.326921,0,9.750155],[-4.757331,0,9.61657],[-5.184,0,9.470156],[-5.609247,0,9.324032],[-6.035222,0,9.16605],[-6.366066,0,8.857471],[-6.588955,0,8.462668],[-6.747993,0,8.040961],[-6.872433,0,7.607528],[-6.95826,0,7.16479],[-7.006721,0,6.716524],[-7.018176,0,6.265835],[-6.992012,0,5.815731],[-6.927592,0,5.369472],[-6.825437,0,4.930154],[-6.684001,0,4.501926],[-6.508907,0,4.086509],[-6.304791,0,3.684494],[-6.078497,0,3.294573],[-5.836168,0,2.914455],[-5.581665,0,2.542393],[-5.318061,0,2.176736],[-5.047787,0,1.815988],[-4.77297,0,1.458693],[-4.495586,0,1.103391],[-4.217786,0,0.748413],[-3.941841,0,0.391994],[-3.670623,0,0.031944],[-3.409929,0,-0.335818],[-3.166947,0,-0.715582],[-2.951152,0,-1.111428],[-2.77114,0,-1.525359],[-2.641419,0,-1.956159],[-2.57598,0,-2.406934],[-2.599825,0,-2.846015],[-2.638638,0,-3.336436],[-3.047851,0,-3.466827],[-3.468786,0,-3.635845],[-3.752984,0,-3.998514],[-3.888522,0,-4.417527],[-3.916535,0,-4.899075],[0.213201,0,-4.936954],[0.203555,0,-4.593784],[-1.936806,0,-3.570133],[-2.169454,0,-2.686071],[-2.402102,0,-1.476302],[-2.960457,0,-0.59224],[-3.891049,0,0.664059],[-4.914699,0,2.199535],[-6.217528,0,4.898251],[-6.264057,0,7.550438],[-5.845291,0,8.387971],[-4.588992,0,9.132444],[-3.193105,0,9.59774],[-2.495161,0,10.202624],[-2.076395,0,11.179746],[-1.611099,0,12.529104],[-1.47151,0,13.227048],[-1.491413,0,13.880116]      ], 32);

    var geo = body.geometry;

    var sketch = addGeometryShaderSketch(geo, defaultVertexShader, pVaseFragmentShader);

    // console.log(this);

    for(var i = 0 ; i < body.geometry.faces.length ; i++){
      var face = body.geometry.faces[i];
      var temp = face.a;
      var temp2 = face.c;
      face.a = temp2;
      face.c = temp;
    }
    sketch.mesh.geometry.computeFaceNormals();
    sketch.mesh.geometry.computeVertexNormals();

    sketch.startTime = time;

    sketch.update = function() {
      var scale = (this.xhi - this.xlo) / 16 + sketchPadding;
      this.mesh.getMatrix().translate(-2,-12,0.0).
      rotateX(-PI/2).rotateZ(PI/2).scale(scale/7);
      this.setUniform('t', (time - this.startTime) / 0.5);
    }
  }
}

PVase.prototype = new Sketch;

// var lVaseShape =  [
//   [[-1.66159,-3.68055],[-1.773634,-4.090704],[-2.232532,-4.308656],[-2.633714,-4.418088],[-3.070594,-4.419276],[-3.498048,-4.287182],[-3.678558,-3.881167],[-3.479754,-3.487502],[-3.100546,-3.264764],[-2.85367,-2.907842],[-2.68442,-2.509155],[-2.560581,-2.094476],[-2.485761,-1.668299],[-2.484919,-1.234358],[-2.588226,-0.813763],[-2.781088,-0.424502],[-3.086771,-0.114626]],
//   [[-3.086771,-0.114626],[-3.478233,0.0748838],[-3.894185,0.196225],[-4.31274,0.307776],[-4.728153,0.430589],[-5.136792,0.574557],[-5.536255,0.741828],[-5.924712,0.934189],[-6.271939,1.195092],[-6.521691,1.552186],[-6.674899,1.957623],[-6.768432,2.380217],[-6.80059,2.811987],[-6.786154,3.244341],[-6.727722,3.673189],[-6.631971,4.095047],[-6.508676,4.509886],[-6.353594,4.913861],[-6.18102,5.310594],[-5.987867,5.69781],[-5.783412,6.079129],[-5.569773,6.455417],[-5.349677,6.827965],[-5.124971,7.197759],[-4.897169,7.565658],[-4.667585,7.93245],[-4.437463,8.298906],[-4.208097,8.665833],[-3.980914,9.034117],[-3.757889,9.404912],[-3.541163,9.779471],[-3.337092,10.160972],[-3.147408,10.549996],[-2.984881,10.95097],[-2.849218,11.362228],[-2.75617,11.784122],[-2.716251,12.217886],[-2.744254,12.642155],[-2.799989,13.099298],[-3.214532,13.201209]],
//   [[-3.214532,13.201209],[-3.606484,13.383478],[-3.875476,13.734126],[-3.999723,14.138567],[-4.022671,14.60006],[-0.0741333,14.581098]]
// ];

// vaseShader = {

//     uniforms : {
//         "time": { type: "f", value: 0 },
//     },

//     vertexShader : [

//         "varying vec3 vNormal;",
//        "varying vec2 vUv; ",
//        "varying vec3 vPosition;",
//        // "varying vec3 vecNormal;",

//        " void main() {",
//        "    vUv = uv;",
//        "    vPosition = position;",
//        "     vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;",
//        // "     vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

//        "     gl_Position = projectionMatrix *",
//        "                   modelViewMatrix *",
//        "                   vec4(position,1.0);",
//        " }",
        
            

//     ].join("\n"),

//     fragmentShader : [
//         "\
//         vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
//         vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
//         vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
//         vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
//         vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
//         float noise(vec3 P) {\
//         vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
//         vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
//         vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
//         vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
//         vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
//         vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
//         vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
//         gx0 = fract(gx0); gx1 = fract(gx1);\
//         vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
//         vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
//         gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
//         gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
//         vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
//         g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
//         g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
//         g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
//         vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
//         vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
//         g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
//         g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
//         vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
//             dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
//             vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
//             dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
//             return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
//         }\
//         float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
//         float turbulence(vec3 P) {\
//             float f = 0., s = 1.;\
//             for (int i = 0 ; i < 9 ; i++) {\
//                 f += abs(noise(s * P)) / s;\
//                 s *= 2.;\
//                 P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
//             }\
//             return f;\
//         }\
//         varying vec2 vUv;\
//         uniform float time;\
//         varying vec3 vPosition;\
//         void main(void) {\
//            gl_FragColor = vec4(   vec3(1.0,.8,.2)  *  turbulence(vPosition) ,1.0 );\
//         }"
//     ].join("\n")
// }

// var myFragmentShader = ["\
//    void main(void) {\
//         float t = mod(time,1.0);\
//         float bc = 1.;\
//         float a = 3.14 - atan(vPosition.x,vPosition.y);\
//         float ma = mx-1.;\
//         if(a > mix(0.,6.29,value))\
//             bc=0.;\
//         vec3 point = 5.*vPosition;\
//         vec3 normal = normalize(vNormal);\
//         float s =  .3 + max(0.,dot(vec3(.3), normal));\
//         float tu =  turbulence(point) ;\
//         float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
//         vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
//         if (vNormal.x > 0.) {\
//             float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
//             color += vec3(h*.4, h*.7, h);\
//         }\
//         else {\
//             float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
//             color += vec3(h, h*.8, h*.6);\
//         }\
//       gl_FragColor = vec4(color*bc,alpha);\
//    }\
// "].join("\n");

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

var count = 0;

barleyField = {
    
    setup:function(){

        field = new THREE.Object3D();

        tree = new TREE();
        
        tree.params.ballGeo =  new THREE.SphereGeometry(1,3,6),
        tree.params.jointGeo = new THREE.CylinderGeometry( 1,1,1,5,1),
        tree.params.mat = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.SmoothShading,vertexColors:THREE.FaceColors }),

        tree.generate({
            joints: [40,5],
            length: [5,2],
            width: [1,2],
            rads:[1,2],
            start:[1,30],
            angles:[0,.6]
        });
        
        tree.position.y=-10;
        tree.setScale(.1);
        tree.updateMatrixWorld();

        budsAll = tree.makeList([0,0,-1,-1,-2]);
        budsRoot = tree.makeList([0,0,-1,-1,0]);
        budsEnd =  tree.makeList([0,0,-1,-1,-3]);
        rootRoot = tree.makeList([0,0,0]);
        rootAll = tree.makeList([0,0,-2]);
        tipScale = tree.makeList([0,0,[35,39]])
        tipScaleBuds = tree.makeList([0,0,[7,9],-1,0])

        tree.makeDictionary();
        
        counter = 0;

        counter-=.5+noise(count*.05);
        
        tree.applyFunc([
            budsAll, {rz:-.05,sinScaleMult:1,sinOff:Math.PI,sinScale:0.2,sc:1.3},
            budsEnd, {scy:8,scx:.2,scz:.2},
            rootAll, {rz:0,jFreq:.1,jMult:.01+noise(count*.01)*.2,jOff:counter*.3,jFract:.01},
            tipScale, {sc:.9},
            tipScaleBuds, {rz:0,offsetter3:0.001,freq:.37,offMult:.655,off:.323*3}
        ],tree.transform)
    
        var geo = tree.mergeMeshes(tree);

        var material = new THREE.MeshLambertMaterial({color:0xffffff,skinning:true,vertexColors:THREE.FaceColors});

        geo.skinIndices = [];
        geo.skinWeights = [];

        for(var i = 0 ; i < geo.faces.length ; i++){
            geo.faces[i].color.setRGB((geo.vertices[geo.faces[i].a].y/20)+.5,(geo.vertices[geo.faces[i].a].y/20)+.35,(geo.vertices[geo.faces[i].a].y/20)+.1);
            if(i<5){
                console.log(geo.faces[i]);
            }
        }

        for(var i = 0 ; i < geo.vertices.length ; i++){

            q = (10+geo.vertices[i].y)/20;
            g = -q+1;

            geo.skinIndices.push( new THREE.Vector4(1,0,0,0 ));
            geo.skinWeights.push( new THREE.Vector4(q,g,0,0 ));

        }

        geo.bones = [];

        var bone = {};

        bone.name="whatever";
        bone.pos = [0,0,0];
        bone.rot = [0,0,0];
        bone.scl = [1,1,1];
        bone.rotq = [0,0,0,1];
        bone.parent = -1;

        geo.bones.push(bone);

        var bone = {};

        bone.name="whatever2";
        bone.pos = [0,-1,0];
        bone.rot = [0,0,0];
        bone.scl = [1,1,1];
        bone.rotq = [0,0,0,1];
        bone.parent = 0;

        geo.bones.push(bone);


        things = [];
        field.toGrow = [];



        for(var i = 0 ; i < 200 ; i++){
            var thing = new THREE.SkinnedMesh(geo,material,false);
            // thing.scale = new THREE.Vector3(5,5,5);
            thing.id=i;
            if(i>0){
              thing.position.x = 50-Math.random()*100;
              thing.position.y = (Math.random()*10);
              thing.position.z = 50+thing.position.y*-9;
              field.toGrow.push(thing);
              thing.grow = .001;
              thing.scale.set(.001,.001,.001);
            }
            thing.position.y+=20;
            
            field.add(thing);
            things.push(thing);
        }

        this.things = things;
        field.things = things;
        field.material = tree.params.mat;

        return field;

    },

    draw:function(time){
       
        offset = count*-.25*.1;
        
        for(var i = 0 ; i < things.length ; i++){
            things[i].bones[1]._rotation.z = .25*4*noise(things[i].position.x/100+offset,things[i].position.y/100,things[i].position.z/100);

        }


      
    }
}

THREE.Object3D.prototype.addNoiseFloor = function() {
  var plane = barleyField.setup();
  var noisePlane = NoisePlane.setup({x:1,y:1,z:1});
  plane.noisePlane = noisePlane;
  plane.add(noisePlane);
  this.add(plane);
  this.noisePlane = noisePlane;
  return plane;
}

function nFloor() {

  var a = root.addNoiseFloor();

  this.grow = false;
  a.switcher = 1;
  a.speeder = 0;

  var sketch = geometrySketch(a);

  // console.log(sketch);

  sketch.mouseDown = function(x, y) {
     this.downX = x;
     this.downY = y;
  }

  sketch.mouseDrag = function(x, y) {
      var change = x - this.downX;

      if(sketch.countUp==undefined){
        sketch.countUp = 0;
        sketch.countDown = 0;
      }

      if(change > 0)
        this.countUp+=change*.01;
      if(change < 0){
        this.countDown+=change*.01;
      }

      // console.log(change);
      // console.log((this.downX - x) + " " + (this.downY - y));
  }

  a.update = function() {

    var nP = sketch.mesh.noisePlane;

    if(a.switcher>1 && a.switcher<3 || a.switcher>4){
      if(!this.now)
        this.now = time;
      a.speeder+=nP.waveAmount;
      if(nP.waveAmount<.06)
        nP.waveAmount+=.002;
    }

    sketch.mesh.noisePlane.draw(time);
    // nP.position.y=10;
    nP.rotation.x=.3;

    if(a.switcher>-1 && nP.matOpac < 1 && a.switcher<4){
      nP.matOpac += .1;
    }
    // if(a.switcher>3){
      nP.noiseFreq = mouseY/50;
    // }
    // if(a.switcher > 4 && nP.matOpac > 0){
    //   nP.matOpac -= .1;
    // }

    // this.getMatrix().translate(0,-4.2,0).scale(0.2).rotateX(.2);

    // var offset = 0;

    // if(a.switcher < 3 || a.switcher>4)
    //   offset = a.speeder;//(this.now-time)*444*.002;
    // else
    nP.scale.set(.05,.05,.05);
    offset = mouseX*.01;//(this.now-time)*444*.002;

            
    for(var i = 0 ; i < this.things.length ; i++){
        this.things[i].bones[1]._rotation.z = (444*.001)*4*noise(nP.noiseFreq*things[i].position.x/10+offset,nP.noiseFreq*things[i].position.y/100,things[i].position.z/100);

    }

    if (isDef(this.fadeTime)) {
      var t = min(1, (time - this.fadeTime) / 2.0);
      this.value = t;
      _g.globalAlpha = sCurve(1 - t) * (1-t);
    }
      for(var i = 0 ; i < sketch.mesh.children.length-1 ; i++){
        var sc = .0001;
        sketch.mesh.children[i].scale.set(sc,sc,sc);
      }
    // if(this.switcher>-1){
    //   for(var i = 0 ; i < sketch.mesh.things.length ; i++){
    //     var gs = sketch.countUp;
    //     var bar = sketch.mesh.toGrow[i];

    //     if(sketch.countUp > bar.position.x && bar.position.x > 0 && bar.grow < 1)
    //       bar.grow+=.1;
    //     if(sketch.countDown < bar.position.x && bar.position.x < 0 && bar.grow < 1)
    //       bar.grow+=.1;

    //     bar.scale.set(0.0001,.0001,.0001);
    //   }
    //   // if(sketch.countUp<50)
    //   //   sketch.countUp+=1;
    // }

  }

  sketch.onClick = function(x, y) { 
    // console.log(a.switcher);

    a.switcher += 1;
    this.fadeTime = time; 
    this.grow = true;
    
  }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_
/*
registerGlyph("barley()",
["P!P P!P#P$P%P&P'P(P)P*P*P+P,P-P.P/P0P1P2P3P4P5P6P7P8P9P:P;P<P=P>P?P@PAPBPCQDQDQEQFQGQHQIQJQKQLQMQNQOQPQQQRQSQTQUQVQWQXQYQZQ[Q]Q^Q_Q_Q`QaQbQcQdQeQfQgQhQiQjQkQlRmRnRoRpRqRrRsRtRuRvRvRwRxRySzS{S|S}S~T}S}","P#P#P$O$N$N%M%M&L&K'K'J(J)J)I*I+I+I,J-J-J.K.L.L/M/N0N0O0P0Q0Q1R1S1S2S2T3T4T4T5T6T7T8T8S9S9R:Q:Q:P:O;N;N;M;L;L;K<K<J=J>J?J@J@JAJBJCJCKDKDLELEMENENFOFPFQFQFRGSGSGTHTITITJTKTLTMTNTNTOTPSQSQSRRRRSQSQTPTPT","P$Q$R$R%R%S%S&T&T'T'T(U)U)U*U+U+U,T-T-T.S.S/R/R0R0Q0Q1P1P2P2O2O3O4N4N5N5M6M6M7M8M8N9N9O:O:O:P;Q;Q;R;R<S<S<S=T=T>T?T?T@TATBTBSCSCRDRDQEQEQFPFPGOGOGOHNHNININJMJMKMKLLLLLMLNLOLOLPLQMQMQNRNRORORPSPRPQPQOP",]
);
*/
THREE.Object3D.prototype.addBarley = function() {
  var plane = barleyField.setup();
  var noisePlane = NoisePlane.setup();
  plane.noisePlane = noisePlane;
  plane.add(noisePlane);
  this.add(plane);
  this.noisePlane = noisePlane;
  this.plane = plane;
  return plane;
}

function barley() {

  var a = root.addBarley();

  

  this.grow = false;
  a.switcher = 1;
  a.speeder = 0;

  var sketch = geometrySketch(a);

  // console.log(sketch);

  sketch.mouseDown = function(x, y) {
     this.downX = x;
     this.downY = y;
  }

  sketch.mouseDrag = function(x, y) {
      var change = x - this.downX;

      if(sketch.countUp==undefined){
        sketch.countUp = 0;
        sketch.countDown = 0;
      }

      if(change > 0)
        this.countUp+=change*.01;
      if(change < 0){
        this.countDown+=change*.01;
      }

      // console.log(change);
      // console.log((this.downX - x) + " " + (this.downY - y));
  }

  a.update = function() {

    var nP = sketch.mesh.noisePlane;

    if(a.switcher>1 && a.switcher<3 || a.switcher>4){
      if(!this.now)
        this.now = time;
      a.speeder+=nP.waveAmount;
      if(nP.waveAmount<.06)
        nP.waveAmount+=.002;
    }

    sketch.mesh.noisePlane.draw(time);
    nP.position.y=10;

    if(a.switcher>2 && nP.matOpac < 1 && a.switcher<4){
      nP.matOpac += .1;
    }
    if(a.switcher>3){
      nP.noiseFreq = mouseY/100;
    }
    if(a.switcher > 4 && nP.matOpac > 0){
      nP.matOpac -= .1;
    }

    this.getMatrix().translate(0,-4.2,0).scale(0.2).rotateX(.2);

    var offset = 0;

    if(a.switcher < 3 || a.switcher>4)
      offset = a.speeder;//(this.now-time)*444*.002;
    else
      offset = mouseX*.01;//(this.now-time)*444*.002;

            
    for(var i = 0 ; i < this.things.length ; i++){
        this.things[i].bones[1]._rotation.z = (444*.001)*4*noise(nP.noiseFreq*things[i].position.x/100+offset,nP.noiseFreq*things[i].position.y/100,things[i].position.z/100);

    }

    if (isDef(this.fadeTime)) {
      var t = min(1, (time - this.fadeTime) / 2.0);
      this.value = t;
      _g.globalAlpha = sCurve(1 - t) * (1-t);
    }

    if(this.switcher>0){
      for(var i = 0 ; i < sketch.mesh.toGrow.length ; i++){
        var gs = sketch.countUp;
        var bar = sketch.mesh.toGrow[i];

        if(sketch.countUp > bar.position.x && bar.position.x > 0 && bar.grow < 1)
          bar.grow+=.1;
        if(sketch.countDown < bar.position.x && bar.position.x < 0 && bar.grow < 1)
          bar.grow+=.1;

        bar.scale.set(bar.grow,bar.grow,bar.grow);
      }
      // if(sketch.countUp<50)
      //   sketch.countUp+=1;
    }

  }

  sketch.onClick = function(x, y) { 
    // console.log(a.switcher);

    a.switcher += 1;
    this.fadeTime = time; 
    this.grow = true;
    
  }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

NoisePlane = new THREE.Object3D();

    
    NoisePlane.setup=function(args){

        if(args==undefined) args = {};
        this.cX = args.x || 1;
        this.cY = args.y || .8;
        this.cZ = args.z || .3;

        
        var plane = new THREE.PlaneGeometry(100,90,80,50);
        this.matOpac = 0;
        this.waveAmount = 0;
        this.noiseFreq = 1;
        this.mater = new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:THREE.VertexColors,transparent: true, opacity: 1});
        this.plane = new THREE.Mesh(plane,this.mater);
        this.add(this.plane);
        return this;
        
    }
    
    NoisePlane.draw=function(time){


        // this.matOpac = Math.sin(time);
        this.mater.opacity = this.matOpac;

        this.plane.geometry.verticesNeedUpdate = true;
        this.plane.geometry.normalsNeedUpdate = true;
        this.plane.geometry.colorsNeedUpdate = true;

        for(var i = 0 ; i < this.plane.geometry.vertices.length ; i++){
            var v = this.plane.geometry.vertices[i];
            v.z = noise(
                (v.x*.01*this.noiseFreq)-mouseX*.01,
                (v.y*.01*this.noiseFreq)+mouseY*.01,
                1
                )*10;
        }
        
        this.plane.rotation.x = 4.81;

        
        var faceIndices = [ 'a', 'b', 'c', 'd' ];
        this.plane.geometry.computeFaceNormals();
        this.plane.geometry.computeVertexNormals();
        
         for(var i = 0 ; i < this.plane.geometry.faces.length ; i++){
            for(var j = 0 ; j < 3 ; j++){
              f = this.plane.geometry.faces[i];
              var v = this.plane.geometry.vertices[f[faceIndices[j]]];
              f.vertexColors[j] = new THREE.Color(
                20*noise(v.z*.003)+this.cX,
                20*noise(v.z*.003)+this.cY,
                20*noise(v.z*.003)+this.cZ
              );
            } 
        }
    }

fragPlane = {
    
    setup:function(){
        
        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
            },

            vertexShader : [

                "varying vec3 vNormal;",
               "varying vec2 vUv; ",
               // "varying vec3 vecNormal;",

               " void main() {",
               "    vUv = uv;",
               "     vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;",
               // "     vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

               "     gl_Position = projectionMatrix *",
               "                   modelViewMatrix *",
               "                   vec4(position,1.0);",
               " }",
                
                    

            ].join("\n"),

            fragmentShader : [
            "\
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
    float noise(vec3 P) {\
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
        gx0 = fract(gx0); gx1 = fract(gx1);\
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
    vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
    }\
    float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
    float turbulence(vec3 P) {\
        float f = 0., s = 1.;\
    for (int i = 0 ; i < 9 ; i++) {\
       f += abs(noise(s * P)) / s;\
       s *= 2.;\
       P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
    }\
        return f;\
    }\
                varying vec2 vUv;\
                uniform float time;\
               void main(void) {\
                   float x = 2.*vUv.x-1.,y = 2.*vUv.y-1.,z = sqrt(1.-x*x-y*y);\
                   float cRot = cos(.2*time), sRot = sin(.2*time);\
                   float cVar = cos(.1*time), sVar = sin(.1*time);\
                   vec3 pt = vec3(cRot*x+sRot*z+cVar, y, -sRot*x+cRot*z+sVar);\
                   float g = turbulence(pt);                     /* CLOUDS */\
                   vec2 v = 1.2 * (vUv - vec2(.5,.5));           /* SHAPE */\
                   float d = 1. - 4.1 * dot(v,v);\
                   float s = .3*x + .3*y + .9*z; s *= s; s *= s; /* LIGHT */\
                   d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : d>-.1 ? d+.1 : 0.;\
                   float f = -.2 + sin(4. * pt.x + 8. * g + 4.); /* FIRE */\
                   f = f > 0. ? 1. : 1. - f * f * f;\
                   if (d <= 0.1)\
                      f *= (g + 5.) / 3.;\
                   vec4 color = vec4(d*f*f*.85, d*f, d*.7, 1);   /* COLOR */\
                   if (d <= .05) {                               /* STARS */\
                      float t = noise(vec3(80.*x-time, 80.*y+.3*time, 1));\
                      if ((t = t*t*t*t) > color.x)\
                         color = vec4(t,t,t,1);\
                   }\
                   gl_FragColor = color;\
                }"
            ].join("\n")
        }

        // shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: lightShader.uniforms,
        //     vertexShader:   lightShader.vertexShader,
        //     fragmentShader: lightShader.fragmentShader,
        // });

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    type: "f",
                    value: 0.0
                },
            },
            vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });


        var sph = new THREE.Mesh(new THREE.PlaneGeometry(50,50),shaderMaterial);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;
        // scene.add(sph);

        return sph;


    },
    
    draw:function(time){

        shaderMaterial.uniforms['time'].value = time*.5;
        
    }
}

THREE.Object3D.prototype.addFragPlane = function() {
  var plane = fragPlane.setup();
  this.add(plane);
  this.plane = plane;
  return plane;
}

function shader() {
	var a = root.addFragPlane();
	geometrySketch(a);
	a.update = function() {
		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;
	}
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

palmTree = {

	bob:0,
    
    setup:function(){
        
        tree = new TREE();
        
        tree.generate({joints:[10,33,7],angles:[0,1],rads:[1,3,2],length:[5,3,2],start:[1,9,1],width:[3,2,2]})
        
        // codeName="palmTree";
        // // scene.add(tree);
        
        // tree.position.y = -30;

        // // setSliders({"var1":0,"var2":0,"var3":.6,"var4":.4,"var5":.2,"var6":.4,"var7":.3})
        var sph= sphere(5);
        
        tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            [0,-1,-3],  {obj:sph},

            // [0,-1,-1,1,-1],  {ob:.03},

        ]),tree.appendObj)
        
         tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            // [0,-1,-1,1,-1],  {ob:.03},

        ]),function(obj,args){obj.parts[0].position.x=3,obj.parts[1].position.z=3,obj.parts[1].position.y=-1})

        // tree.geometry = {};

        tree.material = tree.params.mat;

        // tree = sphere(10);

        return tree;
        
    },
    
    draw:function(time){

        tree.passFunc(tree.makeInfo([
            [0,-1,-2],   {rz:0,sc:.98,nFreq:.1,nOff:time,nMult:.2,nObjOff:1},
            [0,-1,-1,-1,-2],  {sc:1+(-0.284*.2),rx:0.105,jOffset:0.083,jOff:count*0.3*-.1,jFreq:-0.067,jMult:-0.002,nFreq:.05,nOff:time,nMult:.6,nObjOff:0.2,nFract:.1},
            [0,-1,-1,-1,1], {ry:-1},
            [0,-1,-1,-1,-1,1,-2],  {sc:.8,rz:.15,rx:-.1},
            [0,-1,-1,-1,-1,0,-2],  {sc:.8,rz:.15,rx:.1},
            [0,-1,-1,-1,-1,-1,0],  {rz:0,off:.2,offMult:2,freq:.11},
            [0,-1,-2],{sc:.92}

        ]),tree.transform)

        
    }
}

/*
I'm commenting this out until we figure out how to get it to work again. -KP

registerGlyph("tree()",["FrFoGlHjHgIeIbJ`J]KYKWLTLRMOMMNJNGOEOBP@P=P:Q8Q5R3Q2N2K2I1F1D1A1>1<09070401///,/).'.$.!-!/%0'1*1,1/122427393<4?4A5D5F5I5L5N6Q6T6V6Y6[6_6b5d5g5i5l4o4q4t4w4y4|4}4{4x4v3s3p3n3k4i4f4c4a4^4Z4X4U5S5P5M5K5H5",]
);
*/

THREE.Object3D.prototype.addTree = function() {
  var palm = palmTree.setup();
  this.add(palm);
  this.palm = palm;
  return palm;
}

function tree() {
	var a = root.addTree();
	geometrySketch(a);
	a.update = function() {

		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;

	}
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

registerGlyph("explode()",["wOxRyUzXz[z_ybxdvfshqkommokqisfudwbx_y[{X{U|R}O}L~I~F~C}@}=};|8z6x4v2t0r.o,m+j)g(e'b&_%[$X#U!S!P!M!J!G#D#A$>%;&8'6)3+1-./,1*3(6&8%;$>#A#D#G!J!M!P S V Y ] `!c#f$h%k&m(o*q-s/u1w4x6z9{<|?}A}D}G}J|M{P{S{V",]
);

THREE.Object3D.prototype.addNoiseBall = function() {
  var ball = explodeBall.setup();
  this.add(ball);
  this.ball = ball;
  return ball;
}

function explode() {
   var a = root.addNoiseBall();
   geometrySketch(a);
   a.update = function() {
      this.shaderMaterial.uniforms['time'].value = time*.1;
      this.shaderMaterial.uniforms['alpha'].value = this.sketch.fade();
      a.getMatrix().scale(0.6);
   }
}

explodeBall = {
    
    setup:function(){
        
      

        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
                "alpha": { type: "f", value: 1 },
                "weight": { type: "f", value: 1 },
                "tExplosion": { type: "t", value: null },
            },

            vertexShader : [


 				"vec3 mod289(vec3 x)\
 				{\
                  return x - floor(x * (1.0 / 289.0)) * 289.0;\
                }",


                // "vec3 mod289(vec3 x)",
                // "{",
                // "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                // "}",

                "vec4 mod289(vec4 x)",
                "{",
                "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                "}",

                "vec4 permute(vec4 x)",
                "{",
                "  return mod289(((x*34.0)+1.0)*x);",
                "}",

                "vec4 taylorInvSqrt(vec4 r)",
                "{",
                "  return 1.79284291400159 - 0.85373472095314 * r;",
                "}",

                "vec3 fade(vec3 t) {",
                "  return t*t*t*(t*(t*6.0-15.0)+10.0);",
                "}",

                "float cnoise(vec3 P)",
                "{",
                "  vec3 Pi0 = floor(P); // Integer part for indexing",
                "  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "float pnoise(vec3 P, vec3 rep)",
                "{",
                "  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period",
                "  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "varying vec2 vUv;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "uniform float time;",
                "uniform float alpha;",
                "uniform float weight;",
                "varying float d;",

                "float stripes( float x, float f) {",
                "    float PI = 3.14159265358979323846264;",
                "    float t = .5 + .5 * sin( f * 2.0 * PI * x);",
                "    return t * t - .5;",
                "}",
                "",
                "float turbulence( vec3 p ) {",
                "    float w = 100.0;",
                "    float t = -.5;",
                "    for (float f = 1.0 ; f <= 10.0 ; f++ ){",
                "        float power = pow( 2.0, f );",
                "        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );",
                "    }",
                "    return t;",
                "}",

                "void main() {",

                    "vUv = uv;",
                    "vec4 mPosition = modelMatrix * vec4( position, 1.0 );",
                    "vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
                    "vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );",
                    "pos = position;",
                    "//float noise = .3 * pnoise( 8.0 * vec3( normal ) );",
                    "float noise = 1.0 *  -.10 *  turbulence( .25 * normal + time );",
                    "//float noise = - stripes( normal.x + 2.0 * turbulence( normal ), 1.6 );",
                    "float displacement = - weight * noise;",
                    "displacement += 1.0 ;//* pnoise( 0.01 * position + vec3( 2.0 * time ), vec3( 10.0 ) );",
                    "ao = noise;",
                    "vec3 newPosition = position + normal * vec3( displacement );",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

                "}",
            ].join("\n"),

            fragmentShader : [
                "\
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
            vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
            float noise(vec3 P) {\
                vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
                vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
                vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
                vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
                vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
                vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
                vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
                gx0 = fract(gx0); gx1 = fract(gx1);\
                vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
                vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
                gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
                gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
                vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
                     g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
                     g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
                     g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
                vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
                vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
                g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
                g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
            vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
                               dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
                          vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
                               dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
                return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
            }\
            float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
            float turbulence(vec3 P) {\
                float f = 0., s = 1.;\
            for (int i = 0 ; i < 9 ; i++) {\
               f += abs(noise(s * P)) / s;\
               s *= 2.;\
               P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
            }\
                return f;\
            }\
                varying vec2 vUv;\
                uniform sampler2D tExplosion;\
                varying vec3 vReflect;\
                varying vec3 pos;\
                varying float ao;\
                varying float d;\
                uniform float time;\
                uniform float alpha;\
                float PI = 3.14159265358979323846264;\
                float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}\
                void main() {\
                  vec3 color = vec3((((ao)*-190.)*-.1));\
                  vec3 col = vec3(1.5,.3,.1);\
                  float ns = turbulence(vec3(pos.x+(time*3.),pos.y+(time*2.),pos.z+(time*4.)));\
                  gl_FragColor = vec4( color*col*vec3(ns*1.4,ns*ns*5.,ns*ns*5.), alpha );\
                }"
            ].join("\n")
        }

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: 0,
                    texture: THREE.ImageUtils.loadTexture('http://www.bpsd.mb.ca/naci/nordstrom/samples/web/portfolio_lowhar/images/splosion.png')
                },
                time: {
                    type: "f",
                    value: 0.0
                },
                alpha: {
                    type: "f",
                    value: 1.0
                },
                weight: {
                    type: "f",
                    value: 10.0
                }
            },
           vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });


        var sph = new THREE.Mesh(new THREE.SphereGeometry(1,200,200),shaderMaterial);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;

        return sph;

    },
    
    draw:function(time) { }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

/*
registerGlyph("flag()",["~B}C|E{FzGyIxJvLuMtNsOqPoQnRlSkTiUhUfVdWcXaY`Z^Z[ZYZXZVZT[R[P[OZMYLXJWIVGUEUESEQDPDNELFKHJIIKHLGNFOFQFSGUGVHXIXKYLZN[O]Q^R]T[VZWYXXYVYTYRZQZOZMZK[I[H[F]D]B]@]?]=];]9]7]6]4]2]0[/[-Z+Z*Y(X&X%W$U#T#R!P O",]
);
*/

THREE.Object3D.prototype.addFlag = function() {
  var ball = flago.setup();
  this.add(ball);
  this.ball = ball;
  return ball;
}

function flag() {
  var a = root.addFlag();
  geometrySketch(a);
  a.update = function() {

    this.shaderMaterial.uniforms['time'].value = time*.1;

  }
}

flago = {
    
    setup:function(){
        
      

        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
                "weight": { type: "f", value: 1 },
                "tExplosion": { type: "t", value: null },
            },

            vertexShader : [


        "vec3 mod289(vec3 x)\
        {\
                  return x - floor(x * (1.0 / 289.0)) * 289.0;\
                }",


                // "vec3 mod289(vec3 x)",
                // "{",
                // "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                // "}",

                "vec4 mod289(vec4 x)",
                "{",
                "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                "}",

                "vec4 permute(vec4 x)",
                "{",
                "  return mod289(((x*34.0)+1.0)*x);",
                "}",

                "vec4 taylorInvSqrt(vec4 r)",
                "{",
                "  return 1.79284291400159 - 0.85373472095314 * r;",
                "}",

                "vec3 fade(vec3 t) {",
                "  return t*t*t*(t*(t*6.0-15.0)+10.0);",
                "}",

                "float cnoise(vec3 P)",
                "{",
                "  vec3 Pi0 = floor(P); // Integer part for indexing",
                "  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "float pnoise(vec3 P, vec3 rep)",
                "{",
                "  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period",
                "  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "varying vec2 vUv;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "uniform float time;",
                "uniform float weight;",
                "varying float d;",

                "float stripes( float x, float f) {",
                "    float PI = 3.14159265358979323846264;",
                "    float t = .5 + .5 * sin( f * 2.0 * PI * x);",
                "    return t * t - .5;",
                "}",
                "",
                "float turbulence( vec3 p ) {",
                "    float w = 100.0;",
                "    float t = -.5;",
                "    for (float f = 1.0 ; f <= 10.0 ; f++ ){",
                "        float power = pow( 2.0, f );",
                "        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );",
                "    }",
                "    return t;",
                "}",

                "void main() {",

                    "vUv = uv;",
                    "vec4 mPosition = modelMatrix * vec4( position, 1.0 );",
                    "vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
                    "vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );",
                    "pos = position;",
                    "//float noise = .3 * pnoise( 8.0 * vec3( normal ) );",
                    "float noise = 1.0 *  -.10 *  turbulence( .25 * normal + time );",
                    "//float noise = - stripes( normal.x + 2.0 * turbulence( normal ), 1.6 );",
                    "float displacement = - weight * noise;",
                    "displacement = pnoise( 0.01 * position*10. + vec3( 2.0 * time ), vec3( 10.0 ) );",
                    "ao = noise;",
                    "vec3 newPosition = position + normal * vec3( displacement );",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

                "}",
            ].join("\n"),

            fragmentShader : [


                "varying vec2 vUv;",
                "uniform sampler2D tExplosion;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "varying float d;",
                "float PI = 3.14159265358979323846264;",

                "float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}",

                "void main() {",

                    "vec3 color = vec3(vUv.y,vUv.y,vUv.y);//texture2D( tExplosion, vec2( 0, 1.0 - 1.3 * ao + .01 * random(vec3(12.9898,78.233,151.7182),0.0) ) ).rgb;",
                    "gl_FragColor = vec4( color.rgb, 1.0 );",

                "}"
            ].join("\n")
        }

        // shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: lightShader.uniforms,
        //     vertexShader:   lightShader.vertexShader,
        //     fragmentShader: lightShader.fragmentShader,
        // });

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: 0,
                    texture: THREE.ImageUtils.loadTexture('http://www.bpsd.mb.ca/naci/nordstrom/samples/web/portfolio_lowhar/images/splosion.png')
                },
                time: {
                    type: "f",
                    value: 0.0
                },
                weight: {
                    type: "f",
                    value: 10.0
                }
            },
           vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });

        var sph = new THREE.Mesh(new THREE.PlaneGeometry(20,10,100,100),shaderMaterial);
        // sph.scale.set(.1,.1,.1);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;

        return sph;

    },
    
    draw:function(time){

        this.shaderMaterial.uniforms['time'].value = time*.1;
        
    }
}

