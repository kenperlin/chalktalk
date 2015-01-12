define(function () {

   function VisibleGraph() {

      // console.log(CT.CT.Utils);

      this.p = CT.Utils.newVec(0,0,0);
      this.q = CT.Utils.newVec(0,0,0);
      this.pix = CT.Utils.newVec(0,0,0);
      this.travel = 0;
      this.pixelSize = 1;

      this.setResponder = function(R) {
         this.R = R;
         R.graph = this;
         R.setup();
      };

      this.findNodeAtPixel = function(pix) {
         var zNearest = -Number.MAX_VALUE;
         var jNearest = -1;
         for (var j = 0 ; j < this.nodes.length ; j++) {
            var node = this.nodes[j];
            var d = 10;
            if (node.r !== undefined)
               d *= node.r * 10;
            var dx = pix.x - node.pix.x;
            var dy = pix.y - node.pix.y;
            if (Math.sqrt(dx * dx + dy * dy) < d * this.pixelSize && node.pix.z > zNearest) {
               jNearest = j;
               zNearest = node.pix.z;
            }
         }
         return jNearest;
      };

      this.mouseMove = function(x,y) {
      };

      this.mouseDown = function(x,y) {
         var R = this.R;
         this.pix.set(x,y,0);
         this.p.copy(this.pix).applyMatrix4(pixelToPointMatrix);
         this.travel = 0;
         switch (R.clickType) {
         case 'B':
            R.J = this.findNodeAtPixel(this.pix);
            R.actionType = R.J != -1 ? 'J' : 'B';
            switch (R.actionType) {
            case 'J':
               R.onClickBPressJ();
               break;
            case 'B':
               R.onClickBPressB();
               break;
            }
            break;
         case 'J':
            R.J = this.findNodeAtPixel(this.pix);
            R.actionType = R.J == R.I_ ? 'I' : R.J != -1 ? 'J' : 'B';
            switch (R.actionType) {
            case 'I':
               R.onClickPress();
               break;
            case 'J':
               R.onClickPressJ();
               break;
            case 'B':
               R.onClickPressB();
               break;
            }
            break;
         default:
            R.I = this.findNodeAtPixel(this.pix);
            R.actionType = R.I != -1 ? 'I' : 'B';
            switch (R.actionType) {
            case 'I':
               R.onPress();
               break;
            case 'B':
               R.onPressB();
               break;
            }
            break;
         }
      };

      this.mouseDrag = function(x,y) {
         console.log(x,y);
         var R = this.R;
         this.q.copy(this.p);
         this.pix.set(x,y,0);
         this.p.copy(this.pix).applyMatrix4(pixelToPointMatrix);
         this.travel += this.p.distanceTo(this.q);
         switch (R.clickType) {
         case 'B':
            switch (R.actionType) {
            case 'J': R.onClickBDragJ(); break;
            case 'B': R.onClickBDragB(); break;
            }
            break;
         case 'J':
            switch (R.actionType) {
            case 'I': R.onClickDrag(); break;
            case 'J': R.onClickDragJ(); break;
            case 'B': R.onClickDragB(); break;
            }
            break;
         default:
            switch (R.actionType) {
            case 'I': R.onDrag(); break;
            case 'B': R.onDragB(); break;
            }
            break;
         }
      };

      this.mouseUp = function(x,y) {
         var R = this.R;
         this.pix.set(x,y,0);
         R.K = this.findNodeAtPixel(this.pix);
         switch (R.clickType) {
         case 'B':
            R.clickType = 'none';
            if (this.travel >= .1) {
               switch (R.actionType) {
               case 'J': R.onClickBReleaseJ(); break;
               case 'B': R.onClickBReleaseB(); break;
               }
            }
            else {
               switch (R.actionType) {
               case 'J': R.onClickBClickJ(); break;
               case 'B': R.onClickBClickB(); break;
               }
            }
            break;
         case 'J':
            R.clickType = 'none';
            if (this.travel >= .1)
               switch (R.actionType) {
               case 'I': R.onClickRelease(); break;
               case 'J': R.onClickReleaseJ(); break;
               case 'B': R.onClickReleaseB(); break;
               }
            else
               switch (R.actionType) {
               case 'I': R.onClickClick(); break;
               case 'J': R.onClickClickJ(); break;
               case 'B': R.onClickClickB(); break;
               }
            R.J = -1;
            R.I_ = -1;
            break;
         default:
            if (this.travel >= .1) {
               switch (R.actionType) {
               case 'I': R.onRelease(); break;
               case 'B': R.onReleaseB(); break;
               }
            }
            else {
               R.clickPoint.copy(this.p);
               switch (R.actionType) {
               case 'I':
                  R.I_ = R.I;
                  R.clickType = 'J';
                  R.onClick();
                  break;
               case 'B':
                  R.clickType = 'B';
                  R.onClickB();
                  break;
               }
            }
            R.I = -1;
            R.J = -1;
            break;
         }
         R.J = -1;
         R.K = -1;
      };
   }

   return VisibleGraph;
});
