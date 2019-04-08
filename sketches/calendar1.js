function() {
   this.label = 'calendar1';
   this.onSwipe[4] = ['prev', () => month = max(0, month - 1)];
   this.onSwipe[2] = ['year', () => isYear = ! isYear];
   this.onSwipe[6] = ['year', () => isYear = ! isYear];
   this.onSwipe[0] = ['next', () => month = min(2, month + 1)];
   this.render = elapsed => {
      mCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
      mCurve([[-1,-1],[-1,1]]);
      this.afterSketch(() => {
         if (isYear) {
	    for (let n = 0 ; n < yearData.length ; n++) {
               textHeight(this.mScale(n == 0 ? 0.4 : 0.2));
               mText(yearData[n],[0,.68-1.8*n/yearData.length],.5,.5);
               mDrawRect([-.47,-.92],[-.0,-.58]);
            }
	 }
	 else {
            textHeight(this.mScale(0.155));
	    let data = monthData[month];
	    for (let n = 0 ; n < data.length ; n++)
               mText(data[n],[0,.8-1.8*n/data.length],.5,.5);
            if (month == 1)
               mDrawRect([-.373,-.437],[-.13,-.2]);
          }
      });
   }
   let isYear = false;
   let yearData = [
         "      2018       ",
         "                 ",
         "JAN FEB MAR APR",
         "MAY JUN JUL AUG",
         "SEP OCT NOV DEC",
   ];
   let month = 1;
   let monthData = [
      [
         "   September 2018   ",
         "                    ",
         "Su Mo Tu We Th Fr Sa",
         "                   1",
         " 2  3  4  5  6  7  8",
         " 9 10 11 12 13 14 15",
         "16 17 18 19 20 21 22",
         "23 24 25 26 27 28 29",
         "30                  ",
      ], [
         "    October 2018    ",
         "                    ",
         "Su Mo Tu We Th Fr Sa",
         "    1  2  3  4  5  6",
         " 7  8  9 10 11 12 13",
         "14 15 16 17 18 19 20",
         "21 22 23 24 25 26 27",
         "28 29 30 31         ",
      ], [
         "   November 2018    ",
         "                    ",
         "Su Mo Tu We Th Fr Sa",
         "             1  2  3",
         " 4  5  6  7  8  9 10",
         "11 12 13 14 15 16 17",
         "18 19 20 21 22 23 24",
         "25 26 27 28 29 30   ",
      ],
   ];
}

