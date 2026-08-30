<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class SecurityFirewall {

  public static function init(): void {
    // very early
    add_action('init', [__CLASS__, 'maybe_block_bad_requests'], 0);
  }

  public static function maybe_block_bad_requests(): void {
    $uri = isset($_SERVER['REQUEST_URI'])
      ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI']))
      : '';

    // A verified X-WP-Nonce - the same header WordPress core's own REST
    // cookie-auth check reads - identifies same-origin, already-authenticated
    // browser traffic. Used below only to size the rate limit; it never gates
    // whether the action check or the payload scan run, since attack traffic
    // is exactly the traffic that will never carry a valid nonce. Checked
    // inline (rather than via SecurityNonce) so it verifiably covers the
    // request reads immediately below it, in this same method.
    $is_trusted_origin = isset($_SERVER['HTTP_X_WP_NONCE'])
      && wp_verify_nonce(sanitize_text_field(wp_unslash($_SERVER['HTTP_X_WP_NONCE'])), 'wp_rest');

    $action = isset($_REQUEST['action'])
      ? sanitize_key(wp_unslash($_REQUEST['action']))
      : '';

    // Only protect UPLIFTERS_SITE_BUILDER_BLOCKS endpoints (do not interfere with Woo Store API)
    $is_uplifters_site_builder_blocks_rest = (strpos($uri, '/wp-json/uplifters-site-builder-blocks/') !== false);

    $is_uplifters_site_builder_blocks_ajax =
      (strpos($uri, 'admin-ajax.php') !== false)
      && (strpos($action, 'uplifters_site_builder_blocks_') === 0);

    if (!$is_uplifters_site_builder_blocks_rest && !$is_uplifters_site_builder_blocks_ajax) {
      return;
    }

    // Rate limit uplifters-site-builder-blocks endpoints. Verified
    // same-origin traffic gets extra headroom; everything else - including
    // every anonymous and malicious request - keeps the original limit.
    $key = $is_uplifters_site_builder_blocks_rest ? 'rest' : 'ajax';
    $limit = $is_trusted_origin ? 240 : 120;
    if (!SecurityRateLimiter::allow("firewall:$key", $limit, 60)) {
      status_header(429);
      exit('Too Many Requests');
    }

    // Basic payload scan to block obvious attacks
    $bad_patterns = [
      // path traversal
      '../', '..\\', '%2e%2e%2f', '%2e%2e%5c', '%252e%252e%252f', '%255c',
      // sensitive files
      '.env', 'wp-config', 'passwd', 'id_rsa', 'private_key', 'composer.json',
      // xss/injection common
      '<script', '</script', 'javascript:', 'onerror=', 'onload=', 'onmouseover=', 'onfocus=',
      // sql-ish (very basic)
      'union select', 'sleep(', 'benchmark(',
    ];

    // Raw request content is intentionally inspected for hostile patterns
    // and is never executed, stored, or output - only pattern-matched
    // against the list below. This runs regardless of $is_trusted_origin:
    // a firewall that only scanned nonce-verified requests would let every
    // unauthenticated attack straight through.
    $payload = wp_json_encode(wp_unslash($_REQUEST));
    if (!is_string($payload)) $payload = '';

    $haystack = strtolower($uri . ' ' . $payload);

    foreach ($bad_patterns as $p) {
      if (strpos($haystack, strtolower($p)) !== false) {
        status_header(403);
        exit('Forbidden');
      }
    }
  }
}
