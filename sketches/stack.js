function() {
    this.label = 'stack';
    this._stack = [];
    this._openOutput = false;
    this._removeTop = false;
    this._pushContinuous = false;
    this.onSwipe[0] = [
        'peek', 
        function() {
           if (this._pushContinuous) {
              return;
           }
           if (this._stack.length == 0) {
              console.log("TRIED TO PEEK, BUT IS EMPTY");
              return;
           }
           console.log("PEEK " + this._stack[this._stack.length - 1]);
           this._openOutput = true;
        }
    ];

    this.onSwipe[2] = [
       'pop', 
       function() {
           if (this._pushContinuous) {
              return;
           }
           if (this._stack.length == 0) {
              console.log("TRIED TO POP, BUT IS EMPTY");
              return;
           } 
           console.log("POPPED " +  this._stack[this._stack.length - 1]);
           if (this.out[0] !== undefined) {
             this._openOutput = true;
             this._removeTop = true;
           }
           else {
             this._stack.pop(); 
           }
       }
    ];
    this.onSwipe[6] = [
       'push', 
       function() {
           if (this._pushContinuous) {
              return;
           }
           if (this.inValue === undefined || this.inValue[0] === undefined) {
              console.log("TRIED TO PUSH, BUT NOTHING TO ADD");
              return;
           }
           var input = this.inValue[0];
           this._stack.push(input);
           console.log("PUSHED " + input);
       }
    ];
    this.onSwipe[4] = [
       'push continuously',
       function() {
          if (this.inValue[0] === undefined) {
              this._pushContinuous = false;
              return;
          }

          this._pushContinuous = !this._pushContinuous;
       }
    ];

    this.onSwipe[7] = [
      'debug',
       function() {
          console.log(this);
       }
    ];

    this.render = function() {
       mCurve([[-1, 1], [1, 1]]);
       this.duringSketch(function() {
          mCurve([[0, 1], [0, -.3]]);
          mCurve([[-.2, -.1], [0, -.3], [.2, -.1]]);
       });
       this.afterSketch(function() {
           // console.log(this._stack  + " " + this._stack.length);
           var offset = 0;
           var frameHeight = .2
           for (var i = 0; i < this._stack.length; i++) {
              mLine([-1, 1 - offset], [-1, 1 - offset - frameHeight]);
              mLine([-1, 1 - offset - frameHeight], [1, 1 - offset - frameHeight]);
              mLine([1,  1 - offset - frameHeight], [1, 1 - offset]);

              offset += frameHeight;

                textHeight(this.mScale(.2));
                mText(this._stack[i], [0, -offset + 5 * frameHeight], .4, 1);

              // if (offset > 15 ) {
              //      break;
              // }
           }
           if (this._stack.length > 0) {
              mLine([-1.1, 1 - offset + (1 * frameHeight)], [-1.1, 1 - offset + (0 * frameHeight)]);
              mLine([1.1,  1 - offset + (1 * frameHeight)], [1.1, 1 - offset + (0 * frameHeight)]);
           }


           mCurve([[-.2, -.1 - offset], [0, -.3 - offset], [.2, -.1 - offset]]);
           mCurve([[0, 1 - offset], [0, -.3 - offset]]);

           if (this._pushContinuous) {
               if (this.inValue[0] === undefined) {
                  this._pushContinuous = false;
               }
               else {
                  this._stack.push(this.inValue[0]);
              }
          }
       });
    }

    this.output = function() {
        if (this._openOutput) {
            this._openOutput = false;
            if (this._removeTop) {
                this._removeTop = false;
                var val = this._stack.pop();
                return val;
            }
            return this._stack[this._stack.length - 1];
        }
    };
}