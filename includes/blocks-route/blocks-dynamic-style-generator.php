<?php
/**
 * Attaches per-instance dynamic block CSS to each block's registered
 * style handle instead of printing raw <style> tags from render.php.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\BlocksRoute;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class BlocksDynamicStyleGenerator {

	/**
	 * Enqueue dynamically generated, already-sanitized CSS for a block instance.
	 *
	 * @param mixed  $block WP_Block instance passed into render.php, or the
	 *                      block's registered name (e.g. 'uplifters-site-builder-blocks/countup-auto-animate')
	 *                      when render.php's CSS is assembled inside a helper
	 *                      function that does not have $block in scope.
	 * @param string $css   Fully assembled CSS for this block instance.
	 */
	public static function enqueue( $block, string $css ): void {
		$css = trim( $css );

		if ( '' === $css ) {
			return;
		}

		$handle = self::resolve_handle( $block );

		if ( ! $handle ) {
			return;
		}

		wp_add_inline_style( $handle, wp_strip_all_tags( $css ) );
	}

	/**
	 * Resolve the style handle that block.json's "style" property registered.
	 *
	 * @param mixed $block WP_Block instance, or a registered block name string.
	 * @return string|null
	 */
	private static function resolve_handle( $block ): ?string {
		$block_type = null;

		if ( $block instanceof \WP_Block ) {
			$block_type = $block->block_type;
		} elseif ( is_string( $block ) ) {
			$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( $block );
		}

		if ( ! ( $block_type instanceof \WP_Block_Type ) ) {
			return null;
		}

		$handles = $block_type->style_handles;

		if ( empty( $handles ) ) {
			return null;
		}

		return $handles[0];
	}
}
