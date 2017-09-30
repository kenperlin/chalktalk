
function() {
  // Todo update depth when node is added.
   this.label = 'BST';

   this.createNode = function(value) {
     var node = {};
     node.value = value;
     node.right = null;
     node.left = null;
     node.center = null;
     return node;
   };

   this.stack = [];


   let ctx = this;

   function BST() {
      this.root = null;

      this.depth = 0;

      BST.Node = function(value, center) {
         this.value = value;
         this.left = null;
         this.right = null;
         this.center = center;
         this.parentCenter = null;
         this.parentRadius = null;
      };

      BST.Node.prototype = {
        insert : function(value) {
           let toinsert = new BST.Node(value);
           let parent = this;
           let current = this;
           let comp = null;

           while (current !== null) {
              parent = current;
              comp = current.value;
              if (value <= comp) {
                 current = current.left;
              }
              else {
                 current = current.right;
              }
           }
           switch (value <= comp) {
           case true:
              parent.left = toinsert;
              break;
           case false:
              parent.right = toinsert;
              break;
           }
        },
        getPredecessor: function(node) {
          var curNode = node.left;
          while (curNode.right !== null){
            curNode = curNode.right;
          }
          return curNode.value;
        },


        remove: function(node) {
          if (node.left === null){
            return node.right;
          }
          if (node.right === null){
            return node.left;
          }
          var value = this.getPredecessor(node);
          node.value = value;
          node.left = this.recRemove(node.left, value);
          return node;
        },

        recRemove: function(node, value) {
          if (value < node.value){
            node.left = this.recRemove(node.left, value);
          }
          else if (value > node.value){
            node.right = this.recRemove(node.right, value);
          }
          else {
            node = this.remove(node);
          }
          return node;
        },

        // drawNode: function() {
        //   if (this.center !== null){
        //     let radius = 0.5;
        //     let left = this.center[0] - radius;
        //     let bottom = this.center[1] - radius;
        //     let right = this.center[0] + radius;
        //     let top = this.center[1] + radius;
        //     _g.save();
        //     color("red");
        //     mDrawOval([left,bottom], [right,top], 32, PI, 0);
        //     mDrawOval([left,bottom], [right,top], 32, 0, -PI);
        //     // textHeight(this.mScale(.8));
        //     // mText(this.value, this.center, .5, .5, .5);
        //     _g.restore();
        //   }
        // },



        toString : function() {
           return "(" + this.value + ")";
        },
        print : function() {
           if (this.left !== null) {
              this.left.print();
           }
           console.log(this.toString());
           if (this.right !== null) {
              this.right.print();
           }
        }
      };
   }
   BST.prototype = {
      insert : function(value) {
         if (this.root === null) {
            this.root = new BST.Node(value);
            return this;
         }
         this.root.insert(value);
         return this;
      },
      remove: function(value){
        this.root = this.root.recRemove(this.root, value);
      },
      copyData: function(oldNode) {
        var newNode = new BST.Node(oldNode.value, oldNode.center);

        if (oldNode.left !== null){
          newNode.left = this.copyData(oldNode.left)
        }
        if (oldNode.right !== null){
          newNode.right = this.copyData(oldNode.right);
        }
        return newNode;
      },
      clone: function(){
        var newBST = new BST();
        var oldNode = this.root;
        newBST.root = new BST.Node(oldNode.value, oldNode.center);
        newBST.depth = this.depth;
        if (oldNode.left !== null){
            newBST.root.left = this.copyData(oldNode.left);
        }
        if (oldNode.right !== null){
            newBST.root.right = this.copyData(oldNode.right);
        }

        return newBST;

      },

      updateStack: function() {
        ctx.stack.push(this.clone());
        var newBST = ctx.stack[ctx.stack.length-1];
        this.root = newBST.root;
        // newBST.stack = this.stack;
      },

      revertStack: function() {
        if (ctx.stack.length <= 1) return;
        var temp = ctx.stack.pop();
        var oldBST = ctx.stack[ctx.stack.length-1];

        this.root = oldBST.root;
        this.depth = oldBST.depth;
      },

      _sortedArrayToBST: function(arr, start, end) {
        if (start > end){
          return null;
        }
        var mid = Math.trunc((start + end)/2);
        var node = new BST.Node(arr[mid]);
        node.left = this._sortedArrayToBST(arr, start, mid-1);
        node.right = this._sortedArrayToBST(arr, mid+1, end);
        return node;

      },

      createArrFromDepth: function(depth){
        var height = depth-1;
        var maxVal = pow(2,height+1)-1;
        var arr = [];
        for (i=1;i<=maxVal;i++){
          arr.push(i);
        }
        return arr;
      },

      createBSTFromDepth: function(value){
        this.depth = value;
        var arr = this.createArrFromDepth(value);

        return this._sortedArrayToBST(arr, 0, arr.length-1);;
      },

      print : function() {
         if (this.root === null) {
            return;
         }
         this.root.print();
      },
   };


   this.setup = function() {
      this.tree = new BST();
      this.tree.root = this.tree.createBSTFromDepth(3);
      // this.tree.insert(5).insert(2).insert(7).insert(1).insert(3).insert(6).insert(8);
      this.tree.updateStack();

      this.data = function() { return this.tree; };
   }

   // NOT USED RIGHT NOW
   this.getSize = function(node) {
     if (node === null) {
        return 0;
     }
     return this.getSize(node.left) + 1 + this.getSize(node.right);
   }


  this.recDrawNode = function(node, center, radius, parentCenter, parentRadius, xOffset = 5, yOffset = 2){
    if (node !== null) {
      node.center = center;
      this.drawNode(node, center,radius, parentCenter,parentRadius);
      if (node.left !== null){
        var newCenter = [center[0]-xOffset*radius,center[1]-yOffset*radius];
        this.recDrawNode(node.left, newCenter, radius, center, radius, xOffset/2);
      }
      if (node.right !== null){
        var newCenter = [center[0]+xOffset*radius,center[1]-yOffset*radius];
        this.recDrawNode(node.right, newCenter, radius, center, radius, xOffset/2);
      }
    }


  }

   this.drawNode = function(node, center, radius, parentCenter, parentRadius) {
     var left = center[0] - radius;
     var bottom = center[1] - radius;
     var right = center[0] + radius;
     var top = center[1] + radius;
     mDrawOval([left,bottom], [right,top], 32, PI, 0);
     mDrawOval([left,bottom], [right,top], 32, 0, -PI);
     if (parentCenter !== undefined && parentRadius !== undefined){
       var childParentVec = [center[0]-parentCenter[0],center[1]-parentCenter[1]];
       var childParentDist = sqrt(pow(childParentVec[0],2)+pow(childParentVec[1],2));
       var edgeOfParent = [parentCenter[0] + parentRadius/childParentDist*childParentVec[0], parentCenter[1] + parentRadius/childParentDist*childParentVec[1]];
       var edgeOfChild = [center[0] - radius/childParentDist*childParentVec[0],center[1] - radius/childParentDist*childParentVec[1]];
       mLine(edgeOfParent,edgeOfChild);
     }
     textHeight(this.mScale(.4));
     mText(node.value, center, .5, .5, .5);

   }

   // findClickedNode helper function
   this.inCircle = function(node, clickLocation){
     var dist = Math.sqrt((clickLocation[0]-node.center[0])*(clickLocation[0]-node.center[0]) + (clickLocation[1]-node.center[1])*(clickLocation[1]-node.center[1]));
     return dist < 0.5;
   }

   this.findClickedNode = function(node, clickLocation) {
      if (node === null) return null;
      if (!this.inCircle(node, clickLocation)){ // if the click isnt in that node
        if (node.center[0] > clickLocation[0]){
          if (node.left !== null){
            return this.findClickedNode(node.left, clickLocation);
          }
          else {
            return null;
          }
        } else {
          if (node.right !== null){
            return this.findClickedNode(node.right, clickLocation);
          } else {
            return null;
          }
        }
      }
      return node;
   }

   this._clickedY = null;
   this.onPress = function(p){
     var node = this.findClickedNode(this.data().root, [p.x, p.y]);
     if (node !== null){
      //  node.drawNode();
       this.tree.updateStack();
       this.tree.remove(node.value);
     }
     this._clickedY = p.y;


   }


   this.onSwipe[4] = [
       'undo',
       function() {
           this.tree.revertStack();
       }
    ];

    // this.onPress = function(p) {
    //
    // }


    this.onCmdClick = function(p) {
      console.log("WEE");
    };

    this.onCmdDrag = function(p) {
      console.log("WEE AGAAAAAIN");
    };

    this.onCmdRelease = function(p) {
      console.log("WEE ARE DONE");
    }

    this.onDrag = function(p) {
      // save a point "boundary"/"threshold" for comparison
      let point = [p.x, p.y];

      let addedDepth = Math.round((this._clickedY - point[1])/2);
      if (addedDepth !== 0){
        let newDepth = this.tree.depth + addedDepth;
        newDepth = Math.min(newDepth, 6);
        newDepth = Math.max(newDepth, 1);
        this.tree.root = this.tree.createBSTFromDepth(newDepth);
        this.tree.updateStack();
        this.tree.depth = newDepth;

        this._clickedY = point[1];
      };


      // if (newDepth > 1){

      // }
      // else if (newDepth < 0) {
      //
      // }

    };

    this.onRelease = function(p) {
      this._clickedY = null;
    }

    this.under = function(other) {
       if (other.output === undefined) {
          return;
       }

       let out = other.output();
       if (/^\d+$/.test(out)){
         out = Number(out);
         this.tree.insert(out);
         other.fade();
         other.delete();
       }

    };

   this.render = function() {
      this.duringSketch(function(){
        mDrawOval([-1,-1], [1,1], 32, PI, 0);
        // mLine([-1, 0], [1, 0]);
      });
      this.afterSketch(function(){
        // this.drawNode([0,0],.5);
        // this.drawNode([-1,-1],.5, [0,0],.5);
        // this.drawNode([ 1,-1],.5, [0,0],.5);
        var nodeSize = 0.5;
        var center = [0,0];

        var curNode = this.data().root;
        let depth = this.tree.depth;
        if (depth > 4){


          this.recDrawNode(curNode, center, nodeSize,undefined,undefined,20);
        }
        else if (depth > 3){
          this.recDrawNode(curNode, center, nodeSize,undefined,undefined,10);
        }
        else {
          this.recDrawNode(curNode, center, nodeSize);
        }



      });
   }

// Remove almost
// minValue: function() {
//   if (this.left === null){
//     return this.value;
//   } else {
//     return this.left.minValue();
//   }
// },
// remove : function(value, parent) {
//     if (value < this.value) {
//       return this.left.remove(value, this);
//     } else if (value > this.value) {
//       return this.right.remove(value, this);
//     } else {
//       if (this.left !== null && this.right !== null) {
//         this.value = this.right.minValue();
//         this.right.remove(this.value, this);
//       } else if (parent.left === this) {
//         parent.left = (this.left !== null) ? this.left : this.right;
//       } else if (parent.right === this) {
//         parent.right = (this.right != null) ? this.left : this.right;
//       }
//     }
// },
// Remove almost


}
// removeHelper: function(node) {
//     if (node.left === null )
//       return node.right;
//     if (node.right == null )
//       return node.left;
//       //otherwise we have two children
//     var value = minValue(node);
//     node.value = value;
//     node.left = recRemove ( node.left, value );
//     return node;
//   },
//
//   minValue: function(node) {
//     if (node.left === null){
//       return node.value;
//     } else {
//       return node.left.minValue();
//     }
//   },
//   remove : function(node, value) {
//     console.log(node);
//     if (value < node.value) {
//       node.left = this.remove(node.left, value);
//     } else if (value > node.value) {
//       node.right = this.remove(node.right, value);
//     } else {
//       node = this.removeHelper(node);
//     }
//     return node;
//
//     // };
//     // this.remove(val, null);
//   },
