<?php
/**
 * Server-side rendering for the Columns Layout block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Helper functions (declared once per page) ─────────────────────────────────

if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_layout_get_equal_widths' ) ) {
	function uplifters_site_builder_blocks_p_column_layout_get_equal_widths( $count ) {
		$count = absint( $count );
		if ( $count < 1 ) return array();
		return array_fill( 0, $count, 100 / $count );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_layout_normalize_widths' ) ) {
	function uplifters_site_builder_blocks_p_column_layout_normalize_widths( $widths, $count ) {
		$count = absint( $count );
		if ( $count < 1 ) return array();

		if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
			return uplifters_site_builder_blocks_p_column_layout_get_equal_widths( $count );
		}

		$nums  = array_map(
			static fn( $w ) => is_numeric( $w ) ? (float) $w : 0,
			$widths
		);
		$total = array_sum( $nums );

		if ( $total <= 0 ) return uplifters_site_builder_blocks_p_column_layout_get_equal_widths( $count );

		return array_map( static fn( $w ) => ( $w / $total ) * 100, $nums );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_layout_make_grid_template' ) ) {
	function uplifters_site_builder_blocks_p_column_layout_make_grid_template( $widths, $count ) {
		$count = max( 1, absint( $count ) );
		$norm  = uplifters_site_builder_blocks_p_column_layout_normalize_widths( $widths, $count );

		if ( empty( $norm ) ) {
			return sprintf( 'repeat(%d,minmax(1ch,1fr))', $count );
		}

		return implode( ' ', array_map(
			static function ( $w ) {
				$f = rtrim( rtrim( number_format( (float) $w, 6, '.', '' ), '0' ), '.' );
				return "minmax(1ch,{$f}fr)";
			},
			$norm
		) );
	}
}

/**
 * Extract a device-specific widths array from the columnWidths attribute.
 *
 * Handles three legacy shapes:
 *   - object { desktop:[], tablet:[], mobile:[] }   → current shape
 *   - flat array                                     → apply to all devices
 *   - anything else                                  → equal widths
 *
 * Cascade: tablet inherits desktop, mobile inherits tablet.
 *
 * @param mixed  $raw    Raw columnWidths attribute.
 * @param string $device 'desktop' | 'tablet' | 'mobile'
 * @param int    $count  Number of columns.
 * @return array Normalised widths array.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_layout_resolve_column_widths' ) ) {
	function uplifters_site_builder_blocks_p_column_layout_resolve_column_widths( $raw, $device, $count ) {
		// Current object shape
		if ( is_array( $raw ) && isset( $raw['desktop'] ) ) {
			$desktop = is_array( $raw['desktop'] ) ? $raw['desktop'] : array();
			$tablet  = is_array( $raw['tablet']  ) ? $raw['tablet']  : $desktop;
			$mobile  = is_array( $raw['mobile']  ) ? $raw['mobile']  : $tablet;

			switch ( $device ) {
				case 'mobile':
					$widths = ! empty( $mobile ) ? $mobile : $tablet;
					break;
				case 'tablet':
					$widths = ! empty( $tablet ) ? $tablet : $desktop;
					break;
				default:
					$widths = $desktop;
			}

			return uplifters_site_builder_blocks_p_column_layout_normalize_widths( $widths, $count );
		}

		// Legacy: flat array → use for all devices
		if ( is_array( $raw ) ) {
			return uplifters_site_builder_blocks_p_column_layout_normalize_widths( $raw, $count );
		}

		return uplifters_site_builder_blocks_p_column_layout_get_equal_widths( $count );
	}
}

/**
 * Resolve a gap value (number or object) for a specific device.
 *
 * @param mixed  $raw     Raw gap attribute.
 * @param string $device  'desktop' | 'tablet' | 'mobile'
 * @return float
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_layout_resolve_gap' ) ) {
	function uplifters_site_builder_blocks_p_column_layout_resolve_gap( $raw, $device ) {
		if ( is_array( $raw ) && ! isset( $raw[0] ) ) {
			// Object shape
			$desktop = is_numeric( $raw['desktop'] ?? null ) ? (float) $raw['desktop'] : 0;
			$tablet  = is_numeric( $raw['tablet']  ?? null ) ? (float) $raw['tablet']  : $desktop;
			$mobile  = is_numeric( $raw['mobile']  ?? null ) ? (float) $raw['mobile']  : $tablet;

			switch ( $device ) {
				case 'mobile': return max( 0, min( 100, $mobile ) );
				case 'tablet': return max( 0, min( 100, $tablet ) );
				default:       return max( 0, min( 100, $desktop ) );
			}
		}

		// Legacy: plain number
		return max( 0, min( 100, is_numeric( $raw ) ? (float) $raw : 0 ) );
	}
}

// ── Resolve attributes ────────────────────────────────────────────────────────

$uplifters_site_builder_blocks_section_count = isset( $attributes['sections'] )
	? absint( $attributes['sections'] )
	: 0;

if ( $uplifters_site_builder_blocks_section_count < 1 ) {
	return;
}

$uplifters_site_builder_blocks_raw_gap           = $attributes['gap']          ?? 0;
$uplifters_site_builder_blocks_raw_column_widths = $attributes['columnWidths'] ?? array();

$uplifters_site_builder_blocks_gap_desktop = uplifters_site_builder_blocks_p_column_layout_resolve_gap( $uplifters_site_builder_blocks_raw_gap, 'desktop' );
$uplifters_site_builder_blocks_gap_tablet  = uplifters_site_builder_blocks_p_column_layout_resolve_gap( $uplifters_site_builder_blocks_raw_gap, 'tablet'  );
$uplifters_site_builder_blocks_gap_mobile  = uplifters_site_builder_blocks_p_column_layout_resolve_gap( $uplifters_site_builder_blocks_raw_gap, 'mobile'  );

// Desktop widths drive the static grid-template-columns.
// Tablet and mobile widths are written as CSS custom properties and applied
// via media queries so each breakpoint gets its own column layout.
$uplifters_site_builder_blocks_widths_desktop = uplifters_site_builder_blocks_p_column_layout_resolve_column_widths(
	$uplifters_site_builder_blocks_raw_column_widths, 'desktop', $uplifters_site_builder_blocks_section_count
);
$uplifters_site_builder_blocks_widths_tablet  = uplifters_site_builder_blocks_p_column_layout_resolve_column_widths(
	$uplifters_site_builder_blocks_raw_column_widths, 'tablet',  $uplifters_site_builder_blocks_section_count
);
$uplifters_site_builder_blocks_widths_mobile  = uplifters_site_builder_blocks_p_column_layout_resolve_column_widths(
	$uplifters_site_builder_blocks_raw_column_widths, 'mobile',  $uplifters_site_builder_blocks_section_count
);

$uplifters_site_builder_blocks_gtc_desktop = uplifters_site_builder_blocks_p_column_layout_make_grid_template( $uplifters_site_builder_blocks_widths_desktop, $uplifters_site_builder_blocks_section_count );
$uplifters_site_builder_blocks_gtc_tablet  = uplifters_site_builder_blocks_p_column_layout_make_grid_template( $uplifters_site_builder_blocks_widths_tablet,  $uplifters_site_builder_blocks_section_count );
$uplifters_site_builder_blocks_gtc_mobile  = uplifters_site_builder_blocks_p_column_layout_make_grid_template( $uplifters_site_builder_blocks_widths_mobile,  $uplifters_site_builder_blocks_section_count );

// Inline style: desktop values applied directly; others via CSS vars.
$uplifters_site_builder_blocks_inline_style = implode( '', array(
	'--uplifters-site-builder-blocks-column-layout-gap-desktop:',   $uplifters_site_builder_blocks_gap_desktop,  'px;',
	'--uplifters-site-builder-blocks-column-layout-gap-tablet:',    $uplifters_site_builder_blocks_gap_tablet,   'px;',
	'--uplifters-site-builder-blocks-column-layout-gap-mobile:',    $uplifters_site_builder_blocks_gap_mobile,   'px;',
	'--uplifters-site-builder-blocks-column-layout-gtc-tablet:',    $uplifters_site_builder_blocks_gtc_tablet,   ';',
	'--uplifters-site-builder-blocks-column-layout-gtc-mobile:',    $uplifters_site_builder_blocks_gtc_mobile,   ';',
	'display:grid;',
	'grid-template-columns:',    $uplifters_site_builder_blocks_gtc_desktop,  ';',
	'gap:',                      $uplifters_site_builder_blocks_gap_desktop,  'px;',
	'width:100%;',
	'max-width:100%;',
	'box-sizing:border-box;',
	'overflow-wrap:anywhere;',
	'word-break:break-word;',
	'align-items:stretch;',
) );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'column-layout',
	'style' => $uplifters_site_builder_blocks_inline_style,
) );
?>

<?php
// Print responsive <style> block only once per page.
static $uplifters_site_builder_blocks_column_layout_style_printed = false;

if ( ! $uplifters_site_builder_blocks_column_layout_style_printed ) :
	$uplifters_site_builder_blocks_column_layout_style_printed = true;
?>
<?php ob_start(); ?>

	.column-layout > * {
		min-width: 0 !important;
		max-width: 100%;
		box-sizing: border-box;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.column-layout > .column-section,
	.column-layout > .wp-block-column-section {
		width: 100%;
		min-inline-size: 0;
	}

	@media (max-width: 1024px) {
		.column-layout {
			grid-template-columns: var( --uplifters-site-builder-blocks-column-layout-gtc-tablet ) !important;
			gap: var( --uplifters-site-builder-blocks-column-layout-gap-tablet ) !important;
		}
	}

	@media (max-width: 767px) {
		.column-layout {
			grid-template-columns: var( --uplifters-site-builder-blocks-column-layout-gtc-mobile ) !important;
			gap: var( --uplifters-site-builder-blocks-column-layout-gap-mobile ) !important;
		}
	}
<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>
<?php endif; ?>

	<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
</div>
