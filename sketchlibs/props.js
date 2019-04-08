function Props(_sketch) {
/*
   Implement history:
      Record value before every change into an array.
      Prepare to step back through that array.
*/

/*
   The format for a Mix object (also stored as a JSON file on the server):

   FILE   : { [ mixName    : VALUE  ]* }
   VALUE  : { [ choiceName : CHOICE ]* }
   CHOICE : { [ pathName   : weight ]* }

   Example:

   {
      mixName1 : {
         choice1: { path1 : weight1, path2 : weight2, ... },
         choice2: { ... },
	 ...
      },
      mixName2 : { ... },
      ...
   }
*/

   this.props = () => props;

   let sketch = _sketch;
   let outSketch;

   //------------------ HANDLE USER CLICKING AND DRAGGING -------------------

   this.onPress = function(p) {
      if (props) {
         I = max(0, min(nItems-1, y2i(p.y)));
         currentName = propName[I];

         let prps = props;
         let name = currentName;
         for (let j ; (j = name.indexOf('.')) > 0 ; ) {
            prps = prps[name.substring(0, j)];
            name = name.substring(j+1, name.length);
         }
         currentValue = prps[name];

         switch (typeOf(currentValue)) {
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
         case 'array':
            this.onDrag(p);
            break;
         }
      }
   }

   this.onDrag = function(p) {
      if (currentName)
         switch (typeOf(currentValue)) {
         case 'boolean':
         case 'object':
            break;
         case 'string':
            menuChoice = y2i(p.y) - I;
            break;
         case 'array':
            slidingOrMixing(p);
	    if (isMix(currentName))
	       normalizeMixWeights(currentName);
            break;
         }
   }

   this.onRelease = function(p) {
      if (currentName)
         switch (typeOf(currentValue)) {
         case 'array':
            if (slidingOrMixing(p) == 'mixing')
               saveMixData();
            break;
         case 'boolean':
            if (y2i(p.y) == I)
               setProp(x1[currentName] = ! x1[currentName]);
            break;
         case 'string':
            let i, values = head(currentValue, ':'),
                menuNames = values.split(','),
                menuSize = menuNames.length;
            if (menuChoice >= 0 && menuChoice < menuSize)
               setProp(values + ':' + menuChoice);

            if (isMix(currentName) && tail(currentName) == 'select') {
               let path = head(currentName);
               for (let n = 0 ; n < menuSize ; n++) {
                  currentName = path + '.' + menuNames[n];
                  setProp(n == menuChoice);
               }
            }

            // WHEN SELECTING OTHER THAN 'none' FOR A MIX, SET ALL OTHER MIX WEIGHTS TO 0.

            if (isMix(currentName)) {
               let mKey   = head(currentName), key,
                   mData  = mixData[mixName(mKey)],
                   choice = menuNames[menuChoice];
               if (choice != 'none')
                  for (let name in mixData)
                     if ((key = 'MIX ' + name) != mKey) {
                        let choiceString = head(props[key].select, ':'),
                            choices = choiceString.split(',');
                        props[key].select = choiceString + ':0';
                        for (let i = 0 ; i < choices.length ; i++)
                           props[key][choices[i]][0] = i == 0;
                     }
               mixStateData = mData[choice] = def(mData[choice], {});
            }

            break;
         }
      I = -1;
      currentName = '';
   }

   //------------------ HANDLE USER CMD-CLICKING AND CMD-SWIPING -------------------

   let cmdI;
   this.onCmdPress = p => cmdI = max(0, min(nItems-1, y2i(p.y)));
   this.onCmdSwipe = [];

   // CMD SWIPE RIGHT TO DELETE A MIX.

   this.onCmdSwipe[0] = [ 'delete mix', p => { if (isMix(propName[cmdI])) deleteMix(propName[cmdI]); } ];

   // CMD SWIPE DOWNWARD TO REMOVE A SLIDER FROM THE ACTIVE MIX STATE.

   this.onCmdSwipe[6] = [ 'remove from mix', p => { delete mixStateData[propName[cmdI]]; saveMixData(); } ];

   // CMD CLICK TO CREATE A TIME-VARYING VALUE:
   // -- TO RIGHT OF CURRENT VALUE CREATES NOISE FUNCTION.
   // -- TO LEFT OF CURRENT VALUE CREATES SINE FUNCTION.

   this.onCmdClick = p => {
      if (props) {
         let prps = props, j,
             name = propName[max(0, min(nItems-1, y2i(p.y)))];
         currentName = name;
         while ((j = name.indexOf('.')) > 0) {
            prps = prps[name.substring(0, j)];
            name = name.substring(j+1, name.length);
         }
         switch (typeOf(prps[name])) {
         case 'array':
            x1[currentName] = max(-1, min(1, p.x));
            break;
         case 'string':
            x1[currentName] = 1;
         case 'boolean':
            x0[currentName] = time + mix(.5, 2, random());
            break;
         }
      }
   }

   // CREATE A NEW MIX

   this.newMix = s => {
      if (typeof s == 'string') {
         let i = s.indexOf(':');
         if (i > 0)
            props['MIX ' + s.substring(0, i)] = s.substring(i + 1, s.length);
      }
   }

   //------------------ VARIOUS UTILITY FUNCTIONS ----------------------------------

   // SET VALUE FOR PROPERTY PATH currentName.

   let setProp = value => {
      let outputPropValue = (name, value) => {
	 if (outSketch && outSketch.onSetProp) {
	    if (typeOf(value) == 'string') {
	       i = value.indexOf(':');
	       value = parseInt(value.substring(i + 1, value.length));
	    }
	    outSketch.onSetProp(name, value);
	 }
      }
      let prps = props;
      let name = currentName;
      for (let j ; (j = name.indexOf('.')) > 0 ; ) {
         prps = prps[name.substring(0, j)];
         name = name.substring(j+1, name.length);
      }
      if (typeOf(prps[name]) == 'array') {
         prps[name][0] = value;
	 outputPropValue(name, value);
      }
      else {
         prps[name] = value;
	 outputPropValue(name, value);
      }

      if (currentName == 'close all') {
         props['close all'] = false;

         let closeAll = (props, path, name) => {
            if (typeOf(props[name]) == 'object') {
               x0[path] = -1;
	       props = props[name];
               for (let name in props)
                  closeAll(props, path + '.' + name, name);
            }
         }
         for (let name in props)
            closeAll(props, name, name);
      }
   };

   // MAKE SURE ALL MIX WEIGHTS SUM TO 1.
/*
   let normalizeMixWeights = id => {
      let path = head(id),
          choice = tail(id),
          prop = props[path],
          total = 1 - prop[choice][0],
          choices = head(prop.select, ':').split(',');

      let W = [];
      for (let i = 0 ; i < choices.length ; i++)
         W.push(prop[choices[i]][0]);
      normalizeWeights(W, choice != 'none');
      for (let i = 0 ; i < choices.length ; i++)
         prop[choices[i]][0] = W[i];
   }

   let normalizeWeights = (W, changeOnlyFirst) => {
      let sum = 0;
      for (let i = 1 ; i < W.length ; i++)
         sum += W[i];
      if (changeOnlyFirst) {
         W[0] = 1 - sum;
	 return;
      }
      let total = 1 - W[0];
      for (let i = 1 ; i < W.length ; i++)
         if (sum == 0)
            W[i] = total / (W.length - 1);
         else
            W[i] *= total / sum;
   }
*/
   let normalizeMixWeights = id => {
      let path = head(id),
          choice = tail(id),
          prop = props[path],
          total = 1 - prop[choice][0],
          choices = head(prop.select, ':').split(','),
          sum = 0;
      for (let i = 1 ; i < choices.length ; i++)
         sum += prop[choices[i]][0];
      if (choice != 'none') {
         prop.none[0] = 1 - sum;
         return;
      }
      for (let i = 1 ; i < choices.length ; i++)
         if (sum == 0)
            prop[choices[i]][0] = total / (choices.length - 1);
         else
            prop[choices[i]][0] *= total / sum;
   }

   // CONVERT -1 <= x <= 1 INTO A SLIDER VALUE

   let modifyIfDiscrete = (v, p) => p.length < 4 ? v : v + p[3]/2 - (v + p[3]/2 - p[1]) % p[3];

   let evalSlider = (p, x) => modifyIfDiscrete(mix(p[1], p[2], .5 + .5 * x), p);

   // SET A SLIDER VALUE OR A MIX VALUE SLIDER

   let slidingOrMixing = p => {
      let x = max(-1, min(1, p.x)),
          value = evalSlider(currentValue, x),
          key = head(currentName);
      for (let mName in mixData) {
         let mKey = 'MIX ' + mName;
         if (props[mKey] && key != mKey) {
            let index = tail(props[mKey].select, ':');
            if (index > 0) {
               let choices = head(props[mKey].select, ':'),
                   choice = choices.split(',')[index];
               mixData[mName][choice] = def(mixData[mName][choice], {});
               mixData[mName][choice][currentName] = parseFloat(roundedString(value));
               return 'mixing';
            }
         }
      }
      x0[currentName] = x1[currentName] = x;
      setProp(value);
      return 'sliding';
   }

   // FILTER SLIDER VALUE THROUGH ANY PREDEFINED MIX VALUES

   let MIX_filter = (key, v, level) => {
      if ((level = def(level, 0) + 1) < 10)
         for (let mName in mixData) {
            let mKey = 'MIX ' + mName;
	    if (props[mKey]) {
	       let mData  = mixData[mName],
                   weight = props[mKey].none[0],
                   value  = v * weight;
               for (let choice in mData)
                  if (mData[choice][key] !== undefined) {
                     let w = MIX_filter(mKey + '.' + choice, props[mKey][choice][0], level);
                     value  += w * mData[choice][key];
                     weight += w;
                  }
               if (weight > 0)
                  v = value / weight;
            }
         }
      return v;
   }

   // DELETE A MIX PROPERTY

   let deleteMix = mKey => {
      delete mixData[mixName(mKey)];
      delete props[mKey];
      saveMixData();
   }

   // SAVE ALL MIX DATA TO THE SERVER

   let saveMixData = () => server.set('state/props_' + title, mixData);

   //------------------ RENDER EVERY FRAME OF THE ANIMATION ------------------------

   this.render = function(_outSketch) {
      outSketch = _outSketch;

      // IF OUT_SKETCH HAS BEEN RELOADED, ANY CONFLICTING VALUES
      // ARE COPIED TO IT FROM THE EXISTING PROPS SETTINGS.

      if (outSketch) {

         let isArray = value => typeOf(value) == 'array';
         let p = outSketch.props;

         // FIRST EXPAND ANY MACROS IN OUT_SKETCH.

         let setTitle = _title => {
            title = _title;
            server.get('state/props_' + title, data => {
	       mixData = data;
	       for (let name in mixData) {
	          let choices = [];
	          for (let choice in mixData[name])
	             choices.push(choice);
	          addMixProps('MIX ' + name, choices);
               }
	    });
	 }

	 let addMixProps = (key, choices) => {
            p[key] = { select: 'none,' + choices.join(',') };
	    p[key].none = 1;
            for (let i = 0 ; i < choices.length ; i++)
               p[key][choices[i]] = [0, 0, 1];
         }

	 let addMixData = (key, choices) => {
            let data = mixData[mixName(key)];
            for (let i = 0 ; i < choices.length ; i++) {
	       let choice = choices[i];
	       if (data[choice] === undefined)
	          data[choice] = {};
            }
         }

         let expandMacros = p => {
            for (let key in p)
               if (typeOf(p[key]) == 'object')
                  expandMacros(p[key]);
               else if (key == 'title') {
	          setTitle(p.title);
                  delete p.title;
               }
               else if (typeOf(p[key]) == 'string' && isMix(key)) {
                  let name = mixName(key);
                  mixData[name] = def(mixData[name], {});
		  let choices = p[key].split(',');
		  addMixProps(key, choices);
		  addMixData(key, choices);
		  saveMixData();
               }
         }
         expandMacros(p);
	 if (title === 'untitled') {
	    let type = outSketch.typeName;
	    setTitle(type.substring(0, type.indexOf('_')));
         }

         if (p && props && p != props)
            for (let key in p)
               if (props[key]) {
                  let setValues = (src, dst, key) => {
                     if (typeOf(src) == 'object')
                        for (let k in dst[key])
                           setValues(src[k], dst[key], k);
                     else if (src)
                        if (isArray(dst[key]) && isArray(src))
                           dst[key][0] = src[0];
                        else if (typeof dst[key] != 'function')
                           dst[key] = src;
                  }
                  setValues(props[key], p, key);
               }
         props = p;
      }
 
      if (outSketch && outSketch.props)
         props = outSketch.props;

      sketch.faded(0.015);
      mFillRect([-1.05,-1.05 - 2 * (nItems * dy - 1)],[1.05,1.05]);
      textHeight(sketch.mScale(1.3 * dy));
      if (! props) {
         sketch.faded(1);
         mText('properties', [0, i2y(0)-dy/8], .5, .5);
      }
      else {

         let evalProps = (props, prefix) => {
            for (let name in props)
               if (props[name] !== undefined && typeof props[name] != 'function')
		  switch (typeOf(props[name])) {
		  case 'object':
                     evalProps(props[name], prefix + name + '.');
		     break;
                  case 'array':
		     let v = props[name],
		         val = modifyIfDiscrete(MIX_filter(prefix + name, v[0]), v);
		     props['__' + name] = () => val;
		     break;
	          }
	 }
	 evalProps(props, '');

         nItems = 0;
         propName = [];
         let addPropNames = (props, prefix) => {
            for (let name in props) {
               if (props[name] !== undefined && typeof props[name] != 'function') {
                  let id = prefix + name;
                  propName[nItems++] = id;
                  if (typeOf(props[name]) == 'object' && x0[id] == 1)
                     addPropNames(props[name], id + '.');
               }
            }
         }
         addPropNames(props, '');

         let updatePropValue = (i, id, prps, name) => {

            let value = prps[name];

            switch (typeOf(value)) {
            case 'boolean':
               if (x1[id] === undefined)
                  x0[id] = -1;
               x1[id] = value;
               if (x0[id] > 0 && time > x0[id]) {
                  x1[id] = random() >= 0.5;
                  x0[id] = time + mix(.5, 2, random());
                  value = x1[id];
               }
               break;
            case 'string':
               if (x0[id] === undefined) {
                  x0[id] = x1[id] = -1;
                  let k = value.indexOf(':');
                  if (k < 0)
                     value += ':0';
               }
               if (x1[id] > 0 && time > x0[id]) {
                  let j = value.indexOf(':'),
                      values = value.substring(0, j).split(',');
                  value = value.substring(0, j + 1) + floor(random() * values.length);
                  x0[id] = time + mix(.5, 2, random());
               }
               break;
            case 'number':
               value = [value, 0, 1];
            case 'array':
               let t = (value[0] - value[1]) / (value[2] - value[1]);
               if (x0[id] === undefined)
                  x0[id] = x1[id] = t * 2 - 1;
               else {
                  let x = t * 2 - 1;
                  if (x < min(x0[id], x1[id]) - .001 || x > max(x0[id], x1[id]) + .001)
                     x0[id] = x1[id] = x;
               }
               let vary = .5 + (x1[id] < x0[id] ? sin(PI * time + i) / 2 : noise2(time, i));
               value[0] = evalSlider(value, mix(x0[id], x1[id], vary));
               break;
            }

            prps[name] = value;
         }

         let i = 0;
         let updatePropValues = (props, prefix) => {
            for (let name in props)
               if (typeOf(props[name]) == 'object')
                  updatePropValues(props[name], prefix + name + '.');
               else if (props[name] !== undefined && typeof props[name] != 'function')
                  updatePropValue(i++, prefix + name, props, name);
         }
         updatePropValues(props, '');

         lineWidth(.75);
         let menuStr = '';
         let ry = dy * 0.7;
         for (let i = 0 ; i < nItems ; i++) {
            let id = propName[i];

            let prps = props;
            let name = propName[i];
            for (let j ; (j = name.indexOf('.')) > 0 ; ) {
               prps = prps[name.substring(0, j)];
               name = name.substring(j+1, name.length);
            }
            let propValue = prps[name];

            let y = i2y(i), y0 = y-ry, y1 = y+ry;

            switch (typeOf(propValue)) {

            case 'boolean':
               sketch.faded(i == I ? .04 : propValue ? .16 : .005);
               mFillRect([-1, y0], [1, y1]);
               sketch.faded(1);
               mText(pathStr(id), [dy/4-1, y], 0,.5);
               mText(propValue, [1-dy/4, y], 1,.5);
               break;

            case 'string':
               sketch.faded(0);
               mFillRect([-1, y0], [.3, y1]);
               if (x1[id] > 0) {
                  sketch.faded(.05);
                  mFillRect([.3, y - dy], [1.05, y + dy]);
               }
               sketch.faded(1);
               mText(pathStr(id), [dy/4-1, y], 0,.5);
               if (x1[id] < 0 && i == I)
                  menuStr = propValue;
               let V = propValue.split(':');
	       let text = V[0].split(',')[parseInt(V[1])];
               mText(text, [1-dy/4, y], 1,.5);
               break;

            case 'array':
               let v2x = v => max(-1, min(1, v * 2 - 1)),
                   xLo = max(-1, min(1, min(x0[id], x1[id]))),
                   xHi = max(-1, min(1, max(x0[id], x1[id]))),
                   v = propValue,
		   evalFunc = prps['__' + name],
                   val = evalFunc ? evalFunc() : v[0];

               if (evalFunc)
	          val = evalFunc();
               else
		  val = modifyIfDiscrete(val, v);

	       let x = v2x((val - v[1]) / (v[2] - v[1]));
               if (evalFunc && val != v[0])
	          xLo = xHi = x;

               let drawFill = (f,lo,hi) => { sketch.faded(f); mFillRect([lo, y0], [hi, y1]); }
	       drawFill(.04, -1, xLo);
	       drawFill(.02,xLo, xHi);
	       drawFill(.00,xHi,   1);

               sketch.faded(.2);
	       let drawTick = x => mLine([x, y0], [x, y1]);
	       drawTick(x);
	       if (v.length == 4)
	          for (let val = v[1] + v[3] ; val < v[2] ; val += v[3])
                     drawTick(v2x((val - v[1]) / (v[2] - v[1])));
               sketch.faded(1);

               if (mixStateData[id] !== undefined)
                  color('cyan');

               mText(pathStr(id), [dy/4-1, y], 0,.5);
               let isInt = Number.isInteger(v[1]) &&
                           Number.isInteger(v[2]) &&
                           Number.isInteger(v[3]) ;
               mText(roundedString(val, isInt ? 0 : 2), [1-dy/4, y], 1,.5);
               break;

            case 'object':
               if (x0[id] === undefined)
                  x0[id] = -1;
               if (i == I) {
                  sketch.faded(.05);
                  mFillRect([-1, y0], [1, y1]);
               }

               let colorId = sketch.colorId;
	       for (let mixId in mixStateData)
	          if (mixId.indexOf(id) == 0)
		     colorId = getIndex(CT.colorsArray, 'cyan');

               color(fadedColor(.5, colorId));
               let _y = x0[id] > 0 ? 0.055 : 0.015;
               mFillRect([-1.04, y - _y], [-1.01, y + _y]);

               color(fadedColor(1, colorId));
               mText(pathStr(id), [dy/4-1, y], 0,.5);
               break;
            }
         }
         if (menuStr) {
            let y = i2y(I) + dy, y0 = y-ry, y1 = y+ry;
            let j = menuStr.indexOf(':');
            let values = menuStr.substring(0, j).split(',');
            let menuSize = values.length;
            sketch.faded(.025);
            mFillRect([.3, y - 2 * dy * menuSize], [1.05, y]);
            sketch.faded(1);
            for (let n = 0 ; n < menuSize ; n++) {
               if (n == menuChoice) {
                  sketch.faded(.05);
                  mFillRect([.3, y - 2 * dy * (menuChoice + 1)], [1.05, y - 2 * dy * menuChoice]);
                  sketch.faded(1);
               }
               mText(values[n], [1-dy/4, i2y(I + n)], 1,.5);
            }
         }
      }
   }

   // UTILITY FUNCTION TO HELP RENDER THE VERTICAL BARS THAT SHOW PATH TREE STRUCTURE.

   let pathSpacer0 = LONG_VBAR + LONG_HBAR;
   let pathSpacer = LONG_VBAR + ' ';

   let pathStr = str => {
      let count = 0, j;
      for ( ; (j = str.indexOf('.')) >= 0 ; count++)
         str = str.substring(j+1, str.length);
      for (j = 0 ; j < count ; j++)
         str = (j==0 ? pathSpacer0 : pathSpacer) + str;
      return str;
   }

   // VARIOUS INTERNAL VARIABLES

   let I            = -1;
   let currentName  = '';
   let currentValue;
   let dy           = 1 / 12;
   let head         = (id,sep) => id.substring(0, max(id.lastIndexOf(def(sep,'.')), 0));
   let i2y          = i => (1 - 2 * i * dy - dy) * (1 + dy/4);
   let isMix        = key => key.substring(0, 4) == 'MIX ';
   let menuChoice   = 0;
   let mixData      = {};
   let mixName      = key => key.substring(4, key.length);
   let mixStateData = {};
   let nItems       = 1;
   let propName     = [];
   let props        = null;
   let tail         = (id,sep) => id.substring(id.lastIndexOf(def(sep,'.')) + 1, id.length);
   let title        = 'untitled';
   let typeOf       = arg => Array.isArray(arg) ? 'array' : typeof arg;
   let x0           = {};
   let x1           = {};
   let y2i          = y => floor((y / (1 + dy/4) + dy - 1) / (-2 * dy) + .5);
}

