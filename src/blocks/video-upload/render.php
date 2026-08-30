<?php
/**
 * Server-side rendering for the Video Grid Uploaded block.
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

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_sanitize_cols' ) ) {
	/**
	 * Clamp the videos-per-row value.
	 *
	 * @param mixed $value Raw value.
	 * @param int   $fallback Fallback columns.
	 * @return int Columns between 1 and 6.
	 */
	function uplifters_site_builder_blocks_video_upload_sanitize_cols(
		$value,
		int $fallback = 1
	): int {
		$number = absint( $value );

		if ( $number < 1 ) {
			$number = $fallback;
		}

		return max( 1, min( 6, $number ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_upload_spacing_rem' ) ) {
	/**
	 * Convert a spacing unit ( 1 = 0.25rem ) into a CSS rem string.
	 *
	 * @param mixed $value Raw spacing unit.
	 * @return string CSS length.
	 */
	function uplifters_site_builder_blocks_video_upload_spacing_rem( $value ): string {
		$unit = absint( $value );

		return rtrim( rtrim( number_format( $unit * 0.25, 2, '.', '' ), '0' ), '.' ) . 'rem';
	}
}

$uplifters_site_builder_blocks_uplifters_videos = isset( $attributes['videos'] ) && is_array( $attributes['videos'] )
	? $attributes['videos']
	: array();

if ( empty( $uplifters_site_builder_blocks_uplifters_videos ) ) {
	return;
}

$uplifters_site_builder_blocks_uplifters_devices = array(
	'desktop' => '',
	'tablet'  => '(max-width:1024px)',
	'mobile'  => '(max-width:767px)',
);

$uplifters_site_builder_blocks_uplifters_rows_raw = isset( $attributes['rows'] ) ? $attributes['rows'] : null;

$uplifters_site_builder_blocks_uplifters_cols = array();

$uplifters_site_builder_blocks_uplifters_cols['desktop'] = uplifters_site_builder_blocks_video_upload_sanitize_cols(
	uplifters_site_builder_blocks_video_upload_responsive_value( $uplifters_site_builder_blocks_uplifters_rows_raw, 'desktop', 1 ),
	1
);

$uplifters_site_builder_blocks_uplifters_cols['tablet'] = uplifters_site_builder_blocks_video_upload_sanitize_cols(
	uplifters_site_builder_blocks_video_upload_responsive_value( $uplifters_site_builder_blocks_uplifters_rows_raw, 'tablet', $uplifters_site_builder_blocks_uplifters_cols['desktop'] ),
	$uplifters_site_builder_blocks_uplifters_cols['desktop']
);

$uplifters_site_builder_blocks_uplifters_cols['mobile'] = uplifters_site_builder_blocks_video_upload_sanitize_cols(
	uplifters_site_builder_blocks_video_upload_responsive_value( $uplifters_site_builder_blocks_uplifters_rows_raw, 'mobile', $uplifters_site_builder_blocks_uplifters_cols['desktop'] ),
	$uplifters_site_builder_blocks_uplifters_cols['desktop']
);

/**
 * Normalise every video into a per-device value set before any markup is
 * printed, so the generated CSS and the rendered items share one index.
 */
$uplifters_site_builder_blocks_uplifters_items = array();

foreach ( $uplifters_site_builder_blocks_uplifters_videos as $uplifters_site_builder_blocks_uplifters_video ) {
	if ( ! is_array( $uplifters_site_builder_blocks_uplifters_video ) ) {
		continue;
	}

	$uplifters_site_builder_blocks_uplifters_video_url = isset( $uplifters_site_builder_blocks_uplifters_video['url'] ) ? esc_url_raw( $uplifters_site_builder_blocks_uplifters_video['url'] ) : '';

	if ( '' === $uplifters_site_builder_blocks_uplifters_video_url ) {
		continue;
	}

	$uplifters_site_builder_blocks_uplifters_item = array(
		'url' => $uplifters_site_builder_blocks_uplifters_video_url,
	);

	foreach ( array_keys( $uplifters_site_builder_blocks_uplifters_devices ) as $uplifters_site_builder_blocks_uplifters_device ) {
		$uplifters_site_builder_blocks_uplifters_is_desktop = ( 'desktop' === $uplifters_site_builder_blocks_uplifters_device );

		$uplifters_site_builder_blocks_uplifters_width = max(
			1,
			absint(
				uplifters_site_builder_blocks_video_upload_responsive_value(
					isset( $uplifters_site_builder_blocks_uplifters_video['width'] ) ? $uplifters_site_builder_blocks_uplifters_video['width'] : null,
					$uplifters_site_builder_blocks_uplifters_device,
					$uplifters_site_builder_blocks_uplifters_is_desktop ? 320 : $uplifters_site_builder_blocks_uplifters_item['desktop']['width']
				)
			)
		);

		$uplifters_site_builder_blocks_uplifters_height = max(
			1,
			absint(
				uplifters_site_builder_blocks_video_upload_responsive_value(
					isset( $uplifters_site_builder_blocks_uplifters_video['height'] ) ? $uplifters_site_builder_blocks_uplifters_video['height'] : null,
					$uplifters_site_builder_blocks_uplifters_device,
					$uplifters_site_builder_blocks_uplifters_is_desktop ? 180 : $uplifters_site_builder_blocks_uplifters_item['desktop']['height']
				)
			)
		);

		$uplifters_site_builder_blocks_uplifters_padding = uplifters_site_builder_blocks_video_upload_responsive_value(
			isset( $uplifters_site_builder_blocks_uplifters_video['padding'] ) ? $uplifters_site_builder_blocks_uplifters_video['padding'] : null,
			$uplifters_site_builder_blocks_uplifters_device,
			$uplifters_site_builder_blocks_uplifters_is_desktop ? 0 : $uplifters_site_builder_blocks_uplifters_item['desktop']['padding_unit']
		);

		$uplifters_site_builder_blocks_uplifters_margin = uplifters_site_builder_blocks_video_upload_responsive_value(
			isset( $uplifters_site_builder_blocks_uplifters_video['margin'] ) ? $uplifters_site_builder_blocks_uplifters_video['margin'] : null,
			$uplifters_site_builder_blocks_uplifters_device,
			$uplifters_site_builder_blocks_uplifters_is_desktop ? 0 : $uplifters_site_builder_blocks_uplifters_item['desktop']['margin_unit']
		);

		$uplifters_site_builder_blocks_uplifters_item[ $uplifters_site_builder_blocks_uplifters_device ] = array(
			'width'        => $uplifters_site_builder_blocks_uplifters_width,
			'height'       => $uplifters_site_builder_blocks_uplifters_height,
			'padding_unit' => absint( $uplifters_site_builder_blocks_uplifters_padding ),
			'margin_unit'  => absint( $uplifters_site_builder_blocks_uplifters_margin ),
			'padding'      => uplifters_site_builder_blocks_video_upload_spacing_rem( $uplifters_site_builder_blocks_uplifters_padding ),
			'margin'       => uplifters_site_builder_blocks_video_upload_spacing_rem( $uplifters_site_builder_blocks_uplifters_margin ),
		);
	}

	$uplifters_site_builder_blocks_uplifters_items[] = $uplifters_site_builder_blocks_uplifters_item;
}

if ( empty( $uplifters_site_builder_blocks_uplifters_items ) ) {
	return;
}

$uplifters_site_builder_blocks_uplifters_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-video-upload-' );

$uplifters_site_builder_blocks_uplifters_css = '';

foreach ( $uplifters_site_builder_blocks_uplifters_devices as $uplifters_site_builder_blocks_uplifters_device => $uplifters_site_builder_blocks_uplifters_media_query ) {
	$uplifters_site_builder_blocks_uplifters_device_css = '';

	$uplifters_site_builder_blocks_uplifters_device_css .= '#' . $uplifters_site_builder_blocks_uplifters_unique_id . ' .uplifters-video-upload__grid{';
	$uplifters_site_builder_blocks_uplifters_device_css .= 'grid-template-columns:repeat(' . $uplifters_site_builder_blocks_uplifters_cols[ $uplifters_site_builder_blocks_uplifters_device ] . ',minmax(0,1fr));';
	$uplifters_site_builder_blocks_uplifters_device_css .= '}';

	foreach ( $uplifters_site_builder_blocks_uplifters_items as $uplifters_site_builder_blocks_uplifters_index => $uplifters_site_builder_blocks_uplifters_item ) {
		$uplifters_site_builder_blocks_uplifters_values = $uplifters_site_builder_blocks_uplifters_item[ $uplifters_site_builder_blocks_uplifters_device ];

		$uplifters_site_builder_blocks_uplifters_device_css .= '#' . $uplifters_site_builder_blocks_uplifters_unique_id . ' .uplifters-video-upload__item--' . (int) $uplifters_site_builder_blocks_uplifters_index . '{';
		$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-video-upload-item-padding:' . $uplifters_site_builder_blocks_uplifters_values['padding'] . ';';
		$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-video-upload-item-margin:' . $uplifters_site_builder_blocks_uplifters_values['margin'] . ';';
		$uplifters_site_builder_blocks_uplifters_device_css .= '--uplifters-video-upload-item-ratio:' . $uplifters_site_builder_blocks_uplifters_values['width'] . ' / ' . $uplifters_site_builder_blocks_uplifters_values['height'] . ';';
		$uplifters_site_builder_blocks_uplifters_device_css .= '}';
	}

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
	<div class="uplifters-video-upload__grid">
		<?php foreach ( $uplifters_site_builder_blocks_uplifters_items as $uplifters_site_builder_blocks_uplifters_index => $uplifters_site_builder_blocks_uplifters_item ) : ?>
			<div class="uplifters-video-upload__item uplifters-video-upload__item--<?php echo (int) $uplifters_site_builder_blocks_uplifters_index; ?>">
				<video
					class="uplifters-video-upload__video"
					src="<?php echo esc_url( $uplifters_site_builder_blocks_uplifters_item['url'] ); ?>"
					controls
					preload="metadata"
				></video>
			</div>
		<?php endforeach; ?>
	</div>
</div>