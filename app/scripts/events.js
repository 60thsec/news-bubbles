'use strict';
var NB = NB || {};

NB.Events = (function() {
  var Events = {}
    , storyPanel
    , chartWrapper
    , storyPanelResizer
    , offsetX
    , body
  ;

  function resizerMousedown() {
    if (d3.event.target.id === 'story-panel-toggle') { return false; }
    chartWrapper = d3.select('#chart-wrapper').style('transition', '0ms');
    storyPanel = d3.select('#story-panel').style('transition', '0ms');

    storyPanelResizer = d3.select('#story-panel-resizer').classed('active', true);

    body = d3.select('body');
    offsetX = d3.mouse(document.body)[0] - NB.splitPos;

    body.on('mousemove', resizerMousemove);
    body.on('mouseup', resizerMouseup);
    body.on('touchmove', resizerMousemove);
    body.on('touchend', resizerMouseup);
  }

  function resizerMousemove() {
    d3.event.preventDefault();
    NB.splitPos = Math.max(100, d3.mouse(document.body)[0] - offsetX);
    NB.Layout.moveSplitPos();
    NB.Chart.resize();
  }
  
  function resizerMouseup() {
    chartWrapper.style('transition', null);
    storyPanel.style('transition', null);
    storyPanelResizer.classed('active', false);

    //Snap the splitter to the right if it's less that xpx
    if (document.body.offsetWidth - NB.splitPos < 100) {
      NB.Layout.hideStoryPanel();
    }

    body.on('mousemove', null);
    body.on('mouseup', null);
    body.on('touchmove', null);
    body.on('touchend', null);
  }

  d3.select('#story-panel-resizer').on('mousedown', resizerMousedown);
  d3.select('#story-panel-resizer').on('touchstart', resizerMousedown);


  d3.select('#story-panel-toggle').on('click', function() {
//     console.log('#story-panel-toggle clicked');
    d3.event.preventDefault();
//     body = d3.select('body');
    NB.Layout.toggleStoryPanel();
    return false;
  });

  $('#more-btn').on('click', function() {
    NB.Data.getNextPage(function(data) {
      NB.Chart.addStories(data);
    });
  });



  /*  ----------------  */
  /*  --  Settings  --  */
  /*  ----------------  */

  $('#open-settings-btn').on('click', function() {
    NB.Settings.openSettings();
  });
  $('#save-settings-btn').on('click', function() {
    NB.Settings.saveSettings();
  });
  $('#cancel-settings-btn').on('click', function() {
    NB.Settings.cancelSettings();
  });



  /*  ---------------  */
  /*  --  Sources  --  */
  /*  ---------------  */

  //TODO this could probably be one event on .news-sources-source
  var rdSource = $('#news-source-rd');
  var hnSource = $('#news-source-hn');

//   var src = NB.Settings.getSetting('source') || 'rd'; //this should never be empty, but 'rd' is there for the fun of it.
//   var minScore = NB.Settings.getSetting(src + 'MinScore');

  rdSource.on('click', function() {
    rdSource.addClass('active');
    hnSource.removeClass('active');
    NB.Settings.setSetting('source', 'rd');
    NB.Chart.reset(); //TODO build reset into getData?
    var minScore = NB.Settings.getSetting('rdMinScore');

    NB.Data.getData('rd', minScore); //TODO get the settings for limits and min scores
  });

  hnSource.on('click', function() {
    rdSource.removeClass('active');
    hnSource.addClass('active');
    NB.Settings.setSetting('source', 'hn');
    NB.Chart.reset();
    
    var minScore = NB.Settings.getSetting('hnMinScore');
    NB.Data.getData('hn', minScore); //TODO get the settings for limits and min scores
  });



  /*  --------------  */
  /*  --  Global  --  */
  /*  --------------  */

  window.onresize = function() {
    NB.Layout.render();
    NB.Chart.resize();
  };

  return Events;

})();