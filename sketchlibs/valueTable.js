function ValueTable() {
   var title = '', clickTitleCallback = null;
   var labels = [], values = [], I = -2,
       nDrags, tableSize = 8, nr = 9, isNormalizing = false;

   this.setTitle = function(_title, callback) {
      title = _title;
      clickTitleCallback = callback;
   }

   this.setLabels = function(_labels) {
      labels = _labels;
      tableSize = max(8, labels.length);
      nr = min(9, tableSize + 1);
      values = [];
      for (let i = 0 ; i < labels.length ; i++)
         values.push(.5);
   }

   this.setValue = function(prop, value) {
      for (let n = 0 ; n < labels.length ; n++)
         if (labels[n] == prop) {
	    values[n] = value;
	    break;
	 }
   }

   this.setNormalizing = function(state) {
      isNormalizing = state;
      if (isNormalizing) {
         values[0] = 1;
	 for (let n = 1 ; n < values.length ; n++)
	    values[n] = 0;
      }
   }

   function normalizeValues() {
      var sum, i, adjust;

      for (let iterations = 0 ; iterations < 10 ; iterations++) {
         sum = 0;
         for (i = 0 ; i < values.length ; i++)
            if (i != I)
               sum += values[i];

         adjust = (1 - values[I] - sum) / (values.length - 1);

         for (i = 0 ; i < values.length ; i++)
            if (i != I)
               values[i] = max(0, values[i] + adjust);
      }
   }

   this.getValues = function() { return values; }

   this.onPress = function(p) {
      I = floor((.5 - .5 * p.y) * nr) - 1;

      if (I >= labels.length)
         I = -2;
      nDrags = 0;
   }

   this.onDrag = function(p) {
      if (I >= 0) {
         values[I] = max(0, min(1, .5 + .5 * p.x));
         if (isNormalizing)
            normalizeValues();
         nDrags++;
      }
   }

   this.onRelease = function(p) {
      if (I == -1)
         clickTitleCallback();
      else if (isNormalizing)
         normalizeValues();
      else if (I >= 0 && nDrags < 5)
         values[I] = 0.5;
      I = -2;
   }

   this.update = function() {
      textHeight(sk().mScale(1.6 / nr));
      var r = .95 / nr;
      for (let i = -1 ; i < labels.length ; i++) {
         let y = 1 - 2 * (i+1.5) / nr;
         color(fadedColor(fadedAlpha(i == -1 ? .65 : .4)));
         mFillRect([-1,y-r,-.02],[1,y+r,-.02]);
         if (i == -1) {
            color(defaultPenColor);
            mText(title, [0, y], .5, .5);
         }
	 else {
            let value = values[i],
                x = 2 * value - 1;
            color(fadedColor(fadedAlpha(.55)));
            mFillRect([-1,y-r,-.01],[x,y+r,-.01]);
            color(defaultPenColor);
            mText(labels[i], [-.98, y], 0, .5);
            mText(roundedString(value, 2), [.98, y], 1, .5);
	 }
      }
   }
}

