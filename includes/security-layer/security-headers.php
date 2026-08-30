<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class SecurityHeaders {
  public static function init(): void {
    add_action('send_headers', function () {
      header('X-Content-Type-Options: nosniff');
      header('X-Frame-Options: SAMEORIGIN');
      header('Referrer-Policy: strict-origin-when-cross-origin');

      if (is_admin()) {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
      }
    });
  }
}
