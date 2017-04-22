function() {
   this.label = "text-to-speech";

   this.setup = function() {
      this.msg = "";
      this.getTextOn = true;
      if ("speechSynthesis" in window) {
         this.speak = function() {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(this.msg));
         };
      }
      else {
         this.speak = function() {return;};
      }
   };

   this.onSwipe[0] = [
      "speak",
      function() {
         this.speak();
      }
   ];

   this.onSwipe[2] = [
      "toggle get text",
      function() {
         this.getTextOn = !this.getTextOn;
      }
   ];

   this.onSwipe[4] = [
      "remove text",
      function() {
         this.msg = '';
      }
   ]
   
   this.render = function() {
      mCurve([[-1, 1], [1, 1]]);
      mCurve([[0, 1], [0, -1]]);
      this.afterSketch(function() {
         if (this.getTextOn 
             && this.inValue[0] !== undefined 
             && this.inValue[0] != '') {
            this.msg = String(this.inValue);
         }

         if (this.msg != '') {
            textHeight(this.mScale(1));
            mText(String(this.msg), [0, 0], .5, .5);
         }
      });
   };

   this.output = function() {
      return 0;
   };
}