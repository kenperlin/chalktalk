function() {

   // CHANGE TO AN ORIGINAL NAME FOR SKETCH
   this.label = "nameofsketch";

   /*
    * OPTIONAL SETUP BEFORE CREATION OF SKETCH
    */
   this.setup = function() {
      // INSTANTIATE PROPERTIES
   }

   /*
    * MAIN RENDER LOOP FOR THE SKETCH,
    *    CONTROL SKETCH RECOGNITION STROKES AND APPEARANCE
    *
    * param : elapsedTime (TIME BETWEEN RENDER CALLS)
    */
   this.render = function(elapsedTime) {
      // render FUNCTION BODY: 
      //    - CALL DRAW FUNCTIONS IN THE BODY TO SPECIFY 
      //       STROKES AND STROKE ORDER FOR RECOGNITION OF SKETCH
      //    - ADD PROGRAM LOGIC, RESPOND TO INPUT / OUTPUT


      // duringSketch:
      //    - OPTIONALLY CALL DRAW FUNCTIONS IN A PROVIDED CALLBACK TO SPECIFY
      //       STROKES FOR RECOGNITION THAT WILL DISAPPEAR AFTER RECOGNITION
      this.duringSketch(function() {
         // DRAW OR DO SOMETHING HERE
      });


      // afterSketch:
      //    - CALL DRAW FUNCTIONS IN A PROVIDED CALLBACK TO
      //       CHANGE THE APPEARANCE OF THE SKETCH DURING ITS LIFETIME,
      //       STROKES NOT USED FOR RECOGNITION
      //    - ADD PROGRAM LOGIC, RESPOND TO INPUT/ OUT
      this.afterSketch(function() {
         // DRAW OR DO SOMETHING HERE
      });
   };
   
   /*
    * SEND OUTPUT TO CONNECTED SKETCHES
    */
   this.output = function() {
      // THE RETURN VALUE OF THIS FUNCTION WILL
      // BE PASSED THROUGH SKETCH LINKS
      // e.g. 
      // return 10; 
      // TO RETURN THE VALUE 10;
      //
      // THERE ARE CURRENTLY NO RESTRICTIONS ON OUTPUT TYPE,
      // SO THE SKETCH ON THE RECEIVING END IS RESPONSIBLE
      // FOR INTERPRETING AND HANDLING THE DATA
      // (NOTE THAT A TYPE SYSTEM FOR SAFE SKETCH INPUT / OUTPUT IS BEING DEVELOPED BY @Kronopath)
      
      // TO ACCESS DATA SENT TO THIS SKETCH BY ANOTHER ONE
      // THROUGH THE "i"th LINK (THERE CAN BE MULTIPLE INPUT SKETCH LINKS PER SKETCH), 
      // RETRIEVE THE VALUE FROM:
      // this.inValue[i]
      // (ALSO NOTE THAT BEFORE USING AN INPUT VALUE,
      // YOU SHOULD CHECK WHETHER IT IS DEFINED -- i.e. THE SKETCH LINK EXISTS)
   };

   // CURSOR CONTROLS :

   // - DRAG FROM SKETCH CENTER OUTWARDS TOWARDS
   //    A POINT ON A "CIRCLE" AROUND THE SKETCH (0 - 7),
   //       0 - 2π COUNTER-CLOCKWISE
   // - EACH ARRAY CONTAINS THE OPERATION NAME AND A CALLBACK
   this.onSwipe[0] = [
      "Description for help mode", 
      function() { 
         // DO SOMETHING
      }
   ];
   // ...
   // this.onSwipe[7] = [ ... ];

   /*
    * MOUSE CLICK EVENT CALLBACKS FOR CLICK, DRAG, RELEASE, AND MOVE
    * 
    * param : p (AN OBJECT CONTAINING THE PROPERTIES x, y : 
    *    COORDINATES OF THE MOUSE EVENT WITH RESPECT TO THIS SKETCH)
    */
   this.onPress = function(p) {

   };
   this.onDrag = function(p) {

   };
   this.onRelease = function(p) {

   };
   this.onMove = function(p) {
   
   };

   /*
    * MOUSE CLICK EVENT CALLBACKS FOR CLICK, DRAG, AND RELEASE WHEN COMMAND CLICK ACTIVE
    *    (ALTERNATE INPUTS THAT ACTIVATE AFTER CLICKING THE 
    *     BOTTOM-LEFT "cmd" OPTION FOR A SKETCH)
    *
    * 
    * param : p (AN OBJECT CONTAINING THE PROPERTIES x, y : 
    *    COORDINATES OF THE MOUSE EVENT WITH RESPECT TO THIS SKETCH)
    */
   this.onCmdPress = function(p) {

   };
   this.onCmdDrag = function(p) {

   };
   this.onCmdRelease = function(p) {

   };


   /*
    * MOUSE CLICK EVENT CALLBACKS FOR DOWN (CLICK), DRAG, UP (RELEASE), AND MOVE
    * 
    * param : x, y, z (COORDINATES IN THE CHALKTALK WORLD),
    *    USE this.inverseTransform([x, y, def(z)]) 
    *       TO TRANSFORM INTO COORDINATES IN THIS SKETCH (RETURNS POINT AS AN ARRAY)
    */
   this.mouseDown = function(x, y, z) {

   };
   this.mouseDrag = function(x, y, z) {

   };
   this.mouseUp = function(x, y, z) {

   };
   this.mouseMove = function(x, y, z) {
      
   };

   // OTHER SKETCH INTERACTION CALLBACKS :

   /*
    * CALLED WHEN THIS SKETCH IS PLACED UNDER ANOTHER
    *    (NOTE : CALLED IN BOTH SKETCHES)
    *
    * param : otherSketch (THE SKETCH OVER THIS ONE)
    */
   this.under = function(otherSketch) {

   };
   /*
    * CALLED WHEN THIS SKETCH IS PLACED OVER ANOTHER
    *    (NOTE : CALLED IN BOTH SKETCHES)
    *
    * param : otherSketch (THE SKETCH UNDER THIS ONE)
    */
   this.over = function(otherSketch) {

   };
   /*
    * CALLED WHEN THIS SKETCH INTERSECTS WITH ANOTHER
    *    (NOTE : CALLED IN BOTH SKETCHES)
    *
    * param : otherSketch (THE SKETCH THAT INTERSECTS WITH THIS ONE)
    */
   this.onIntersect = function(otherSketch) {

   };
}
