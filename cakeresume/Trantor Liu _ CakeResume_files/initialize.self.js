(function() {
  $(document).ready(function() {
    window.getParameterByName = function(name, url) {
      var regex, results;
      if (url == null) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
      results = regex.exec(url);
      if (!results) {
        return null;
      }
      if (!results[2]) {
        return '';
      }
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    return Paloma.start();
  });

  $(document).on('page:load', function() {
    var i, image, images, len, results1;
    images = document.getElementsByTagName('img');
    results1 = [];
    for (i = 0, len = images.length; i < len; i++) {
      image = images[i];
      if (!image.getAttributeNode('data-no-retina')) {
        if (image.src) {
          results1.push(new RetinaImage(image));
        } else {
          results1.push(void 0);
        }
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  });

}).call(this);
