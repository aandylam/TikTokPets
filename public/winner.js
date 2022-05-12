// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");

let reloadButton = document.getElementById("reload");

// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});



// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.
sendGetRequest("/getWinner")
.then(function(response) {
  console.log(response);
  showWinningVideo(response[0].url);
  document.getElementById("videoName").textContent = response[0].nickname;
})
.catch(function(err) {console.log("GET request error", err)});

function showWinningVideo(url) {
  
  let winningUrl = url;
  addVideo(winningUrl, divElmt);
  loadTheVideos();
  
}

async function sendGetRequest(url) {
  params = {
    method: 'GET', 
     };
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.json();
    return data;
  } else {
    throw Error(response.status);
  }
}