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
      let checkOK = entry[3].replace(/("|\s|\r)/g, "");
      if(checkOK == "1") {           
        entries[lineIndex-1] = new Object();
        for (let fieldIndex = 0; fieldIndex < entry.length; fieldIndex++) {
          let fieldValue = entry[fieldIndex];
          if (objectNames[fieldIndex] == "Record")
            entries[lineIndex-1][objectNames[fieldIndex]] = fieldValue.replace(/("|\r)/g, "");
          else
            entries[lineIndex-1][objectNames[fieldIndex]] = fieldValue.replace(/("|\s|\r)/g, "");
        }
      }
    }
    let records = getRecordData(entries);
    usersRecords = sortRecords(records);
  }
  
  function getRecordData(data) {
    Records = [];
    for (let recordIndex = 0; recordIndex < data.length; recordIndex++) {
      recordObject = new Object();
      recordArr = data[recordIndex]["Record"].split(" ");
      recordObject["Date"] = dateFormat(recordArr[1]);
      recordObject["Time"] = timeFormat(recordArr[2]);
      recordObject["EmployeeNum"] = parseInt(recordArr[4]);
      Records.push(recordObject);
    }
    return Records;
  }
  
  function getInfo(month, badgeNum) {
    let myRecords = [];
    for (let recordIndex = 0; recordIndex < usersRecords.length; recordIndex++) {
      let date = new Date(usersRecords[recordIndex]["Date"]);
      let myMonth = new Date(month);
      if(date.getMonth() == myMonth.getMonth()){
        let badge = usersRecords[recordIndex]["EmployeeNum"];
        if(badge == badgeNum){
          myRecords[recordIndex] = usersRecords[recordIndex];
        }
      }
    }
    createTable(myRecords);
  }
  
  function sortRecords(records) {
    fields = ["Date", "Time", "EmployeeNum"];
    records.sort(dynamicSort(fields));
    return records;
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
  
  function dateFormat(date) {
    year = (parseInt(date[0]) * 10 + parseInt(date[1])) + 2000;
    month = parseInt(date[2]) * 10 + parseInt(date[3]);
    if(month < 10)
      month = "0" + month; 
    day = parseInt(date[4]) * 10 + parseInt(date[5]);
    if(day < 10)
      day = "0" + day; 
    return day + "/" + month + "/" + year;
  }
  
  function timeFormat(time) {
    hours = parseInt(time[0]) * 10 + parseInt(time[1]);
    if(hours < 10)
      hours = "0" + hours; 
    minutes = parseInt(time[2]) * 10 + parseInt(time[3]);
    if(minutes < 10)
      minutes = "0" + minutes;
    seconds = parseInt(time[4]) * 10 + parseInt(time[5]);
    if(seconds < 10)
      seconds = "0" + seconds;
    return hours + ":" + minutes + ":" + seconds;
  }
  
  function createTable(myRecords) {
    let table = $('<table class="table text-right"></table>')
    let MyCols = 6;
		let headers = ["תאריך", "יום", "הסכם", "כניסה", "יציאה", "סה\"כ", "תקן", "הפסקה מאושרת", "חוסר", "רגילות", "שעות עודפות", "שגיאה", "הערה יומית", "מאושר לחישוב עם הפסקות"]
		let row = $('<tr></tr>');
		for (let i = 0; i < headers.length; i++)
		{
			let col = $('<th scope="col">' + headers[i] + '</th>');
      row.append(col);
		}
		table.append(row);
    $('#myTable').append(table);
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