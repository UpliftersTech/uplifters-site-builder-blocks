<?php
namespace UpliftersSiteBuilderBlocks\BlocksRoute;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class BlocksCategoryRegister {

	/**
	 * Define custom block categories.
	 *
	 * The reusable custom logo is stored at:
	 * uplifters-site-builder-blocks/src/assets-shared/brand-icon/blocks-category-icon.js
	 */
	private static function defined_custom_categories(): array {

		$uplifters_site_builder_blocks_label = __('Uplifters Website Builder', 'uplifters-site-builder-blocks');

		return [
			[
				'slug'  => 'uplifters-site-builder-blocks-gene',
				'title' => $uplifters_site_builder_blocks_label,
				'icon'  => null,
			],
			[
				'slug'  => 'uplifters-site-builder-blocks-text',
				'title' => sprintf('%s - %s', __('Text', 'uplifters-site-builder-blocks'), $uplifters_site_builder_blocks_label),
				'icon'  => null,
			],
			[
				'slug'  => 'uplifters-site-builder-blocks-layout',
				'title' => sprintf('%s - %s', __('Layout', 'uplifters-site-builder-blocks'), $uplifters_site_builder_blocks_label),
				'icon'  => null,
			],
		];
	}

	public static function register(): void {
		add_filter('block_categories_all', [__CLASS__, 'add_categories'], 10, 2);

		// Load the reusable Uplifters Website Builder category logo in the block editor only.
		add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_category_icon']);
	}

	/**
	 * Load src/assets-shared/brand-icon/blocks-category-icon.js and its inline styles.
	 *
	 * This file assumes blocks-category-register.php is located at:
	 * uplifters-site-builder-blocks/includes/blocks-route/blocks-category-register.php
	 */
	public static function enqueue_category_icon(): void {
		$plugin_root = dirname(__DIR__, 2);
		$script_file = $plugin_root . '/src/assets-shared/brand-icon/blocks-category-icon.js';

		if (!file_exists($script_file)) {
			return;
		}

		$script_url = plugins_url(
			'src/assets-shared/brand-icon/blocks-category-icon.js',
			$plugin_root . '/uplifters-site-builder-blocks.php'
		);

		wp_enqueue_script(
			'uplifters-site-builder-blocks-block-category-icon',
			$script_url,
			['wp-blocks', 'wp-dom-ready', 'wp-element'],
			(string) filemtime($script_file),
			true
		);

		self::enqueue_category_icon_styles();
	}

	/**
	 * The default category icon slot is a fixed 24px box, which clips the
	 * "Uplifters Website Builder" label rendered beside the SVG. Allow it to size naturally.
	 */


      private static function enqueue_category_icon_styles(): void {
		$handle = 'uplifters-site-builder-blocks-block-category-icon-style';

		wp_register_style($handle, false, [], UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION);
		wp_enqueue_style($handle);

		$css =
			'.uplifters-site-builder-blocks-category-title {' .
				'display: inline-flex;' .
				'align-items: center;' .
				'gap: 6px;' .
			'}' .
			'.uplifters-site-builder-blocks-category-title svg {' .
				'width: 18px;' .
				'height: 18px;' .
				'flex-shrink: 0;' .
			'}' .
			'.block-editor-inserter__panel-header svg:not(.uplifters-site-builder-blocks-category-title svg) {' .
				'display: none !important;' .
			'}';

		wp_add_inline_style($handle, $css);
		}


	public static function add_categories(array $categories, $editor_context): array {
		return self::merge_custom_categories($categories, $editor_context);
	}

	private static function merge_custom_categories(array $categories, $context): array {

		$custom_categories = apply_filters(
			'uplifters_site_builder_blocks_block_categories',
			self::defined_custom_categories(),
			$context
		);

		$existing_slugs = array_column($categories, 'slug');
		$to_add         = [];

		foreach ($custom_categories as $cat) {
			if (!is_array($cat)) {
				continue;
			}

			$slug  = isset($cat['slug']) ? (string) $cat['slug'] : '';
			$title = isset($cat['title']) ? $cat['title'] : '';

			if ($slug === '' || $title === '') {
				continue;
			}

			if (in_array($slug, $existing_slugs, true)) {
				continue;
			}

			$new_cat = [
				'slug'  => $slug,
				'title' => $title,
			];

			// Custom SVG is attached by the editor-side JavaScript file.
			if (isset($cat['icon']) && is_string($cat['icon']) && $cat['icon'] !== '') {
				$new_cat['icon'] = $cat['icon'];
			}

			$to_add[]         = $new_cat;
			$existing_slugs[] = $slug;
		}

		return array_merge($to_add, $categories);
	}
}
