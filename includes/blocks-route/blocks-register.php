<?php
namespace UpliftersSiteBuilderBlocks\BlocksRoute;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class BlocksRegister {

  public static function register_all(): void {

    if ( ! function_exists('register_block_type') ) {
      return;
    }

    // Candidate locations for production and development.
    $candidates = [
    
      UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'build',
    
    ];

    $found_any = false;
    $registered = [];

    foreach ($candidates as $dir) {
      $dir = trailingslashit($dir);

      if ( ! is_dir($dir) ) {
        continue;
      }

      // Find block.json files one level deep.
      foreach (glob($dir . '*/block.json') ?: [] as $json) {
        self::register_block_directory(dirname($json), $registered, $found_any);
      }

      // Support nested build/blocks/<category>/<block>/block.json structures.
      foreach (glob($dir . '*/*/block.json') ?: [] as $json) {
        self::register_block_directory(dirname($json), $registered, $found_any);
      }
    }

  }

  private static function register_block_directory(string $directory, array &$registered, bool &$found_any): void {
    $canonical = realpath($directory) ?: $directory;

    if (isset($registered[$canonical])) {
      return;
    }

    register_block_type($directory);
    $registered[$canonical] = true;
    $found_any = true;
  }
}
