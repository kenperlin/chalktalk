
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

