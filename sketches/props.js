function() {
   this.label = 'props';

   this.onPress = function(p) {
      if (props) {
         I = max(0, min(nItems-1, y2i(p.y)));
	 currentName = propName[I];
	 currentValue = props[currentName];

	 let j = currentName.indexOf(R_ARROW);
	 if (j > 0) {
	    let name     = currentName.substring(0, j);
	    let subname  = currentName.substring(j+1, currentName.length);
	    currentValue = props[name][subname];
	 }

         switch (typeof currentValue) {
         case 'boolean':
            x0[currentName] = -1;
            break;
         case 'string':
	    x1[currentName] = -1;
            this.onDrag(p);
            break;
         case 'object':
            x0[currentName] = -x0[currentName];
            break;
         case 'number':
            this.onDrag(p);
            break;
         }
      }
   }
   this.onDrag = function(p) {
      if (currentName)
         switch (typeof currentValue) {
         case 'boolean':
         case 'object':
            break;
         case 'string':
            menuChoice = y2i(p.y) - I;
            break;
         case 'number':
            x0[currentName] = x1[currentName] = max(-1, min(1, p.x));
            break;
         }
   }
   this.onRelease = function(p) {
      if (currentName)
         switch (typeof currentValue) {
         case 'boolean':
            if (y2i(p.y) == I)
               x1[currentName] = ! x1[currentName];
            break;
         case 'string':
            let values = currentValue.substring(0, currentValue.indexOf(':')),
                menuSize = values.split(' ').length;
            if (menuChoice >= 0 && menuChoice < menuSize) {
	       let j = currentName.indexOf(R_ARROW);
	       if (j > 0) {
	          let name    = currentName.substring(0, j),
	              subname = currentName.substring(j+1, currentName.length);
                  props[name][subname] = currentValue = values + ':' + menuChoice;
               }
               else
                  props[currentName] = values + ':' + menuChoice;
            }
            break;
         }
      I = -1;
      currentName = '';
   }
   this.onCmdPress = function(p) {
      if (props) {
         I = max(0, min(nItems-1, y2i(p.y)));
	 currentName = propName[I];
	 currentValue = props[currentName];

	 let j = currentName.indexOf(R_ARROW);
	 if (j > 0) {
	    let name     = currentName.substring(0, j);
	    let subname  = currentName.substring(j+1, currentName.length);
	    currentValue = props[name][subname];
	 }

         this.onCmdDrag(p);
      }
   }
   this.onCmdDrag = function(p) {
      if (currentName)
         switch (typeof currentValue) {
         case 'boolean':
            break;
         case 'string':
	    x1[currentName] = 1;
            break;
         case 'number':
            let x = max(-1, min(1, p.x));
            x0[currentName] = min(x0[currentName], x);
            x1[currentName] = max(x1[currentName], x);
            break;
         }
   }
   this.onCmdRelease = function(p) {
      if (currentName)
         switch (typeof currentValue) {
	 case 'boolean':
	 case 'string':
	    x0[currentName] = time + mix(.5, 2, random());
	    break;
	 }
      I = -1;
      currentName = '';
   }
   this.render = function() {
      this.duringSketch(function() {
         let x = 1.05, y = 3*dy;
         mCurve([[-x,x  ],[ x,x  ],[ x,x-y]]);
         mCurve([[ x,x-y],[-x,x-y],[-x,x  ]]);
      });

      this.afterSketch(function() {
         if (! props) {
            let outSketch = this.outSketch(0);
            if (outSketch && outSketch.props)
               props = outSketch.props;
         }
         this.faded(0.015);
         mFillRect([-1.05,-1.05 - 2 * (nItems * dy - 1)],[1.05,1.05]);
         textHeight(this.mScale(1.3 * dy));
         if (! props) {
	    this.faded(1);
	    mText('properties', [0, i2y(0)-dy/8], .5, .5);
	 }
	 else {
	    nItems = 0;
	    propName = [];
	    for (let name in props)
	       if (props[name] !== undefined) {
	          propName[nItems++] = name;
	          if (typeof props[name] == 'object' && x0[name] == 1)
	             for (let subname in props[name])
		        propName[nItems++] = name + R_ARROW + subname;
               }
            lineWidth(.75);
            let menuStr = '';
            let ry = dy * 0.7, name = '', subname = '';
	    function getProp() {
	       if (subname)
	          return props[name][subname];
               else
	          return props[name];
	    }
	    function setProp(value) {
	       if (subname)
	          props[name][subname] = value;
	       else
	          props[name] = value;
	    }
	    for (let i = 0 ; i < nItems ; i++) {
	       let id = propName[i];
	       let j = id.indexOf(R_ARROW);
	       if (j > 0) {
	          name    = id.substring(0, j);
	          subname = id.substring(j + 1, id.length);
	       }
	       else {
	          name    = id;
		  subname = '';
	       }
               let y = i2y(i), y0 = y-ry, y1 = y+ry;

               switch (typeof getProp()) {

	       case 'boolean':
	          if (x1[id] === undefined) {
		     x0[id] = -1;
		     x1[id] = getProp();
		  }
	          setProp(x1[id]);
                  this.faded(i == I ? .04 : getProp() ? .16 : .005);
                  mFillRect([-1, y0], [1, y1]);
                  this.faded(1);
                  mText(tail(id), [dy/4-1, y], 0,.5);
                  mText(getProp(), [1-dy/4, y], 1,.5);
	          if (x0[id] > 0 && time > x0[id]) {
		     x1[id] = random() >= 0.5;
		     x0[id] = time + mix(.5, 2, random());
		  }
		  break;

	       case 'string':
	          if (x0[id] === undefined) {
                     x0[id] = x1[id] = -1;
                     let k = getProp().indexOf(':');
		     if (k < 0)
		        setProp(getProp() + ':0');
                  }
                  let str = getProp(),
		      j = str.indexOf(':'),
                      values = str.substring(0, j).split(' '),
                      value = parseInt(str.substring(j + 1, str.length));
                  this.faded(0);
                  mFillRect([-1, y0], [.5, y1]);
	          if (x1[id] > 0) {
                     this.faded(.05);
                     mFillRect([.5, y - dy], [1.05, y + dy]);
                  }
                  this.faded(1);
                  mText(tail(id), [dy/4-1, y], 0,.5);
		  if (x1[id] < 0 && i == I)
                     menuStr = getProp();
                  mText(values[value], [1-dy/4, y], 1,.5);
	          if (x1[id] > 0 && time > x0[id]) {
		     setProp(str.substring(0, j + 1) + floor(random() * values.length));
		     x0[id] = time + mix(.5, 2, random());
		  }
		  break;

	       case 'number':
	          if (x0[id] === undefined)
		     x0[id] = x1[id] = getProp() * 2 - 1;
                  let x = mix(x0[id], x1[id], .5 + noise2(time, i));
		  setProp(.5 + .5 * x);
                  this.faded(0.04); mFillRect([    -1, y0], [x0[id], y1]);
                  this.faded(0.02); mFillRect([x0[id], y0], [x1[id], y1]);
                  this.faded(0.00); mFillRect([x1[id], y0], [     1, y1]);
                  this.faded(1);
                  mLine([x, y0], [x, y1]);
                  mText(tail(id), [dy/4-1, y], 0,.5);
                  mText(roundedString(getProp(), 2), [1-dy/4, y], 1,.5);
		  break;

	       case 'object':
		  if (x0[id] === undefined)
		     x0[id] = -1;
	          if (i == I) {
                     this.faded(.05);
                     mFillRect([-1, y0], [1, y1]);
                  }
                  this.faded(1);
                  mText(name, [dy/4-1, y], 0,.5);
		  this.faded(.5);
		  mFillRect([-1.04, y - .015], [-1.01, y + .015]);
		  if (x0[id] > 0) {
		     let n = 0;
		     for (let subname in props[name])
		        n++;
		     mFillRect([-1.04, y0 - 2 * n * dy], [-1.01, y]);
		  }
		  break;
	       }
            }
            if (menuStr) {
               let y = i2y(I) + dy, y0 = y-ry, y1 = y+ry;
               let j = menuStr.indexOf(':');
               let values = menuStr.substring(0, j).split(' ');
               let nItems = values.length;
               this.faded(.015);
               mFillRect([.5, y - 2 * dy * nItems], [1.05, y]);
               this.faded(1);
               for (let n = 0 ; n < nItems ; n++) {
	          if (n == menuChoice) {
                     this.faded(.05);
                     mFillRect([.5, y - 2 * dy * (menuChoice + 1)], [1.05, y - 2 * dy * menuChoice]);
                     this.faded(1);
                  }
                  mText(values[n], [1-dy/4, i2y(I + n)], 1,.5);
               }
            }
         }
      });
   }

   function tail(id) { return id.substring(max(id.indexOf(R_ARROW), 0), id.length); }
   function i2y(i) { return (1 - 2 * i * dy - dy) * (1 + dy/4); }
   function y2i(y) { return floor((y / (1 + dy/4) + dy - 1) / (-2 * dy) + .5); }
   var props = null, propName = [], menuChoice = 0, x0 = {}, x1 = {}, dy, I = -1;
   var nItems = 1, dy = 1 / 12, currentName = '', currentValue;
}

