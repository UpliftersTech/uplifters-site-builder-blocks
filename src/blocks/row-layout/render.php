<?php
/**
 * Server-side rendering for the Row Layout block.
 *
 * columnWidths: { desktop:[], tablet:[], mobile:[] }
 * gap:          { desktop:0,  tablet:0,  mobile:0  }
 *
 * Each device's columnWidths array is converted into a grid-template-rows
 * value and applied via CSS custom properties + media queries so the
 * frontend matches what the editor drag-resize preview shows.
 *
 * Row sizing uses minmax(auto, Xfr):
 *   - minimum: auto  → row is never taller than its content needs.
 *   - maximum: Xfr   → proportional share when the grid has free height.
 * This means short content stays short; the proportions only kick in when
 * the grid container is explicitly taller than the sum of content heights.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

$uplifters_site_builder_blocks_to_float = static function ( $value, $fallback = 0 ) {
	return is_numeric( $value ) ? (float) $value : (float) $fallback;
};

$uplifters_site_builder_blocks_fmt = static function ( $value ) {
	return rtrim( rtrim( number_format( (float) $value, 4, '.', '' ), '0' ), '.' );
};

/**
 * Normalize a raw sizes array so values sum to 100.
 *
 * @param mixed $sizes   Raw array from attribute.
 * @param int   $count   Expected stack count.
 * @return float[]
 */
$uplifters_site_builder_blocks_normalize = static function ( $sizes, $count ) {
	$count = max( 1, (int) $count );

	if ( ! is_array( $sizes ) || count( $sizes ) !== $count ) {
		return array_fill( 0, $count, 100 / $count );
	}

	$nums  = array_map( static fn( $v ) => is_numeric( $v ) ? (float) $v : 0, $sizes );
	$total = array_sum( $nums );

	if ( $total <= 0 ) {
		return array_fill( 0, $count, 100 / $count );
	}

	return array_map( static fn( $v ) => ( $v / $total ) * 100, $nums );
};

/**
 * Build a grid-template-rows CSS value from a normalized sizes array.
 * Uses minmax(auto, Xfr) — content-height minimum, proportional maximum.
 *
 * @param float[]      $sizes  Normalized percentages (sum = 100).
 * @param int          $count  Stack count.
 * @param callable     $fmt    Number formatter.
 * @return string
 */
$uplifters_site_builder_blocks_build_rows = static function ( $sizes, $count, $fmt ) {
	$count = max( 1, (int) $count );

	if ( empty( $sizes ) ) {
		return sprintf( 'repeat(%d,auto)', $count );
	}

	return implode(
		' ',
		array_map(
			static fn( $s ) => 'minmax(auto,' . $fmt( $s ) . 'fr)',
			$sizes
		)
	);
};

// ── Attributes ────────────────────────────────────────────────────────────────

$uplifters_site_builder_blocks_stack_count = isset( $attributes['sections'] )
	? absint( $attributes['sections'] )
	: 0;

if ( $uplifters_site_builder_blocks_stack_count < 1 ) {
	return;
}

// columnWidths — { desktop:[], tablet:[], mobile:[] }
$uplifters_site_builder_blocks_cw = isset( $attributes['columnWidths'] ) && is_array( $attributes['columnWidths'] )
	? $attributes['columnWidths']
	: array();

$uplifters_site_builder_blocks_widths_d = $uplifters_site_builder_blocks_normalize( $uplifters_site_builder_blocks_cw['desktop'] ?? array(), $uplifters_site_builder_blocks_stack_count );
$uplifters_site_builder_blocks_widths_t = $uplifters_site_builder_blocks_normalize( $uplifters_site_builder_blocks_cw['tablet']  ?? array(), $uplifters_site_builder_blocks_stack_count );
$uplifters_site_builder_blocks_widths_m = $uplifters_site_builder_blocks_normalize( $uplifters_site_builder_blocks_cw['mobile']  ?? array(), $uplifters_site_builder_blocks_stack_count );

$uplifters_site_builder_blocks_rows_d = $uplifters_site_builder_blocks_build_rows( $uplifters_site_builder_blocks_widths_d, $uplifters_site_builder_blocks_stack_count, $uplifters_site_builder_blocks_fmt );
$uplifters_site_builder_blocks_rows_t = $uplifters_site_builder_blocks_build_rows( $uplifters_site_builder_blocks_widths_t, $uplifters_site_builder_blocks_stack_count, $uplifters_site_builder_blocks_fmt );
$uplifters_site_builder_blocks_rows_m = $uplifters_site_builder_blocks_build_rows( $uplifters_site_builder_blocks_widths_m, $uplifters_site_builder_blocks_stack_count, $uplifters_site_builder_blocks_fmt );

// gap — { desktop:0, tablet:0, mobile:0 }
$uplifters_site_builder_blocks_gap_attr = isset( $attributes['gap'] ) && is_array( $attributes['gap'] )
	? $attributes['gap']
	: array();

$uplifters_site_builder_blocks_gap_d = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_gap_attr['desktop'] ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_gap_t = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_gap_attr['tablet']  ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_gap_m = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_gap_attr['mobile']  ?? 0, 0 ) ) );

// topSpace / bottomSpace — { desktop:0, tablet:0, mobile:0 }
// Extra space above the first row / below the last row, set by dragging the
// layout's outer edge handles. Rendered as padding on the grid wrapper so
// it never eats into the row tracks themselves.
$uplifters_site_builder_blocks_top_attr = isset( $attributes['topSpace'] ) && is_array( $attributes['topSpace'] )
	? $attributes['topSpace']
	: array();

$uplifters_site_builder_blocks_top_d = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_top_attr['desktop'] ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_top_t = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_top_attr['tablet']  ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_top_m = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_top_attr['mobile']  ?? 0, 0 ) ) );

$uplifters_site_builder_blocks_bottom_attr = isset( $attributes['bottomSpace'] ) && is_array( $attributes['bottomSpace'] )
	? $attributes['bottomSpace']
	: array();

$uplifters_site_builder_blocks_bottom_d = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_bottom_attr['desktop'] ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_bottom_t = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_bottom_attr['tablet']  ?? 0, 0 ) ) );
$uplifters_site_builder_blocks_bottom_m = max( 0, min( 200, $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_bottom_attr['mobile']  ?? 0, 0 ) ) );

// ── Shared responsive CSS → <head> ───────────────────────────────────────────
//
// Only the media-query rules go here — they reference CSS custom properties
// that are set per-instance in the inline style below.
// wp_add_inline_style() deduplicates: multiple layout blocks on the same
// page will only emit this CSS once.
//
$uplifters_site_builder_blocks_layout_css = '
.uplifters-site-builder-blocks-q-row-layout {
	box-sizing:    border-box;
	overflow-wrap: break-word;
}
@media (max-width:1024px) {
	.uplifters-site-builder-blocks-q-row-layout {
		grid-template-rows: var(--uplifters-site-builder-blocks-rl-rt) !important;
		gap:                var(--uplifters-site-builder-blocks-rl-gt) !important;
		padding-top:        var(--uplifters-site-builder-blocks-rl-pt-t) !important;
		padding-bottom:     var(--uplifters-site-builder-blocks-rl-pb-t) !important;
	}
}
@media (max-width:767px) {
	.uplifters-site-builder-blocks-q-row-layout {
		grid-template-rows: var(--uplifters-site-builder-blocks-rl-rm) !important;
		gap:                var(--uplifters-site-builder-blocks-rl-gm) !important;
		padding-top:        var(--uplifters-site-builder-blocks-rl-pt-m) !important;
		padding-bottom:     var(--uplifters-site-builder-blocks-rl-pb-m) !important;
	}
}';

if ( wp_style_is( 'uplifters-site-builder-blocks-font-oswald', 'enqueued' ) ) {
	wp_add_inline_style( 'uplifters-site-builder-blocks-font-oswald', $uplifters_site_builder_blocks_layout_css );
} elseif ( wp_style_is( 'wp-block-library', 'enqueued' ) ) {
	wp_add_inline_style( 'wp-block-library', $uplifters_site_builder_blocks_layout_css );
} else {
	wp_register_style( 'uplifters-site-builder-blocks-q-row-layout', false, array(), UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION );
	wp_enqueue_style( 'uplifters-site-builder-blocks-q-row-layout' );
	wp_add_inline_style( 'uplifters-site-builder-blocks-q-row-layout', $uplifters_site_builder_blocks_layout_css );
}

// ── Per-instance inline style ─────────────────────────────────────────────────
//
// CSS custom properties carry each device's values.
// Desktop base styles are applied directly; tablet/mobile override via
// the shared media queries above.
//
$uplifters_site_builder_blocks_inline_style = implode( '', array(
	// grid-template-rows per device
	'--uplifters-site-builder-blocks-rl-rd:', $uplifters_site_builder_blocks_rows_d, ';',
	'--uplifters-site-builder-blocks-rl-rt:', $uplifters_site_builder_blocks_rows_t, ';',
	'--uplifters-site-builder-blocks-rl-rm:', $uplifters_site_builder_blocks_rows_m, ';',
	// gap per device
	'--uplifters-site-builder-blocks-rl-gd:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_gap_d ), 'px;',
	'--uplifters-site-builder-blocks-rl-gt:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_gap_t ), 'px;',
	'--uplifters-site-builder-blocks-rl-gm:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_gap_m ), 'px;',
	// top/bottom space per device
	'--uplifters-site-builder-blocks-rl-pt-d:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_top_d ), 'px;',
	'--uplifters-site-builder-blocks-rl-pt-t:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_top_t ), 'px;',
	'--uplifters-site-builder-blocks-rl-pt-m:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_top_m ), 'px;',
	'--uplifters-site-builder-blocks-rl-pb-d:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_bottom_d ), 'px;',
	'--uplifters-site-builder-blocks-rl-pb-t:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_bottom_t ), 'px;',
	'--uplifters-site-builder-blocks-rl-pb-m:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_bottom_m ), 'px;',
	// base (desktop) applied directly
	'display:grid;',
	'grid-template-columns:minmax(0,1fr);',
	'grid-template-rows:var(--uplifters-site-builder-blocks-rl-rd);',
	'gap:var(--uplifters-site-builder-blocks-rl-gd);',
	'padding-top:var(--uplifters-site-builder-blocks-rl-pt-d);',
	'padding-bottom:var(--uplifters-site-builder-blocks-rl-pb-d);',
	'width:100%;',
	'max-width:100%;',
) );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'uplifters-site-builder-blocks-q-row-layout',
	'style' => $uplifters_site_builder_blocks_inline_style,
) );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
</div>
