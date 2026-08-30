<?php
/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS responsive assets registry.
 *
 * Loads global responsive editor controls/assets and frontend responsive CSS.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\ResponsiveGlobal;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class ResponsiveAttributeRegister {

	const EDITOR_HANDLE   = 'uplifters-site-builder-blocks-responsive-editor';
	const FRONTEND_HANDLE = 'uplifters-site-builder-blocks-responsive-frontend';

	/**
	 * Register responsive hooks.
	 */
	public static function register(): void {
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_assets' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_frontend_assets' ) );
	}

	/**
	 * Enqueue responsive assets for Gutenberg block editor / FSE site editor.
	 */
	public static function enqueue_editor_assets(): void {
		$base_url  = self::get_plugin_url() . 'src/responsive-toolbar/';
		$base_path = self::get_plugin_path() . 'src' . DIRECTORY_SEPARATOR . 'responsive-toolbar' . DIRECTORY_SEPARATOR;

		$editor_js  = $base_path . 'responsive-controller.js';
		$editor_css = $base_path . 'responsive-editor.css';

		if ( is_readable( $editor_js ) ) {
			wp_enqueue_script(
				self::EDITOR_HANDLE,
				$base_url . 'responsive-controller.js',
				array(
					'wp-blocks',
					'wp-plugins',
					'wp-element',
					'wp-components',
					'wp-compose',
					'wp-data',
					'wp-editor',
					'wp-block-editor',
					'wp-i18n',
					'wp-dom-ready',
				),
				filemtime( $editor_js ),
				true
			);
		}

		if ( is_readable( $editor_css ) ) {
			wp_enqueue_style(
				self::EDITOR_HANDLE,
				$base_url . 'responsive-editor.css',
				array(),
				filemtime( $editor_css )
			);
		}
	}

	/**
	 * Enqueue responsive frontend CSS.
	 */
	public static function enqueue_frontend_assets(): void {
		$base_url  = self::get_plugin_url() . 'src/responsive-toolbar/';
		$base_path = self::get_plugin_path() . 'src' . DIRECTORY_SEPARATOR . 'responsive-toolbar' . DIRECTORY_SEPARATOR;

		$frontend_css = $base_path . 'responsive-frontend.css';

		if ( is_readable( $frontend_css ) ) {
			wp_enqueue_style(
				self::FRONTEND_HANDLE,
				$base_url . 'responsive-frontend.css',
				array(),
				filemtime( $frontend_css )
			);
		}
	}

	/**
	 * Get plugin absolute path.
	 */
	private static function get_plugin_path(): string {
		if ( defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_PLUGIN_PATH' ) ) {
			return trailingslashit( UPLIFTERS_SITE_BUILDER_BLOCKS_PLUGIN_PATH );
		}

		if ( defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_PATH' ) ) {
			return trailingslashit( UPLIFTERS_SITE_BUILDER_BLOCKS_PATH );
		}

		if ( defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_DIR' ) ) {
			return trailingslashit( UPLIFTERS_SITE_BUILDER_BLOCKS_DIR );
		}

		return trailingslashit( dirname( __DIR__, 2 ) );
	}

	/**
	 * Get plugin URL.
	 */
	private static function get_plugin_url(): string {
		if ( defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_PLUGIN_URL' ) ) {
			return trailingslashit( UPLIFTERS_SITE_BUILDER_BLOCKS_PLUGIN_URL );
		}

		if ( defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_URL' ) ) {
			return trailingslashit( UPLIFTERS_SITE_BUILDER_BLOCKS_URL );
		}

		return trailingslashit( plugin_dir_url( dirname( __DIR__, 2 ) . '/uplifters-site-builder-blocks.php' ) );
	}
}
