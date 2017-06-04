function() {
    this.label = 'LinkedList';

    this.list = null;
    this.openOutput = false;

    this.onSwipe[0] = [
       'insert front',
       function() {
           if (this.inValue === undefined || this.inValue[0] === undefined) {
              return;
           }
           var input = this.inValue[0];
           this.list.insertFront(input);
       }
    ];

    this.onSwipe[4] = [
       'remove front', 
       function() {
           if (this.list.size == 0) {
              return;
           } 
           if (this.out[0] !== undefined) {
             this.openOutput = true;
           }
           else {
             this.list.removeFront(); 
           }
       }
   ];

    // this.onSwipe[6] = [
    //   'empty',
    //   function() {
    //     this.stack = [];
    //   }
    // ];

   this.onSwipe[6] = [
      "reverse in place",
      function() {
         this.list.reverseInPlace();
      }
   ];

    this.onSwipe[2] = [
      'debug',
       function() {
          console.log(this);
       }
    ];

   this.setup = function() {
      this.list = new LinkedList.SinglyLinked(this);
   };

   this.printed = false;
   this.render = function() {
      this.duringSketch(function() {
        let seventh = 1 / 7;
        let height = 0.25;
        mCurve([[-1, 0], [1, 0]]);
        mCurve([
                  [-1 + (4 * seventh) + .75, -height], [-1 + (4 * seventh) + .75, height],
                  [-1 + seventh + .25, height],  [-1 + seventh + .25, -height],
                  [-1 + (4 * seventh) + .75, -height]
        ]);
      });
      this.afterSketch(function() {
         mCurve([[-1, 1], [1, 1]]);
         mCurve([[-1, -1], [1, -1]]);
         this.list.print();
         this.list.draw();
         this.list.drawDeferred()
      });
   }



    this.output = function() {
      return 0;
    };
}