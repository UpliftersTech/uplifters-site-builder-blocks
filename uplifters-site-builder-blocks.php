<?php
/**
 * Plugin Name:        Uplifters Website Builder
 * Description:        Design responsive websites with visual breakpoint controls, templates, fonts, and advanced tools for headers, footers, login pages, and more.
 * Version:            1.0.2
 * Requires at least:  6.5
 * Requires PHP:       7.4
 * Author:             Uplifters
 * License:            GPLv2 or later
 * License URI:        https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:        uplifters-site-builder-blocks
 * @package            UpliftersSiteBuilderBlocks
 */
 
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION', '1.0.2' );
define( 'UPLIFTERS_SITE_BUILDER_BLOCKS_FILE', __FILE__ );
define( 'UPLIFTERS_SITE_BUILDER_BLOCKS_DIR', plugin_dir_path( __FILE__ ) );
define( 'UPLIFTERS_SITE_BUILDER_BLOCKS_URL', plugin_dir_url( __FILE__ ) );
define( 'UPLIFTERS_SITE_BUILDER_BLOCKS', 'UPLIFTERS_SITE_BUILDER_BLOCKS' );

/**
 * Core autoloader.
 */
require_once UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'includes/core-init/plugin-autoloader.php';
\UpliftersSiteBuilderBlocks\CoreInit\PluginAutoloader::register();

/**
 * Boot main plugin.
 */

$plugin = new \UpliftersSiteBuilderBlocks\CoreInit\PluginMain();
$plugin->boot();
