(function() {
  window.Item = {
    setupItemLinks: function(itemId, itemSelector, links, popoverOptions) {
      var linksSelector;
      if (links == null) {
        links = [];
      }
      if (popoverOptions == null) {
        popoverOptions = {};
      }
      linksSelector = itemSelector + ' a';
      $(linksSelector).click(function(e) {
        var href;
        href = $(e.currentTarget).attr('href');
        return $.post('/resumes/' + itemId + '/links', {
          link: {
            url: href
          }
        });
      });
      return $(linksSelector).each(function(i, a) {
        var $badge, $img, link;
        link = _.find(links, function(l) {
          return l.url === $(a).attr('href');
        });
        if (link && link.title && link.image_url) {
          $badge = $('<span class="badge badge-clicks">' + link.clicks + '</span>');
          $img = $('<img />').attr('src', link.image_url).attr('alt', link.url);
          $badge.popover(_.extend({
            title: link.title,
            content: $img[0].outerHTML,
            html: true,
            trigger: 'hover click'
          }, popoverOptions));
          return $img.error(function() {
            return $badge.remove();
          });
        }
      });
    },
    setUpItemModel: function(selector, basePathname, showRegistrationForm) {
      var $modal;
      if (showRegistrationForm == null) {
        showRegistrationForm = false;
      }
      $modal = $('.modal-item');
      $modal.modal();
      $modal.on('hidden.bs.modal', function() {
        return window.history.pushState('', '', basePathname);
      });
      return $(selector).click(function(e) {
        var $contentarea, $modalBody, $modalTitle, username;
        if ($(e.target).closest('.item-control-panel').length || $(e.target).is('a')) {

        } else {
          e.preventDefault();
          username = $(e.currentTarget).data('username');
          $modal = $('.modal-item');
          $modalTitle = $('.modal-item .modal-title');
          $modalBody = $('.modal-item .modal-body');
          $contentarea = $('.modal-item .modal-body .contentarea');
          $modal.modal('show');
          $modalTitle.text('');
          $contentarea.html('');
          return $.get('/' + username + '.json').success(function(data) {
            window.history.pushState('', '', basePathname + '/' + username);
            $modalTitle.text(data.user.name);
            $contentarea.html(data.user.item.body);
            Item.setupItemLinks(data.user.item.id, '.modal-item .modal-body .contentarea', data.user.item.links, {
              placement: 'top'
            });
            Item.trackPreview(data.user);
            if (showRegistrationForm) {
              $modalBody.addClass('show-registration-form');
              return $.get('/users/registrations/form').success(function(registrationFormHtml) {
                $modalBody.find('.registration-form-wrapper').remove();
                return $modalBody.append(registrationFormHtml);
              });
            } else {
              return $modalBody.removeClass('show-registration-form');
            }
          }).error(function() {
            return $modal.modal('hide');
          });
        }
      });
    },
    trackPreview: function(user) {
      return analytics.track('Click a resume', {
        category: 'Resume',
        label: user.name
      });
    }
  };

}).call(this);
