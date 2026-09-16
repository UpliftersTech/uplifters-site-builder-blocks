<?php
/**
 * Shared inserter-preview bundle registration.
 *
 * The 42 block editor bundles all render the same inserter previews. Building
 * that registry into each of them duplicated it — and motion/react with it —
 * 42 times over. It is now built once, as build/blocks-inserter-preview/
 * inserter-preview.js, and published on a global that every block's edit.js
 * reads through src/blocks-inserter-preview/inserter-preview-shared.js.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\AssetsEnqueue;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class InserterPreviewRegister {

	/**
	 * Script handle for the shared preview bundle.
	 */
	const SCRIPT_HANDLE = 'uplifters-site-builder-blocks-inserter-preview';

	/**
	 * Built asset path, relative to the plugin root, without extension.
	 */
	const BUILD_PATH = 'build/blocks-inserter-preview/inserter-preview';

	/**
	 * Hook registration.
	 */
	public static function register(): void {
		// Priority 1, so the global exists before WordPress's own priority-10
		// auto-enqueue of registered block scripts.
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_shared_previews' ), 1 );

		// Priority 20, after that auto-enqueue, so every block handle already
		// exists to patch.
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'inject_editor_script_dependency' ), 20 );
	}

	/**
	 * Enqueue the shared preview bundle in the block editor.
	 */
	public static function enqueue_shared_previews(): void {
		if ( ! is_admin() ) {
			return;
		}

		$script_path = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . self::BUILD_PATH . '.js';

		if ( ! file_exists( $script_path ) ) {
			return;
		}

		$asset = self::asset_meta();

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			UPLIFTERS_SITE_BUILDER_BLOCKS_URL . self::BUILD_PATH . '.js',
			$asset['dependencies'],
			$asset['version'],
			false
		);

		wp_set_script_translations( self::SCRIPT_HANDLE, 'uplifters-site-builder-blocks' );
	}

	/**
	 * Dependency list and cache-busting version emitted by the build.
	 *
	 * @return array{dependencies: array<int, string>, version: string}
	 */
	private static function asset_meta(): array {
		$asset_path = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . self::BUILD_PATH . '.asset.php';

		$meta = file_exists( $asset_path ) ? require $asset_path : array();

		return array(
			'dependencies' => isset( $meta['dependencies'] ) && is_array( $meta['dependencies'] )
				? $meta['dependencies']
				: array(),
			'version'      => isset( $meta['version'] )
				? (string) $meta['version']
				: UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION,
		);
	}

	/**
	 * Patch the shared bundle in as an explicit dependency of every registered
	 * plugin block's editor script, so
	 * window.UpliftersSiteBuilderBlocksInserterPreview is guaranteed to exist
	 * by the time a block's edit.js renders a preview — without needing the
	 * build step to add it to each block's generated *.asset.php dependency
	 * list.
	 */
	public static function inject_editor_script_dependency(): void {
		if ( ! wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
			return;
		}

		$scripts = wp_scripts();

		foreach ( \WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $block_type ) {
			if ( 0 !== strpos( $name, 'uplifters-site-builder-blocks/' ) ) {
				continue;
			}

			$handles = ! empty( $block_type->editor_script_handles )
				? $block_type->editor_script_handles
				: array_filter( array( $block_type->editor_script ?? null ) );

			foreach ( $handles as $handle ) {
				if ( ! isset( $scripts->registered[ $handle ] ) ) {
					continue;
				}

				if ( ! in_array( self::SCRIPT_HANDLE, $scripts->registered[ $handle ]->deps, true ) ) {
					$scripts->registered[ $handle ]->deps[] = self::SCRIPT_HANDLE;
				}
			}
		}
	}
}
