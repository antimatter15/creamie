require.def("stream/client",
  ["stream/tweetstream", "stream/tweet"], // socket.io is loaded from the page
  function(tweetstream, tweetModule) {
    
    function connect (cb) {
	    //todo: chrome transport

	    
      var port = chrome.extension.connect({name: "stream"});
      port.onMessage.addListener(function(msg) {
        cb(msg)
      });


      return {};
    }
    
    return {
      connect: connect
    }
  }
);
