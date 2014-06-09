      window.twittler = {};

      twittler.tweets = [];

      twittler.container = {
        tweets: "#tweets",
        newTweets: "#new-tweets"
      };

      twittler.view = 'home';

      twittler.newTweetCount = null;

      twittler.intervalId = null;

      twittler.writeTweet = function(msg) {
        msg = msg || $('#message').val();

        if (msg && msg !== '') {
          writeTweet(msg);
          $('#message').val(''); // clear input
          this.fetch(this.view).display().listen(); // refresh tweets
        }
      };

      twittler.fetch = function(view) {
        if (!view || view === 'home') {
          this.tweets = streams.home;
        } else if (view.indexOf('#') > -1) {
          this.tweets = streams.home.filter( function(tweet) {
            return tweet.message.indexOf(view) > 1;
          });
        } else {
          this.tweets = streams.users[view];
        }

        return this;
      };

      twittler.display = function(tweets) {
        var $tweet;
        var message;

        tweets = tweets || this.tweets;

        $("#tweets").html(''); // clear container

        for (var i = 0, len = tweets.length; i < len; i+=1) {
          $tweet = $('<div class="tweet"></div>');
          message = formatmsg(tweets[i].message);
          $tweet.append('<span class="username"> @' + tweets[i].user + '</span>: ' + '<span class="message">' + message+ '</span>' + '<span class="timestamp"> —' + $.timeago(tweets[i].created_at) + '</span>');
          $tweet.appendTo(this.container.tweets);
        }

        function formatmsg(msg) {
          var formattedmsg;
          var hashtagIndex;
          var hashtag;
          var begin;
          var end;

          hashtagIndex = msg.indexOf('#');

          if (hashtagIndex > -1) {
            begin = hashtagIndex;
            for (var i = hashtagIndex; i < msg.length; i++) {
               if (msg[i] === ' ') {
                  end = i;
                  break;
               }
            }
            formattedmsg = msg.slice(0, begin) + '<span class="hashtag">' + msg.slice(begin, end) + '</span>';
          }

          return formattedmsg || msg;
        }

        this.initEventHandlers();

        return this;
      };

      twittler.listen = function() {
        var self = this;
        var startlen = self.tweets.length;
        var intervalId;

        // if an old interval loop exists, kill it
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

      twittler.initEventHandlers = function() {
        var self = this;

        // submit new tweet on Enter keypress
        $("input").unbind('keypress').keypress(function(e) { // need to unbind keypress and bind again otherwise input is submitted multiple times.. more info: http://webroxtar.com/2011/10/solution-jquery-click-event-gets-called-twice-fires-twice/
            if (e.which === 13) {
              e.preventDefault();
              self.writeTweet(); 
              return false;
            }
            return true;
            
        });

        $('#submittweet').click( function(e) {
          e.preventDefault();
          self.writeTweet(); 
        });

        // load tweets for specific user when username is clicked
        $(".username").click( function(e){
          e.preventDefault();
          var username = e.currentTarget.outerText.replace("@", "");

          self.view = username;
          self.fetch(username).display().listen();
          $('#viewall').css('display', 'inline-block'); //show "view all" link to go back
        });

        $(".hashtag").click( function(e){
          e.preventDefault();
          var hashtag = e.currentTarget.outerText;
          self.view = hashtag;
          self.fetch(hashtag).display().listen();
          $('#viewall').css('display', 'inline-block'); //show "view all" link to go back
        });

        // load new tweets when clicked
        $("#new-tweets").click( function(e){
          e.preventDefault();
          $('#new-tweets').text('');
          self.fetch(self.view).display().listen();
        });

        // load all tweets when clicked
        $('#viewall').click( function(e) {
          e.preventDefault();
          self.view = 'home';
          self.fetch(self.view).display().listen();
          $('#viewall').hide();
        });

      };