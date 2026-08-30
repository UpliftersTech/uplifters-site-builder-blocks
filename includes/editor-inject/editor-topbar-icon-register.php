<?php
/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS editor topbar logo assets.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\EditorInject;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class EditorTopbarIconRegister {

	const EDITOR_BRAND_HANDLE = 'uplifters-site-builder-blocks-editor-brand';
	const EDITOR_ICON_HANDLE  = 'uplifters-site-builder-blocks-editor-topbar-icon';

	/**
	 * Register editor topbar logo hooks.
	 */
	public static function register(): void {
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_brand_assets' ) );
	}

	/**
	 * Enqueue editor topbar branding for Gutenberg and the Site Editor.
	 */
	public static function enqueue_editor_brand_assets(): void {
		$plugin_url  = self::get_plugin_url();
		$plugin_path = self::get_plugin_path();

		$editor_url  = $plugin_url . 'src/editor-topbar/';
		$editor_path = $plugin_path . 'src' . DIRECTORY_SEPARATOR . 'editor-topbar' . DIRECTORY_SEPARATOR;

		$icon_url  = $plugin_url . 'src/assets-shared/brand-icon/editor-topbar-icon.js';
		$icon_path = $plugin_path . 'src' . DIRECTORY_SEPARATOR . 'assets-shared' . DIRECTORY_SEPARATOR . 'brand-icon' . DIRECTORY_SEPARATOR . 'editor-topbar-icon.js';

		$editor_js  = $editor_path . 'editor-topbar-button-leftside.js';
		$editor_css = $editor_path . 'editor-topbar-button-leftside.css';

		$script_dependencies = array(
			'wp-dom-ready',
			'wp-i18n',
		);

		if ( is_readable( $icon_path ) ) {
			wp_enqueue_script(
				self::EDITOR_ICON_HANDLE,
				$icon_url,
				array(),
				filemtime( $icon_path ),
				true
			);

			$script_dependencies[] = self::EDITOR_ICON_HANDLE;
		}

		if ( is_readable( $editor_js ) ) {
			wp_enqueue_script(
				self::EDITOR_BRAND_HANDLE,
				$editor_url . 'editor-topbar-button-leftside.js',
				$script_dependencies,
				filemtime( $editor_js ),
				true
			);

			wp_add_inline_script(
				self::EDITOR_BRAND_HANDLE,
				'window.UpliftersSiteBuilderBlocksEditorBrand = ' . wp_json_encode(
					array(
						'dashboardUrl' => admin_url( 'admin.php?page=uplifters-site-builder-blocks' ),
						'name'         => __( 'Uplifters Builder', 'uplifters-site-builder-blocks' ),
					)
				) . ';',
				'before'
			);
		}

		if ( is_readable( $editor_css ) ) {
			wp_enqueue_style(
				self::EDITOR_BRAND_HANDLE,
				$editor_url . 'editor-topbar-button-leftside.css',
				array(),
				filemtime( $editor_css )
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
