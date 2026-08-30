<?php
/**
 * Server-side rendering for the Columns Section block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Helper functions (declared once per page) ─────────────────────────────────

if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_section_get_numeric_value' ) ) {
	function uplifters_site_builder_blocks_p_column_section_get_numeric_value( $value, $fallback = 0 ) {
		if ( ! is_numeric( $value ) ) {
			return (float) $fallback;
		}
		return (float) $value;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_section_format_css_number' ) ) {
	function uplifters_site_builder_blocks_p_column_section_format_css_number( $value ) {
		$formatted = number_format( (float) $value, 4, '.', '' );
		return rtrim( rtrim( $formatted, '0' ), '.' );
	}
}

/**
 * Extract a device-specific value from a responsive attribute object.
 * Cascade: tablet → desktop, mobile → tablet → desktop.
 *
 * @param array  $obj    Object with device keys { desktop, tablet, mobile }
 * @param string $device 'desktop' | 'tablet' | 'mobile'
 * @param mixed  $fallback
 * @return mixed
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_p_column_section_resolve_responsive_value' ) ) {
	function uplifters_site_builder_blocks_p_column_section_resolve_responsive_value( $obj, $device, $fallback = null ) {
		if ( ! is_array( $obj ) ) {
			return $fallback;
		}

		$desktop = isset( $obj['desktop'] ) ? $obj['desktop'] : $fallback;

		if ( $device === 'desktop' ) {
			return $desktop;
		}

		$tablet = isset( $obj['tablet'] ) ? $obj['tablet'] : $desktop;

		if ( $device === 'tablet' ) {
			return $tablet;
		}

		// mobile
		$mobile = isset( $obj['mobile'] ) ? $obj['mobile'] : $tablet;
		return $mobile;
	}
}

// ── Extract and normalize attributes ──────────────────────────────────────────

$uplifters_site_builder_blocks_padding_attr = isset( $attributes['padding'] ) && is_array( $attributes['padding'] )
	? $attributes['padding']
	: array( 'desktop' => 0, 'tablet' => 0, 'mobile' => 0 );

$uplifters_site_builder_blocks_margin_attr = isset( $attributes['margin'] ) && is_array( $attributes['margin'] )
	? $attributes['margin']
	: array( 'desktop' => 0, 'tablet' => 0, 'mobile' => 0 );

$uplifters_site_builder_blocks_bg_color_attr = isset( $attributes['backgroundColor'] ) && is_array( $attributes['backgroundColor'] )
	? $attributes['backgroundColor']
	: array( 'desktop' => '', 'tablet' => '', 'mobile' => '' );

// Desktop values used directly; tablet/mobile via media queries + CSS custom properties
$uplifters_site_builder_blocks_padding_desktop = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_padding_attr['desktop'] ?? 0, 0 );
$uplifters_site_builder_blocks_padding_tablet  = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_padding_attr['tablet']  ?? 0, 0 );
$uplifters_site_builder_blocks_padding_mobile  = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_padding_attr['mobile']  ?? 0, 0 );

$uplifters_site_builder_blocks_margin_desktop = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_margin_attr['desktop'] ?? 0, 0 );
$uplifters_site_builder_blocks_margin_tablet  = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_margin_attr['tablet']  ?? 0, 0 );
$uplifters_site_builder_blocks_margin_mobile  = uplifters_site_builder_blocks_p_column_section_get_numeric_value( $uplifters_site_builder_blocks_margin_attr['mobile']  ?? 0, 0 );

$uplifters_site_builder_blocks_sanitize_background_color = static function ( $value ): string {
	$color = is_string( $value ) ? trim( $value ) : '';
	$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
		|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color )
		|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $color );

	return $is_valid ? $color : '';
};

$uplifters_site_builder_blocks_bg_desktop = $uplifters_site_builder_blocks_sanitize_background_color( $uplifters_site_builder_blocks_bg_color_attr['desktop'] ?? '' );
$uplifters_site_builder_blocks_bg_tablet  = $uplifters_site_builder_blocks_sanitize_background_color( $uplifters_site_builder_blocks_bg_color_attr['tablet'] ?? '' );
$uplifters_site_builder_blocks_bg_mobile  = $uplifters_site_builder_blocks_sanitize_background_color( $uplifters_site_builder_blocks_bg_color_attr['mobile'] ?? '' );

// Cascade fallback
$uplifters_site_builder_blocks_bg_desktop = $uplifters_site_builder_blocks_bg_desktop ?: 'transparent';
$uplifters_site_builder_blocks_bg_tablet  = $uplifters_site_builder_blocks_bg_tablet  ?: $uplifters_site_builder_blocks_bg_desktop;
$uplifters_site_builder_blocks_bg_mobile  = $uplifters_site_builder_blocks_bg_mobile  ?: $uplifters_site_builder_blocks_bg_tablet;

// Inline style: desktop values directly, others via CSS custom properties
$uplifters_site_builder_blocks_inline_style = implode( '', array(
	'--column-section-padding-desktop:',  uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_padding_desktop ), 'px;',
	'--column-section-padding-tablet:',   uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_padding_tablet  ), 'px;',
	'--column-section-padding-mobile:',   uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_padding_mobile  ), 'px;',
	'--column-section-margin-desktop:',   uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_margin_desktop  ), 'px;',
	'--column-section-margin-tablet:',    uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_margin_tablet   ), 'px;',
	'--column-section-margin-mobile:',    uplifters_site_builder_blocks_p_column_section_format_css_number( $uplifters_site_builder_blocks_margin_mobile   ), 'px;',
	'--column-section-background-desktop:', $uplifters_site_builder_blocks_bg_desktop, ';',
	'--column-section-background-tablet:',  $uplifters_site_builder_blocks_bg_tablet,  ';',
	'--column-section-background-mobile:',  $uplifters_site_builder_blocks_bg_mobile,  ';',
	'padding:var(--column-section-padding-desktop);',
	'margin:var(--column-section-margin-desktop);',
	'background-color:var(--column-section-background-desktop);',
	'box-sizing:border-box;',
	'width:100%;',
	'max-width:100%;',
	'min-width:0;',
	'overflow-wrap:anywhere;',
	'word-break:break-word;',
) );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'column-section',
	'style' => $uplifters_site_builder_blocks_inline_style,
) );
?>

<?php
// Print responsive <style> block only once per page.
static $uplifters_site_builder_blocks_p_column_section_style_printed = false;

if ( ! $uplifters_site_builder_blocks_p_column_section_style_printed ) :
	$uplifters_site_builder_blocks_p_column_section_style_printed = true;
?>
<?php ob_start(); ?>

	.column-section > *,
	.column-section .wp-block,
	.column-section p {
		max-width: 100%;
		min-width: 0;
		overflow-wrap: anywhere;
		word-break: break-word;
		box-sizing: border-box;
	}

	@media (max-width: 1024px) {
		.column-section {
			padding: var( --column-section-padding-tablet ) !important;
			margin: var( --column-section-margin-tablet ) !important;
			background-color: var( --column-section-background-tablet ) !important;
		}
	}

	@media (max-width: 767px) {
		.column-section {
			padding: var( --column-section-padding-mobile ) !important;
			margin: var( --column-section-margin-mobile ) !important;
			background-color: var( --column-section-background-mobile ) !important;
		}
	}
<?php
$uplifters_site_builder_blocks_css = ob_get_clean();
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>
<?php endif; ?>

	<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
</div>
