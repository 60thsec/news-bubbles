'use strict';

var NB = NB || {};

NB.Comments = (function() {
  var Comments = {};


  function parseRdComments(commentTree, cb) {
    var $result = $('<div>')
//       , result
      , level = 0
      , author
      , timeAgo
      , score
//       , commentBody
    ;

    function getChildren(arr) {
      level++;
      var $children = $('<ul class="comment-list level-' + level + '">');

      arr.forEach(function(commentObj) {
        var $child = $('<li class="comment-list-item">');
        if (commentObj.kind === 'more') {
          //TODO, maybe really handle 'more'
        } else {
          author = commentObj.data.author;
          timeAgo = moment(commentObj.data.created_utc * 1000).fromNow();
          score = commentObj.data.score + ' points';

          var bodyHtml = $('<textarea>').html(commentObj.data.body_html).text();
          var $commentBody = $('<div class="comment-list-item-text body"></div>');
          $commentBody.append(bodyHtml);
          $child.append($commentBody);
          $child.append('<p class="comment-list-item-text meta"> ' + author + ' | ' + timeAgo + ' | ' + score + '</p>');

          if (commentObj.data.replies && commentObj.data.replies.data && commentObj.data.replies.data.children.length) {
            $child.append(getChildren(commentObj.data.replies.data.children));
          }
        }

        $children.append($child);
      });
      
      level--;
      return $children;
    }

    var story = commentTree[0].data.children[0].data;
    var selfText = $('<textarea>').html(story.selftext_html).text();
    if (selfText) {
      $result.append(selfText);
      $result.append('<h3>Comments</h3>');
      $result.append('<hr>');
    } else {
      $result.append('<p class="comment-list-title">To contibute your own wisdom to the conversation, head on over to <a href="' + story.url + '" target="_blank">reddit</a>.</p><hr>');
    }
    $result.append(getChildren(commentTree[1].data.children));

    cb($result);
  }


  function parseHnComments(story, comments, cb) {
    var $result = $('<ul class="comment-list level-1"></ul>');
    var sourceUrl = 'https://news.ycombinator.com/item?id=' + story.sourceId;


    if (story.hn.storyText) {
      $result.append(story.hn.storyText);
      $result.append('<h3>Comments</h3>');
      $result.append('<hr>');
    }
    var html = [
      '<p class="comment-list-title">Head on over to ',
        '<a href="' + sourceUrl + '" target="_blank">Hacker News</a> to add yours.',
      '</p><hr>'
    ].join('');
    $result.append(html);

    comments.hits.forEach(function(comment) {
      var $child = $('<li class="comment-list-item">');
      var author = comment.author;
      var timeAgo = moment(comment.created_at_i * 1000).fromNow();
      var points = comment.points + ' points';

      $child.append('<div class="comment-list-item-text body">' + comment.comment_text + '</div>');
      $child.append('<p class="comment-list-item-text meta"> ' + author + ' | ' + timeAgo + ' | ' + points + '</p>');

      $result.append($child);
    });

    html = $result[0].outerHTML;
    cb(html);
  }



  /*  --  PUBLIC  --  */

  Comments.getForRdStory = function(storyId, cb) {
    var url = 'http://www.reddit.com/comments/' + storyId + '.json';

    $.get(url, function(data) {
      parseRdComments(data, cb);
    });

  };

  Comments.getForHnStory = function(story, cb) {
    var url = 'https://hn.algolia.com/api/v1/search?tags=comment,story_' + story.sourceId;

    $.get(url, function(comments) {
      parseHnComments(story, comments, cb);
    });

  };

  return Comments;
  
})();
