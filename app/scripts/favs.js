'use strict';

var NB = NB || {};

NB.Favs = (function() {
  var Favs = {};

  var store = [];

  function init() {
    //favourite array
    if (localStorage.favs) {
      var favs = JSON.parse(localStorage.favs);
      if (Array.isArray(favs)) {
        store = favs;
      }
    }
  }

  Favs.addToFavs = function(story) {
    store.push(story);
    localStorage.favs = JSON.stringify(store);
    
    NB.Data.emit('addToFavs', {story: story});
  };

  Favs.removeFromFavs = function(story) {
//     console.log('Removing story from favs:', story);
    var id = story._id;
    NB.Data.emit('removeFromFavs', {storyId: story._id});
    
    store.forEach(function(fav, i) {
      if (fav._id === id) {
        store.splice(i, 1);
        localStorage.favs = JSON.stringify(store);
        return;
      }
    });
  };

  Favs.isFav = function(story) {
    if (!store.length) { return false; }
    var id = story._id;
    var hasMatch = false;

    store.forEach(function(fav) {
      if (fav._id === id) { hasMatch = true; }
    });

    return hasMatch;
  };

  //adds/removes from the store, returns true if it's now a fav, false otherwise
  Favs.toggleFav = function(koStory) {
    var story = koStory.raw;
    var isFav = Favs.isFav(story);
    if (isFav) {
      Favs.removeFromFavs(story);
      koStory.isFav(false);
      return false;
    } else {
      Favs.addToFavs(story);
      koStory.isFav(true);
      return true;
    }
  };

  Favs.getAll = function() {
    return store;
  };




  init();
  return Favs;
})();