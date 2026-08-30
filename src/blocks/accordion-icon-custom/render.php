<?php
/**
 * Server-side render template for the Uplifters Website Builder Accordion block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_accordion_icon_custom_responsive_value' ) ) {
	function uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}

			if ( isset( $value['desktop'] ) && '' !== $value['desktop'] && null !== $value['desktop'] ) {
				return $value['desktop'];
			}

			if ( isset( $value['tablet'] ) && '' !== $value['tablet'] && null !== $value['tablet'] ) {
				return $value['tablet'];
			}

			if ( isset( $value['mobile'] ) && '' !== $value['mobile'] && null !== $value['mobile'] ) {
				return $value['mobile'];
			}

			return $fallback;
		}

		return ( '' !== $value && null !== $value ) ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_accordion_icon_custom_safe_color' ) ) {
	function uplifters_site_builder_blocks_accordion_icon_custom_safe_color( $color ): string {
		$color = is_string( $color ) ? trim( $color ) : '';

		if ( '' === $color ) {
			return '';
		}

		$safe = safecss_filter_attr( 'color:' . $color );

		if ( '' === $safe ) {
			return '';
		}

		return trim( (string) preg_replace( '/^color\s*:\s*/i', '', $safe ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_accordion_icon_custom_font_size' ) ) {
	function uplifters_site_builder_blocks_accordion_icon_custom_font_size( $value, int $fallback ): int {
		$value = absint( $value );
		return $value ? $value : $fallback;
	}
}

$uplifters_site_builder_blocks_heading         = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
$uplifters_site_builder_blocks_items           = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();
$uplifters_site_builder_blocks_default_open_id = isset( $attributes['defaultOpenId'] ) ? (string) $attributes['defaultOpenId'] : '';

$uplifters_site_builder_blocks_block_id   = ! empty( $attributes['blockId'] ) ? sanitize_html_class( $attributes['blockId'] ) : wp_unique_id( 'uplifters-site-builder-blocks-accordion-icon-custom-' );
$uplifters_site_builder_blocks_group_name = $uplifters_site_builder_blocks_block_id . '-group';

$uplifters_site_builder_blocks_desktop_heading_font_family_key = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_tablet_heading_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_mobile_heading_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_desktop_heading_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_heading_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_tablet_heading_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_heading_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_mobile_heading_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_heading_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_heading_font_size = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontSize', 'desktop', 28 ), 28 );
$uplifters_site_builder_blocks_tablet_heading_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontSize', 'tablet', $uplifters_site_builder_blocks_desktop_heading_font_size ), $uplifters_site_builder_blocks_desktop_heading_font_size );
$uplifters_site_builder_blocks_mobile_heading_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingFontSize', 'mobile', $uplifters_site_builder_blocks_desktop_heading_font_size ), $uplifters_site_builder_blocks_desktop_heading_font_size );

$uplifters_site_builder_blocks_desktop_heading_color = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingColor', 'desktop', '' ) );
$uplifters_site_builder_blocks_tablet_heading_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingColor', 'tablet', $uplifters_site_builder_blocks_desktop_heading_color ) );
$uplifters_site_builder_blocks_mobile_heading_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'headingColor', 'mobile', $uplifters_site_builder_blocks_desktop_heading_color ) );

$uplifters_site_builder_blocks_desktop_title_font_family_key = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_tablet_title_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_mobile_title_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_desktop_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_title_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_tablet_title_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_title_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_mobile_title_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_title_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_title_font_size = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontSize', 'desktop', 16 ), 16 );
$uplifters_site_builder_blocks_tablet_title_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontSize', 'tablet', $uplifters_site_builder_blocks_desktop_title_font_size ), $uplifters_site_builder_blocks_desktop_title_font_size );
$uplifters_site_builder_blocks_mobile_title_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleFontSize', 'mobile', $uplifters_site_builder_blocks_desktop_title_font_size ), $uplifters_site_builder_blocks_desktop_title_font_size );

$uplifters_site_builder_blocks_desktop_title_color = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleColor', 'desktop', '' ) );
$uplifters_site_builder_blocks_tablet_title_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleColor', 'tablet', $uplifters_site_builder_blocks_desktop_title_color ) );
$uplifters_site_builder_blocks_mobile_title_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'titleColor', 'mobile', $uplifters_site_builder_blocks_desktop_title_color ) );

$uplifters_site_builder_blocks_desktop_content_font_family_key = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_tablet_content_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_mobile_content_font_family_key  = (string) uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_desktop_content_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_content_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_tablet_content_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_content_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_mobile_content_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_content_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_content_font_size = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontSize', 'desktop', 14 ), 14 );
$uplifters_site_builder_blocks_tablet_content_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontSize', 'tablet', $uplifters_site_builder_blocks_desktop_content_font_size ), $uplifters_site_builder_blocks_desktop_content_font_size );
$uplifters_site_builder_blocks_mobile_content_font_size  = uplifters_site_builder_blocks_accordion_icon_custom_font_size( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentFontSize', 'mobile', $uplifters_site_builder_blocks_desktop_content_font_size ), $uplifters_site_builder_blocks_desktop_content_font_size );

$uplifters_site_builder_blocks_desktop_content_color = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentColor', 'desktop', '' ) );
$uplifters_site_builder_blocks_tablet_content_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentColor', 'tablet', $uplifters_site_builder_blocks_desktop_content_color ) );
$uplifters_site_builder_blocks_mobile_content_color  = uplifters_site_builder_blocks_accordion_icon_custom_safe_color( uplifters_site_builder_blocks_accordion_icon_custom_responsive_value( $attributes, 'contentColor', 'mobile', $uplifters_site_builder_blocks_desktop_content_color ) );

$uplifters_site_builder_blocks_static_css = '
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom{box-sizing:border-box;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom*,.wp-block-uplifters-site-builder-blocks-accordion-icon-custom*::before,.wp-block-uplifters-site-builder-blocks-accordion-icon-custom*::after{box-sizing:border-box;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__heading{margin:0 0 16px;font-weight:600;line-height:1.25;color:#111827;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__group{width:100%;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__item{margin-bottom:12px;padding:0 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05);}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__toggle{display:inline-flex;align-items:center;width:100%;gap:12px;padding:12px 0;border:0;border-radius:8px;background:transparent;color:#111827;font:inherit;font-weight:600;text-align:left;cursor:pointer;list-style:none;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__toggle::-webkit-details-marker{display:none;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__toggle:hover,.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__toggle:focus{color:#4b5563;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__toggle:focus-visible{outline:2px solid #2563eb;outline-offset:2px;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:16px;height:16px;color:currentColor;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__icon svg{display:block;width:16px;height:16px;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__icon--up{display:none;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__item[open] .uplifters-site-builder-blocks-accordion-icon-custom__icon--down{display:none;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__item[open] .uplifters-site-builder-blocks-accordion-icon-custom__icon--up{display:block;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__title{flex:1 1 auto;min-width:0;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__content{width:100%;overflow:hidden;}
.wp-block-uplifters-site-builder-blocks-accordion-icon-custom .uplifters-site-builder-blocks-accordion-icon-custom__text{margin:0;padding:0 0 16px;color:#374151;line-height:1.65;}
';

$uplifters_site_builder_blocks_dynamic_css  = '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__heading{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_desktop_heading_font_family . ';font-size:' . $uplifters_site_builder_blocks_desktop_heading_font_size . 'px;';
if ( $uplifters_site_builder_blocks_desktop_heading_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_desktop_heading_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__title{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_desktop_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_desktop_title_font_size . 'px;';
if ( $uplifters_site_builder_blocks_desktop_title_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_desktop_title_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__text{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_desktop_content_font_family . ';font-size:' . $uplifters_site_builder_blocks_desktop_content_font_size . 'px;';
if ( $uplifters_site_builder_blocks_desktop_content_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_desktop_content_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__heading{font-family:' . $uplifters_site_builder_blocks_tablet_heading_font_family . ';font-size:' . $uplifters_site_builder_blocks_tablet_heading_font_size . 'px;';
if ( $uplifters_site_builder_blocks_tablet_heading_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_tablet_heading_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__title{font-family:' . $uplifters_site_builder_blocks_tablet_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_tablet_title_font_size . 'px;';
if ( $uplifters_site_builder_blocks_tablet_title_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_tablet_title_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__text{font-family:' . $uplifters_site_builder_blocks_tablet_content_font_family . ';font-size:' . $uplifters_site_builder_blocks_tablet_content_font_size . 'px;';
if ( $uplifters_site_builder_blocks_tablet_content_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_tablet_content_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__heading{font-family:' . $uplifters_site_builder_blocks_mobile_heading_font_family . ';font-size:' . $uplifters_site_builder_blocks_mobile_heading_font_size . 'px;';
if ( $uplifters_site_builder_blocks_mobile_heading_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_mobile_heading_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__title{font-family:' . $uplifters_site_builder_blocks_mobile_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_mobile_title_font_size . 'px;';
if ( $uplifters_site_builder_blocks_mobile_title_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_mobile_title_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-accordion-icon-custom__text{font-family:' . $uplifters_site_builder_blocks_mobile_content_font_family . ';font-size:' . $uplifters_site_builder_blocks_mobile_content_font_size . 'px;';
if ( $uplifters_site_builder_blocks_mobile_content_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_mobile_content_color . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-accordion-icon-custom',
	)
);
?>
<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php if ( ! empty( $uplifters_site_builder_blocks_heading ) ) : ?>
		<h3 class="uplifters-site-builder-blocks-accordion-icon-custom__heading"><?php echo wp_kses_post( $uplifters_site_builder_blocks_heading ); ?></h3>
	<?php endif; ?>

	<div class="uplifters-site-builder-blocks-accordion-icon-custom__group" data-allow-multiple="false">
		<?php foreach ( $uplifters_site_builder_blocks_items as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_item ) : ?>
			<?php
			$uplifters_site_builder_blocks_item_id      = ! empty( $uplifters_site_builder_blocks_item['id'] ) ? sanitize_html_class( $uplifters_site_builder_blocks_item['id'] ) : 'item-' . ( $uplifters_site_builder_blocks_index + 1 );
			/* translators: %d: Accordion item number. */
			$uplifters_site_builder_blocks_item_title   = isset( $uplifters_site_builder_blocks_item['title'] ) ? $uplifters_site_builder_blocks_item['title'] : sprintf( __( 'Accordion #%d', 'uplifters-site-builder-blocks' ), $uplifters_site_builder_blocks_index + 1 );
			$uplifters_site_builder_blocks_item_content = isset( $uplifters_site_builder_blocks_item['content'] ) ? $uplifters_site_builder_blocks_item['content'] : '';
			$uplifters_site_builder_blocks_is_open      = ( ! empty( $uplifters_site_builder_blocks_item['isOpen'] ) || ( $uplifters_site_builder_blocks_default_open_id && $uplifters_site_builder_blocks_default_open_id === $uplifters_site_builder_blocks_item_id ) );
			$uplifters_site_builder_blocks_summary_id   = $uplifters_site_builder_blocks_block_id . '-button-' . $uplifters_site_builder_blocks_item_id;
			$uplifters_site_builder_blocks_panel_id     = $uplifters_site_builder_blocks_block_id . '-panel-' . $uplifters_site_builder_blocks_item_id;
			$uplifters_site_builder_blocks_item_classes = 'uplifters-site-builder-blocks-accordion-icon-custom__item' . ( $uplifters_site_builder_blocks_is_open ? ' is-active' : '' );
			?>
			<details class="<?php echo esc_attr( $uplifters_site_builder_blocks_item_classes ); ?>" name="<?php echo esc_attr( $uplifters_site_builder_blocks_group_name ); ?>"<?php echo esc_attr( $uplifters_site_builder_blocks_is_open ? ' open' : '' ); ?>>
				<summary id="<?php echo esc_attr( $uplifters_site_builder_blocks_summary_id ); ?>" class="uplifters-site-builder-blocks-accordion-icon-custom__toggle" aria-controls="<?php echo esc_attr( $uplifters_site_builder_blocks_panel_id ); ?>">
					<span class="uplifters-site-builder-blocks-accordion-icon-custom__icon" aria-hidden="true">
						<svg class="uplifters-site-builder-blocks-accordion-icon-custom__icon--down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
						<svg class="uplifters-site-builder-blocks-accordion-icon-custom__icon--up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6" /></svg>
					</span>
					<span class="uplifters-site-builder-blocks-accordion-icon-custom__title"><?php echo wp_kses_post( $uplifters_site_builder_blocks_item_title ); ?></span>
				</summary>

				<div id="<?php echo esc_attr( $uplifters_site_builder_blocks_panel_id ); ?>" class="uplifters-site-builder-blocks-accordion-icon-custom__content" role="region" aria-labelledby="<?php echo esc_attr( $uplifters_site_builder_blocks_summary_id ); ?>">
					<p class="uplifters-site-builder-blocks-accordion-icon-custom__text"><?php echo wp_kses_post( $uplifters_site_builder_blocks_item_content ); ?></p>
				</div>
			</details>
		<?php endforeach; ?>
	</div>
</div>
