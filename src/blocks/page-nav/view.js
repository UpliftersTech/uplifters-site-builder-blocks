(function(){
  document.querySelectorAll('.uplifters-site-builder-blocks-fse-page-menu').forEach(function(root){
    if (root.dataset.upliftersSiteBuilderBlocksMounted === 'true') {
      return;
    }

    root.dataset.upliftersSiteBuilderBlocksMounted = 'true';

    var normalizeUrl = function(url) {
      try {
        var parsedUrl = new URL(url, window.location.origin);

        var pathname = parsedUrl.pathname.replace(/\/+$/, '');

        return (
          parsedUrl.origin +
          pathname +
          parsedUrl.search
        );
      } catch (error) {
        return String(url || '').replace(/\/+$/, '');
      }
    };

    var currentUrl = normalizeUrl(
      window.location.href
    );

    root
      .querySelectorAll('.uplifters-site-builder-blocks-page-menu-item')
      .forEach(function(link) {
        var href = normalizeUrl(
          link.getAttribute('href') || ''
        );

        if (href === currentUrl) {
          link.classList.add('is-active');
        }
      });

    var trigger = root.querySelector(
      '.uplifters-site-builder-blocks-page-menu-mobile-trigger'
    );

    var layer = root.querySelector(
      '.uplifters-site-builder-blocks-page-menu-mobile-layer'
    );

    var backdrop = root.querySelector(
      '.uplifters-site-builder-blocks-page-menu-backdrop'
    );

    var closeBtn = root.querySelector(
      '.uplifters-site-builder-blocks-page-menu-close-btn'
    );

    if (!trigger || !layer) {
      return;
    }

    function openMenu() {
      layer.classList.add('is-open');

      trigger.setAttribute(
        'aria-expanded',
        'true'
      );

      document.body.classList.add(
        'uplifters-site-builder-blocks-page-menu-lock-scroll'
      );
    }

    function closeMenu() {
      layer.classList.remove('is-open');

      trigger.setAttribute(
        'aria-expanded',
        'false'
      );

      document.body.classList.remove(
        'uplifters-site-builder-blocks-page-menu-lock-scroll'
      );
    }

    function toggleMenu() {
      if (layer.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    trigger.addEventListener(
      'click',
      toggleMenu
    );

    if (backdrop) {
      backdrop.addEventListener(
        'click',
        closeMenu
      );
    }

    if (closeBtn) {
      closeBtn.addEventListener(
        'click',
        closeMenu
      );
    }

    layer
      .querySelectorAll('.uplifters-site-builder-blocks-page-menu-item')
      .forEach(function(link) {
        link.addEventListener(
          'click',
          closeMenu
        );
      });

    document.addEventListener(
      'keydown',
      function(event) {
        if (
          event.key === 'Escape' &&
          layer.classList.contains('is-open')
        ) {
          closeMenu();
        }
      }
    );
  });
})();
