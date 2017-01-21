(function() {
  $(function() {
    $('body').on('click', 'a[data-event]', function(e) {
      var $ct;
      $ct = $(e.currentTarget);
      return analytics.track($ct.data('event'), {
        category: $ct.data('category') || 'Link',
        label: $ct.data('label') || $ct.text()
      });
    });
    $('body').on('click', 'button[data-event]', function(e) {
      var $ct;
      $ct = $(e.currentTarget);
      return analytics.track($ct.data('event'), {
        category: $ct.data('category') || 'Button',
        label: $ct.data('label') || $ct.text()
      });
    });
    return $('body').on('submit', 'form[data-event]', function(e) {
      var $ct;
      $ct = $(e.currentTarget);
      return analytics.track($ct.data('event'), {
        category: $ct.data('category') || 'Form',
        label: $ct.data('label') || $ct.find('[type=submit]').text()
      });
    });
  });

}).call(this);
