function() {
    this.label = 'LinkedList';
    this.is3D = true;

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
      'remove arbitrary (data)',
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
            this.list.removeByData(input);
         //}
      }
   ];
   this.onSwipe[3] = [
      'remove arbitrary (selection)',
      function() {
         if (this.list.size() == 0) {
            return;
         }
         let s = this.list.getSelectedStructure();
         if (s === null) {
            return;
         }
         this.list.removeByPtr(s.structure);
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

      this.demonstrationCode = {
         "SL_NODE" : [
         "struct list_node<T> {",
         "    T data;",
         "    struct list_node * next;",
         "};"
         ],

         "SL_REMOVE_ARBITRARY" : [
         "void remove(T value)",
         "{",
         "    struct list_node * prev = nullptr;",
         "    struct list_node * curr = this->head;",
         "",
         "    while (curr != nullptr && curr->data != value) {",
         "        prev = curr;",
         "        curr = curr->next;",
         "    }",
         "    if (curr == nullptr) {",
         "        return;",
         "    }",
         "",
         "    if (prev == nullptr) {",
         "        this->head = curr->next;",
         "    } else {",
         "        prev->next = curr->next;",
         "    }",
         "    this->_size--;",
         "}"         
         ],

         "SL_REMOVE_ARBITRARY_LINUS_TORVALDS" : [
         // https://medium.com/@bartobri/applying-the-linus-tarvolds-good-taste-coding-requirement-99749f37684a
         // LINUS TORVALDS STYLE
         "void remove(T value)",
         "{",
         "    struct list_node ** indirect = &(this->head);",
         "",
         "    while ((*indirect) != nullptr && (*indirect)->data != value) {",
         "        indirect = &(*indirect)->next;",
         "    }",
         "    if ((*indirect) == nullptr) {",
         "        return;",
         "    }",
         "",
         "    *indirect = (*indirect)->next;",
         "    this->_size--;",
         "}",
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
      this.selectSubstructure(p);
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

   this.selectSubstructure = function(p) {
      this.list.selectSubstructure(p);
   };

   // linkedlist.SinglyLinked.Operation = Object.freeze({
   //    IDLE : '1',
   //    INSERT_FRONT : '2',
   //    REMOVE_FRONT : '3',
   //    INSERT_ARBITRARY : '4',
   //    REMOVE_ARBITRARY : '5',
   //    REVERSE_IN_PLACE : '6',
   // });

   this.printed = false;
   this.render = function(elapsed) {
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
         this.mutex = "BLOCK"; 
         this.list.print();
         this.list.draw();
         this.mutex = "UNBLOCK";
         //console.log(elapsed);
      });
   };

   this.over = function(other) {

   };

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      let out = other.output();
      let additionPoint = this.list.getSelectedStructure();
      if (additionPoint === null) {
         this.list.insertFront(out);
      }
      else {
         this.list.insertByPtr(out, additionPoint.structure);
      }
      other.fade();
      other.delete();
   };


    this.output = function() {
      return this.list.head;
    };
}