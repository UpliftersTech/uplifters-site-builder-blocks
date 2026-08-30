<?php
/**
 * Server-side rendering for the ScrollToTop block.
 *
 * @package UpliftersSiteBuilderBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_responsive_value' ) ) {
	/**
	 * Resolve a responsive value for a device.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $key        Attribute key.
	 * @param string $device     Device key.
	 * @param string $fallback   Fallback value.
	 * @return string Resolved value.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_responsive_value(
		array $attributes,
		string $key,
		string $device,
		string $fallback = ''
	): string {
		if (
			empty( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		foreach ( array( $device, 'desktop', 'tablet', 'mobile' ) as $lookup ) {
			if (
				isset( $value[ $lookup ] ) &&
				'' !== $value[ $lookup ]
			) {
				return (string) $value[ $lookup ];
			}
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_sanitize_css_value' ) ) {
	/**
	 * Strip anything that could break out of a CSS declaration.
	 *
	 * @param string $value Raw value.
	 * @return string Safe value.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_sanitize_css_value(
		string $value
	): string {
		$value = wp_strip_all_tags( $value );

		$value = str_replace(
			array( '<', '>', '{', '}', ';' ),
			'',
			$value
		);

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_sanitize_color' ) ) {
	/**
	 * Allow hex, rgb(a) and the transparent keyword only.
	 *
	 * @param string $value Raw color.
	 * @return string Safe color, or an empty string.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_sanitize_color(
		string $value
	): string {
		$value = trim( $value );

		if ( 'transparent' === strtolower( $value ) ) {
			return 'transparent';
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ) {
			return $value;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_sanitize_placement' ) ) {
	/**
	 * Clamp the placement value to a known corner.
	 *
	 * @param string $value Raw placement.
	 * @return string Safe placement.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_sanitize_placement(
		string $value
	): string {
		$allowed = array(
			'bottom-right',
			'bottom-left',
			'top-right',
			'top-left',
		);

		return in_array( $value, $allowed, true ) ? $value : 'bottom-right';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_sanitize_arrow_style' ) ) {
	/**
	 * Clamp the arrow style to a known variant.
	 *
	 * @param string $value Raw style.
	 * @return string Safe style.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_sanitize_arrow_style(
		string $value
	): string {
		$allowed = array(
			'arrow',
			'chevron',
			'chevron-double',
			'triangle',
		);

		return in_array( $value, $allowed, true ) ? $value : 'arrow';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_scroll_to_top_arrow_svg' ) ) {
	/**
	 * Build the up arrow markup.
	 *
	 * The SVG is a hardcoded literal with no attribute data, so there is no
	 * dynamic value to escape here. Color and size come from CSS variables.
	 *
	 * @param string $style Sanitized arrow style.
	 * @return string SVG markup.
	 */
	function uplifters_site_builder_blocks_scroll_to_top_arrow_svg(
		string $style
	): string {
		switch ( $style ) {
			case 'chevron':
				$inner = '<path d="M5 15.5 12 8.5l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
				break;

			case 'chevron-double':
				$inner = '<path d="M5 12.5 12 5.5l7 7M5 19 12 12l7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
				break;

			case 'triangle':
				$inner = '<path d="M12 5.5 20 18.5H4z" fill="currentColor"/>';
				break;

			default:
				$inner = '<path d="M12 19.5V6M5.5 12.5 12 6l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
				break;
		}

		return '<svg class="uplifters-scroll-to-top__icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' . $inner . '</svg>';
	}
}

$uplifters_site_builder_blocks_uplifters_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-scroll-to-top-' );

$uplifters_site_builder_blocks_uplifters_placement = uplifters_site_builder_blocks_scroll_to_top_sanitize_placement(
	isset( $attributes['placement'] ) ? (string) $attributes['placement'] : 'bottom-right'
);

$uplifters_site_builder_blocks_uplifters_hide_at_start = ! empty( $attributes['hideAtStart'] );

$uplifters_site_builder_blocks_uplifters_show_after = isset( $attributes['showAfter'] )
	? absint( $attributes['showAfter'] )
	: 300;

$uplifters_site_builder_blocks_uplifters_arrow_style = uplifters_site_builder_blocks_scroll_to_top_sanitize_arrow_style(
	isset( $attributes['arrowStyle'] ) ? (string) $attributes['arrowStyle'] : 'arrow'
);

$uplifters_site_builder_blocks_uplifters_devices = array(
	'desktop' => '',
	'tablet'  => '(max-width:1024px)',
	'mobile'  => '(max-width:767px)',
);

$uplifters_site_builder_blocks_uplifters_defaults = array(
	'size'                 => '64px',
	'outlineWidth'         => '2px',
	'outlineColor'         => '#111827',
	'backgroundColor'      => '#2563eb',
	'arrowColor'           => '#ffffff',
	'arrowSize'            => '22px',
	'offsetX'              => '32px',
	'offsetY'              => '32px',
	'hoverBackgroundColor' => '#1d4ed8',
	'hoverOutlineColor'    => '#111827',
	'hoverArrowColor'      => '#ffffff',
);

$uplifters_site_builder_blocks_uplifters_colors = array(
	'outlineColor',
	'backgroundColor',
	'arrowColor',
	'hoverBackgroundColor',
	'hoverOutlineColor',
	'hoverArrowColor',
);

/**
 * Resolve every key for every device up front. Tablet and mobile fall back to
 * the already resolved desktop value, so a variant that was never touched
 * simply inherits instead of jumping back to the hard default.
 */
$uplifters_site_builder_blocks_uplifters_values = array();

foreach ( array_keys( $uplifters_site_builder_blocks_uplifters_devices ) as $uplifters_site_builder_blocks_uplifters_device ) {
	$uplifters_site_builder_blocks_uplifters_is_desktop = ( 'desktop' === $uplifters_site_builder_blocks_uplifters_device );

	foreach ( $uplifters_site_builder_blocks_uplifters_defaults as $uplifters_site_builder_blocks_uplifters_key => $uplifters_site_builder_blocks_uplifters_default ) {
		$uplifters_site_builder_blocks_uplifters_fallback = $uplifters_site_builder_blocks_uplifters_is_desktop
			? $uplifters_site_builder_blocks_uplifters_default
			: $uplifters_site_builder_blocks_uplifters_values['desktop'][ $uplifters_site_builder_blocks_uplifters_key ];

		$uplifters_site_builder_blocks_uplifters_raw = uplifters_site_builder_blocks_scroll_to_top_responsive_value(
			$attributes,
			$uplifters_site_builder_blocks_uplifters_key,
			$uplifters_site_builder_blocks_uplifters_device,
			$uplifters_site_builder_blocks_uplifters_fallback
		);

		if ( in_array( $uplifters_site_builder_blocks_uplifters_key, $uplifters_site_builder_blocks_uplifters_colors, true ) ) {
			$uplifters_site_builder_blocks_uplifters_clean = uplifters_site_builder_blocks_scroll_to_top_sanitize_color( $uplifters_site_builder_blocks_uplifters_raw );

			if ( '' === $uplifters_site_builder_blocks_uplifters_clean ) {
				$uplifters_site_builder_blocks_uplifters_clean = uplifters_site_builder_blocks_scroll_to_top_sanitize_color( $uplifters_site_builder_blocks_uplifters_fallback );
			}
		} else {
			$uplifters_site_builder_blocks_uplifters_clean = uplifters_site_builder_blocks_scroll_to_top_sanitize_css_value( $uplifters_site_builder_blocks_uplifters_raw );

			if ( '' === $uplifters_site_builder_blocks_uplifters_clean ) {
				$uplifters_site_builder_blocks_uplifters_clean = $uplifters_site_builder_blocks_uplifters_fallback;
			}
		}

		$uplifters_site_builder_blocks_uplifters_values[ $uplifters_site_builder_blocks_uplifters_device ][ $uplifters_site_builder_blocks_uplifters_key ] = $uplifters_site_builder_blocks_uplifters_clean;
	}
}

$uplifters_site_builder_blocks_uplifters_css = '';

foreach ( $uplifters_site_builder_blocks_uplifters_devices as $uplifters_site_builder_blocks_uplifters_device => $uplifters_site_builder_blocks_uplifters_media_query ) {
	$uplifters_site_builder_blocks_uplifters_set = $uplifters_site_builder_blocks_uplifters_values[ $uplifters_site_builder_blocks_uplifters_device ];

	$uplifters_site_builder_blocks_uplifters_device_css  = '';

	$uplifters_site_builder_blocks_uplifters_device_css .= '#' . $uplifters_site_builder_blocks_uplifters_unique_id . '{';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-offset-x:' . $uplifters_site_builder_blocks_uplifters_set['offsetX'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-offset-y:' . $uplifters_site_builder_blocks_uplifters_set['offsetY'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '}';

	$uplifters_site_builder_blocks_uplifters_device_css .= '#' . $uplifters_site_builder_blocks_uplifters_unique_id . ' .uplifters-scroll-to-top{';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-size:' . $uplifters_site_builder_blocks_uplifters_set['size'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-outline-width:' . $uplifters_site_builder_blocks_uplifters_set['outlineWidth'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-outline-color:' . $uplifters_site_builder_blocks_uplifters_set['outlineColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-background-color:' . $uplifters_site_builder_blocks_uplifters_set['backgroundColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-arrow-color:' . $uplifters_site_builder_blocks_uplifters_set['arrowColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-arrow-size:' . $uplifters_site_builder_blocks_uplifters_set['arrowSize'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-hover-background-color:' . $uplifters_site_builder_blocks_uplifters_set['hoverBackgroundColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-hover-outline-color:' . $uplifters_site_builder_blocks_uplifters_set['hoverOutlineColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-stt-hover-arrow-color:' . $uplifters_site_builder_blocks_uplifters_set['hoverArrowColor'] . ';';
	$uplifters_site_builder_blocks_uplifters_device_css .= '}';

	if ( '' === $uplifters_site_builder_blocks_uplifters_media_query ) {
		$uplifters_site_builder_blocks_uplifters_css .= $uplifters_site_builder_blocks_uplifters_device_css;
		continue;
	}

	$uplifters_site_builder_blocks_uplifters_css .= '@media ' . $uplifters_site_builder_blocks_uplifters_media_query . '{';
	$uplifters_site_builder_blocks_uplifters_css .= $uplifters_site_builder_blocks_uplifters_device_css;
	$uplifters_site_builder_blocks_uplifters_css .= '}';
}

$uplifters_site_builder_blocks_uplifters_css = wp_strip_all_tags( $uplifters_site_builder_blocks_uplifters_css );

\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_uplifters_css );

$uplifters_site_builder_blocks_uplifters_wrapper_classes = array(
	'uplifters-scroll-to-top-wrapper',
	'uplifters-scroll-to-top-wrapper--' . $uplifters_site_builder_blocks_uplifters_placement,
);

if ( $uplifters_site_builder_blocks_uplifters_hide_at_start ) {
	$uplifters_site_builder_blocks_uplifters_wrapper_classes[] = 'is-hidden';
}

$uplifters_site_builder_blocks_uplifters_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_uplifters_unique_id,
		'class' => implode( ' ', $uplifters_site_builder_blocks_uplifters_wrapper_classes ),
	)
);
?>
<div
	<?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_uplifters_wrapper_attributes, array() );
	?>
	data-hide-at-start="<?php echo esc_attr( $uplifters_site_builder_blocks_uplifters_hide_at_start ? 'true' : 'false' ); ?>"
	data-show-after="<?php echo esc_attr( (string) $uplifters_site_builder_blocks_uplifters_show_after ); ?>"
>
	<button
		type="button"
		class="uplifters-scroll-to-top"
		aria-label="<?php esc_attr_e( 'Scroll back to top', 'uplifters-site-builder-blocks' ); ?>"
	>
		<span class="uplifters-scroll-to-top__icon">
			<?php
			echo wp_kses( uplifters_site_builder_blocks_scroll_to_top_arrow_svg( $uplifters_site_builder_blocks_uplifters_arrow_style ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			?>
		</span>
	</button>
</div>
