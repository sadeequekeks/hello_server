const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { parse } = require("csv-parse");

const csvArr = [];

const bl = ["Tailoring", "Vegetable", "Fruit", "Barrow Pusher", "Shoemaking"];

start();

async function start() {
  try {
    let filename = null;
    if (process.argv.length == 3) {
      filename = process.argv[2];
    }
    if (filename) {
      await readAll("./hello.csv");
      transformBVN();
      transformAccountNo();
      transformPhone();
      writeCsv("./out/hello.csv", csvArr);
    }
  } catch (err) {
    console.log(err);
  }
}

function readAll(filename) {
  return new Promise((resolve, reject) => {
    let count = 0;
    fs.createReadStream(filename)
      .pipe(parse({ delimeter: ",", columns: true }))
      .on("data", (row) => {
        if (row.Gender.startsWith("F")) row.Gender = "female";
        if (row.Gender.startsWith("M")) row.Gender = "male";
        row.State = "KADUNA";
        row.Additional_investment_needed = "true";
        row.Business_Value = naira();
        row.Business_type = "Trade";
        row.Business_line =
          bl[Math.abs(Math.ceil(Math.random() * bl.length - 1))];
        csvArr.push(row);
        count++;
      })
      .on("end", () => {
        console.log(`Done Reading ${count} Records from CSV !!!`);
        resolve(true);
      })
      .on("error", (err) => {
        console.log("ERROR >> ", err.message);
        reject(err.message);
      });
  });
}

function writeCsv(filename, arr) {
  const writer = createCsvWriter({
    path: filename,
    header: [
      { id: "S/No", title: "S/No" },
      { id: "Surname", title: "Surname" },
      { id: "Other_names", title: "Other_names" },
      { id: "Phone_number", title: "Phone_number" },
      { id: "BVN", title: "BVN" },
      { id: "Account_name", title: "Account_name" },
      { id: "Account_number", title: "Account_number" },
      { id: "Bank", title: "Bank" },
      { id: "Residential_address", title: "Residential_address" },
      { id: "Gender", title: "Gender" },
      { id: "Disabled", title: "Disabled" },
      { id: "State", title: "State" },
      { id: "Business_name", title: "Business_name" },
      {
        id: "Additional_investment_needed",
        title: "Additional_investment_needed",
      },
      { id: "Business_type", title: "Business_type" },
      { id: "Business_line", title: "Business_line" },
      { id: "Business_Value", title: "Business_Value" },
      { id: "LGA", title: "LGA" },
    ],
  });

  writer.writeRecords(arr).then(() => {
    console.log("Done Writting Records!");
  });
}

function checkBank() {
  csvArr.forEach((obj) => {});
}

function transformPhone() {
  const badPhone = [];
  for (let i = 0; i < csvArr.length; i++) {
    let obj = csvArr[i];
    obj.Phone_number = obj.Phone_number.trim() + "";
    if (obj.Phone_number.length < 9) {
      badPhone.push(obj);
      csvArr.splice(i, 1);
    } else if (obj.Phone_number.startsWith("+234")) {
      obj.Phone_number = `'${obj.Phone_number}`;
    } else if (obj.Phone_number.length == 10) {
      obj.Phone_number = `'+234${obj.Phone_number}`;
    } else if (obj.Phone_number.startsWith("0")) {
      obj.Phone_number = `'+234${obj.Phone_number.substring(1)}`;
    } else {
      obj.Phone_number = `'+234${obj.Phone_number}`;
    }
  }
  if (badPhone.length > 0) {
    console.log(
      `WRITTING ${badPhone.length} RECORDS WITH BAD PHONE NUMBERS ...`
    );
    writeCsv("./out/bad-phone.csv", badPhone);
  }
}

function transformBVN() {
  const badBVN = [];
  for (let i = 0; i < csvArr.length; i++) {
    let obj = csvArr[i];
    obj.BVN = obj.BVN.trim() + "";
    if (obj.BVN.length != 11) {
      badBVN.push(obj);
      csvArr.splice(i, 1);
    }
  }
  if (badBVN.length > 0) {
    console.log(`WRITTING ${badBVN.length} RECORDS WITH BAD BVN NUMBERS ...`);
    writeCsv("./out/bad-bvn.csv", badBVN);
  }
}

function transformAccountNo() {
  const badAC = [];
  for (let i = 0; i < csvArr.length; i++) {
    let obj = csvArr[i];
    obj.Account_number = obj.Account_number.trim() + "";
    if (obj.Account_number.length == 10) {
      if (obj.Account_number.startsWith("0")) {
        csvArr[i].Account_number = `'${obj.Account_number}`;
      }
    } else {
      badAC.push(obj);
      csvArr.splice(i, 1);
    }
  }
  if (badAC.length > 0) {
    console.log(
      `WRITTING ${badAC.length} RECORDS WITH BAD ACCOUNT NUMBERS ...`
    );
    writeCsv("./out/bad-account.csv", badAC);
  }
}

function naira(min = 50000, max = 500000) {
  let ret = "";
  let difference = max - min;
  let rand = Math.random();
  rand = Math.floor(rand * difference);
  rand = rand + min;
  rand = rand.toString();
  for (let i = 0; i < rand.length; i++) {
    if (i < 3) {
      ret = ret + rand[i];
    } else {
      ret = ret + "0";
    }
  }
  return ret;
}