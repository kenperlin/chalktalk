function() {
    this.label = 'stack';
    this.stack = [];
    this.openOutput = false;
    this.removeTop = false;
    this.pushContinuous = false;
    this.EMPTYOUTPUT = -1
    this.onSwipe[0] = [
        'peek', 
        function() {
           if (this.pushContinuous) {
              return;
           }
           if (this.stack.length == 0) {
              console.log("TRIED TO PEEK, BUT IS EMPTY");
              return;
           }
           console.log("PEEK " + this.stack[this.stack.length - 1]);
           this.openOutput = true;
        }
    ];

    this.onSwipe[6] = [
       'pop', 
       function() {
           if (this.pushContinuous) {
              return;
           }
           if (this.stack.length == 0) {
              console.log("TRIED TO POP, BUT IS EMPTY");
              return;
           } 
           console.log("POPPED " +  this.stack[this.stack.length - 1]);
           if (this.out[0] !== undefined) {
             this.openOutput = true;
             this.removeTop = true;
           }
           else {
             this.stack.pop(); 
           }
       }
    ];
    this.onSwipe[2] = [
       'push', 
       function() {
           if (this.pushContinuous) {
              return;
           }
           if (this.inValue === undefined || this.inValue[0] === undefined /*|| this.inValue[0] == this.EMPTYOUTPUT*/) {
              console.log("TRIED TO PUSH, BUT NOTHING TO ADD");
              return;
           }
           var input = this.inValue[0];
           this.stack.push(input);
           console.log("PUSHED " + input);
       }
    ];
    // this.onSwipe[4] = [
    //    'push continuously',
    //    function() {
    //       if (this.inValue[0] === undefined) {
    //           this.pushContinuous = false;
    //           return;
    //       }

    //       this.pushContinuous = !this.pushContinuous;
    //    }
    // ];
    this.onSwipe[4] = [
      'empty',
      function() {
        this.stack = [];
      }
    ];

    this.onSwipe[7] = [
      'debug',
       function() {
          console.log(this);
       }
    ];

    // this.render = function() {
    //    mCurve([[-1, 1], [1, 1]]);
    //    this.duringSketch(function() {
    //       mCurve([[0, 1], [0, -.3]]);
    //       mCurve([[-.2, -.1], [0, -.3], [.2, -.1]]);
    //    });
    //    this.afterSketch(function() {
    //        // console.log(this.stack  + " " + this.stack.length);
    //        var offset = 0;
    //        var frameHeight = .2
    //        for (var i = 0; i < this.stack.length; i++) {
    //           mLine([-1, 1 - offset], [-1, 1 - offset - frameHeight]);
    //           mLine([-1, 1 - offset - frameHeight], [1, 1 - offset - frameHeight]);
    //           mLine([1,  1 - offset - frameHeight], [1, 1 - offset]);

    //           offset += frameHeight;

    //             textHeight(this.mScale(.2));
    //             mText(this.stack[i], [0, -offset + 5 * frameHeight], .4, 1);

    //           // if (offset > 15 ) {
    //           //      break;
    //           // }
    //        }
    //        if (this.stack.length > 0) {
    //           mLine([-1.1, 1 - offset + (1 * frameHeight)], [-1.1, 1 - offset + (0 * frameHeight)]);
    //           mLine([1.1,  1 - offset + (1 * frameHeight)], [1.1, 1 - offset + (0 * frameHeight)]);
    //        }


    //        mCurve([[-.2, -.1 - offset], [0, -.3 - offset], [.2, -.1 - offset]]);
    //        mCurve([[0, 1 - offset], [0, -.3 - offset]]);

    //        if (this.pushContinuous) {
    //            if (this.inValue[0] === undefined) {
    //               this.pushContinuous = false;
    //            }
    //            else {
    //               this.stack.push(this.inValue[0]);
    //           }
    //       }
    //    });
    // }

    this.render = function() {
       mCurve([[-1, -1], [1, -1]]);
       this.duringSketch(function() {
          mCurve([[0, -1], [0, .3]]);
          mCurve([[-.2, .1], [0, .3], [.2, .1]]);
       });
       this.afterSketch(function() {
           var offset = 0;
           var frameHeight = .2
           for (var i = 0; i < this.stack.length; i++) {
              mLine([-1, -1 + offset], [-1, -1 + offset + frameHeight]);
              mLine([-1, -1 + offset + frameHeight], [1, -1 + offset + frameHeight]);
              mLine([1,  -1 + offset + frameHeight], [1, -1 + offset]);

              offset += frameHeight;

              textHeight(this.mScale(.2));
              mText(String(this.stack[i]).substring(0, 15), [0, offset - 6 * frameHeight + 0.025], .5, 1);

              // if (offset > 15 ) {
              //      break;
              // }
           }
           if (this.stack.length > 0) {
              mLine([-1.1, -1 + offset - (1 * frameHeight)], [-1.1, -1 + offset + (0 * frameHeight)]);
              mLine([1.1,  -1 + offset - (1 * frameHeight)], [1.1, -1 + offset + (0 * frameHeight)]);
           }

           mCurve([[0, -1 + offset], [0, .3 + offset]]);
           mCurve([[-.2, .1 + offset], [0, .3 + offset], [.2, .1 + offset]]);

          //  if (this.pushContinuous) {
          //      if (this.inValue[0] === undefined) {
          //         this.pushContinuous = false;
          //      }
          //      else {
          //         this.stack.push(this.inValue[0]);
          //     }
          // }
       });
    }

    this.output = function() {
      if (this.stack.length == 0) {
        // return this.EMPTYOUTPUT;
        return 0;
      }
      if (this.removeTop) {
          this.removeTop = false;
          var val = this.stack.pop();
          return val;
      }
      return this.stack[this.stack.length - 1];
    };

    // this.output = function() {
    //     if (this.openOutput) {
    //         this.openOutput = false;
    //         if (this.removeTop) {
    //             this.removeTop = false;
    //             var val = this.stack.pop();
    //             return val;
    //         }
    //         return this.stack[this.stack.length - 1];
    //     }
    // };

    // this.output = function() {
    //    this.openOutput = true;
    //    if (this.stack.length > 0) {
    //         if (this.removeTop) {
    //             this.removeTop = false;
    //             var val = this.stack.pop();
    //             return val;
    //         }
    //         return this.stack[this.stack.length - 1];
    //    }
    //    console.log("HMMMMMMMMMMM");
    //    return "NONE";
    // };
}