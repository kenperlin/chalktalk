facedemo = function() {
   this.is3D = true;
   var that = this;

   this.isLines = 0;
   this.colorId = 1;

   this.onCmdSwipe[0] = ['show lines', function() { this.isLines = ! this.isLines; }];

   this.isAlreadyOutput = 0;

   var vertices = [
// 0-5
      [14  , 99  ,  0  ], // ?
      [27  , 85  ,  0  ], // side of head near top
      [30  , 70  ,  0  ], // ?
      [15  , 30  ,-12  ], // bottom of hair in back
      [19.5, 31.5, 16  ], // bottom of hair in front
      [ 6.1, 16.8, 43.5], // bottom of chin
// 6-10
      [ 5  , 70  , 44  ], // inner brow, top
      [12  , 72  , 42  ], // middle brow, top
      [22  , 68  , 35  ], // outer brow
      [12  , 70  , 42  ], // middle brow, bottom
      [ 5  , 68  , 44.5], // inner brow, bottom
// 11-14
      [ 6  , 60  , 43.7], // inner eye
      [12  , 62  , 44  ], // middle eye, top
      [19  , 60  , 38  ], // outer eye
      [12  , 58  , 43  ], // middle eye, bottom
// 15-17
      [ 2  , 45  , 52  ], // tip of nose, bottom
      [ 5  , 44  , 47  ], // side of nose
      [ 1  , 42.5, 49  ], // bottom of nose
// 18-23
      [ 4  , 38  , 50  ], // top of lip
      [ 8  , 30.2, 46  ], // outside left/right corner of lips
      [ 3  , 23.5, 47  ], // bottom of lower lip   16-20 nose/lips
      [ 2.1, 35  , 46  ], // bottom of upper lip
      [ 5  , 31  , 46  ], // mouth line
      [ 2.7, 29  , 45  ], // top of lower lip
// 24-30
      [12  , 60  , 40  ], // pupils
      [13  , 50  , 40  ], // teeth
      [13  , 34  , 40  ], // teeth
      [ 0  , 34  , 40  ], // teeth
      [ 0  , 50  , 40  ], // teeth
      [ 4  , 47  , 48  ], // side of nostril, top
      [26.5, 55  , 14  ], // side of face near ear
// 31-35
      [20  , 50  , 30  ], // whites of eyes
      [12  , 95  , 27  ], // front of top of head
      [22  , 80  , 24  ], // side of temple
      [12  , 99  , 13  ], // back of top of head
      [20  , 70  , 30  ], // whites of eyes
// 36-40
      [ 2  , 48.5, 52.5], // top of tip of nose
      [ 5  , 19.7, 46.5], // upper point of chin
      [ 3  , 23  , 45.5], // point on face just below lips
      [17  , 40  , 41  ], // point on face to side of upper lip
      [22  , 51  , 38  ], // cheekbone

// 41-45
      [10.6, 26  , 38  ], // point on face to side of lower lip
      [10  , 84  , 34  ], // top of face
      [ 6  , 22  , 20  ], // back of bottom of face
      [22  , 35  , 15  ], // UNUSED
      [12  , 97  , -5  ], // back of top of head
// 46-50
      [15  , 91  ,-17  ], // behind back of top of head
      [18  , 80  ,-26  ], // top of back of head
      [16  , 60  ,-29  ], // bottom of back of head
      [10  , 40  ,-23  ], // below bottom of back of head
      [30  , 52  , -4  ], // back of head to the side
// 51-52
      [16  , 86  , 39  ], // front of hair
      [20  , 40  ,-23  ], // UNUSED
// 53-58
      [28.5, 50.7, 13  ], // ear
      [26.4, 49.3, 14  ],
      [23.3, 51.3, 16  ],
      [24.3, 59  , 18  ],
      [27.6, 61  , 14  ],
      [30  , 59  , 12  ],
   ];

   // GENDER, WEIGHT

   var morphData = [
   ];

   let propNames = 'rotx,roty,rotz,ah,blink,brows,gazex,gazey,lids,ooh,smile,sneer'.split(',');

   this.props = {
      alive : true,
      rotx  : [ 0,-1,1],
      roty  : [ 0,-1,1],
      rotz  : [ 0,-1,1],
      ah    : [-1,-1,1],
      blink : [ 0,-1,1],
      brows : [ 0,-1,1],
      gazex : [ 0,-1,1],
      gazey : [ 0,-1,1],
      lids  : [ 0,-1,1],
      ooh   : [ 0,-1,1],
      smile : [ 0,-1,1],
      sneer : [ 0,-1,1],
   };

   var flexData = [
/*AH   */ [19,20,21,22,23,4,5,28,16,37,38,39,41],
             [[0,-3,-.6],[0,-6,-1.2],[0,.3],[-.5,-2.8,-.6],[-.6,-5.9,-1.2],[-.5,-1.5,-.3],
              [0,-4,-.8],[0,-4.8,-1],[.2,-.3],[0,-5,-.8],[0,-5,-1],[0,-1,-.2],[0,-3,-1]],
/*BLINK*/ [12,14], [[0,-2],[0,2]],
/*BROWS*/ [6,7,8,9,10,13,1,2,42], [[-1,4],[0,1],[0,-2.3],[0,1],[0,4],[0,-1],[.4,.2],[0,-1],[-.5,1]],
/*GAZEX*/ [24,25,26], [[2.8],[3],[3]],
/*GAZEY*/ [24,25,26], [[0,2],[0,2],[0,2]],
/*LIDS */ [12,14,60], [[0,2],[0,2],[0,3]],
/*OOH  */ [18,19,20,21,22,23,3,4,18,39,41],
             [[.5,.2],[4,-.5,2],[.5],[1.6],[4.7,.2,1],[1.6],[.2],[.25,.4],[.4],[3],[2]],
/*SMILE*/ [19,21,22,23,4,39,41], [[0,4.2],[-.8,1],[-.8,2.6],[-.8,1],[0,1],[0,3],[0,2]],
/*SNEER*/ [18,21,16,17,29,39], [[1.5,2],[1.5,2],[-.2,1],[-.3],[0,.8],[0,.4]],
   ];

   function setColor(r,g,b) {
      color(floor(255 * r), floor(255 * g), floor(255 * b));
   }

   function mFillOval(p, r) {
      var c = [];
      for (var i = 0 ; i < 24 ; i++) {
         var theta = i * TAU / 24;
         c.push([p[0] + r * cos(theta), p[1] + r * sin(theta), p[2]]);
      }
      mFillCurve(c);
   }

   this.disk = function(n, r) {
      mFillOval(this.getVertex(n, 1), r);
      mFillOval(this.getVertex(n,-1), r);
   }

   this.getVertex = function(n, sign) {
      var p = vertices[n], x = p[0], y = p[1], z = p[2], i, index, value, j, f;
      for (i = 0 ; i < flexData.length/2 ; i++) {
         f = this.flexValues[3 + i];
         index = flexData[2 * i    ];
         value = flexData[2 * i + 1];
          for (j = 0 ; j < index.length ; j++)
            if (n == index[j]) {
               x += f * value[j][0] * (i==3 ? sign : 1);
               y += f * def(value[j][1]);
               z += f * def(value[j][2]);
            }
      }
      return [sign * x, y, z];
   }

   this.flexValues = newArray(3 + flexData.length / 2);

   this.blinkTime = 0;

   this.addAmbient = function(n, v) {
      let t = 2.5 * jtrAmpl[n] * noise(n + .5, .5, jtrFreq[n] * time * 3);
      switch (n) {
      case 6: // GAZEX
      case 7: // GAZEY
         t = .4 * sgain(t, .9);
      }
      if (n == 4 && time > this.blinkTime) {
         t = mix(2, 0, .5 + .5 * v);
         if (time > this.blinkTime + .1)
            this.blinkTime = time + .25 + 3 * random();
      }
      return t;
   }

   this.allPolys = [];

   this.doDraw = function(polys, noFill) {
      var n, p, c, sign, nv = vertices.length;
      var drawOrFill = function() {
         if (! noFill)
            mFillCurve(c);
         mClosedCurve(c);
         that.allPolys.push(c);
      }
      for (n = 0 ; n < polys.length ; n++) {
         p = polys[n];
         if (p.length == 2) {
            c = [ this.getVertex(p[0], 1) ,
                  this.getVertex(p[1], 1) ,
                  this.getVertex(p[1],-1) ,
                  this.getVertex(p[0],-1) ];
            drawOrFill();
         }
         else {
            for (sign = -1 ; sign <= 1 ; sign += 2) {
               c = [];
               for (i = 0 ; i < p.length ; i++)
                  c.push(this.getVertex(p[i], sign));
               drawOrFill();
            }
         }
      }
   }

   // X,Y,Z, AH,BLINK,BROWS, GAZEX,GAZEY, LIDS,OOH,SMILE,SNEER

   var jtrAmpl = [.08,.04,0, 0,0,.1, .07,.07, .15,0,0,0];
   var jtrFreq = [.25,.25,0, 0,0,.5, .50,.50, .50,0,0,0];

   this.draw = () => mLines([[-1,1],[1,1],[0,-1],[-1,1]]);

   this.update = function() {
      var i;

      for (let n = 0 ; n < propNames.length ; n++) {
         this.flexValues[n] = this.prop(propNames[n]);
         if (this.prop('alive'))
            this.flexValues[n] += this.addAmbient(n, this.flexValues[n]);
      }

      var rgb = palette.rgb[this.colorId];
      var red = rgb[0] / 255, grn = rgb[1] / 255, blu = rgb[2] / 255;
      var gray = (red + grn + blu) / 3;
      red = mix(red, gray, .5);
      grn = mix(grn, gray, .5);
      blu = mix(blu, gray, .5);

      this.allPolys = [];

      lineWidth(this.mScale(.01));
      m.translate(0,-1,0);
      m.scale(.02);

      m.rotateX(-.2 * this.flexValues[0]);
      m.rotateY(-.2 * this.flexValues[1]);
      m.rotateZ(-.2 * this.flexValues[2]);

      setColor(.02 * red, .02 * grn, .02 * blu);
      this.doDraw([[3,49],[49,48],[48,47],[47,46],[46,45],[1,45,46],[1,46,47],[50,47,48],[48,49,3],
                 [30,3,4],[34,32],[34,1,33,32],[1,30,33],[45,34],[34,45,1],[50,1,47],[50,48,3],
                 [50,3,30],[50,30,1],[32,51],[51,42],[32,33,51],[51,33,42],[15,16,17],[39,40,41]]);

      setColor(1,1,1);
      this.doDraw([[35,31],[25,26,27,28]]);

      setColor(.5 * red, .5 * grn, .5 * blu);
      this.disk(24,2.4);

      setColor(0,0,0);
      this.doDraw([[6,7,9,10],[7,8,9],[15,16,17],[26,23]]);
      this.disk(24,1.2);

      setColor(.82 * red, .82 * grn, .82 * blu);
      this.doDraw([[13,12,9,8],[12,11,10,9],[5,43],[5,4,43]]);

      setColor(.93 * red, .93 * grn, .93 * blu);
      this.doDraw([[11,29,36],[53,54,55,56,57,58],[7,33],[16,29,11],[39,40,41],[4,41,40],[4,5,41],
                 [5,37,41],[41,19,39,41],[6,10],[10,11],[11,36],[36,15],[17,18],[20,38],[38,37],
                 [37,5],[17,16,18],[29,15,36],[42,6],[42,7,6],[42,33,8,7],[30,4,40],[30,40,8],
                 [13,8,40],[8,33,30],[11,14,16],[40,16,14],[13,40,14],[40,39,16],[16,39,18],
                 [18,39,19],[37,38,41],[38,20,41],[41,20,19]]);

      setColor(.66 * red, .66 * grn, .66 * blu);
      this.doDraw([[15,17],[18,21],[23,20],[18,19,22,21],[23,22,19,20],[15,29,16]]);
      this.doDraw([[11,12,13,14],[17,15]], true);

      if (this.isLines) {
         color('blue');
         for (i = 0 ; i < this.allPolys.length ; i++)
            mCurve(this.allPolys[i]);
      }
   }
}

