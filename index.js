'use strict'
// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");

// local modules
const db = require("./sqlWrap");
const win = require("./pickWinner");


// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');


/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


/* start of code run on start-up */
// create object to interface with express
const app = express();

// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/compare.html");
});

// Get JSON out of HTTP request body, JSON.parse, and put object into req.body
app.use(bodyParser.json());

app.get("/getTwoVideos", function(req, res) {
  console.log("Picking two videos");
  let video1 = 0;
  let video2 = 0;
  while(video1 == video2) {
    video1 = getRandomInt(7);
    video2 = getRandomInt(7);
  }
  console.log(video1);
  console.log(video2);
  getTwoVideos(video1, video2)
  .then(function(result) {
    return res.json(result);
  })
  .catch(function(err) {console.log("SQL error", err)});
})

app.post("/insertPref", (req, res) => {
  console.log("sending response");
  let vidObj = req.body;
  insertPref(vidObj)
  .then(function(response) {
    console.log(response);
    if(response == -1) {
      return res.json("pick winner");
    } else {
      return res.json("continue");
    }
  })
  .catch(function(err) {console.log("DB error", err)});
});


app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
  // change parameter to "true" to get it to computer real winner based on PrefTable 
  // with parameter="false", it uses fake preferences data and gets a random result.
  // winner should contain the rowId of the winning video.
  let winner = await win.computeWinner(8,false);
  let videoInfo = await db.all('select * from VideoTable where rowIdNum = '+winner);
  res.send(videoInfo);
  } catch(err) {
    res.status(500).send(err);
  }
});

app.get("/getList", (req,res) => {
  console.log("received request");
  dumpTable()
  .then(function(result) {
    return res.json(result);
  })
  .catch(function(err) {console.log("SQL error", err)});
})


// Page not found
app.use(function(req, res){
  res.status(404); 
  res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});


// an async function to get the whole contents of the database 
async function getTwoVideos(num1, num2) {
  console.log("getting two videos");
  const tableContents = await dumpTable();
  console.log(tableContents);
  const videoArray = [tableContents[num1], tableContents[num2]];
  return videoArray;
}

async function dumpTable() {
  const sql = "select * from VideoTable"
  
  let result = await db.all(sql)
  return result;
}

async function insertPref(obj) {
  const sql = "insert into PrefTable (better, worse) values (?, ?)";
  await db.run(sql, [obj.better, obj.worse]);
  let contents = await db.all("select * from PrefTable");
  console.log(contents.length);
  if(contents.length >= 15) {
    return -1;
  }
}

