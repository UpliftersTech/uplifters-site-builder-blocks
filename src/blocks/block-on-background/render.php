<?php
/**
 * Server-side rendering for the BlockOnBackground block.
 *
 * @package UpliftersSiteBuilderBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$uplifters_site_builder_blocks_block_height    = isset( $attributes['blockHeight'] ) ? absint( $attributes['blockHeight'] ) : 400;
$uplifters_site_builder_blocks_block_width     = isset( $attributes['blockWidth'] ) ? absint( $attributes['blockWidth'] ) : 1200;
$uplifters_site_builder_blocks_padding_top     = isset( $attributes['paddingTop'] ) ? absint( $attributes['paddingTop'] ) : 20;
$uplifters_site_builder_blocks_padding_bottom  = isset( $attributes['paddingBottom'] ) ? absint( $attributes['paddingBottom'] ) : 20;
$uplifters_site_builder_blocks_padding_left    = isset( $attributes['paddingLeft'] ) ? absint( $attributes['paddingLeft'] ) : 20;
$uplifters_site_builder_blocks_padding_right   = isset( $attributes['paddingRight'] ) ? absint( $attributes['paddingRight'] ) : 20;
$uplifters_site_builder_blocks_bg_image_url    = isset( $attributes['bgImageUrl'] ) ? esc_url_raw( $attributes['bgImageUrl'] ) : '';
$uplifters_site_builder_blocks_overlay_opacity = isset( $attributes['overlayOpacity'] ) ? absint( $attributes['overlayOpacity'] ) : 0;
$uplifters_site_builder_blocks_bg_color        = isset( $attributes['bgColor'] ) ? sanitize_text_field( $attributes['bgColor'] ) : '';
$uplifters_site_builder_blocks_bg_gradient     = isset( $attributes['bgGradient'] ) ? sanitize_text_field( $attributes['bgGradient'] ) : '';

if ( '' !== $uplifters_site_builder_blocks_bg_gradient && ! preg_match( '/^[a-zA-Z0-9\s(),.%#\-]+$/', $uplifters_site_builder_blocks_bg_gradient ) ) {
	$uplifters_site_builder_blocks_bg_gradient = '';
}

// Image and gradient are mutually exclusive; the image wins if both are present.
if ( '' !== $uplifters_site_builder_blocks_bg_image_url ) {
	$uplifters_site_builder_blocks_bg_gradient = '';
}

if ( $uplifters_site_builder_blocks_overlay_opacity > 100 ) {
	$uplifters_site_builder_blocks_overlay_opacity = 100;
}

$uplifters_site_builder_blocks_inline_styles = array(
	'--uplifters-block-on-background-height: ' . $uplifters_site_builder_blocks_block_height . 'px',
	'--uplifters-block-on-background-width: ' . $uplifters_site_builder_blocks_block_width . 'px',
	'--uplifters-block-on-background-padding-top: ' . $uplifters_site_builder_blocks_padding_top . 'px',
	'--uplifters-block-on-background-padding-bottom: ' . $uplifters_site_builder_blocks_padding_bottom . 'px',
	'--uplifters-block-on-background-padding-left: ' . $uplifters_site_builder_blocks_padding_left . 'px',
	'--uplifters-block-on-background-padding-right: ' . $uplifters_site_builder_blocks_padding_right . 'px',
	'--uplifters-block-on-background-overlay: rgba(0, 0, 0, ' . ( $uplifters_site_builder_blocks_overlay_opacity / 100 ) . ')',
);

if ( '' !== $uplifters_site_builder_blocks_bg_color ) {
	$uplifters_site_builder_blocks_inline_styles[] = '--uplifters-block-on-background-bg-color: ' . $uplifters_site_builder_blocks_bg_color;
}

$uplifters_site_builder_blocks_inline_styles[] = '--uplifters-block-on-background-bg-image: ' . ( '' !== $uplifters_site_builder_blocks_bg_image_url ? 'url(' . $uplifters_site_builder_blocks_bg_image_url . ')' : 'none' );
$uplifters_site_builder_blocks_inline_styles[] = '--uplifters-block-on-background-bg-gradient: ' . ( '' !== $uplifters_site_builder_blocks_bg_gradient ? $uplifters_site_builder_blocks_bg_gradient : 'none' );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'uplifters-block-on-background',
		'style' => implode( '; ', $uplifters_site_builder_blocks_inline_styles ) . ';',
	)
);
$uplifters_site_builder_blocks_overlay_style = 'background-color: rgba(0, 0, 0, ' . ( $uplifters_site_builder_blocks_overlay_opacity / 100 ) . ');';
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<div
		class="uplifters-block-on-background__overlay"
		style="<?php echo esc_attr( $uplifters_site_builder_blocks_overlay_style ); ?>"
		aria-hidden="true"
	></div>

	<div class="uplifters-block-on-background__content">
		<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
	</div>
</div>