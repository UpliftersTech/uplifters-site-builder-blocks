<?php
/**
 * Server-side rendering for the Row Section block.
 *
 * Attributes are now responsive objects:
 *   padding         = { desktop: 0, tablet: 0, mobile: 0 }
 *   margin          = { desktop: 0, tablet: 0, mobile: 0 }
 *   backgroundColor = { desktop: '', tablet: '', mobile: '' }
 *
 * Responsive CSS lives in <head> via wp_add_inline_style() — never inside
 * the grid container (a <style> as a direct grid child creates an invisible
 * extra grid row).
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

// ── Read object attributes ────────────────────────────────────────────────────

$uplifters_site_builder_blocks_padding         = isset( $attributes['padding'] )         && is_array( $attributes['padding'] )         ? $attributes['padding']         : array();
$uplifters_site_builder_blocks_margin          = isset( $attributes['margin'] )          && is_array( $attributes['margin'] )          ? $attributes['margin']          : array();
$uplifters_site_builder_blocks_background_color = isset( $attributes['backgroundColor'] ) && is_array( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : array();

$uplifters_site_builder_blocks_pad_d = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_padding['desktop'] ?? 0, 0 );
$uplifters_site_builder_blocks_pad_t = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_padding['tablet']  ?? 0, 0 );
$uplifters_site_builder_blocks_pad_m = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_padding['mobile']  ?? 0, 0 );

$uplifters_site_builder_blocks_mar_d = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_margin['desktop'] ?? 0, 0 );
$uplifters_site_builder_blocks_mar_t = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_margin['tablet']  ?? 0, 0 );
$uplifters_site_builder_blocks_mar_m = $uplifters_site_builder_blocks_to_float( $uplifters_site_builder_blocks_margin['mobile']  ?? 0, 0 );

$uplifters_site_builder_blocks_bg_d = sanitize_hex_color( $uplifters_site_builder_blocks_background_color['desktop'] ?? '' ) ?: '';
$uplifters_site_builder_blocks_bg_t = sanitize_hex_color( $uplifters_site_builder_blocks_background_color['tablet']  ?? '' ) ?: $uplifters_site_builder_blocks_bg_d;
$uplifters_site_builder_blocks_bg_m = sanitize_hex_color( $uplifters_site_builder_blocks_background_color['mobile']  ?? '' ) ?: $uplifters_site_builder_blocks_bg_t;

// ── Responsive CSS → <head> ───────────────────────────────────────────────────
//
// The base rules here do the containment work:
//   • min-height: 0    — a grid item's default `min-height: auto` lets tall
//                        content escape its row track; that overflow is what
//                        made one stack's image paint over the stack below
//                        and hide the images after it.
//   • display: flow-root — establishes a block formatting context so child
//                        margins don't collapse out of the stack.
//   • media rules      — an unconstrained <img> renders at its intrinsic
//                        size, which is the other half of the same overflow.
//
$uplifters_site_builder_blocks_responsive_css = '
.uplifters-site-builder-blocks-q-row-section {
	box-sizing:    border-box;
	min-width:     0;
	min-height:    0;
	display:       flow-root;
	overflow-wrap: anywhere;
}
.uplifters-site-builder-blocks-q-row-section img,
.uplifters-site-builder-blocks-q-row-section video,
.uplifters-site-builder-blocks-q-row-section iframe {
	max-width: 100%;
	height:    auto;
	display:   block;
}
.uplifters-site-builder-blocks-q-row-section figure {
	max-width:    100%;
	margin-left:  0;
	margin-right: 0;
}
.uplifters-site-builder-blocks-q-row-section > * {
	margin-top: 0;
	margin-bottom: 0;
}
@media (max-width:1024px) {
	.uplifters-site-builder-blocks-q-row-section {
		padding:          var(--uplifters-site-builder-blocks-rsc-pt) !important;
		margin:           var(--uplifters-site-builder-blocks-rsc-mt) !important;
		background-color: var(--uplifters-site-builder-blocks-rsc-bgt, transparent) !important;
	}
}
@media (max-width:767px) {
	.uplifters-site-builder-blocks-q-row-section {
		padding:          var(--uplifters-site-builder-blocks-rsc-pm) !important;
		margin:           var(--uplifters-site-builder-blocks-rsc-mm) !important;
		background-color: var(--uplifters-site-builder-blocks-rsc-bgm, transparent) !important;
	}
}';

if ( wp_style_is( 'uplifters-site-builder-blocks-font-oswald', 'enqueued' ) ) {
	wp_add_inline_style( 'uplifters-site-builder-blocks-font-oswald', $uplifters_site_builder_blocks_responsive_css );
} elseif ( wp_style_is( 'wp-block-library', 'enqueued' ) ) {
	wp_add_inline_style( 'wp-block-library', $uplifters_site_builder_blocks_responsive_css );
} else {
	wp_register_style( 'uplifters-site-builder-blocks-q-row-section', false, array(), UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION );
	wp_enqueue_style( 'uplifters-site-builder-blocks-q-row-section' );
	wp_add_inline_style( 'uplifters-site-builder-blocks-q-row-section', $uplifters_site_builder_blocks_responsive_css );
}

// ── Inline style on the element ───────────────────────────────────────────────

$uplifters_site_builder_blocks_props = implode( '', array(
	'--uplifters-site-builder-blocks-rsc-pd:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_pad_d ), 'px;',
	'--uplifters-site-builder-blocks-rsc-pt:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_pad_t ), 'px;',
	'--uplifters-site-builder-blocks-rsc-pm:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_pad_m ), 'px;',
	'--uplifters-site-builder-blocks-rsc-md:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_mar_d ), 'px;',
	'--uplifters-site-builder-blocks-rsc-mt:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_mar_t ), 'px;',
	'--uplifters-site-builder-blocks-rsc-mm:', $uplifters_site_builder_blocks_fmt( $uplifters_site_builder_blocks_mar_m ), 'px;',
	( $uplifters_site_builder_blocks_bg_d !== '' ? '--uplifters-site-builder-blocks-rsc-bgd:' . $uplifters_site_builder_blocks_bg_d . ';' : '' ),
	( $uplifters_site_builder_blocks_bg_t !== '' ? '--uplifters-site-builder-blocks-rsc-bgt:' . $uplifters_site_builder_blocks_bg_t . ';' : '' ),
	( $uplifters_site_builder_blocks_bg_m !== '' ? '--uplifters-site-builder-blocks-rsc-bgm:' . $uplifters_site_builder_blocks_bg_m . ';' : '' ),
) );

$uplifters_site_builder_blocks_base = implode( '', array(
	'padding:var(--uplifters-site-builder-blocks-rsc-pd);',
	'margin:var(--uplifters-site-builder-blocks-rsc-md);',
	( $uplifters_site_builder_blocks_bg_d !== '' ? 'background-color:var(--uplifters-site-builder-blocks-rsc-bgd);' : '' ),
) );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'uplifters-site-builder-blocks-q-row-section',
	'style' => $uplifters_site_builder_blocks_props . $uplifters_site_builder_blocks_base,
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