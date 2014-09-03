'use strict';
var NB = NB || {};

NB.Data = (function() {
  var Data = {};

  var store = {}
    // , stories = []
//     , nextPage = 0
    , hitsPerPage = 20
    , pageLimit = 1
    , readList = []
    , timer
    , storyStore
    , stories = []
    , socket
  ;

  if (localStorage.readList) {
    readList = JSON.parse(localStorage.readList);
  }

  function saveData(data) {
//     console.log('saveData() - count:', data.length);
    localStorage.stories = JSON.stringify(data);
    NB.Data.stories = data;
  }

  function sortBy(arr, key) {
    key = key || 'commentCount';
    arr.sort(function(a, b) {
      return b[key] - a[key];
    });
  }

  //parse HN data that came straight from the HN API
//   function parseHNRawStoryData(data) {
//     data.forEach(function(d) {
//       var jsDate = new Date(d.created_at);
//       d.postDate = jsDate;
//       var commentCount = d.num_comments; //TODO one row?
//       d.commentCount = commentCount;
//       d.name = d.title;
//       d.score = d.points;
//       d.id = 'hn-' + d.objectID;
//       d.sourceId = d.objectID;
//       d.source = 'hn';
//     });
//     sortBy(data, 'commentCount');
//     return data;
//   }

//   function parseRedditData(data) {
//     data.forEach(function(d) {
//       var jsDate = new Date(d.data.created * 1000);
//       d.postDate = jsDate;
//       var commentCount = d.data.num_comments; //TODO one row?
//       d.commentCount = commentCount;
//       d.score = d.data.score;
//       d.id = 'rd-' + d.data.name;
//       d.sourceId = d.data.name;
//       d.source = 'rd';
//       d.name = d.data.title;
//       d.url = d.data.url;
//       d.author = d.data.author;
//       d.thumb = d.data.thumbnail;
//     });
//     sortBy(data, 'commentCount');
//     console.log('parsed reddit data:', data);
//     return data;
//   }

  function mergeStories(delta) {
    delta.forEach(function(d) {
      var existing = Data.stories.filter(function(existingStory) {
        return existingStory.id === d.id;
      })[0];
      if (existing) {
        existing.commentCount = d.commentCount;
        existing.score = d.score;
      } else {
        if (d.postDate > NB.oldestStory) { //I don't want to add stories that are older than what's on the chart
          Data.stories.push(d);
        }
        
      }
    });
  }

  //parse story data
  function parseStoryData(data, captureOldest) {
    data.forEach(function(d) {
//       var jsDate = new Date(d.postDate);
      d.postDate = new Date(d.postDate);
    });
    sortBy(data, 'commentCount');
    return data;
  }

  function parseData(data, captureOldest) {
    data.forEach(function(s) {
      s.postDate = new Date(s.postDate);
      if (captureOldest) {
        NB.oldestStory = Math.min(NB.oldestStory, s.postDate);
      }
    });
    sortBy(data, 'commentCount');
    return data;
  }


  function getHnData(limit) {
    limit = limit || NB.HITS_PER_PAGE;
    $.get('/api/hn/' + limit, function(data) {
      Data.stories = parseData(data, true);
      NB.Chart.drawStories();
//       console.log('oldest of this lot is:', new Date(NB.oldestStory).toString())
    });
  }


  function getRedditData(limit) {
    limit = limit || NB.HITS_PER_PAGE;
    $.get('/api/rd/' + limit, function(data) {
      Data.stories = parseData(data, true);
      NB.Chart.drawStories();
//       console.log('oldest of this lot is:', new Date(NB.oldestStory).toString())
    });
  }


  function init() {
    socket = io(); //TODO only get the server to send data for reddit or hn?

    socket.on('data', function(msg) {
//       console.log(msg.data);
      if (msg.data.length && msg.source === NB.source) { //e.g. if it's the reddit view and the data is reddit data
        mergeStories(parseStoryData(msg.data));
        NB.Chart.drawStories();
      }
    });
  }



  /*  --  PUBLIC  --  */
  Data.stories = [];

  Data.setData = function(key, value) {
    store[key] = value;
  };

  Data.markAsRead = function(id) {
    readList.push(id);
    localStorage.readList = JSON.stringify(readList);
  };

  Data.isRead = function(id) {
    var objString = id.toString();
    for (var i = 0; i < readList.length; i++) {
      if (objString === readList[i]) {
        return true;
      }
    }
    return false;
  };

  Data.getData = function(source, limit) {
    if (source === 'rd') {
      getRedditData(limit);
    }
    if (source === 'hn') {
      getHnData(limit);
    }
  }

  Data.goBananas = function() {
    console.log('Get comfortable...');
    $.get('/api/hn/getall', function(data) {
      mergeStories(parseStoryData(data));
      console.log('Got', data.length, 'stories');
      NB.Chart.drawStories();
    });
  }

  init();
  return Data;
})();
