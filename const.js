
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

function getDayName(currentDate) {
  let day = currentDate.getDay();
  let daysArr = ['א','ב','ג','ד','ה'];
  return daysArr[day];
}

function getGeneralDataNames(){
  return ["ימי נוכחות", "ימי תקן", "שעות נוכחות", "שעות תקן", "שעות חוסר", "הפסקה", "מספר הפסקות", "שגיאות"];
}

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
  
function getMonthlyRemark(){
  return "";
}

function getLongBreakStart() {
  return 6;
}

function getLongBreakEnd() {
  return 17;
}

function getValueByProperty(arr, property) {
  let res = arr.find(element => Object.keys(element) == property); 
  return Object.values(res)[0];
}

function getObjByValue(arr, property, value) {
  return arr.find(element => element[property] == value); 
}

function getStandard(agreementID) {
  return getObjByValue(agreements, "agreementID", agreementID);
}

function getUserInfo(badgeNum) {
  return getObjByValue(users, "Badge", badgeNum);
}

function minutesToTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);          
  let minutes = totalMinutes % 60;
  if(hours < 10)
    hours = "0" + hours;
  if(minutes < 10)
    minutes = "0" + minutes;
  return hours + ":" + minutes;
}  

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

const holidays = [{
        "id": 5,
        "holidayName": "HolHamoed", 
        "dates": [{
            "start": "2020-04-10", // חול המועד פסח
            "end": "2020-04-13"
          }, {
            "start": "2020-10-04", // חול המועד סוכות
            "end": "2020-10-08"
          }, {
            "start": "2021-03-29", // חול המועד פסח
            "end": "2021-04-01"
          }, {
            "start": "2021-09-22", // חול המועד סוכות
            "end": "2021-09-26"
          }, {
            "start": "2022-03-17", // חול המועד פסח
            "end": "2022-03-20"
          }, {
            "start": "2022-10-11", // חול המועד סוכות
            "end": "2022-10-15"
        }]
    }, {
        "id": 6,
        "holidayName": "Bhirot",
        "dates": [{
            "start": "2020-03-02",
            "end": "2020-03-02"
        }]
    }, {
        "id": 7,
        "holidayName": "YomHaatzmaut",
        "dates": [{
            "start": "2020-04-29",
            "end": "2020-04-29"
          }, {
            "start": "2021-04-15",
            "end": "2021-04-15"
          }, {
            "start": "2022-05-05",
            "end": "2022-05-05"
        }]
    }, {
        "id": 8,
        "holidayName": "Pesah",
        "dates": [{
            "start": "2020-04-08", // חג ראשון
            "end": "2020-04-09"
          }, {
            "start": "2020-04-14", // חג שני
            "end": "2020-04-15"
          }, {
            "start": "2021-03-27", // חג ראשון
            "end": "2021-03-28"
          }, {
            "start": "2021-04-02", // חג שני
            "end": "2021-04-03"
          }, {
            "start": "2022-04-15", // חג ראשון
            "end": "2022-04-16"
          }, {
            "start": "2022-04-21", // חג שני
            "end": "2022-04-22"
        }]
    }, {
        "id": 9,
        "holidayName": "YomHazikaron",
        "dates": [{
            "start": "2020-04-28",
            "end": "2020-04-28"
          }, {
            "start": "2021-04-14",
            "end": "2021-04-14"
          }, {
            "start": "2022-05-04",
            "end": "2022-05-04"
        }]
    }, {
        "id": 10,
        "holidayName": "Shavuot",
        "dates": [{
            "start": "2020-05-29",
            "end": "2020-05-29"
          }, {
            "start": "2021-05-17",
            "end": "2021-05-17"
          }, {
            "start": "2022-06-05",
            "end": "2022-06-05"
        }]
    }, {
        "id": 11,
        "holidayName": "ErevShavuot",
        "dates": [{
            "start": "2020-05-28",
            "end": "2020-05-28"
          }, {
            "start": "2021-05-16",
            "end": "2021-05-16"
          }, {
            "start": "2022-06-04",
            "end": "2022-06-04"
        }]
    }, {
        "id": 12,
        "holidayName": "Gibush",
        "dates": []
     }, {
        "id": 13,
        "holidayName": "RoshHashana",
        "dates": [{
            "start": "2020-09-19",
            "end": "2020-09-20"
          }, {
            "start": "2021-09-07",
            "end": "2021-09-08"
          }, {
            "start": "2022-09-26",
            "end": "2022-09-27"
        }]
    }, {
        "id": 14,
        "holidayName": "Sukot",
        "dates": [{
            "start": "2020-10-02", // חג ראשון
            "end": "2020-10-03"
          }, {
            "start": "2021-09-20", // חג ראשון
            "end": "2021-09-21"
          }, {
            "start": "2022-10-09", // חג ראשון
            "end": "2022-10-10"
        }]
    }, {
        "id": 15,
        "holidayName": "Purim",
        "dates": [{
            "start": "2020-03-10",
            "end": "2020-03-11"
          }, {
            "start": "2021-02-26",
            "end": "2021-02-27"
          }, {
            "start": "2022-03-17",
            "end": "2022-03-18"
        }]
    }, {
        "id": 16,
        "holidayName": "ErevKipur",
        "dates": [{
            "start": "2020-09-27",
            "end": "2020-09-27"
          }, {
            "start": "2021-09-15",
            "end": "2021-09-15"
          }, {
            "start": "2022-10-04",
            "end": "2022-10-04"
        }]
    }, {
        "id": 17,
        "holidayName": "Kipur",
        "dates": [{
            "start": "2020-09-28",
            "end": "2020-09-28"
          }, {
            "start": "2021-09-16",
            "end": "2021-09-16"
          }, {
            "start": "2022-10-05",
            "end": "2022-10-05"
        }]
    }, {
        "id": 18,
        "holidayName": "ErevRoshHashana",
        "dates": [{
            "start": "2020-09-18",
            "end": "2020-09-18"
          }, {
            "start": "2021-09-06",
            "end": "2021-09-06"
          }, {
            "start": "2022-09-25",
            "end": "2022-09-25"
        }]
    }, {
        "id": 19,
        "holidayName": "SimhatTora",
        "dates": [{
            "start": "2020-10-09", // חג שני
            "end": "2020-10-10"
          }, {
            "start": "2021-09-27", // חג שני
            "end": "2021-09-28"
          }, {
            "start": "2022-10-16", // חג שני
            "end": "2022-10-17"
        }]
    }, {
        "id": 20,
        "holidayName": "Hanuka",
        "dates": [{
            "start": "2020-12-11", 
            "end": "2020-12-18"
          }, {
            "start": "2021-11-29", 
            "end": "2021-12-06"
          }, {
            "start": "2022-12-19", 
            "end": "2022-12-26"
        }]
    }, {
        "id": 21,
        "holidayName": "August",
        "dates": [{
            "start": "2020-08-01",
            "end": "2020-08-31"
          }, {
            "start": "2021-08-01",
            "end": "2021-08-31"
          }, {
            "start": "2022-08-01",
            "end": "2022-08-31"
        }]
    }
];

const agreements = [{
        "agreementID": 4,
        "standard": [{
            "normal": 480
          }, {
            "day5": 480
          }, {
            "Purim": 420
          }, {
            "Hanuka": 360
        }] 
    }, {
        "agreementID": 6,
        "standard": [{
            "normal": 510
          }, {
            "day5": 480
          }, {
            "YomHazikaron": 330
          }, {
            "Purim": 420
          }, {
            "Hanuka": 390
        }]
    }, {
        "agreementID": 12,
        "standard": [{
            "normal": 450
          }, {
            "day5": 450
          }, {
            "YomHazikaron": 330
          }, {
            "Purim": 420
          }, {
            "Hanuka": 330
        }]
    }, {
        "agreementID": 16,
        "standard": [{
            "normal": 510
          }, {
            "day5": 480
          }, {
            "YomHazikaron": 330
          }, {
            "Purim": 420
          }, {
            "Hanuka": 390
          }, {
            "August": 450
        }]
    }
];

const users = [{
        "UserId": 3,
        "Badge": "2",
        "AgreementID": 6
    }, {
        "UserId": 6,
        "Badge": "133",
        "AgreementID": 6
    }, {
        "UserId": 7,
        "Badge": "131",
        "AgreementID": 16
    }, {
        "UserId": 8,
        "Badge": "136",
        "AgreementID": 6
    }, {
        "UserId": 9,
        "Badge": "127",
        "AgreementID": 16
    }, {
        "UserId": 11,
        "Badge": "301",
        "AgreementID": 16
    }, {
        "UserId": 12,
        "Badge": "135",
        "AgreementID": 6
    }, {
        "UserId": 13,
        "Badge": "128",
        "AgreementID": 4
    }, {
        "UserId": 14,
        "Badge": "132",
        "AgreementID": 6
    }, {
        "UserId": 15,
        "Badge": "130",
        "AgreementID": 6
    }, {
        "UserId": 17,
        "Badge": "134",
        "AgreementID": 6
    }, {
        "UserId": 18,
        "Badge": "303",
        "AgreementID": 6
    }, {
        "UserId": 19,
        "Badge": "205",
        "AgreementID": 6
    }, {
        "UserId": 20,
        "Badge": "202",
        "AgreementID": 16
    }, {
        "UserId": 21,
        "Badge": "68",
        "AgreementID": 4
    }, {
        "UserId": 22,
        "Badge": "13",
        "AgreementID": 12
    }, {
        "UserId": 23,
        "Badge": "17",
        "AgreementID": 16
    }, {
        "UserId": 24,
        "Badge": "22",
        "AgreementID": 16
    }, {
        "UserId": 25,
        "Badge": "28",
        "AgreementID": 16
    }, {
        "UserId": 26,
        "Badge": "29",
        "AgreementID": 16
    }, {
        "UserId": 27,
        "Badge": "92",
        "AgreementID": 16
    }, {
        "UserId": 28,
        "Badge": "60",
        "AgreementID": 6
    }, {
        "UserId": 29,
        "Badge": "85",
        "AgreementID": 6
    }, {
        "UserId": 30,
        "Badge": "69",
        "AgreementID": 16
    }, {
        "UserId": 31,
        "Badge": "83",
        "AgreementID": 6
    }, {
        "UserId": 32,
        "Badge": "73",
        "AgreementID": 16
    }, {
        "UserId": 33,
        "Badge": "74",
        "AgreementID": 4
    }, {
        "UserId": 34,
        "Badge": "78",
        "AgreementID": 4
    }, {
        "UserId": 35,
        "Badge": "84",
        "AgreementID": 16
    }, {
        "UserId": 36,
        "Badge": "47",
        "AgreementID": 16
    }, {
        "UserId": 37,
        "Badge": "80",
        "AgreementID": 6
    }, {
        "UserId": 38,
        "Badge": "26",
        "AgreementID": 16
    }, {
        "UserId": 39,
        "Badge": "91",
        "AgreementID": 6
    }, {
        "UserId": 40,
        "Badge": "89",
        "AgreementID": 6
    }, {
        "UserId": 41,
        "Badge": "90",
        "AgreementID": 6
    }, {
        "UserId": 43,
        "Badge": "201",
        "AgreementID": 6
    }, {
        "UserId": 44,
        "Badge": "70",
        "AgreementID": 6
    }, {
        "UserId": 45,
        "Badge": "307",
        "AgreementID": 16
    }, {
        "UserId": 48,
        "Badge": "321",
        "AgreementID": 6
    }, {
        "UserId": 49,
        "Badge": "324",
        "AgreementID": 6
    }, {
        "UserId": 52,
        "Badge": "349",
        "AgreementID": 4
    }, {
        "UserId": 53,
        "Badge": "360",
        "AgreementID": 16
    }, {
        "UserId": 54,
        "Badge": "344",
        "AgreementID": 6
    }, {
        "UserId": 55,
        "Badge": "346",
        "AgreementID": 4
    }, {
        "UserId": 56,
        "Badge": "343",
        "AgreementID": 6
    }, {
        "UserId": 57,
        "Badge": "341",
        "AgreementID": 6
    }, {
        "UserId": 59,
        "Badge": "79",
        "AgreementID": 16
    }, {
        "UserId": 60,
        "Badge": "347",
        "AgreementID": 16
    }, {
        "UserId": 61,
        "Badge": "348",
        "AgreementID": 6
    }, {
        "UserId": 62,
        "Badge": "342",
        "AgreementID": 6
    }, {
        "UserId": 63,
        "Badge": "322",
        "AgreementID": 6
    }, {
        "UserId": 64,
        "Badge": "990",
        "AgreementID": 6
    }, {
        "UserId": 65,
        "Badge": "362",
        "AgreementID": 16
    }, {
        "UserId": 66,
        "Badge": "364",
        "AgreementID": 4
    }, {
        "UserId": 67,
        "Badge": "177",
        "AgreementID": 6
    }, {
        "UserId": 68,
        "Badge": "323",
        "AgreementID": 6
    }, {
        "UserId": 70,
        "Badge": "9",
        "AgreementID": 6
    }, {
        "UserId": 72,
        "Badge": "370",
        "AgreementID": 6
    }, {
        "UserId": 73,
        "Badge": "376",
        "AgreementID": 16
    }, {
        "UserId": 74,
        "Badge": "375",
        "AgreementID": 6
    }, {
        "UserId": 75,
        "Badge": "377",
        "AgreementID": 6
    }, {
        "UserId": 76,
        "Badge": "40",
        "AgreementID": 6
    }, {
        "UserId": 77,
        "Badge": "382",
        "AgreementID": 16
    }, {
        "UserId": 78,
        "Badge": "385",
        "AgreementID": 4
    }, {
        "UserId": 79,
        "Badge": "386",
        "AgreementID": 4
    }, {
        "UserId": 80,
        "Badge": "392",
        "AgreementID": 6
    }, {
        "UserId": 81,
        "Badge": "387",
        "AgreementID": 6
    }, {
        "UserId": 82,
        "Badge": "391",
        "AgreementID": 6
    }, {
        "UserId": 83,
        "Badge": "393",
        "AgreementID": 6
    }, {
        "UserId": 84,
        "Badge": "388",
        "AgreementID": 16
    }, {
        "UserId": 85,
        "Badge": "394",
        "AgreementID": 16
    }, {
        "UserId": 86,
        "Badge": "396",
        "AgreementID": 16
    }, {
        "UserId": 87,
        "Badge": "397",
        "AgreementID": 16
    }, {
        "UserId": 88,
        "Badge": "0",
        "AgreementID": 6
    }, {
        "UserId": 89,
        "Badge": "398",
        "AgreementID": 4
    }, {
        "UserId": 90,
        "Badge": "436",
        "AgreementID": 6
    }, {
        "UserId": 91,
        "Badge": "399",
        "AgreementID": 6
    }, {
        "UserId": 92,
        "Badge": "402",
        "AgreementID": 6
    }, {
        "UserId": 95,
        "Badge": "407",
        "AgreementID": 6
    }, {
        "UserId": 97,
        "Badge": "470",
        "AgreementID": 6
    }, {
        "UserId": 100,
        "Badge": "417",
        "AgreementID": 6
    }, {
        "UserId": 102,
        "Badge": "418",
        "AgreementID": 6
    }, {
        "UserId": 108,
        "Badge": "421",
        "AgreementID": 4
    }, {
        "UserId": 109,
        "Badge": "423",
        "AgreementID": 16
    }, {
        "UserId": 110,
        "Badge": "422",
        "AgreementID": 6
    }, {
        "UserId": 112,
        "Badge": "426",
        "AgreementID": 4
    }, {
        "UserId": 113,
        "Badge": "425",
        "AgreementID": 6
    }, {
        "UserId": 114,
        "Badge": "428",
        "AgreementID": 6
    }, {
        "UserId": 115,
        "Badge": "429",
        "AgreementID": 6
    }, {
        "UserId": 116,
        "Badge": "426",
        "AgreementID": 4
    }, {
        "UserId": 117,
        "Badge": "432",
        "AgreementID": 4
    }, {
        "UserId": 122,
        "Badge": "434",
        "AgreementID": 6
    }, {
        "UserId": 125,
        "Badge": "441",
        "AgreementID": 6
    }, {
        "UserId": 126,
        "Badge": "442",
        "AgreementID": 6
    }, {
        "UserId": 128,
        "Badge": "443",
        "AgreementID": 16
    }, {
        "UserId": 129,
        "Badge": "444",
        "AgreementID": 16
    }, {
        "UserId": 130,
        "Badge": "446",
        "AgreementID": 6
    }, {
        "UserId": 131,
        "Badge": "445",
        "AgreementID": 16
    }, {
        "UserId": 132,
        "Badge": "447",
        "AgreementID": 6
    }, {
        "UserId": 134,
        "Badge": "448",
        "AgreementID": 16
    }, {
        "UserId": 135,
        "Badge": "383",
        "AgreementID": 16
    }, {
        "UserId": 136,
        "Badge": "450",
        "AgreementID": 16
    }, {
        "UserId": 137,
        "Badge": "449",
        "AgreementID": 4
    }, {
        "UserId": 138,
        "Badge": "451",
        "AgreementID": 16
    }, {
        "UserId": 141,
        "Badge": "458",
        "AgreementID": 4
    }, {
        "UserId": 142,
        "Badge": "457",
        "AgreementID": 4
    }, {
        "UserId": 143,
        "Badge": "459",
        "AgreementID": 16
    }, {
        "UserId": 146,
        "Badge": "551",
        "AgreementID": 16
    }, {
        "UserId": 147,
        "Badge": "552",
        "AgreementID": 16
    }, {
        "UserId": 148,
        "Badge": "553",
        "AgreementID": 4
    }, {
        "UserId": 149,
        "Badge": "554",
        "AgreementID": 16
    }, {
        "UserId": 152,
        "Badge": "515",
        "AgreementID": 6
    }, {
        "UserId": 153,
        "Badge": "555",
        "AgreementID": 16
    }, {
        "UserId": 154,
        "Badge": "556",
        "AgreementID": 4
    }, {
        "UserId": 156,
        "Badge": "558",
        "AgreementID": 16
    }, {
        "UserId": 157,
        "Badge": "559",
        "AgreementID": 16
    }, {
        "UserId": 158,
        "Badge": "507",
        "AgreementID": 16
    }, {
        "UserId": 159,
        "Badge": "561",
        "AgreementID": 16
    }, {
        "UserId": 160,
        "Badge": "563",
        "AgreementID": 16
    }, {
        "UserId": 162,
        "Badge": "568",
        "AgreementID": 16
    }, {
        "UserId": 163,
        "Badge": "566",
        "AgreementID": 16
    }, {
        "UserId": 164,
        "Badge": "567",
        "AgreementID": 16
    }, {
        "UserId": 166,
        "Badge": "569",
        "AgreementID": 6
    }, {
        "UserId": 167,
        "Badge": "571",
        "AgreementID": 6
    }, {
        "UserId": 168,
        "Badge": "570",
        "AgreementID": 6
    }, {
        "UserId": 169,
        "Badge": "573",
        "AgreementID": 6
    }, {
        "UserId": 170,
        "Badge": "572",
        "AgreementID": 6
    }, {
        "UserId": 172,
        "Badge": "574",
        "AgreementID": 6
    }, {
        "UserId": 173,
        "Badge": "575",
        "AgreementID": 6
    }, {
        "UserId": 178,
        "Badge": "550",
        "AgreementID": 6
    }, {
        "UserId": 186,
        "Badge": "576",
        "AgreementID": 16
    }, {
        "UserId": 187,
        "Badge": "577",
        "AgreementID": 16
    }, {
        "UserId": 190,
        "Badge": "580",
        "AgreementID": 6
    }, {
        "UserId": 192,
        "Badge": "581",
        "AgreementID": 6
    }, {
        "UserId": 197,
        "Badge": "578",
        "AgreementID": 6
    }, {
        "UserId": 198,
        "Badge": "579",
        "AgreementID": 6
    }
];
