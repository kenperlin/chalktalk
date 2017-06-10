function() {
    this.label = 'LinkedList';

    // CURRENTLY PARTIALLY-SUPPORTED OPERATIONS:
    //   insertFront
    //   removeFront
    //   remove (removeArbitrary)
    //   reverseInPlace
    //   COMPACT (just for testing/fun, not high priority-wise)
    //

    this.openOutput = false;

    this.onSwipe[4] = [
       'insert front',
       function() {
           if (this.inValue === undefined || this.inValue[0] === undefined) {
              return;
           }
           var input = this.inValue[0];
           this.list.insertFront(input);
       }
    ];

   this.onSwipe[0] = [
      'remove front', 
      function() {
         if (this.list.size() == 0) {
            return;
         } 
           //if (this.out[0] !== undefined) {
           //  this.openOutput = true;
           //}
           //else {
         this.list.removeFront(); 
           //}
      }
   ];

   this.onSwipe[2] = [
      'remove arbitrary',
      function() {
         if (this.list.size() == 0) {
            return;
         } 
         //if (this.out[0] !== undefined) {
         //   this.openOutput = true;
         //}
         //else {
         if (this.inValue === undefined || this.inValue[0] === undefined) {
            return;
         }
         var input = this.inValue[0];
            this.list.remove(input);
         //}
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

   this.onSwipe[7] = [
      "compact",
      function() {
         this.list._compact();
      }
   ];



   this.setup = function() {
      this.list = new LinkedList.SinglyLinked(this);
      this.code = {
        "SL_NODE" : [
        "struct list_node<T> {",
        "    T data;",
        "    struct list_node * next;",
        "};"
        ],

        "SL_REVERSE_IN_PLACE" : [
        "void reverse_in_place(void)",
        "{",
        "    struct list_node * curr = this->head;",
        "    struct list_node * prev = nullptr;",
        "    while (curr != nullptr) {",
        "        next = curr->next;",
        "        curr->next = prev;",
        "        prev = curr;",
        "        curr = next;",
        "    }",
        "    this->head = prev;",
        "}"
        ],

      };
   };

   this.onPress = function(p) {
      // if (this.list.size() <= 0) {
      //   return;
      // }

      // let bla = this.list.head.bound.pos;
      // bla.x = p.x;
      // bla.y = p.y;
      // bla.z = p.z;
      //console.log(p.x, p.y, p.z);
   };

   this.onDrag = function(p) {
      // if (this.list.size() <= 3) {
      //   return;
      // }

      // let bla = this.list.head.bound.pos;
      // bla.x = p.x;
      // bla.y = p.y;
      // bla.z = p.z;    
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
         this.list.print();
         this.list.draw();
      });
   };

   this.over = function(other) {

   };

   this.under = function(other) {
      let curr = this.head;
      
   };


    this.output = function() {
      return 0;
    };
}