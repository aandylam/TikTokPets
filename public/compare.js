let videoElmts = document.getElementsByClassName("tiktokDiv");

let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.unloved");
let redButtons = document.querySelectorAll("div.loved");

let continueButton = document.getElementById("continuebutton");
continueButton.addEventListener("click", buttonAction);


for(let i = 0; i < 2; i++) {
  let heart = heartButtons[i];
  heart.addEventListener("click", function() {
    makeRedHeart(i)
  });
}

for (let i=0; i<2; i++) {
  let reload = reloadButtons[i]; 
  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
} // for loop

// hard-code videos for now
// You will need to get pairs of videos from the server to play the game.
const urls = [];
const videos =[];
sendGetRequest('/getTwoVideos')
.then(function(response) {
  console.log(response);
  // const urls = [response[0].url, response[1].url];
  urls[0] = response[0].url;
  urls[1] = response[1].url;
  videos[0] = response[0];
  videos[1] = response[1];
  for(let i = 0; i<2; i++) {
    addVideo(urls[i], videoElmts[i]);
  }
  loadTheVideos();
})
.catch(function(err) {
  console.log("GET request error", err);
});

console.log(urls);
console.log(videos);

async function sendGetRequest(url) {
  console.log("checking");
  let response = await fetch(url);
  if(response.ok) {
    let data = await response.json();
    return data;
  } else {
    throw Error(response.status);
  }
}

function makeRedHeart(i) {
  heartButtons[i].style.display = "none";
  redButtons[i].style.display = "inline";
}

async function sendPostRequest(url, data) {
  params = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: data };
  console.log("about to send post request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}
function buttonAction() {
    let vidOne = videos[0].rowIdNum;
    let vidTwo = videos[1].rowIdNum;
    let obj;
    if(redButtons[0].style.display == "inline") {
      obj = {
        "better": vidOne,
        "worse": vidTwo
      };
    } else if(redButtons[1].style.display == "inline") {
      obj = {
        "better": vidTwo,
        "worse": vidOne
      };
    }
    console.log(obj);
    let data = JSON.stringify(obj);
    sendPostRequest("/insertPref", data)
    .then(function(response) {
      console.log("received response");
      if(response.localeCompare("pick winner")) {
        window.location = "winner.html";
      } else {
        window.location = "compare.html";
      }
    })
    .catch(function(error) {console.log("POST error", error)});
}