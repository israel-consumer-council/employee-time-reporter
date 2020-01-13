(function() {
    
  let csvDataFile;
  let usersRecords;
  
  // Read file from user
  function handleFileSelect(event) { 
    let files = event.target.files;
      for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        reader.onload = (function() {
          return function(e) {
            // Timeout to disable click while loading file 
            setTimeout(enableInputs, 3000); 
            $('#loadingSpinner').css("visibility", "hidden");
            csvDataFile = reader.result;
            // process the loaded file
            processData(csvDataFile); 
          };
        })(f);
        reader.readAsText(f);
      }
  }

  // Enable inputs after loading the file
  function enableInputs(){
    $('#files').prop('disabled', false);
    $('#inputMonth').prop('disabled', false);
    $('#inputBadgeNumber').prop('disabled', false);
    $('#submitBtn').prop('disabled', false);
  }
  
  // Process the CSV file to Array of objects of all entries
  function processData(data) {	
    let csv_lines = data.split("\n");
    let objectNames =  csv_lines[0].split(",");
    let entries = [];
    let keyIndex = 0;
    while (keyIndex < objectNames.length) {
      objectNames[keyIndex] = objectNames[keyIndex].replace(/("| |\r)/g, "");
      keyIndex++;
    }       
    for (let lineIndex = 1; lineIndex < csv_lines.length; lineIndex++) {
      let entry = csv_lines[lineIndex].split(",");
      entries[lineIndex-1] = new Object();
      for (let fieldIndex = 0; fieldIndex < entry.length; fieldIndex++) {
        let fieldValue = entry[fieldIndex];
        entries[lineIndex-1][objectNames[fieldIndex]] = fieldValue.replace(/("|\s|\r)/g, "");
      }
    }
    let records = getRecordData(entries);
    usersRecords = sortRecords(records);
  }
  
  // Format the dates and times to make it user readable
  function getRecordData(data) { 
    let records = [];
    let i = 0;
    for (let recordIndex = 0; recordIndex < data.length; recordIndex++) {
      recordObject = new Object();
      try{
        recordObject["Date"] = dateFormat(data[recordIndex]["Date"]);
        recordObject["Time"] = minutesToTime(data[recordIndex]["Time"]);
        recordObject["UserId"] = parseInt(data[recordIndex]["UserId"]);
        recordObject["Type"] = parseInt(data[recordIndex]["Type"]);
        records.push(recordObject);
      }
      catch(e) {
        console.log(i);
      }
      i++;
    }
    return records;
  }


  // Sort the records according to Date, Time and UserId
  function sortRecords(records) { 
    fields = ["Date", "Time", "UserId"];
    let myRecords = records.sort(sortWithinSort(fields));
    return myRecords;
  }

  // Sort an array by a property, the second sort is within the sorted array
  // For example sorting by Dates, the dates are sorted and then for each group of the same dates sort the hours in the certain date.
  function sortWithinSort(fields) {  
    return function (a,b) {
      if(a[fields[0]] < b[fields[0]]) {
        return -1;
      }
      else if(a[fields[0]] > b[fields[0]]) {
        return 1;
      }
      else {
        if(a[fields[2]] < b[fields[2]]) {
          return -1;
        }
        else if(a[fields[2]] > b[fields[2]]) {
          return 1;
        }
        else {
          if(a[fields[1]] < b[fields[1]]) {
            return -1;
          }
          else if(a[fields[1]] > b[fields[1]]) {
            return 1;
          }
          return 0;
        }
      }
    }
  }
  
  // Get user information according to given month and badge number 
  function getInfo(month, badgeNum) { 
    let myRecords = [];
    let myRecordsIndex = 0;
    for (let recordIndex = 0; recordIndex < usersRecords.length; recordIndex++) {
      let date = new Date(usersRecords[recordIndex]["Date"]);
      let userDate = new Date(month);
      if(date.getFullYear() == userDate.getFullYear()){
        if(date.getMonth() == userDate.getMonth()){
          let userObj = getUserInfo(badgeNum);
          if(userObj == null){
            alert("מספר תג לא תקין");
            return;
          }
          if(usersRecords[recordIndex]["UserId"] == userObj.UserId){
            myRecords[myRecordsIndex] = usersRecords[recordIndex];
            myRecords[myRecordsIndex].AgreementID = userObj.AgreementID;
            myRecordsIndex++;
          }
        }
      }
    }
    if(myRecords.length > 0)
      createTable(myRecords);
    else
      alert("לא קיים!");
  }
  
  // Format the date from a serial number to a string that allows creating Date objects
  function dateFormat(serialNum) { 
    const date = new Date(Math.round((serialNum - 25569)*86400*1000));
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if(month < 10)
      month = "0" + month; 
    if(day < 10)
      day = "0" + day; 
    return year + "-" + month + "-" + day;
  }

  // A "++" function for strings - adds the current number to the sum of numbers
  function totalCalc(total, single, isSubTime){ 
    if(isSubTime) {
      if(total == 0)
        return timeConvert(addZeroes(single));
      else 
        return sumTime(total, timeConvert(single.toFixed(2)));
    }
    else {
      if(total == 0)
        return single;
      else 
        return sumTime(total, single);
    }
  }
  
  // Arrange breaks in objects to ditnigwish between them for calculations
  function getBreakObj(currentBreak, nextDate){ 
    let breakObj = new Object();
    if(currentBreak <= 0.15) {
      breakObj = {
        "currBreak" : currentBreak,
        "type" : 0
      }
    }
    else {
      if(nextDate.getHours() < getLongBreakStart() || nextDate.getHours() > getLongBreakEnd()) {
        breakObj = {
          "currBreak" : 0.15,
          "type" : 0
        }
      }
      else {
        breakObj = {
          "currBreak" : currentBreak,
          "type" : 1
        }
      }
    }
    return breakObj;
  }
  
  // Calculate the sum of all breaks in a certain day
  function calcBreaks(sumBreaks, sumOfBreaks){ 
    let largestBreak = Math.max.apply(Math, sumBreaks.map(function(o) { return o.currBreak; }));
    for (let i = 0; i < sumBreaks.length; i++) {
      let currentBreakNum = parseFloat(sumBreaks[i].currBreak);
      if(currentBreakNum != largestBreak && sumBreaks[i].type == 1) {
        sumBreaks[i].currBreak = "0.15";
      }
      else if(currentBreakNum == largestBreak && currentBreakNum > 0.30) {
        sumBreaks[i].currBreak = "0.30";
      }
      sumOfBreaks = sumTime(sumOfBreaks, timeConvert(sumBreaks[i].currBreak));
    }
    return sumOfBreaks;
  }
  
  // Calculate the Added of Lacked hours in the report
  function calcTime(sumHours, standard, totalAddTime, totalLackTime){ 
    let sumHoursNum = parseFloat(sumHours.replace(':', '.'));
    let standardNum = parseFloat(standard.replace(':', '.'));
    let dateNext, dateCurr, normal, addTimeNum = "", lackTimeNum = "";
    // if the sum of working hours is greater then the needed hours to work
    if(sumHoursNum >= standardNum) { 
      normal = standard;
      dateNext = new Date('1970-01-01 ' + sumHours);
      dateCurr = new Date('1970-01-01 ' + standard);
      let addTime = subTime(dateCurr, dateNext);
      totalAddTime = totalCalc(totalAddTime, addTime, true);
      addTimeNum = addTime.toFixed(2).replace('.', ':');
    }
    else {
      normal = timeFormat(sumHours);
      dateNext = new Date('1970-01-01 ' + standard);
      dateCurr = new Date('1970-01-01 ' + sumHours);
      let lackTime = subTime(dateCurr, dateNext);
      totalLackTime = totalCalc(totalLackTime, lackTime, true);
      lackTimeNum = lackTime.toFixed(2).replace('.', ':');
    }
    return [normal, totalAddTime, addTimeNum, totalLackTime, lackTimeNum];
  }
  
  // Create the report table to show to the user
  function createTable(myRecords) {  
    let table = $('<table class="table text-right"></table>') // ראשי הטבלה
    let MyCols = 6;
		let headers = ["תאריך", "יום", "הסכם", "כניסה", "יציאה", "סה\"כ", "תקן", "הפסקה מאושרת", "חוסר", "רגילות", "שעות עודפות", "שגיאה", "הערה יומית", "מאושר לחישוב עם הפסקות"];
		let rowHeader = $('<tr></tr>');
		for (let header = 0; header < headers.length; header++)
		{
			let col = $('<th scope="col">' + headers[header] + '</th>');
      rowHeader.append(col);
		}
		table.append(rowHeader);
    let totalDaysAtWork = 0; // ימי נוכחות
    let neededDaysAtWork = getNeededDaysAtWork(myRecords[0]["AgreementID"], myRecords[0]["Date"]); // ימי תקן
    let totalHoursAtWork = 0; // שעות נוכחות
    let totalStandard = 0; // שעות תקן
    let totalLackTime = 0; // שעות חוסר
    let totalBreaks = 0; // הפסקה
    let totalNumOfBreaks = 0; // מספר הפסקות
    let totalNormal = 0; // רגילות
    let totalAddTime = 0; // שעות עודפות
    let totalErrors = 0; // מספר שגיאות כולל
    let monthlyRemark = getMonthlyRemark(); // הערה חודשית
    let totalHoursAtWorkWithBreaks = 0; // מאושר לחישוב עם הפסקות
    let sumHours = 0; // סה"כ שעות העבודה
    let sumBreaks = []; // סה"כ זמן הפסקות 
    let isError = false; // Was there an error in a certain day in the report 
    // Get number of hours needed to work of the current day
    let standard = getTodayStandard(myRecords[0]["AgreementID"], new Date(myRecords[0]["Date"])); 
    for (let record = 0; record < myRecords.length; record += 2) {
      let row = $('<tr></tr>');
      let currentDate = new Date(myRecords[record]["Date"] + ' ' + myRecords[record]["Time"]); // התאריך הנוכחי
      let nextDate;
      let nextNextDate;
      if(myRecords[record+1] != null)
        nextDate = new Date(myRecords[record+1]["Date"] + ' ' + myRecords[record+1]["Time"]);   // התאריך הבא
      if(record + 2 < myRecords.length)
        nextNextDate = new Date(myRecords[record+2]["Date"] + ' ' + myRecords[record+2]["Time"]); // התאריך הבא הבא
			let colDate = $('<td scope="col">' + dateConvert(myRecords[record]["Date"]) + '</td>'); // Show today's date
      row.append(colDate);
      let colDay = $('<td scope="col">' + getDayName(currentDate) + '</td>'); // Show day of the week
      row.append(colDay);
      let agreementID = myRecords[0]["AgreementID"];
      let colAgr = $('<td scope="col">' + agreementID + '</td>'); // Show agreement ID
      row.append(colAgr);
      let colEntry;
      // Check if current record object is an entry type (0 - Entry)
      if(myRecords[record]["Type"] == 0) { 
        colEntry = $('<td scope="col">' + myRecords[record]["Time"] + '</td>');
      }
      else {
        colEntry = $('<td scope="col">#שגיאה#</td>'); // Show Error if the record object is Exit type without an Entry type
        isError = true;
      }
      row.append(colEntry);
      // check if dates are equal
      if(nextDate == null || (currentDate.getDate() != nextDate.getDate())) { 
        standard = getTodayStandard(agreementID, currentDate);
        let colExit;
        if(myRecords[record]["Type"] == 1) {
          colExit = $('<td scope="col">' + myRecords[record]["Time"] + '</td>');
        } else {
          colExit = $('<td scope="col">#שגיאה#</td>');
        }
        row.append(colExit);
        let errorRes = tableErrorRow(true, true, headers.length, standard, row, record, totalErrors, table, sumHours, sumBreaks);
        record = errorRes[0];
        totalErrors = errorRes[1];
        table = errorRes[2];
        sumHours = errorRes[3];
        sumBreaks = errorRes[4];
        // Calculate the number of hours needed to work this month
        totalStandard = totalCalc(totalStandard, standard, false); 
      }
      else {
        let colExit;
        if(myRecords[record]["Type"] == 0 && myRecords[record+1]["Type"] == 0) {
          colExit = $('<td scope="col">#שגיאה#</td>'); // Show Error if the record object is Entry type without an Exit type
          isError = true;
        }
        else {
          colExit = $('<td scope="col">' + myRecords[record+1]["Time"] + '</td>');
        }
        row.append(colExit);
        if(myRecords[record]["Type"] == 1 || myRecords[record+1]["Type"] == 0) {
          let errorRow = false;
          if(currentDate.getDate() != nextDate.getDate())  // errorRow = false
            errorRow = true;
          let errorRes = tableErrorRow(errorRow, true, headers.length, standard, row, record, totalErrors, table, sumHours, sumBreaks);
          record = errorRes[0];
          totalErrors = errorRes[1];
          table = errorRes[2];
          sumHours = errorRes[3];
          sumBreaks = errorRes[4];
          continue;
        }
        // Sum the working time between two record objects
        let currentSum = subTime(currentDate, nextDate); 
        // "++" function to add the current working hours to the sum of all working hours of the current day
        sumHours = totalCalc(sumHours, currentSum, true); 
        // If the next date and the date after it are the same calculate the break between them
        if(nextNextDate != null && nextDate.getDate() == nextNextDate.getDate()){
          let currentBreak = addZeroes(subTime(nextDate, nextNextDate));
          sumBreaks.push(getBreakObj(currentBreak, nextDate));
          totalNumOfBreaks++;
          for (let i = 5; i < headers.length; i++) {
            let col = $('<td scope="col"></td>');
            row.append(col);
          }
          table.append(row);
        }
        else {
          // if there is an error in the current batch of the current date show an error
          if(isError) { 
            let errorRes = tableErrorRow(true, false, headers.length, standard, row, record, totalErrors, table, sumHours, sumBreaks);
            record = errorRes[0];
            totalErrors = errorRes[1];
            table = errorRes[2];
            sumHours = errorRes[3];
            sumBreaks = errorRes[4];
            isError = false;
          }
          // Else sum regulary
          else { 
            let sumOfBreaks = "0:00";
            totalDaysAtWork++;    
            // Calculate the sum of all breaks in the current date
            sumOfBreaks = calcBreaks(sumBreaks, sumOfBreaks); 
            // Calculate the sum of all the breaks in the month
            totalBreaks = totalCalc(totalBreaks, sumOfBreaks, false); 
            let resArr = calcTime(sumHours, standard, totalAddTime, totalLackTime);
            normal = resArr[0];
            totalAddTime = resArr[1];
            let addTimeNum = resArr[2];
            totalLackTime = resArr[3];
            let lackTimeNum = resArr[4];
            // Calculate the sum of all the normal in the month
            totalNormal = totalCalc(totalNormal, normal, false); 
            // Calculate the sum of all the working hours in the current date
            let totalHours = sumTime(sumHours, sumOfBreaks); 
            // Calculate the sum of all the working hours in the month
            totalHoursAtWork = totalCalc(totalHoursAtWork, sumHours, false); 
            // Calculate the sum of all the working hours and breaks in the month
            totalHoursAtWorkWithBreaks = totalCalc(totalHoursAtWorkWithBreaks, totalHours, false);
            for (let i = 5; i < headers.length; i++) {
              let col;
              if(i == 5) // סה"כ שעות
                col = $('<td scope="col">' + timeFormat(sumHours) + '</td>'); 
              else if(i == 6) // תקן
                col = $('<td scope="col">' + standard + '</td>');
              else if(i == 7) { // הפסקה מאושרת
                if(sumOfBreaks == "0:00")
                  col = $('<td scope="col"></td>');
                else
                  col = $('<td scope="col">' + sumOfBreaks + '</td>');
              }
              else if(i == 8) { // חוסר
                if(lackTimeNum == 0 || lackTimeNum == "0:00")
                  col = $('<td scope="col"></td>');
                else
                  col = $('<td scope="col">' + timeFormat(lackTimeNum) + '</td>');
              } 
              else if(i == 9) // רגילות
                col = $('<td scope="col">' + normal + '</td>'); 
              else if(i == 10) { // שעות עודפות
                if(addTimeNum == 0 || addTimeNum == "0:00")
                  col = $('<td scope="col"></td>');
                else
                  col = $('<td scope="col">' + timeFormat(addTimeNum) + '</td>');
              }
              else if(i == 12 && totalHours < standard)
                col = $('<td scope="col">#יום לא מלא#</td>'); 
              else if(i == 13)
                col = $('<td scope="col">' + totalHours + '</td>'); 
              else 
                col = $('<td scope="col"></td>');
              row.append(col);
            }
            sumHours = 0;
            sumBreaks = [];
            table.append(row);
          }
          // Calculate the number of hours needed to work this month
          totalStandard = totalCalc(totalStandard, standard, false); 
        }
      } 
		}
    let rowTotal = $('<tr></tr>');
    if(totalErrors == 0){
      totalErrors = "";
    }
    for (let i = 0; i < headers.length; i++) {
        let col;
        if(i == 5) { 
          if(totalHoursAtWork == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalHoursAtWork + '</td>');
        }
        else if(i == 6) { 
          if(totalStandard == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalStandard + '</td>');
        }
        else if(i == 7) { 
          if(totalBreaks == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalBreaks + '</td>');
        }
        else if(i == 8) { 
          if(totalLackTime == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalLackTime + '</td>');
        }
        else if(i == 9) { 
          if(totalNormal == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalNormal + '</td>');
        }
        else if(i == 10) {
          if(totalAddTime == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalAddTime + '</td>');
        }
        else if(i == 11) {
          if(totalErrors == 0)
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalErrors + '</td>');
        }
        else if(i == 13) { 
          if(totalHoursAtWorkWithBreaks == "00:00")
            col = $('<td scope="col"></td>');
          else
            col = $('<td scope="col">' + totalHoursAtWorkWithBreaks + '</td>');
        }
        else
          col = $('<td scope="col"></td>');
        rowTotal.append(col);
    }
    table.append(rowTotal);    
    $('#monthlyReportTable').append(table);
    let generalInfo = [totalDaysAtWork, neededDaysAtWork, totalHoursAtWork, totalStandard, totalLackTime, totalBreaks, totalNumOfBreaks, totalErrors, monthlyRemark];
    let paymentInfo = [totalNormal, totalAddTime];
    reportSummary(generalInfo, paymentInfo);
  }
  
  // SHow an error line in the table if somthing is wrong
  function tableErrorRow(errorRow, errorBit, length, standard, row, record, totalErrors, table, sumHours, sumBreaks) {
    if(errorRow) {
      for (let i = 5; i < length; i++) {
        let col;
        if(i == 6 || i == 8) // תקן או חוסר
          col = $('<td scope="col">' + standard + '</td>');
        else if(i == 11) // שגיאה
          col = $('<td scope="col">#יום לא שלם#</td>');
        else
          col = $('<td scope="col"></td>');
        row.append(col);
      }
    }
    if(errorBit) {
      record--;
      totalErrors++;
    }
    table.append(row);
    sumHours = 0;
    sumBreaks = [];
    return [record, totalErrors, table, sumHours, sumBreaks];
  }
  
  // The summary of the report
  function reportSummary(generalInfo, paymentInfo) { 
    let table = $('<table class="table text-right"></table>') // ראשי הטבלה
    let MyCols = 6;
		let headers = ["נתונים כללים", "שעות לתשלום", "אירועים", "ימים", "שעות"];
    let names = getGeneralDataNames();
		let rowHeader = $('<tr></tr>');
		for(let header = 0; header < headers.length; header++)
		{
			let col = $('<th scope="col">' + headers[header] + '</th>');
      rowHeader.append(col);
		}
		table.append(rowHeader);
    for (let i = 0; i < names.length; i++)
		{
      let row = $('<tr></tr>');
      let col;
      if(generalInfo[i] == 0 || generalInfo[i] == "00:00")
        generalInfo[i] = "";
      col = $('<td scope="col">' + names[i] + ' ' + generalInfo[i] + '</td>');
      row.append(col);
      if(i == 0) {
        if(paymentInfo[0] == 0 || paymentInfo[0] == "00:00")
          paymentInfo[0] = "";
        col = $('<td scope="col">רגילות ' + paymentInfo[0] + '</td>');
        row.append(col);
      }
      else if(i == 1) {
        if(paymentInfo[1] == 0 || paymentInfo[1] == "00:00")
          paymentInfo[1] = "";
        col = $('<td scope="col">שעות עודפות ' + paymentInfo[1] + '</td>');
        row.append(col);
      }
      table.append(row);
		}
    $('#generalReportTable').append(table);  
  }
  
  // Change date for showing to user
  function dateConvert(date) { 
    let dateArr = date.split('-');
    return dateArr[2] + "/" + dateArr[1] + "/" + dateArr[0];
  }
  
  function timeConvert(timeNum) {
    return addTimeNum = timeNum.replace('.', ':');
  }

  // Change number to have two digits after the "." and return a string representation of it
  function addZeroes(num) { 
    let stringNum = String(num);
    let res = stringNum.split(".");     
    if(res.length == 1 || res[1].length < 3) {
      stringNum = num.toFixed(2);
      return stringNum;
    }
    else {
      return stringNum;
    }   
  }

  // A sub function between two Date objects
  function subTime(currentDate, nextDate) { 
    let hours = Math.floor(Math.abs(nextDate - currentDate) / (60*60*1000));
    let minutes = Math.floor(Math.abs(nextDate - currentDate) % (60*60*1000) /60000);
    if(minutes < 10)
      minutes = "0" + minutes;
    let time = hours +'.'+ minutes;
    let timeNum = parseFloat(time);
    return timeNum;
  }
  
  // A "++" function for time strings
  function sumTime(time1, time2) { 
    let timeArr1 = time1.split(':');
    let timeArr2 = time2.split(':');
    let hoursTotal = parseInt(timeArr1[0]) + parseInt(timeArr2[0]);
    let minutesTotal = parseInt(timeArr1[1]) + parseInt(timeArr2[1]);
    if(minutesTotal >= 60) {
      hoursTotal += Math.floor(minutesTotal / 60);
      minutesTotal = minutesTotal % 60;
    }
    if(hoursTotal < 10)
      hoursTotal = "0" + hoursTotal;
    if(minutesTotal < 10)
      minutesTotal = "0" + minutesTotal;
    return hoursTotal + ":" + minutesTotal;
  }
  
  // Get how much hours a worker needs to work in a certain date
  function getTodayStandard(agreementID, currentDate) {
    let standardObj = getStandard(agreementID);
    let standardArr = standardObj.standard;
    let holidayName = getHoliday(currentDate);
    if(holidayName != "") {
      for (let [key, value] of Object.entries(standardArr)) {
        if(key == holidayName)
          return value;
      }
      return "";
    }
    if((0 <= currentDate.getDay()) && (currentDate.getDay() <= 3))
      return minutesToTime(getValueByProperty(standardArr, "normal"));
    else if(currentDate.getDay() == 4)
      return minutesToTime(getValueByProperty(standardArr, "day5"));
    else
      return "";
  }

  // Check if there is an holiday in the current date
  function getHoliday(currentDate) {
    for(let i = 0; i < holidays.length; i++) {
      for(let j = 0; j < holidays[i].dates.length; j++) {
        let startDate = new Date(holidays[i].dates[j].start);
        let endDate = new Date(holidays[i].dates[j].end);
        if((startDate <= currentDate) && (currentDate <= endDate)) {
          return holidays[i].holidayName;
        }
      }
    }
    return "";
  }

  // Get the name of the day for showing in the report
  function getDayName(currentDate) {
    let day = currentDate.getDay();
    let daysArr = ['א','ב','ג','ד','ה'];
    return daysArr[day];
  }

  // Get row names for the summary report
  function getGeneralDataNames(){
    return ["ימי נוכחות", "ימי תקן", "שעות נוכחות", "שעות תקן", "שעות חוסר", "הפסקה", "מספר הפסקות", "שגיאות"];
  }

  // Get the number of days a certain worker needs to work in a certain month
  function getNeededDaysAtWork(agreementID, dateStr){
    let tmpStrDate = new Date(dateStr);
    let month = tmpStrDate.getMonth();
    let year = tmpStrDate.getFullYear();
    let currentDate = new Date(year, month, 1);
    let numOfdays = 0;
    while(currentDate.getMonth() === month) {
      let tmpDate = new Date(currentDate);
      if(getTodayStandard(agreementID, tmpDate) != "")
        numOfdays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return numOfdays;
  }  
    
  // Get the monthly remark
  function getMonthlyRemark(){
    return "";
  }

  // Get the start hour that allows a long break after it
  function getLongBreakStart() {
    return 6;
  }
  
  // Get the end hour that don't allows a long break after it
  function getLongBreakEnd() {
    return 17;
  }
  
  // Get an object value by it is key
  function getValueByProperty(arr, property) {
    let res = arr.find(element => Object.keys(element) == property); 
    return Object.values(res)[0];
  }

  // Get object according to the value
  function getObjByValue(arr, property, value) {
    return arr.find(element => element[property] == value); 
  }

  // Get the standard working hours of a certain agreement
  function getStandard(agreementID) {
    return getObjByValue(agreements, "agreementID", agreementID);
  }

  // Get user information according to a badge number
  function getUserInfo(badgeNum) {
    return getObjByValue(users, "Badge", badgeNum);
  }

  // Convert minutes it to time (HH:MM)
  function minutesToTime(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);          
    let minutes = totalMinutes % 60;
    if(hours < 10)
      hours = "0" + hours;
    if(minutes < 10)
      minutes = "0" + minutes;
    return hours + ":" + minutes;
  }  

  // Reformat a time object to show properly
  function timeFormat(timeStr) {
    let timeArr = timeStr.split(':');
    let hours = timeArr[0];          
    let minutes = timeArr[1];
    if(Number(hours) < 10 && hours.length == 1)
      hours = "0" + hours;
    if(Number(minutes) < 10 && minutes.length == 1)
      minutes = "0" + minutes;
    return hours + ":" + minutes;
  }

  $("document").ready(function() {
    $('#inputMonth').prop('disabled', true);
    $('#inputBadgeNumber').prop('disabled', true);
    $('#submitBtn').prop('disabled', true);
    $('#loadingSpinner').css("visibility", "hidden");
    // Load file button - show spinner on load
    $(document).on("change", "#files", function(event){ 
      $('#files').prop('disabled', true);
			handleFileSelect(event);
      $('#loadingSpinner').css("visibility", "visible");
		});
    // Submit button - delete existing table and show new table according to given info
    $(document).on("submit", "#getReport", function(event){ 
      event.preventDefault();
      if($("#monthlyReportTable").is(':empty') == false) {
        $("#monthlyReportTable").empty();
      }
      if($("#generalReportTable").is(':empty') == false) {
        $("#generalReportTable").empty();
      }
      let month = document.getElementById("inputMonth").value;
      let badgeNum = document.getElementById("inputBadgeNumber").value;
      if(month != "" && badgeNum != "") {
        getInfo(month, badgeNum);
      }
      else {
        alert("נא הכנס חודש ומספר תג!");
      }
		});
  });
  
})();