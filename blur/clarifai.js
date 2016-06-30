function getCredentials(cb) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('accessToken', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl) {
  var data = {
    'url': imgurl
  };
  var accessToken = localStorage.getItem('accessToken');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag?model=nsfw-v0.1&url=' + imgurl,
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'data': data,
    'type': 'GET'
  }).then(function(r){
    parseResponse(r, imgurl);
  });
}

function parseResponse(resp, imgurl) {
  var probs = []; //edited here
  if (resp.status_code === 'OK') {
    var results = resp.results;
    probs = results[0].result.tag.classes;
    if(probs[0] < probs[1]){
      $('#images').append('<img class="sfw" src="'+imgurl+'">');
    }else{
      $('#images').append('<img class="nsfw" src="'+imgurl+'">');
    }
  } else {
    console.log('Sorry, something is wrong.');
  }
}

function run(imgurl) {
  if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
    || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      postImage(imgurl);
    });
  } else {
    postImage(imgurl);
  }
}
