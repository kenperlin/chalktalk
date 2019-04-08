function() {
   let that = this,
       currentDate = new Date(),
       selectedYear  = currentDate.getFullYear(),
       selectedMonth = currentDate.getMonth() + 1,
       selectedDay   = currentDate.getDate();

   this.label = 'calendar';
   this.onClick = ['choose', p => {
      if (isYear) {
         for (let m = 1 ; m <= 12 ; m++)
            if (mR[m].contains(p.x, p.y)) {
               setMonth(m);
	       break;
            }
      }
      else {
         let nDays = daysPerMonth(year, month);
         for (let d = 1 ; d <= nDays ; d++)
            if (dR[d].contains(p.x, p.y)) {
               setDay(d);
	       break;
            }
      }
   }];
   this.onSetProp = (prop, value) => {
      switch (prop) {
      case 'year':
         setYear(value);
         break;
      case 'month':
         setMonth(value + 1);
         break;
      case 'day':
         setDay(value);
         break;
      }
   }
   this.onSwipe[0] = ['next', p => { if (isYear && p.y > .3) setYear(year+1); else setMonth(month + 1); }];
   this.onSwipe[4] = ['prev', p => { if (isYear && p.y > .3) setYear(year-1); else setMonth(month - 1); }];
   this.onSwipe[2] = ['year', () => isYear = ! isYear];
   this.onSwipe[6] = ['year', () => isYear = ! isYear];
   this.props = {
      year : [selectedYear,2000,2030,1],
      month: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec:' + (selectedMonth - 1),
      day  : [selectedDay,1,31,1],
   };

   this.render = elapsed => {
      mCurve([[-1,-1],[-1,1]]);
      mCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
      this.afterSketch(() => {
         if (isYear) {
            for (let n = 0 ; n < yearData.length ; n++) {
               textHeight(this.mScale(n == 0 ? 0.4 : 0.2));
               mText(yearData[n],[0,.68-1.8*n/yearData.length],.5,.5);
               let r = mR[month];
               lineWidth(1);
               mDrawRect([r.left(),r.bottom()],[r.right(),r.top()]);
               lineWidth(2);
               if (year == selectedYear) {
                  r = mR[selectedMonth];
                  mDrawRect([r.left(),r.bottom()],[r.right(),r.top()]);
               }
            }
         }
         else {
            textHeight(this.mScale(0.155));
            let data = monthData[month];
            let y = n => .8 - 1.8 * n / data.length;
            for (let n = 0 ; n < data.length ; n++)
               mText(data[n],[0,y(n)],.5,.5);
            lineWidth(.5);
            let r = dR[day];
            mDrawRect([r.left(),r.bottom()], [r.right(),r.top()]);
            lineWidth(2);
	    if (year == selectedYear && month == selectedMonth) {
	       r = dR[selectedDay];
               mDrawRect([r.left(),r.bottom()], [r.right(),r.top()]);
            }
         }
      });
   }

   let createMonthData = (year, month) => {
          let data = [],
              monthName = monthNames[month - 1],
              ns = floor((20 - monthName.length) / 2),
              d = dayOfWeek(year, month, 0),
              n = 2;
          data[0] = nSpaces(ns) + monthName + nSpaces(21 - monthName.length - ns);
          data[1] = 'Su Mo Tu We Th Fr Sa';
          data[n] = nSpaces(3 * (d+1) - 1);
          let nDays = daysPerMonth(year, month);
          for (let i = 1 ; i <= nDays ; i++) {
             if ((d + i) % 7 == 0)
                data[++n] = '';
             else
                data[n] += ' ';
             data[n] += (i<10 ? ' ' : '') + i;
          }
          data[n] += nSpaces(20 - data[n].length);
          return data;
       },
       dR,
       day = 1,
       dayOfWeek = (year, month, day) => {
          let months = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
          year -= month < 3 ? 1 : 0;
          return (year
                + floor(year / 4)
                - floor(year / 100)
                + floor(year / 400)
                + months[month - 1]
                + day) % 7;
       },
       dayRect = (year, month, day) => {
          let dow = dayOfWeek(year, month, day);
          let x = .265 * (dow - 3);
          let y = .8 - 1.8 * weekOfDay(year, month, day) / monthData[month].length;
          return new Rectangle(x, y, .26, .26);
       },
       daysPerMonth = (year, month) => ([31,28,31,30,31,30,31,31,30,31,30,31])[month-1] + (month==2 && isLeapYear(year)),
       isLeapYear = y => y % 4 == 0 && y % 100 != 0 || y % 400 == 0,
       isYear = false,
       mR = [],
       month = 1,
       monthData,
       monthNames = 'January February March April May June July August September October November December'.split(' '),
       monthRect = m => {
          let x = (((m-1) % 4) - 1.5) * .47;
          let y = -.6 - floor((m-1) / 4) * .355 + .57;
          return new Rectangle(x,y,.44,.36);
       },
       setDay = d => {
          day = d;
          that.setProp('day', day);
       },
       setMonth = m => {
          if (m < 1) {
             month = 12;
             setYear(year - 1);
          }
          else if (m > 12) {
             month = 1;
             setYear(year + 1);
          }
          else
             month = m;
          that.setProp('month', month - 1);
          dR = [];
          let nDays = daysPerMonth(year, month);
          for (let day = 1 ; day <= nDays ; day++)
             dR[day] = dayRect(year, month, day);
       },
       setYear = y => {
          year = y;
          that.setProp('year', year);
          yearData[0] = '     ' + year + '     ';
          monthData = [];
          for (let m = 1 ; m <= 12 ; m++)
             monthData[m] = createMonthData(year, m);
          setMonth(month);
       },
       weekOfDay = (year, month, day) => {
          for (let n = 0 ; n < monthData[month].length ; n++) {
             let str = ' ' + monthData[month][n] + ' ';
             let i = str.indexOf(' ' + day + ' ');
             if (i >= 0)
                return n;
          }
          return 0;
       },
       year = 2018,
       yearData = [
         "     2018     ",
         "               ",
         "JAN FEB MAR APR",
         "MAY JUN JUL AUG",
         "SEP OCT NOV DEC",
       ];

   for (let m = 1 ; m <= 12 ; m++)
      mR[m] = monthRect(m);

   setYear(year);
   setMonth(month);
}

