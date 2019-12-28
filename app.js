(function() {
    
  let myFile;
  let usersRecords;
  
  function handleFileSelect(evt) {
    let files = evt.target.files;
      for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        reader.onload = (function(theFile) {
          return function(e) {
            $('#submitBtn').prop('disabled', false);
            myFile = reader.result;
            processData(myFile);
          };
        })(f);
        reader.readAsText(f);
      }
  }

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
  
  function getRecordData(data) {
    let records = [];
    let i = 0;
    for (let recordIndex = 0; recordIndex < data.length; recordIndex++) {
      recordObject = new Object();
      try{
        recordObject["Date"] = dateFormat(data[recordIndex]["Date"]);
        recordObject["Time"] = timeFormat(data[recordIndex]["Time"]);
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
  
  function getInfo(month, badgeNum) {
    let myRecords = [];
    let myRecordsIndex = 0;
    for (let recordIndex = 0; recordIndex < usersRecords.length; recordIndex++) {
      let date = new Date(usersRecords[recordIndex]["Date"]);
      let userDate = new Date(month);
      if(date.getFullYear() == userDate.getFullYear()){
        if(date.getMonth() == userDate.getMonth()){
          let userObj = getUserInfo(badgeNum);
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
  
  function sortRecords(records) {
    fields = ["Date", "Time", "UserId"];
    let myRecords = records.sort(dynamicSort(fields));
    return myRecords;
  }
  
  function dynamicSort(fields) {  
    return function (a,b) {
      if ( a[fields[0]] < b[fields[0]] ){
        return -1;
      }
      else if ( a[fields[0]] > b[fields[0]] ){
        return 1;
      }
      else {
        if ( a[fields[2]] < b[fields[2]] ){
          return -1;
        }
        else if ( a[fields[2]] > b[fields[2]] ){
          return 1;
        }
        else {
          if ( a[fields[1]] < b[fields[1]] ){
            return -1;
          }
          else if ( a[fields[1]] > b[fields[1]] ){
            return 1;
          }
          return 0;
        }
      }
    }
  }
  
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
  
  function timeFormat(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);          
    let minutes = totalMinutes % 60;
    if(hours < 10)
      hours = "0" + hours;
    if(minutes < 10)
      minutes = "0" + minutes;
    return hours + ":" + minutes;
  }
  
  function createTable(myRecords) {
    let agreement = myRecords[0]["AgreementID"];
    let longBreakStart = getLongBreakStart();
    let longBreakEnd = getLongBreakEnd();
        
    let table = $('<table class="table text-right"></table>') // ראשי הטבלה
    let MyCols = 6;
		let headers = ["תאריך", "יום", "הסכם", "כניסה", "יציאה", "סה\"כ", "תקן", "הפסקה מאושרת", "חוסר", "רגילות", "שעות עודפות", "שגיאה", "הערה יומית", "מאושר לחישוב עם הפסקות"]
		let rowHeader = $('<tr></tr>');
		for (let header = 0; header < headers.length; header++)
		{
			let col = $('<th scope="col">' + headers[header] + '</th>');
      rowHeader.append(col);
		}
		table.append(rowHeader);
    let totalDaysAtWork = 0; // ימי נוכחות
    let neededDaysAtWork = 11; // לבדוק תקן
    let totalHoursAtWork = 0; // שעות נוכחות
    let totalStandard = 0; // שעות תקן
    let totalLackTime = 0; // שעות חוסר
    let totalBreaks = 0; // הפסקה
    let totalNormal = 0; // רגילות
    let totalAddTime = 0; // שעות עודפות
    let totalHoursAtWorkWithBreaks = 0; // מאושר לחישוב עם הפסקות
    
    let dateCalc = "1970-01-01";
    let dateNext;
    let dateCurr;
    let sumHours = 0; // סה"כ שעות העבודה
    let sumBreaks = []; // סה"כ זמן הפסקות
    for (let record = 0; record < myRecords.length; record += 2) {
      let row = $('<tr></tr>');
      let nextNextDate = null;
      if(record + 2 < myRecords.length) { 
        nextNextDate = new Date(myRecords[record+2]["Date"] + ' ' + myRecords[record+2]["Time"]); // התאריך הבא הבא
      }
      let currentDate = new Date(myRecords[record]["Date"] + ' ' + myRecords[record]["Time"]); // התאריך הנוכחי
      let nextDate = new Date(myRecords[record+1]["Date"] + ' ' + myRecords[record+1]["Time"]);   // התאריך הבא
      
      let currentDay = getDay(currentDate); 
      let showDate = dateConvert(myRecords[record]["Date"]);
			let colDate = $('<td scope="col">' + showDate + '</td>');
      row.append(colDate);
      let colDay = $('<td scope="col">' + currentDay + '</td>');
      row.append(colDay);
      let colAgr = $('<td scope="col">' + agreement + '</td>');
      row.append(colAgr);
      let standard = getStandard(myRecords[0]["UserId"], myRecords[record]["Date"]);
      standard = timeConvert(addZeroes(standard));
      if(totalStandard == 0) {
          totalStandard = standard;
      }
      else {
        totalStandard = sumTime(totalStandard, standard);
      }
      let colEntry = $('<td scope="col">' + myRecords[record]["Time"] + '</td>');
      row.append(colEntry);
      if(currentDate.getDate() != nextDate.getDate()) {
        for (let i = 4; i < headers.length; i++) {
          let col;
          if(i == 6 || i == 8) // תקן או חוסר
            col = $('<td scope="col">' + standard + '</td>');
          else if(i == 11) // שגיאה
            col = $('<td scope="col">#יום לא שלם#</td>');
          else
            col = $('<td scope="col"></td>');
          row.append(col);
        }
        table.append(row);
        record--;
        
      } 
      else {
        let currentSum = subTime(currentDate, nextDate);
        if(sumHours == 0) {
          sumHours = timeConvert(addZeroes(currentSum));
        }
        else {
          sumHours = sumTime(sumHours, timeConvert(currentSum.toFixed(2)));
        }
        if(totalHoursAtWork == 0) {
          totalHoursAtWork = sumHours;
        }
        else {
          totalHoursAtWork = sumTime(totalHoursAtWork, sumHours);
        }
        
        let colExit = $('<td scope="col">' + myRecords[record+1]["Time"] + '</td>');
        row.append(colExit);
        if(nextNextDate != null && nextDate.getDate() == nextNextDate.getDate()){
          let currentBreak = addZeroes(subTime(nextDate, nextNextDate));
          let breakObj = new Object();
          if(currentBreak <= 0.15) {
            breakObj = {
              "currBreak" : currentBreak,
              "type" : 0
            }
          }
          else {
            if(nextDate.getHours() < longBreakStart || nextDate.getHours() > longBreakEnd) {
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
          sumBreaks.push(breakObj);
          for (let i = 5; i < headers.length; i++) {
            let col = $('<td scope="col"></td>');
            row.append(col);
          }
        }
        else {
          let addTimeNum = "";
          let lackTimeNum = "";
          let sumOfBreaks = "0:00";
          totalDaysAtWork++;
          
          let largestBreak = Math.max.apply(Math, sumBreaks.map(function(o) { return o.currBreak; }));
          for (let i = 0; i < sumBreaks.length; i++) {
            if(sumBreaks[i].currBreak != largestBreak && sumBreaks[i].type == 1) {
              sumBreaks[i].currBreak = 0.15;
            }
            else if(sumBreaks[i].currBreak == largestBreak && sumBreaks[i].currBreak > 0.30) {
              sumBreaks[i].currBreak = 0.30;
            }
            sumOfBreaks = sumTime(sumOfBreaks, timeConvert(sumBreaks[i].currBreak));
          }

          if(totalBreaks == 0) {
            totalBreaks = sumOfBreaks;
          }
          else {
            totalBreaks = sumTime(totalBreaks, sumOfBreaks);
          }  
          let sumHoursNum = parseFloat(sumHours.replace(':', '.'));
          let standardNum = parseFloat(standard.replace(':', '.'));
          
          if(sumHoursNum >= standardNum) {
            normal = standard;
            dateNext = new Date(dateCalc + ' ' + sumHours);
            dateCurr = new Date(dateCalc + ' ' + standard);
            let addTime = subTime(dateCurr, dateNext);
            if(totalAddTime == 0) {
              totalAddTime = timeConvert(addZeroes(addTime));
            }
            else {
              totalAddTime = sumTime(totalAddTime, timeConvert(addTime.toFixed(2)));
            }
            addTimeNum = String(addTime.toFixed(2)).replace('.', ':');
          }
          else {
            normal = sumHours;
            dateNext = new Date(dateCalc + ' ' + standard);
            dateCurr = new Date(dateCalc + ' ' + sumHours);
            let lackTime = subTime(dateCurr, dateNext);
            if(totalLackTime == 0) {
              totalLackTime = timeConvert(addZeroes(lackTime));
            }
            else {
              totalLackTime = sumTime(totalLackTime, timeConvert(lackTime.toFixed(2)));
            }
            lackTimeNum = String(lackTime.toFixed(2)).replace('.', ':');
          }

          if(sumOfBreaks == "0:00") {
            sumOfBreaks = "";
          }
          if(totalNormal == 0) {
            totalNormal = normal;
          }
          else {
            totalNormal = sumTime(totalNormal, normal);
          }     
          
          for (let i = 5; i < headers.length; i++) {
            let col;
            if(i == 5) // סה"כ שעות
              col = $('<td scope="col">' + sumHours + '</td>'); 
            else if(i == 6) // תקן
              col = $('<td scope="col">' + standard + '</td>');
            else if(i == 7) // הפסקה מאושרת
              col = $('<td scope="col">' + sumOfBreaks + '</td>'); 
            else if(i == 8) // חוסר
              col = $('<td scope="col">' + lackTimeNum + '</td>');
            else if(i == 9) // רגילות
              col = $('<td scope="col">' + normal + '</td>'); 
            else if(i == 10) // שעות עודפות
              col = $('<td scope="col">' + addTimeNum + '</td>'); 
            else if(i == 12 && lackTimeNum != "")
              col = $('<td scope="col">#יום לא מלא#</td>'); 
            else if(i == 13) {
              if(sumOfBreaks == "") {
                  sumOfBreaks = "0:00";
              }
              let totalHours = sumTime(sumHours, sumOfBreaks);
              if(totalHoursAtWorkWithBreaks == 0) {
                totalHoursAtWorkWithBreaks = totalHours;
              }
              else {
                totalHoursAtWorkWithBreaks = sumTime(totalHoursAtWorkWithBreaks, totalHours);
              }
              col = $('<td scope="col">' + totalHours + '</td>'); 
            }
            else 
              col = $('<td scope="col"></td>');
            row.append(col);
          }
          sumHours = 0;
          sumBreaks = [];
        }
        table.append(row);
      } 
		}
    let rowTotal = $('<tr></tr>');
    for (let i = 0; i < headers.length; i++) {
        let col;
        if(i == 5) 
          col = $('<td scope="col">' + totalHoursAtWork + '</td>');
        else if(i == 6)
          col = $('<td scope="col">' + totalStandard + '</td>');
        else if(i == 7) 
          col = $('<td scope="col">' + totalBreaks + '</td>');
        else if(i == 8) 
          col = $('<td scope="col">' + totalLackTime + '</td>');
        else if(i == 9) 
          col = $('<td scope="col">' + totalNormal + '</td>');
        else if(i == 10) 
          col = $('<td scope="col">' + totalAddTime + '</td>');
        else if(i == 13) 
          col = $('<td scope="col">' + totalHoursAtWorkWithBreaks + '</td>');
        else
          col = $('<td scope="col"></td>');
        rowTotal.append(col);
    }
    table.append(rowTotal);    
    $('#myTable').append(table);
  }
  
  function dateConvert(date) {
    let dateArr = date.split('-');
    return dateArr[2] + "/" + dateArr[1] + "/" + dateArr[0];
  }
  
  function timeConvert(timeNum) {
    let timeArr = String(timeNum).split('.');
    return timeArr[0] + ":" + timeArr[1];
  }

  function addZeroes(num) {
    let stringNum = String(num);
    let res = stringNum.split(".");     
    if(res.length == 1 || res[1].length < 3) {
      num = num.toFixed(2);
      return num;
    }
    else {
      return num;
    }   
  }
  
  function getDay(currentDate) {
    let day = currentDate.getDay();
    let daysArr = ['א','ב','ג','ד','ה','ו','ש',];
    return daysArr[day];
  }
  
  function subTime(currentDate, nextDate) {
    let hours = Math.floor(Math.abs(nextDate - currentDate) / (60*60*1000));
    let minutes = Math.floor(Math.abs(nextDate - currentDate) % (60*60*1000) /60000);
    if(minutes < 10)
      minutes = "0" + minutes;
    let time = hours +'.'+ minutes;
    let timeNum = parseFloat(time);
    return timeNum;
  }
  
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
  
  $("document").ready(function() {
    $('#submitBtn').prop('disabled', true);
    $(document).on("change", "#files", function(evt){
			handleFileSelect(evt);
		});
    $(document).on("submit", "#getReport", function(evt){
      evt.preventDefault();
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