var twitter_oauth = (function(exports){

var OAuth  = oauth.OAuth;

function getOA (key, secret, oauth_callback_url) {
  return new OAuth("https://api.twitter.com/oauth/request_token",
                    "https://api.twitter.com/oauth/access_token",
                    key,
                    secret,
                    "1.0",
                    oauth_callback_url,
                    "HMAC-SHA1");
}


exports.reuse = function (key, secret, reuse_oauth_token, cb) {
  cb(null, function (url, method, cb, postbody) {
    var oa = getOA(key, secret, null);
    var request = oa[method.toLowerCase()](url, localStorage.oauth_access_token, localStorage.oauth_access_token_secret, postbody)
    cb(null, request);
  }, doc.results);
}

/*
 * Initial request calls callback with cb(error, authURL, continueFunction)
 * Send the user to String, if he never allowed the application
 * cont takes a callback with the sig(error, request, response)
 */

exports.request = function (key, secret, oauth_callback_url, cb) {
  var oa = getOA(key, secret, oauth_callback_url);
  
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error) cb('error :' + JSON.stringify(error))
    else { 
      console.log('oauth_token :' + oauth_token)
      console.log('oauth_token_secret :' + oauth_token_secret)
      console.log('requestoken results :' ,(results))
      console.log("Requesting access token")
      console.log("http://api.twitter.com/oauth/authorize?oauth_token="+oauth_token);
      
      var cont = function (oauth_token_verifier, cb) {
        oa.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_token_verifier, function(error, oauth_access_token, oauth_access_token_secret, results2) {
          if(error) {
            cb("Request Error "+JSON.stringify(error))
          } else {
            console.log('oauth_access_token :' + oauth_access_token)
            console.log('oauth_token_secret :' + oauth_access_token_secret)
            console.log('accesstoken results :' ,(results2))
            console.log("Requesting access token")
            var data= "";
            
						localStorage.oauth_access_token = oauth_access_token;
						localStorage.oauth_access_token_secret = oauth_access_token_secret;
						localStorage.results = results2;

            cb(null, function (url, method, cb) {
              var request = oa[method.toLowerCase()](url, oauth_access_token, oauth_access_token_secret)
              cb(null, request);
            }, results2);
          }
        });
      };
      
      cb(null, oauth_token, "http://api.twitter.com/oauth/authorize?oauth_token="+oauth_token, cont)
    }
  })
}

return exports;
})({});