<?php
/**
 * Server-side rendering for the Upload Video block.
 *
 * The block renders one uploaded video at the full width of its container.
 * Only the responsive padding, margin and border radius vary per instance, so
 * those three are generated here and attached to the block's registered style
 * handle; everything structural lives in style.scss.
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

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_responsive_value' ) ) {
	/**
	 * Resolve a responsive value for a device.
	 *
	 * Accepts either a { desktop, tablet, mobile } array or a legacy plain
	 * value saved before this block became responsive.
	 *
	 * @param mixed  $value    Attribute value.
	 * @param string $device   Device key.
	 * @param mixed  $fallback Fallback value.
	 * @return mixed Resolved value.
	 */
	function uplifters_site_builder_blocks_video_upload_responsive_value(
		$value,
		string $device,
		$fallback = ''
	) {
		if ( null === $value || '' === $value ) {
			return $fallback;
		}

		if ( ! is_array( $value ) ) {
			return $value;
		}

		$order = array( $device, 'desktop', 'tablet', 'mobile' );

		foreach ( $order as $key ) {
			if (
				isset( $value[ $key ] ) &&
				'' !== $value[ $key ] &&
				null !== $value[ $key ]
			) {
				return $value[ $key ];
			}
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_responsive_box' ) ) {
	/**
	 * Resolve a responsive four-sided box value for a device.
	 *
	 * @param mixed  $value  Attribute value.
	 * @param string $device Device key.
	 * @return array Box with every side present.
	 */
	function uplifters_site_builder_blocks_video_upload_responsive_box( $value, string $device ): array {
		$empty = array(
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
		);

		if ( empty( $value ) || ! is_array( $value ) ) {
			return $empty;
		}

		if ( isset( $value['desktop'] ) || isset( $value['tablet'] ) || isset( $value['mobile'] ) ) {
			$branch = array();

			/*
			 * An all-empty branch falls through to the next one, so tablet and
			 * mobile inherit the desktop box unless they set one of their own.
			 * The editor resolves these the same way.
			 */
			foreach ( array( $device, 'desktop', 'tablet', 'mobile' ) as $key ) {
				if ( empty( $value[ $key ] ) || ! is_array( $value[ $key ] ) ) {
					continue;
				}

				foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
					if ( isset( $value[ $key ][ $side ] ) && '' !== trim( (string) $value[ $key ][ $side ] ) ) {
						$branch = $value[ $key ];
						break 2;
					}
				}
			}

			return array_merge( $empty, $branch );
		}

		return array_merge( $empty, $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_box_to_css' ) ) {
	/**
	 * Turn a four-sided box into CSS declarations.
	 *
	 * @param string $prefix CSS property prefix ( padding or margin ).
	 * @param array  $box    Box values.
	 * @return string CSS declarations.
	 */
	function uplifters_site_builder_blocks_video_upload_box_to_css( string $prefix, array $box ): string {
		$css = '';

		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$value = isset( $box[ $side ] ) ? trim( (string) $box[ $side ] ) : '';

			if ( '' === $value ) {
				continue;
			}

			$value = str_replace( array( '<', '>', '{', '}', ';' ), '', wp_strip_all_tags( $value ) );

			// A unitless number is not valid CSS, so treat it as pixels the
			// same way the editor does rather than emitting a dead rule.
			if ( preg_match( '/^-?\d*\.?\d+$/', $value ) ) {
				$value .= 'px';
			}

			$css .= sprintf( '%1$s-%2$s:%3$s;', $prefix, $side, $value );
		}

		return $css;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_length' ) ) {
	/**
	 * Sanitise a single CSS length such as "12px".
	 *
	 * @param mixed $value Raw value.
	 * @return string Safe CSS length, or an empty string.
	 */
	function uplifters_site_builder_blocks_video_upload_length( $value ): string {
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';

		if ( '' === $value ) {
			return '';
		}

		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', wp_strip_all_tags( $value ) );

		return preg_match( '/^-?\d*\.?\d+(px|em|rem|%|vw|vh)?$/', $value ) ? $value : '';
	}
}

$uplifters_site_builder_blocks_uplifters_url = isset( $attributes['url'] )
	? esc_url_raw( (string) $attributes['url'] )
	: '';

/**
 * Legacy fallback.
 *
 * This block used to hold a grid of videos in a `videos` array. Posts saved
 * back then are migrated to `url` the next time the block is opened in the
 * editor, so until that happens the first saved item is rendered here.
 */
if (
	'' === $uplifters_site_builder_blocks_uplifters_url &&
	! empty( $attributes['videos'] ) &&
	is_array( $attributes['videos'] ) &&
	! empty( $attributes['videos'][0]['url'] )
) {
	$uplifters_site_builder_blocks_uplifters_url = esc_url_raw( (string) $attributes['videos'][0]['url'] );
}

if ( '' === $uplifters_site_builder_blocks_uplifters_url ) {
	return;
}

$uplifters_site_builder_blocks_uplifters_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-video-upload-' );

$uplifters_site_builder_blocks_uplifters_devices = array(
	'desktop' => '',
	'tablet'  => '(max-width:1024px)',
	'mobile'  => '(max-width:767px)',
);

$uplifters_site_builder_blocks_uplifters_css = '';

foreach ( $uplifters_site_builder_blocks_uplifters_devices as $uplifters_site_builder_blocks_uplifters_device => $uplifters_site_builder_blocks_uplifters_media_query ) {
	$uplifters_site_builder_blocks_uplifters_declarations = '';

	$uplifters_site_builder_blocks_uplifters_declarations .= uplifters_site_builder_blocks_video_upload_box_to_css(
		'padding',
		uplifters_site_builder_blocks_video_upload_responsive_box(
			isset( $attributes['padding'] ) ? $attributes['padding'] : null,
			$uplifters_site_builder_blocks_uplifters_device
		)
	);

	$uplifters_site_builder_blocks_uplifters_declarations .= uplifters_site_builder_blocks_video_upload_box_to_css(
		'margin',
		uplifters_site_builder_blocks_video_upload_responsive_box(
			isset( $attributes['margin'] ) ? $attributes['margin'] : null,
			$uplifters_site_builder_blocks_uplifters_device
		)
	);

	$uplifters_site_builder_blocks_uplifters_radius = uplifters_site_builder_blocks_video_upload_length(
		uplifters_site_builder_blocks_video_upload_responsive_value(
			isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : null,
			$uplifters_site_builder_blocks_uplifters_device,
			''
		)
	);

	if ( '' !== $uplifters_site_builder_blocks_uplifters_radius ) {
		$uplifters_site_builder_blocks_uplifters_declarations .= '--uplifters-video-upload-radius:' . $uplifters_site_builder_blocks_uplifters_radius . ';';
	}

	if ( '' === $uplifters_site_builder_blocks_uplifters_declarations ) {
		continue;
	}

	$uplifters_site_builder_blocks_uplifters_rule = '#' . $uplifters_site_builder_blocks_uplifters_unique_id . '.uplifters-video-upload{' . $uplifters_site_builder_blocks_uplifters_declarations . '}';

	if ( '' === $uplifters_site_builder_blocks_uplifters_media_query ) {
		$uplifters_site_builder_blocks_uplifters_css .= $uplifters_site_builder_blocks_uplifters_rule;
		continue;
	}

	$uplifters_site_builder_blocks_uplifters_css .= '@media ' . $uplifters_site_builder_blocks_uplifters_media_query . '{' . $uplifters_site_builder_blocks_uplifters_rule . '}';
}

\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue(
	$block,
	wp_strip_all_tags( $uplifters_site_builder_blocks_uplifters_css )
);

$uplifters_site_builder_blocks_uplifters_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_uplifters_unique_id,
		'class' => 'uplifters-video-upload',
	)
);
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_uplifters_wrapper_attributes, array() );
?>>
	<video
		class="uplifters-video-upload__video"
		src="<?php echo esc_url( $uplifters_site_builder_blocks_uplifters_url ); ?>"
		controls
		preload="metadata"
	></video>
</div>
