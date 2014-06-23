  ( function (exports) {

  var app = {};
  app.visitor = exports.visitor;
  app.view = 'home';
  app.tweets = [];
  app.container = {
    tweets: "#tweets",
    newTweets: "#new-tweets"
  };
  app.newTweetCount = null;
  app.intervalId = null;

  app.init = function () {
    this.fetch().display().listen();
  };

  app.setVisitor = function () {
    var username = $('#username').val();

    if (username && username !== '') {
      exports.visitor = username;
      $('#username').val(''); // clear input
      $('#username').css('display', 'none'); 
      $('.enter-username').css('display', 'none'); 
      $('.create-tweet').css('display', 'block'); 
      $('#message').focus();
    }
  };

  app.fetch = function (view) {
    if (!view || view === 'home') {
      this.tweets = streams.home; // all tweets
    } else if (view.indexOf('#') > -1) {
      this.tweets = streams.hashtags[view]; // all tweets containing specific hashtag
    } else {
      this.tweets = streams.users[view]; // all tweets for a user
    }

    return this;
  };

  app.display = function (tweets) {
    var $tweet;
    var message;

    tweets = tweets || this.tweets;

    $("#tweets").html(''); 

    for (var i = 0, len = tweets.length; i < len; i+=1) {
      $tweet = $('<div class="tweet swell"></div>');
      message = formatmsg(tweets[i].message);
      $tweet.append( '<span class="username"> @' + tweets[i].user + '</span>: ' + '<span class="message">' + message+ '</span>' + '<span class="timestamp"> —' + $.timeago(tweets[i].created_at) + '</span>');
      $tweet.appendTo(this.container.tweets);
    }

    function formatmsg(msg) {
      var formattedmsg = '';
      var hashtag;
      var end;
      // scan each character of the tweet. format hashtag if "#"" is encountered.
      for (var i = 0, len = msg.length; i < len; i++) {
        if (msg[i] === "#") {
          hashtag = parseHashtag(i);
          formattedmsg += hashtag;
          i = end ; // jump the index to the ending position of the hashtag
        } else { 
          formattedmsg += msg[i];
        }
      }

      function parseHashtag(start) {
        var nextch;
        // get the ending index of the hashtag
        for (var i = start; i < msg.length; i++) {
          nextch = i + 1;
          if (!msg[nextch] || msg[nextch] === ' '){
            end = nextch;
            break;
          }
        }

        return ' <span class="hashtag">' + msg.slice(start, end) + '</span> ';
      }

      return formattedmsg;
    }

    this.initEventHandlers();

    $("html, body").scrollTop(0); // jump back to top of page when tweets are displayed

    return this;
  };

  app.listen = function () {
    var self = this;
    var startlen = self.tweets.length;
    var intervalId;

    // if an existing interval loop is running, kill it
    if (self.intervalId) {
      $(self.container.newTweets).text(''); //clear tweet counter
      clearInterval(self.intervalId); // kill previous interval loop
    }

    // begin listening for changes
    self.intervalId = setInterval(listener, 300); 

    function listener() {
      if (self.tweets.length > startlen) {
        self.newTweetCount = self.tweets.length - startlen;
        updateNewTweetCount(self.newTweetCount);
      }
    }

    function updateNewTweetCount(count) {
      $(self.container.newTweets).text(count + ' new tweets');
    }
  };

  app.writeTweet = function (msg) {
    msg = msg || $('#message').val();

    if (msg && msg !== '') {
      writeTweet(msg); // function from data_generator.js
      $('#message').val(''); // clear input field
      this.fetch(this.view).display().listen(); // refresh tweets
      $("html, body").animate({ scrollTop: 0 }, "fast"); // scroll back to top
    }
  };

  app.initEventHandlers = function () {
    var self = this;

    // submit new tweet on Enter keypress
    $("input").unbind('keypress').keypress(function(e) { // need to unbind keypress and bind again otherwise input is submitted multiple times.. more info: http://webroxtar.com/2011/10/solution-jquery-click-event-gets-called-twice-fires-twice/
      if (e.which === 13) {
        e.preventDefault();

        if (e.target.id === 'username') {
          self.setVisitor();
        } else {
          self.writeTweet();             
        }

        return false;
      }
      return true;
    });

    // load tweets for specific user when username is clicked
    $(".username").click( function (e){
      e.preventDefault();
      var username = e.currentTarget.outerText.replace("@", "");
      self.view = username;
      self.fetch(username).display().listen();
      $('#viewall').css('display', 'inline-block'); //show "view all" link to go back
    });

    // view all tweets for a specific hashtag
    $(".hashtag").click( function (e){
      e.preventDefault();
      var hashtag = e.currentTarget.outerText;
      self.view = hashtag;
      self.fetch(hashtag).display().listen();
      $('#viewall').css('display', 'inline-block'); //show "view all" link to go back
    });

    // load new tweets when clicked
    $("#new-tweets").click( function (e){
      e.preventDefault();
      $('#new-tweets').text('');
      self.fetch(self.view).display().listen();
    });

    // load all tweets when clicked
    $('#viewall').click( function (e) {
      e.preventDefault();
      self.view = 'home';
      self.fetch(self.view).display().listen();
      $('#viewall').hide();
    });
  };

  exports.twittler = app;

} )(window);
