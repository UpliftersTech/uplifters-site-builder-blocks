<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class SecurityRateLimiter {

  /**
   * @param string $key logical bucket key e.g. "firewall:rest"
   * @param int $limit max requests
   * @param int $window_seconds time window
   */
  public static function allow(string $key, int $limit, int $window_seconds): bool {
    $ip = self::client_ip();
    $bucket = 'uplifters_site_builder_blocks_rl_' . md5($key . '|' . $ip);

    $data = get_transient($bucket);
    if (!is_array($data)) {
      $data = ['count' => 0, 'start' => time()];
    }

    $elapsed = time() - (int) ($data['start'] ?? 0);

    if ($elapsed > $window_seconds) {
      $data = ['count' => 0, 'start' => time()];
    }

    $data['count'] = ((int) ($data['count'] ?? 0)) + 1;

    // store for remaining window
    $ttl = max(1, $window_seconds - (time() - (int) $data['start']));
    set_transient($bucket, $data, $ttl);

    return $data['count'] <= $limit;
  }

  private static function client_ip(): string {
    // Use REMOTE_ADDR as safest default. Avoid trusting X-Forwarded-For blindly.
    $ip = isset($_SERVER['REMOTE_ADDR'])
      ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']))
      : '0.0.0.0';

    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
  }
}
