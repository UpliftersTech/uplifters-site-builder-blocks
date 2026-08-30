<?php
/**
 * Server-side render for the responsive Copyright block.
 *
 * @package uplifters-site-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value' ) ) {
	function uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $value, string $device, $fallback = '' ) {
		if ( is_array( $value ) ) {
			if ( array_key_exists( $device, $value ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}
			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
				if ( array_key_exists( $fallback_device, $value ) && '' !== $value[ $fallback_device ] && null !== $value[ $fallback_device ] ) {
					return $value[ $fallback_device ];
				}
			}
			return $fallback;
		}

		return ( null !== $value && '' !== $value ) ? $value : $fallback;
	}
}


if ( ! function_exists( 'uplifters_site_builder_blocks_copyright_component_rearrange_color' ) ) {
	function uplifters_site_builder_blocks_copyright_component_rearrange_color( $value ): string {
		$value = is_string( $value ) ? trim( $value ) : '';
		if ( '' === $value ) {
			return '';
		}
		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}
		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\([0-9\s.,%\/+\-]+\)$/', $value ) ) {
			return $value;
		}
		if ( preg_match( '/^var\(--[a-zA-Z0-9_-]+\)$/', $value ) ) {
			return $value;
		}
		return '';
	}
}



if ( ! function_exists( 'uplifters_site_builder_blocks_copyright_component_rearrange_device_css' ) ) {
	function uplifters_site_builder_blocks_copyright_component_rearrange_device_css( string $selector, array $settings ): string {
		$css  = $selector . '{box-sizing:border-box;width:100%;';
		$css .= 'padding:' . $settings['padding'] . 'px;';
		$css .= 'margin:' . $settings['margin'] . 'px;';
		$css .= 'font-size:' . $settings['font_size'] . 'px;';
		$css .= 'line-height:' . ( '' !== $settings['line_height'] ? $settings['line_height'] : '1.625' ) . ';';
		$css .= 'opacity:' . $settings['opacity'] . ';';
		$css .= 'font-weight:' . ( $settings['is_bold'] ? '700' : $settings['font_weight'] ) . ';';
		$css .= 'font-style:' . ( $settings['is_italic'] ? 'italic' : 'normal' ) . ';';
		$css .= 'text-align:' . $settings['position'] . ';';
		if ( '' !== $settings['text_color'] ) {
			$css .= 'color:' . $settings['text_color'] . ';';
		}
		if ( '' !== $settings['background_color'] ) {
			$css .= 'background-color:' . $settings['background_color'] . ';';
		}
		$css .= '}';

		$line_selector = $selector . ' .copyright-component-rearrange-primary-line';
		$css .= $line_selector . '{display:flex;flex-flow:row nowrap;align-items:baseline;gap:.35em;min-width:0;justify-content:' . $settings['position'] . ';}';

		$css .= $selector . ' .copyright-component-rearrange-part-mark{font-size:' . $settings['mark_font_size'] . 'px;opacity:' . $settings['mark_opacity'] . ';';
		if ( '' !== $settings['mark_color'] ) { $css .= 'color:' . $settings['mark_color'] . ';'; }
		if ( '' !== $settings['mark_background_color'] ) { $css .= 'background-color:' . $settings['mark_background_color'] . ';'; }
		$css .= '}';
		$css .= $selector . ' .copyright-component-rearrange-part-year{font-size:' . $settings['year_font_size'] . 'px;opacity:' . $settings['year_opacity'] . ';';
		if ( '' !== $settings['year_color'] ) { $css .= 'color:' . $settings['year_color'] . ';'; }
		if ( '' !== $settings['year_background_color'] ) { $css .= 'background-color:' . $settings['year_background_color'] . ';'; }
		$css .= '}';
		$css .= $selector . ' .copyright-component-rearrange-part-text{font-size:' . $settings['main_text_font_size'] . 'px;opacity:' . $settings['main_text_opacity'] . ';font-weight:' . $settings['main_text_font_weight'] . ';font-style:' . ( $settings['main_text_italic'] ? 'italic' : 'normal' ) . ';';
		if ( '' !== $settings['main_text_color'] ) { $css .= 'color:' . $settings['main_text_color'] . ';'; }
		if ( '' !== $settings['main_text_line_height'] ) { $css .= 'line-height:' . $settings['main_text_line_height'] . ';'; }
		if ( '' !== $settings['main_text_font_family'] ) { $css .= 'font-family:' . $settings['main_text_font_family'] . ';'; }
		$css .= '}';
		$css .= $selector . ' .copyright-component-rearrange-second-line{font-size:' . $settings['second_text_font_size'] . 'px;opacity:' . $settings['second_text_opacity'] . ';font-weight:' . $settings['second_text_font_weight'] . ';font-style:' . ( $settings['second_text_italic'] ? 'italic' : 'normal' ) . ';';
		if ( '' !== $settings['second_text_color'] ) { $css .= 'color:' . $settings['second_text_color'] . ';'; }
		if ( '' !== $settings['second_text_line_height'] ) { $css .= 'line-height:' . $settings['second_text_line_height'] . ';'; }
		if ( '' !== $settings['second_text_font_family'] ) { $css .= 'font-family:' . $settings['second_text_font_family'] . ';'; }
		$css .= '}';
		return $css;
	}
}

$uplifters_site_builder_blocks_mark_key = isset( $attributes['copyrightMark'] ) ? sanitize_key( $attributes['copyrightMark'] ) : 'copyright';
$uplifters_site_builder_blocks_marks    = array(
	'copyright'  => '&copy;',
	'registered' => '&reg;',
	'trademark'  => '&trade;',
);
$uplifters_site_builder_blocks_mark = isset( $uplifters_site_builder_blocks_marks[ $uplifters_site_builder_blocks_mark_key ] ) ? $uplifters_site_builder_blocks_marks[ $uplifters_site_builder_blocks_mark_key ] : $uplifters_site_builder_blocks_marks['copyright'];

$uplifters_site_builder_blocks_devices  = array( 'desktop', 'tablet', 'mobile' );
$uplifters_site_builder_blocks_settings = array();
$uplifters_site_builder_blocks_current_year = (int) gmdate( 'Y' );

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) {
	$uplifters_site_builder_blocks_position = sanitize_key( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['position'] ?? array(), $uplifters_site_builder_blocks_device, 'start' ) );
	if ( ! in_array( $uplifters_site_builder_blocks_position, array( 'start', 'center', 'end' ), true ) ) {
		$uplifters_site_builder_blocks_position = 'start';
	}

	$uplifters_site_builder_blocks_content_order = sanitize_key( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['contentOrder'] ?? array(), $uplifters_site_builder_blocks_device, 'mark-text-year' ) );
	$uplifters_site_builder_blocks_allowed_orders = array( 'mark-text-year', 'mark-year-text', 'text-mark-year', 'text-year-mark', 'year-mark-text', 'year-text-mark' );
	if ( ! in_array( $uplifters_site_builder_blocks_content_order, $uplifters_site_builder_blocks_allowed_orders, true ) ) {
		$uplifters_site_builder_blocks_content_order = 'mark-text-year';
	}


	$uplifters_site_builder_blocks_year_mode = sanitize_key( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['yearMode'] ?? array(), $uplifters_site_builder_blocks_device, 'current' ) );
	if ( ! in_array( $uplifters_site_builder_blocks_year_mode, array( 'current', 'range', 'fixed' ), true ) ) {
		$uplifters_site_builder_blocks_year_mode = 'current';
	}

	$uplifters_site_builder_blocks_starting_year = (string) preg_replace( '/[^0-9]/', '', (string) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['startingYear'] ?? array(), $uplifters_site_builder_blocks_device, '' ) );
	$uplifters_site_builder_blocks_starting_year = substr( $uplifters_site_builder_blocks_starting_year, 0, 4 );
	$uplifters_site_builder_blocks_fixed_year    = sanitize_text_field( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['fixedYear'] ?? array(), $uplifters_site_builder_blocks_device, '' ) );

	$uplifters_site_builder_blocks_displayed_year = (string) $uplifters_site_builder_blocks_current_year;
	if ( 'range' === $uplifters_site_builder_blocks_year_mode && '' !== $uplifters_site_builder_blocks_starting_year && $uplifters_site_builder_blocks_starting_year !== (string) $uplifters_site_builder_blocks_current_year ) {
		$uplifters_site_builder_blocks_displayed_year = $uplifters_site_builder_blocks_starting_year . '–' . $uplifters_site_builder_blocks_current_year;
	} elseif ( 'fixed' === $uplifters_site_builder_blocks_year_mode && '' !== $uplifters_site_builder_blocks_fixed_year ) {
		$uplifters_site_builder_blocks_displayed_year = $uplifters_site_builder_blocks_fixed_year;
	}

	$uplifters_site_builder_blocks_font_weight = (string) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['fontWeight'] ?? array(), $uplifters_site_builder_blocks_device, '400' );
	if ( ! in_array( $uplifters_site_builder_blocks_font_weight, array( '100','200','300','400','500','600','700','800','900' ), true ) ) {
		$uplifters_site_builder_blocks_font_weight = '400';
	}

	$uplifters_site_builder_blocks_main_text_font_weight = (string) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextFontWeight'] ?? array(), $uplifters_site_builder_blocks_device, '400' );
	if ( ! in_array( $uplifters_site_builder_blocks_main_text_font_weight, array( '100','200','300','400','500','600','700','800','900' ), true ) ) { $uplifters_site_builder_blocks_main_text_font_weight = '400'; }
	$uplifters_site_builder_blocks_second_text_font_weight = (string) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextFontWeight'] ?? array(), $uplifters_site_builder_blocks_device, '400' );
	if ( ! in_array( $uplifters_site_builder_blocks_second_text_font_weight, array( '100','200','300','400','500','600','700','800','900' ), true ) ) { $uplifters_site_builder_blocks_second_text_font_weight = '400'; }

	$uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ] = array(
		'text'                => uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['text'] ?? array(), $uplifters_site_builder_blocks_device, '' ),
		'second_text'         => uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondText'] ?? array(), $uplifters_site_builder_blocks_device, '' ),
		'content_order'       => $uplifters_site_builder_blocks_content_order,
		'mark_font_size'       => max( 1, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['markFontSize'] ?? array(), $uplifters_site_builder_blocks_device, 20 ) ),
		'mark_color'           => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['markColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'mark_background_color'=> uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['markBackgroundColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'mark_opacity'         => min( 1, max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['markOpacity'] ?? array(), $uplifters_site_builder_blocks_device, 1 ) ) ),
		'year_font_size'       => max( 1, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['yearFontSize'] ?? array(), $uplifters_site_builder_blocks_device, 16 ) ),
		'year_color'           => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['yearColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'year_background_color'=> uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['yearBackgroundColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'year_opacity'         => min( 1, max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['yearOpacity'] ?? array(), $uplifters_site_builder_blocks_device, 1 ) ) ),
		'main_text_font_size'  => max( 1, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextFontSize'] ?? array(), $uplifters_site_builder_blocks_device, 16 ) ),
		'main_text_color'      => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'main_text_opacity'    => min( 1, max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextOpacity'] ?? array(), $uplifters_site_builder_blocks_device, 1 ) ) ),
		'main_text_font_weight'=> $uplifters_site_builder_blocks_main_text_font_weight,
		'main_text_italic'     => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextItalic'] ?? array(), $uplifters_site_builder_blocks_device, false ),
		'main_text_line_height'=> is_numeric( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextLineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ) ? (string) (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextLineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) : '',
		'main_text_font_family'=> \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['mainTextFontFamily'] ?? array(), $uplifters_site_builder_blocks_device, 'inherit' ) ),
		'second_text_font_size'=> max( 1, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextFontSize'] ?? array(), $uplifters_site_builder_blocks_device, 14 ) ),
		'second_text_color'    => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'second_text_opacity'  => min( 1, max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextOpacity'] ?? array(), $uplifters_site_builder_blocks_device, 1 ) ) ),
		'second_text_font_weight'=> $uplifters_site_builder_blocks_second_text_font_weight,
		'second_text_italic'   => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextItalic'] ?? array(), $uplifters_site_builder_blocks_device, false ),
		'second_text_line_height'=> is_numeric( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextLineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ) ? (string) (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextLineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) : '',
		'second_text_font_family'=> \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['secondTextFontFamily'] ?? array(), $uplifters_site_builder_blocks_device, 'inherit' ) ),
		'show_mark'           => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['showMark'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'show_text'           => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['showText'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'show_year'           => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['showYear'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'show_second_line'    => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['showSecondLine'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'displayed_year'      => $uplifters_site_builder_blocks_displayed_year,
		'position'            => $uplifters_site_builder_blocks_position,
		'padding'             => max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['padding'] ?? array(), $uplifters_site_builder_blocks_device, 2 ) ),
		'margin'              => max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['margin'] ?? array(), $uplifters_site_builder_blocks_device, 2 ) ),
		'font_size'           => max( 1, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['fontSize'] ?? array(), $uplifters_site_builder_blocks_device, 16 ) ),
		'opacity'             => min( 1, max( 0, (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['opacity'] ?? array(), $uplifters_site_builder_blocks_device, 1 ) ) ),
		'is_bold'             => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['isBold'] ?? array(), $uplifters_site_builder_blocks_device, false ),
		'text_color'          => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['textColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'background_color'    => uplifters_site_builder_blocks_copyright_component_rearrange_color( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['backgroundColor'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ),
		'line_height'         => is_numeric( uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['lineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) ) ? (string) (float) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['lineHeight'] ?? array(), $uplifters_site_builder_blocks_device, '' ) : '',
		'is_italic'           => (bool) uplifters_site_builder_blocks_copyright_component_rearrange_responsive_value( $attributes['isItalic'] ?? array(), $uplifters_site_builder_blocks_device, false ),
		'font_weight'         => $uplifters_site_builder_blocks_font_weight,
	);
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-copyright-component-rearrange-' );
$uplifters_site_builder_blocks_selector  = '#' . $uplifters_site_builder_blocks_unique_id;

$uplifters_site_builder_blocks_css  = $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-inline-underline{text-decoration:underline;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-part{min-width:0;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-second-line{display:block;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-mark{display:inline-block;font-size:1.2em;line-height:1;vertical-align:baseline;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-mark-registered{font-size:1.35em;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-tablet,' . $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-mobile{display:none;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_copyright_component_rearrange_device_css( $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-desktop', $uplifters_site_builder_blocks_settings['desktop'] );
$uplifters_site_builder_blocks_css .= '@media(max-width:1024px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-desktop,' . $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-mobile{display:none;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-tablet{display:block;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_copyright_component_rearrange_device_css( $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-tablet', $uplifters_site_builder_blocks_settings['tablet'] );
$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '@media(max-width:767px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-desktop,' . $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-tablet{display:none;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-mobile{display:block;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_copyright_component_rearrange_device_css( $uplifters_site_builder_blocks_selector . ' .copyright-component-rearrange-row-mobile', $uplifters_site_builder_blocks_settings['mobile'] );
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_unique_id,
		'class' => 'copyright-component-rearrange-block uplifters-site-builder-blocks-unified-copyright-component-rearrange',
	)
);
?>
<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) : ?>
		<?php $uplifters_site_builder_blocks_device_settings = $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]; ?>
		<div class="copyright-component-rearrange-row copyright-component-rearrange-row-<?php echo esc_attr( $uplifters_site_builder_blocks_device ); ?>">
			<?php
			$uplifters_site_builder_blocks_parts = array_values(
				array_filter(
					explode( '-', $uplifters_site_builder_blocks_device_settings['content_order'] ),
					static function ( $part ) use ( $uplifters_site_builder_blocks_device_settings ) {
						if ( 'mark' === $part ) {
							return $uplifters_site_builder_blocks_device_settings['show_mark'];
						}
						if ( 'text' === $part ) {
							return $uplifters_site_builder_blocks_device_settings['show_text'];
						}
						return 'year' === $part && $uplifters_site_builder_blocks_device_settings['show_year'];
					}
				)
			);
			?>
			<?php if ( ! empty( $uplifters_site_builder_blocks_parts ) ) : ?>
				<div class="copyright-component-rearrange-primary-line copyright-component-rearrange-layout-inline">
					<?php foreach ( $uplifters_site_builder_blocks_parts as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_part ) : ?>
						<?php if ( 'mark' === $uplifters_site_builder_blocks_part ) : ?>
							<span class="copyright-component-rearrange-part copyright-component-rearrange-part-mark"><span class="copyright-component-rearrange-mark copyright-component-rearrange-mark-<?php echo esc_attr( $uplifters_site_builder_blocks_mark_key ); ?>"><?php echo wp_kses_post( $uplifters_site_builder_blocks_mark ); ?></span></span>
						<?php elseif ( 'text' === $uplifters_site_builder_blocks_part ) : ?>
							<span class="copyright-component-rearrange-part copyright-component-rearrange-part-text"><span class="copyright-component-rearrange-text"><?php echo wp_kses_post( $uplifters_site_builder_blocks_device_settings['text'] ); ?></span></span>
						<?php elseif ( 'year' === $uplifters_site_builder_blocks_part ) : ?>
							<span class="copyright-component-rearrange-part copyright-component-rearrange-part-year copyright-component-rearrange-year"><?php echo esc_html( $uplifters_site_builder_blocks_device_settings['displayed_year'] ); ?></span>
						<?php endif; ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<?php if ( $uplifters_site_builder_blocks_device_settings['show_second_line'] && '' !== trim( wp_strip_all_tags( (string) $uplifters_site_builder_blocks_device_settings['second_text'] ) ) ) : ?>
				<div class="copyright-component-rearrange-second-line">
					<?php echo wp_kses_post( $uplifters_site_builder_blocks_device_settings['second_text'] ); ?>
				</div>
			<?php endif; ?>
		</div>
	<?php endforeach; ?>
</div>
