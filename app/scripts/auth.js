'use strict';
var NB = NB || {};

NB.Auth = (function() {
  var Auth = {}
    , rawUser = {}
    , authModal = d3.select('#auth-modal')
  ;

  // Remove the ugly Facebook appended hash
  // <https://github.com/jaredhanson/passport-facebook/issues/12>
  // source for this code: https://github.com/jaredhanson/passport-facebook/issues/12#issuecomment-5913711
  function removeFacebookAppendedHash() {
    if (!window.location.hash || window.location.hash !== '#_=_') {
      return;
    } else if (window.history && window.history.replaceState) {
      return window.history.replaceState('', document.title, window.location.pathname);
    } else {
      window.location.hash = '';
    }


  }

  function close() {
    authModal
      .transition().duration(500)
      .style('opacity', 0)
      .transition()
      .style('display', 'none');
  }

  function save() {
    close();
  }

  function open() {
    authModal
      .style('display', 'block')
      .transition().duration(500)
      .style('opacity', 1);
  }

  var userModel = {
    _id: '',
    name: {
      first: ko.observable(''),
      last: ko.observable(''),
      display: ko.observable('')
    },
    displayName: ko.observable(''),
    signedIn: ko.observable(false),
    headerText: ko.observable('Sign in'),
    open: open,
    close: close,
    save: save
  };


  function init() {
//     ko.applyBindings(userModel, document.getElementById('user-items'));
//     ko.applyBindings(userModel, document.getElementById('auth-modal'));
  }


  function setUser(user) {
    if (user.reddit) {
      $('body').addClass('user-rdt');
//       $('#story-panel-header').addClass('show-vote-btns');
    } else {
      $('body').removeClass('user-rdt');
//       $('#story-panel-header').removeClass('show-vote-btns');
    }
    rawUser = user;
    var displayName = user.displayName || user.name.display;
    if (user) {
      userModel._id = user._id;
      userModel.displayName(displayName);
      userModel.signedIn(true);
      userModel.headerText(displayName);
      removeFacebookAppendedHash(); //TODO test for FB?
    } else {
      userModel._id = null;
      userModel.displayName(null);
      userModel.signedIn(false);
      userModel.headerText('Sign in'); //TODO not used when no signed in
    }
  }

  function getUser() {
    if (userModel.signedIn()) {
      return userModel;
    } else {
      return null;
    }

  }
  function getRawUser() {
    return rawUser;
  }

  function signOut() {
    console.log('OK, will sign out (ha ha, but I am not really!');
  }


  /*  ---------------  */
  /*  --  Exports  --  */
  /*  ---------------  */

  Auth.setUser    = setUser;
  Auth.getUser    = getUser;
  Auth.getRawUser = getRawUser;
  Auth.signOut    = signOut;
  Auth.userModel  = userModel;

  init();
  return Auth;
})();