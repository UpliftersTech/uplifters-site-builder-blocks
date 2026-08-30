<?php
namespace UpliftersSiteBuilderBlocks\CoreInit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class PluginPaths {
  public static function build_dir(): string {
    return trailingslashit(UPLIFTERS_SITE_BUILDER_BLOCKS_DIR) . 'build';
  }
}
