(function() {
  var ItemsController, currentTourStep, save, saveDraft, saveImages, setupEditor, showMsg, tourStep, tourStep0IfNeeded, tourStep1IfNeeded, tourStep2IfNeeded, tourSteps, viewHtml;

  ItemsController = Paloma.controller('Items');

  ItemsController.prototype.index = function() {
    $(".item-vote-panel").bind("ajax:error", function(event, jqXHR, ajaxSettings, thrownError) {
      if (jqXHR.status === 401) {
        return window.location.replace('/users/sign_up');
      }
    });
    return Item.setUpItemModel('.item-grids .item-grid', '/resumes');
  };

  ItemsController.prototype.show = function() {
    return Item.setupItemLinks(this.params.id, '#item', this.params.links);
  };

  ItemsController.prototype.draft = function() {
    Item.setupItemLinks(this.params.id, '#item', this.params.links);
    if (window.getParameterByName('print')) {
      return window.print();
    }
  };

  ItemsController.prototype["new"] = function() {
    return setupEditor(this.params.id);
  };

  ItemsController.prototype.edit = function() {
    var token;
    token = $('[name=authenticity_token]').val();
    return setupEditor(this.params.id, token);
  };

  setupEditor = function(resumeId, token) {
    var lazySave, original_html, tourStep2IfNeededOnce;
    original_html = void 0;
    lazySave = _.debounce(function() {
      return original_html = save(resumeId, token, original_html);
    }, 300);
    tourStep2IfNeededOnce = _.once(tourStep2IfNeeded);
    $("#contentarea").contentbuilder({
      zoom: 1,
      hiquality: true,
      iconselect: "/assets/contentbuilder_assets/ionicons/selecticon.html",
      snippetOpen: true,
      snippetOpenCallback: tourStep0IfNeeded,
      snippetFile: "/assets/contentbuilder_assets/custom/snippets.html",
      onDrop: function() {
        analytics.track('Drop snippet', {
          category: 'Editor'
        });
        return tourStep1IfNeeded();
      },
      onRender: lazySave
    });
    $('#contentarea').on('keyup', function() {
      lazySave();
      return _.debounce(tourStep2IfNeededOnce, 3000)();
    });
    return $('#divCb').on('keyup click', lazySave);
  };

  save = function(resumeId, token, original_html) {
    var html, p1, p2;
    html = $('#contentarea').data('contentbuilder').html();
    if (original_html !== void 0 && html !== original_html) {
      showMsg('Saving...');
      p1 = saveImages(resumeId, token);
      p2 = p1.then(function() {
        return saveDraft(resumeId, token);
      });
      p2.done(function() {
        return setTimeout(function() {
          return showMsg('Draft saved');
        }, 500);
      });
    }
    return html;
  };

  saveImages = function(resumeId, token) {
    var promises, url;
    url = '/resumes/' + resumeId + '/image';
    promises = [];
    $('#contentarea').find('img').not('#divCb img').each(function() {
      var $img, p;
      $img = $(this);
      if ($img.attr('src') && $img.attr('src').indexOf('base64') !== -1) {
        p = $.post(url, {
          base64: $img.attr('src'),
          filename: $img.data('filename') || '',
          authenticity_token: token
        });
        p.success(function(res) {
          $img.attr('src', res.src);
          return $img.attr('alt', $img.data('filename'));
        });
        return promises.push(p);
      }
    });
    return $.when.apply(void 0, promises);
  };

  saveDraft = function(resumeId, token) {
    var html;
    html = $('#contentarea').data('contentbuilder').html();
    return $.ajax({
      url: '/resumes/' + resumeId + '/update_draft',
      type: 'post',
      data: {
        item: {
          draft: html
        },
        authenticity_token: token
      }
    });
  };

  viewHtml = function() {
    return $('#contentarea').data('contentbuilder').viewHtml();
  };

  showMsg = function(msg) {
    return $('#panel-cms .msg').text(msg).stop().show();
  };

  tourSteps = [
    {
      target: '[data-snip="12"]',
      hint: 'Drag',
      delay: 1600,
      offset: {
        top: -16,
        left: -16
      }
    }, {
      target: '#contentarea .ui-draggable',
      delay: 500,
      offset: function() {
        return {
          top: $('#contentarea .ui-draggable').outerHeight() - 20,
          left: 20
        };
      },
      popoverOptions: {
        placement: 'bottom',
        title: 'Start typing :D',
        content: 'And don’t forget to use <b>links</b> and <b>images</b> to catch your readers’ attention!',
        html: true
      }
    }, {
      target: '.btn-publish',
      offset: function() {
        return {
          top: -24,
          left: $('.btn-publish').outerWidth() - 16
        };
      },
      popoverOptions: {
        placement: 'top',
        title: 'Your changes have been saved 👏',
        content: 'Your changes have been saved. ' + 'When you’re ready, publish your resume to make it visible to others.'
      }
    }
  ];

  currentTourStep = function() {
    var $pointer, currentStep;
    $pointer = $('#tour-pointer');
    return currentStep = parseInt($pointer.attr('data-tour-step'));
  };

  tourStep0IfNeeded = function() {
    if ($('.contentarea').is('.empty')) {
      return tourStep(0);
    }
  };

  tourStep1IfNeeded = function() {
    var $pointer, cs;
    $pointer = $('#tour-pointer');
    cs = currentTourStep();
    if ($('.contentarea').not('.empty') && cs === 0 && !$pointer.is(':hidden')) {
      return tourStep(1);
    }
  };

  tourStep2IfNeeded = function() {
    var cs;
    cs = currentTourStep();
    if (cs === 1) {
      return tourStep(2);
    }
  };

  tourStep = function(index) {
    var $pointer, $target, step;
    $pointer = $('#tour-pointer');
    step = tourSteps[index];
    if (_.isFunction(step.offset)) {
      step.offset = step.offset();
    }
    step.offset || (step.offset = {});
    step.hint || (step.hint = '');
    $target = $(step.target).first();
    _.delay(function() {
      var offset;
      offset = $target.offset();
      offset.top += step.offset.top || 0;
      offset.left += step.offset.left || 0;
      $pointer.attr('data-tour-step', index).text(step.hint).show().offset(offset).hide().fadeIn(1200);
      if (step.popoverOptions) {
        return $pointer.popover(step.popoverOptions).popover('show').on('hidden.bs.popover', function() {
          return $(this).fadeOut(200);
        });
      }
    }, step.delay || 0);
    if (index === 0) {
      return $('html').click(function() {
        if (!$pointer.is(':hidden')) {
          return $pointer.popover('destroy');
        }
      });
    }
  };

}).call(this);
