<?php
/**
 * Server-side render for Heading Advance block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_responsive_value' ) ) {
	function uplifters_site_builder_blocks_heading_advance_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
		if ( empty( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( isset( $value[ $device ] ) && '' !== $value[ $device ] && null !== $value[ $device ] ) return $value[ $device ];
		if ( isset( $value['desktop'] ) && '' !== $value['desktop'] && null !== $value['desktop'] ) return $value['desktop'];
		if ( isset( $value['tablet'] ) && '' !== $value['tablet'] && null !== $value['tablet'] ) return $value['tablet'];
		if ( isset( $value['mobile'] ) && '' !== $value['mobile'] && null !== $value['mobile'] ) return $value['mobile'];

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_responsive_box_value' ) ) {
	function uplifters_site_builder_blocks_heading_advance_responsive_box_value( array $attributes, string $key, string $device ): array {
		if ( empty( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) return array();

		$value = $attributes[ $key ];
		if ( isset( $value[ $device ] ) && is_array( $value[ $device ] ) ) return $value[ $device ];
		if ( isset( $value['desktop'] ) && is_array( $value['desktop'] ) ) return $value['desktop'];
		if ( isset( $value['tablet'] ) && is_array( $value['tablet'] ) ) return $value['tablet'];
		if ( isset( $value['mobile'] ) && is_array( $value['mobile'] ) ) return $value['mobile'];

		return array();
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_css_value( $value ): string {
		$value = wp_strip_all_tags( (string) $value );
		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );
		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_dimension' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_dimension( $value ): string {
		// Support both current BoxControl strings and older { value, unit } shapes.
		if ( is_array( $value ) ) {
			$amount = $value['value'] ?? $value['amount'] ?? '';
			$unit   = isset( $value['unit'] ) ? (string) $value['unit'] : 'px';
			if ( '' === $amount || null === $amount ) return '';
			$value = (string) $amount . ( 0.0 === (float) $amount ? '' : $unit );
		}

		$value = trim( (string) $value );

		if ( ! preg_match( '/^-?(?:\d+|\d*\.\d+)(?:px|%|em|rem)?$/', $value ) ) {
			return '';
		}

		// CSS spacing requires a unit except for zero.
		if ( is_numeric( $value ) ) {
			return 0.0 === (float) $value ? '0' : $value . 'px';
		}

		return $value;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_color( $value ): string {
		$value = trim( (string) $value );
		if ( '' === $value ) return '';
		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) return $value;
		if ( preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ) return $value;
		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_tag' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_tag( $value ): string {
		$allowed = array( 'h1', 'h2', 'h3', 'p' );
		$value   = strtolower( (string) $value );
		return in_array( $value, $allowed, true ) ? $value : 'h1';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_font_weight' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_font_weight( $value, string $fallback = '400' ): string {
		$allowed = array( '100', '200', '300', '400', '500', '600', '700', '800', '900' );
		$value   = (string) $value;
		return in_array( $value, $allowed, true ) ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_choice' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_choice( $value, array $allowed, string $fallback ): string {
		$value = trim( (string) $value );
		return in_array( $value, $allowed, true ) ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_sanitize_number' ) ) {
	function uplifters_site_builder_blocks_heading_advance_sanitize_number( $value, float $minimum, float $maximum ) {
		if ( '' === $value || null === $value || ! is_numeric( $value ) ) return '';
		$value = (float) $value;
		return max( $minimum, min( $maximum, $value ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_smart_default' ) ) {
	function uplifters_site_builder_blocks_heading_advance_smart_default( string $text_type, string $device ): array {
		$defaults = array(
			'h1' => array(
				'desktop' => array( 'font_size' => 64, 'line_height' => 1.04, 'font_weight' => '800' ),
				'tablet'  => array( 'font_size' => 48, 'line_height' => 1.08, 'font_weight' => '800' ),
				'mobile'  => array( 'font_size' => 36, 'line_height' => 1.12, 'font_weight' => '800' ),
			),
			'h2' => array(
				'desktop' => array( 'font_size' => 48, 'line_height' => 1.1, 'font_weight' => '700' ),
				'tablet'  => array( 'font_size' => 38, 'line_height' => 1.14, 'font_weight' => '700' ),
				'mobile'  => array( 'font_size' => 30, 'line_height' => 1.18, 'font_weight' => '700' ),
			),
			'h3' => array(
				'desktop' => array( 'font_size' => 32, 'line_height' => 1.18, 'font_weight' => '700' ),
				'tablet'  => array( 'font_size' => 28, 'line_height' => 1.22, 'font_weight' => '700' ),
				'mobile'  => array( 'font_size' => 24, 'line_height' => 1.28, 'font_weight' => '700' ),
			),
			'p'  => array(
				'desktop' => array( 'font_size' => 18, 'line_height' => 1.75, 'font_weight' => '400' ),
				'tablet'  => array( 'font_size' => 17, 'line_height' => 1.72, 'font_weight' => '400' ),
				'mobile'  => array( 'font_size' => 16, 'line_height' => 1.68, 'font_weight' => '400' ),
			),
		);

		return $defaults[ $text_type ][ $device ] ?? $defaults['h1']['desktop'];
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_box_to_css' ) ) {
	function uplifters_site_builder_blocks_heading_advance_box_to_css( string $prefix, array $box ): string {
		$css = '';
		$map = array( 'top' => 'top', 'right' => 'right', 'bottom' => 'bottom', 'left' => 'left' );

		foreach ( $map as $key => $side ) {
			if ( isset( $box[ $key ] ) && null !== $box[ $key ] && '' !== trim( (string) $box[ $key ] ) ) {
				$value = uplifters_site_builder_blocks_heading_advance_sanitize_dimension( $box[ $key ] );
				if ( '' !== $value ) $css .= $prefix . '-' . $side . ':' . $value . ';';
			}
		}

		return $css;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_heading_advance_device_css' ) ) {
	function uplifters_site_builder_blocks_heading_advance_device_css( string $selector, array $settings ): string {
		$css      = $selector . '{box-sizing:border-box;overflow-wrap:anywhere;';
		$defaults = uplifters_site_builder_blocks_heading_advance_smart_default( $settings['text_type'], $settings['device'] );

		if ( '' !== $settings['font_family'] ) $css .= 'font-family:' . $settings['font_family'] . ';';
		if ( '' !== $settings['text_color'] ) $css .= 'color:' . $settings['text_color'] . ';';
		if ( '' !== $settings['background_color'] ) $css .= 'background-color:' . $settings['background_color'] . ';';

		$css .= is_numeric( $settings['font_size'] ) ? 'font-size:' . $settings['font_size'] . 'px;' : 'font-size:' . $defaults['font_size'] . 'px;';
		$css .= is_numeric( $settings['line_height'] ) ? 'line-height:' . $settings['line_height'] . ';' : 'line-height:' . $defaults['line_height'] . ';';
		$css .= 'font-weight:' . $settings['font_weight'] . ';';
		$css .= 'text-align:' . $settings['text_align'] . ';';
		$css .= 'text-transform:' . $settings['text_transform'] . ';';

		if ( is_numeric( $settings['letter_spacing'] ) ) $css .= 'letter-spacing:' . $settings['letter_spacing'] . 'px;';
		if ( is_numeric( $settings['word_spacing'] ) ) $css .= 'word-spacing:' . $settings['word_spacing'] . 'px;';

		$css .= uplifters_site_builder_blocks_heading_advance_box_to_css( 'padding', $settings['padding'] );
		$css .= uplifters_site_builder_blocks_heading_advance_box_to_css( 'margin', $settings['margin'] );
		$css .= '}';

		return $css;
	}
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-heading-advance-' );
$uplifters_site_builder_blocks_devices   = array( 'desktop', 'tablet', 'mobile' );
$uplifters_site_builder_blocks_settings  = array();

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) {
	$uplifters_site_builder_blocks_text_type = uplifters_site_builder_blocks_heading_advance_sanitize_tag( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'textType', $uplifters_site_builder_blocks_device, 'h1' ) );
	$uplifters_site_builder_blocks_defaults  = uplifters_site_builder_blocks_heading_advance_smart_default( $uplifters_site_builder_blocks_text_type, $uplifters_site_builder_blocks_device );

	$uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ] = array(
		'device'           => $uplifters_site_builder_blocks_device,
		'content'          => uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'content', $uplifters_site_builder_blocks_device, '' ),
		'text_type'        => $uplifters_site_builder_blocks_text_type,
		'font_family'      => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'fontFamily', $uplifters_site_builder_blocks_device, 'inherit' ) ),
		'text_color'       => uplifters_site_builder_blocks_heading_advance_sanitize_color( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'textColor', $uplifters_site_builder_blocks_device, '' ) ),
		'background_color' => uplifters_site_builder_blocks_heading_advance_sanitize_color( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'backgroundColor', $uplifters_site_builder_blocks_device, '' ) ),
		'font_size'        => uplifters_site_builder_blocks_heading_advance_sanitize_number( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'fontSize', $uplifters_site_builder_blocks_device, '' ), 10, 120 ),
		'line_height'      => uplifters_site_builder_blocks_heading_advance_sanitize_number( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'lineHeight', $uplifters_site_builder_blocks_device, '' ), 0.8, 3 ),
		'font_weight'      => uplifters_site_builder_blocks_heading_advance_sanitize_font_weight( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'fontWeight', $uplifters_site_builder_blocks_device, $uplifters_site_builder_blocks_defaults['font_weight'] ), $uplifters_site_builder_blocks_defaults['font_weight'] ),
		'text_align'       => uplifters_site_builder_blocks_heading_advance_sanitize_choice( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'textAlign', $uplifters_site_builder_blocks_device, 'left' ), array( 'left', 'center', 'right', 'justify' ), 'left' ),
		'letter_spacing'   => uplifters_site_builder_blocks_heading_advance_sanitize_number( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'letterSpacing', $uplifters_site_builder_blocks_device, '' ), -5, 20 ),
		'word_spacing'     => uplifters_site_builder_blocks_heading_advance_sanitize_number( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'wordSpacing', $uplifters_site_builder_blocks_device, '' ), -10, 40 ),
		'text_transform'   => uplifters_site_builder_blocks_heading_advance_sanitize_choice( uplifters_site_builder_blocks_heading_advance_responsive_value( $attributes, 'textTransform', $uplifters_site_builder_blocks_device, 'none' ), array( 'none', 'uppercase', 'lowercase', 'capitalize' ), 'none' ),
		'padding'          => uplifters_site_builder_blocks_heading_advance_responsive_box_value( $attributes, 'padding', $uplifters_site_builder_blocks_device ),
		'margin'           => uplifters_site_builder_blocks_heading_advance_responsive_box_value( $attributes, 'margin', $uplifters_site_builder_blocks_device ),
	);
}

$uplifters_site_builder_blocks_has_content = false;
foreach ( $uplifters_site_builder_blocks_settings as $uplifters_site_builder_blocks_device_settings ) {
	if ( '' !== trim( wp_strip_all_tags( (string) $uplifters_site_builder_blocks_device_settings['content'] ) ) ) {
		$uplifters_site_builder_blocks_has_content = true;
		break;
	}
}

if ( ! $uplifters_site_builder_blocks_has_content ) {
	return;
}

$uplifters_site_builder_blocks_static_css  = '#' . $uplifters_site_builder_blocks_unique_id . '{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-item{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-tablet,#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-mobile{display:none;}';
$uplifters_site_builder_blocks_static_css .= '@media (max-width:1023px){#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-desktop,#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-mobile{display:none;}#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-tablet{display:block;}}';
$uplifters_site_builder_blocks_static_css .= '@media (max-width:767px){#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-desktop,#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-tablet{display:none;}#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-mobile{display:block;}}';

$uplifters_site_builder_blocks_dynamic_css  = uplifters_site_builder_blocks_heading_advance_device_css( '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-desktop', $uplifters_site_builder_blocks_settings['desktop'] );
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1023px){' . uplifters_site_builder_blocks_heading_advance_device_css( '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-tablet', $uplifters_site_builder_blocks_settings['tablet'] ) . '}';
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){' . uplifters_site_builder_blocks_heading_advance_device_css( '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-heading-advance-mobile', $uplifters_site_builder_blocks_settings['mobile'] ) . '}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'uplifters-site-builder-blocks-heading-advance-wrapper',
	)
);
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<div id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>">
	<?php foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) : ?>
		<?php
		$uplifters_site_builder_blocks_tag_name = $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]['text_type'];
		$uplifters_site_builder_blocks_class    = 'uplifters-site-builder-blocks-heading-advance-item g2pu-paragraph uplifters-site-builder-blocks-heading-advance-' . $uplifters_site_builder_blocks_device;
		?>
		<<?php echo tag_escape( $uplifters_site_builder_blocks_tag_name ); ?> class="<?php echo esc_attr( $uplifters_site_builder_blocks_class ); ?>">
			<?php echo wp_kses_post( $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]['content'] ); ?>
		</<?php echo tag_escape( $uplifters_site_builder_blocks_tag_name ); ?>>
	<?php endforeach; ?>
	</div>
</div>
