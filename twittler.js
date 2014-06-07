      window.twittler = {};

      twittler.container = "#tweets";
      twittler.tweets = [];
      twittler.fetch = function(user) {

        if (!user) {
          this.tweets = streams.home;
        } else {
          this.tweets = streams.users[user];
        }

        return this;
      };
      twittler.processId = null;
      twittler.listen = function() {
        var self = this;
        var startlen = self.tweets.length;
        var tweetcount;
        var intervalId

        if (self.processId) {
          clearInterval(self.processId);
        }

        intervalId = setInterval(listener, 300);

        function listener() {
          if (self.tweets.length > startlen) {
            tweetcount = self.tweets.length - startlen;
            updateNewTweetCount(tweetcount);
          }
        }

        function updateNewTweetCount(count) {
          var newtweets = $('#new-tweets');
          newtweets.text(count + ' new tweets');
        }

        this.processId = intervalId;
      };

      twittler.display = function(tweets) {
        var $tweet;
        var message;

        tweets = tweets || this.tweets;

        window.twt = tweets;

        $("#tweets").html(''); // clear

        for (var i = 0, len = tweets.length; i < len; i+=1) {
          $tweet = $('<div class="tweet"></div>');
          message = formatmsg(tweets[i].message);

          $tweet.append('<span class="username"> @' + tweets[i].user + '</span>: ' + '<span class="message">' + message+ '</span>' + '<span class="timestamp"> —' + $.timeago(tweets[i].created_at) + '</span>');
          $tweet.appendTo(this.container);
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

        return this;
      };

      twittler.initEventHandlers = function() {
        var self = this;

        // load tweets for specific user when username is clicked
        $(".username").click( function(e){
          e.preventDefault();
          var username = e.currentTarget.outerText.replace("@", "");
          self.fetch(username).display();
        });

        $("#new-tweets").click( function(e){
          e.preventDefault();
          self.fetch().display().listen();
        });
      };