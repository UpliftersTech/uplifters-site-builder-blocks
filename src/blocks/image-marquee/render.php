<?php
/**
 * Server-side render template for the UPLIFTERS_SITE_BUILDER_BLOCKS Image Marquee block.
 *
 * @package UpliftersSiteBuilderBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Determine whether a responsive branch contains a usable value.
 *
 * Numeric zero is considered a valid value.
 *
 * @param mixed $value Value to check.
 * @return bool
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_marquee_has_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value ): bool {
		return (
			null !== $value &&
			'' !== $value
		);
	}
}

/**
 * Get a value from a responsive attribute object.
 *
 * It also supports legacy scalar attributes so blocks created before the
 * responsive update continue to render.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute key.
 * @param string $device     desktop, tablet or mobile.
 * @param mixed  $fallback   Fallback value.
 * @return mixed
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_marquee_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_marquee_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		/*
		 * Legacy scalar value support.
		 */
		if ( ! is_array( $value ) ) {
			return uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value )
				? $value
				: $fallback;
		}

		if (
			array_key_exists( $device, $value ) &&
			uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value[ $device ] )
		) {
			return $value[ $device ];
		}

		if (
			array_key_exists( 'desktop', $value ) &&
			uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value['desktop'] )
		) {
			return $value['desktop'];
		}

		if (
			array_key_exists( 'tablet', $value ) &&
			uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value['tablet'] )
		) {
			return $value['tablet'];
		}

		if (
			array_key_exists( 'mobile', $value ) &&
			uplifters_site_builder_blocks_image_marquee_has_responsive_value( $value['mobile'] )
		) {
			return $value['mobile'];
		}

		return $fallback;
	}
}

/**
 * Sanitize and clamp an integer responsive setting.
 *
 * @param mixed $value Value to sanitize.
 * @param int   $min   Minimum value.
 * @param int   $max   Maximum value.
 * @param int   $fallback Fallback value.
 * @return int
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_marquee_integer_setting' ) ) {
	function uplifters_site_builder_blocks_image_marquee_integer_setting(
		$value,
		int $min,
		int $max,
		int $fallback
	): int {
		if ( ! is_numeric( $value ) ) {
			return $fallback;
		}

		$value = (int) round( (float) $value );

		return max( $min, min( $max, $value ) );
	}
}

/**
 * Sanitize a CSS color.
 *
 * Supports hexadecimal, rgb(), rgba(), hsl(), hsla() and CSS custom
 * properties returned by WordPress color controls.
 *
 * @param mixed $color Color value.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_marquee_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_image_marquee_sanitize_color( $color ): string {
		if ( ! is_string( $color ) ) {
			return '';
		}

		$color = trim( wp_strip_all_tags( $color ) );

		if ( '' === $color ) {
			return '';
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color ) ) {
			return $color;
		}

		if (
			preg_match(
				'/^rgba?\(\s*[0-9.%\s,\/-]+\)$/i',
				$color
			)
		) {
			return $color;
		}

		if (
			preg_match(
				'/^hsla?\(\s*[0-9.%a-z\s,\/-]+\)$/i',
				$color
			)
		) {
			return $color;
		}

		if (
			preg_match(
				'/^var\(\s*--[a-zA-Z0-9_-]+\s*\)$/',
				$color
			)
		) {
			return $color;
		}

		return '';
	}
}

$uplifters_site_builder_blocks_images = (
	isset( $attributes['images'] ) &&
	is_array( $attributes['images'] )
)
	? $attributes['images']
	: array();

$uplifters_site_builder_blocks_images = array_values(
	array_filter(
		$uplifters_site_builder_blocks_images,
		static function ( $image ): bool {
			return (
				is_array( $image ) &&
				! empty( $image['url'] ) &&
				is_string( $image['url'] )
			);
		}
	)
);

/*
 * Desktop responsive values.
 */
$uplifters_site_builder_blocks_desktop_image_padding = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imagePadding',
		'desktop',
		0
	),
	0,
	50,
	0
);

$uplifters_site_builder_blocks_desktop_margin = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'margin',
		'desktop',
		0
	),
	0,
	100,
	0
);

$uplifters_site_builder_blocks_desktop_duration = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'duration',
		'desktop',
		20
	),
	1,
	60,
	20
);

$uplifters_site_builder_blocks_desktop_image_height = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageHeight',
		'desktop',
		256
	),
	100,
	500,
	256
);

$uplifters_site_builder_blocks_desktop_image_width = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageWidth',
		'desktop',
		256
	),
	100,
	500,
	256
);

$uplifters_site_builder_blocks_desktop_background_color = uplifters_site_builder_blocks_image_marquee_sanitize_color(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		''
	)
);

/*
 * Tablet responsive values.
 */
$uplifters_site_builder_blocks_tablet_image_padding = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imagePadding',
		'tablet',
		$uplifters_site_builder_blocks_desktop_image_padding
	),
	0,
	50,
	$uplifters_site_builder_blocks_desktop_image_padding
);

$uplifters_site_builder_blocks_tablet_margin = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'margin',
		'tablet',
		$uplifters_site_builder_blocks_desktop_margin
	),
	0,
	100,
	$uplifters_site_builder_blocks_desktop_margin
);

$uplifters_site_builder_blocks_tablet_duration = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'duration',
		'tablet',
		$uplifters_site_builder_blocks_desktop_duration
	),
	1,
	60,
	$uplifters_site_builder_blocks_desktop_duration
);

$uplifters_site_builder_blocks_tablet_image_height = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageHeight',
		'tablet',
		$uplifters_site_builder_blocks_desktop_image_height
	),
	100,
	500,
	$uplifters_site_builder_blocks_desktop_image_height
);

$uplifters_site_builder_blocks_tablet_image_width = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageWidth',
		'tablet',
		$uplifters_site_builder_blocks_desktop_image_width
	),
	100,
	500,
	$uplifters_site_builder_blocks_desktop_image_width
);

$uplifters_site_builder_blocks_tablet_background_color = uplifters_site_builder_blocks_image_marquee_sanitize_color(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_background_color
	)
);

/*
 * Mobile responsive values.
 */
$uplifters_site_builder_blocks_mobile_image_padding = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imagePadding',
		'mobile',
		$uplifters_site_builder_blocks_desktop_image_padding
	),
	0,
	50,
	$uplifters_site_builder_blocks_desktop_image_padding
);

$uplifters_site_builder_blocks_mobile_margin = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'margin',
		'mobile',
		$uplifters_site_builder_blocks_desktop_margin
	),
	0,
	100,
	$uplifters_site_builder_blocks_desktop_margin
);

$uplifters_site_builder_blocks_mobile_duration = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'duration',
		'mobile',
		$uplifters_site_builder_blocks_desktop_duration
	),
	1,
	60,
	$uplifters_site_builder_blocks_desktop_duration
);

$uplifters_site_builder_blocks_mobile_image_height = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageHeight',
		'mobile',
		$uplifters_site_builder_blocks_desktop_image_height
	),
	100,
	500,
	$uplifters_site_builder_blocks_desktop_image_height
);

$uplifters_site_builder_blocks_mobile_image_width = uplifters_site_builder_blocks_image_marquee_integer_setting(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'imageWidth',
		'mobile',
		$uplifters_site_builder_blocks_desktop_image_width
	),
	100,
	500,
	$uplifters_site_builder_blocks_desktop_image_width
);

$uplifters_site_builder_blocks_mobile_background_color = uplifters_site_builder_blocks_image_marquee_sanitize_color(
	uplifters_site_builder_blocks_image_marquee_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_desktop_background_color
	)
);

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-image-marquee-' );

$uplifters_site_builder_blocks_wrapper_classes = array(
	'uplifters-site-builder-blocks-image-marquee',
	$uplifters_site_builder_blocks_unique_id,
);

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $uplifters_site_builder_blocks_wrapper_classes ),
	)
);

$uplifters_site_builder_blocks_selector = '.' . $uplifters_site_builder_blocks_unique_id;

$uplifters_site_builder_blocks_dynamic_css = '';

/*
 * Desktop base styles.
 */
$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_desktop_background_color
			? $uplifters_site_builder_blocks_desktop_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__outer{';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_desktop_margin . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_desktop_background_color
			? $uplifters_site_builder_blocks_desktop_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__track{';
$uplifters_site_builder_blocks_dynamic_css .= 'animation-duration:' . $uplifters_site_builder_blocks_desktop_duration . 's;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__image-frame{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_desktop_image_padding . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_desktop_image_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_desktop_image_width . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

/*
 * Tablet styles.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_tablet_background_color
			? $uplifters_site_builder_blocks_tablet_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__outer{';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_tablet_margin . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_tablet_background_color
			? $uplifters_site_builder_blocks_tablet_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__track{';
$uplifters_site_builder_blocks_dynamic_css .= 'animation-duration:' . $uplifters_site_builder_blocks_tablet_duration . 's;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__image-frame{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_tablet_image_padding . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_tablet_image_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_tablet_image_width . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '}';

/*
 * Mobile styles.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_mobile_background_color
			? $uplifters_site_builder_blocks_mobile_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__outer{';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_mobile_margin . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_mobile_background_color
			? $uplifters_site_builder_blocks_mobile_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__track{';
$uplifters_site_builder_blocks_dynamic_css .= 'animation-duration:' . $uplifters_site_builder_blocks_mobile_duration . 's;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-image-marquee__image-frame{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_mobile_image_padding . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_mobile_image_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_mobile_image_width . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_keyframe_name = $uplifters_site_builder_blocks_unique_id . '-scroll';
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php ob_start(); ?>
		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> {
			box-sizing: border-box;
			position: relative;
			width: 100%;
			overflow: hidden;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>,
		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> * {
			box-sizing: border-box;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__outer {
			position: relative;
			width: auto;
			overflow: hidden;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__track {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			width: max-content;
			max-width: none;
			white-space: nowrap;
			will-change: transform;
			animation-name: <?php echo esc_html( $uplifters_site_builder_blocks_keyframe_name ); ?>;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__outer:hover .uplifters-site-builder-blocks-image-marquee__track,
		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__outer:focus-within .uplifters-site-builder-blocks-image-marquee__track {
			animation-play-state: paused;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__group {
			display: flex;
			flex: 0 0 auto;
			flex-flow: row nowrap;
			align-items: center;
			width: max-content;
			max-width: none;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__image-frame {
			box-sizing: border-box;
			display: block;
			flex: 0 0 auto;
			max-width: none;
			background-color: transparent;
		}

		.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__image {
			display: block;
			width: 100%;
			height: 100%;
			max-width: none;
			object-fit: cover;
			background-color: #ffffff;
		}

		@keyframes <?php echo esc_html( $uplifters_site_builder_blocks_keyframe_name ); ?> {
			from {
				transform: translate3d(0, 0, 0);
			}

			to {
				transform: translate3d(-50%, 0, 0);
			}
		}

		<?php
		echo wp_kses( wp_strip_all_tags( $uplifters_site_builder_blocks_dynamic_css ), array() );
		?>

		@media (prefers-reduced-motion: reduce) {
			.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__track {
				width: 100%;
				max-width: 100%;
				overflow-x: auto;
				animation: none;
				will-change: auto;
				scrollbar-width: thin;
			}

			.<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-image-marquee__group--duplicate {
				display: none;
			}
		}
	<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

	<?php if ( ! empty( $uplifters_site_builder_blocks_images ) ) : ?>
		<div class="uplifters-site-builder-blocks-image-marquee__outer">
			<div
				class="uplifters-site-builder-blocks-image-marquee__track"
				aria-label="<?php esc_attr_e( 'Image marquee', 'uplifters-site-builder-blocks' ); ?>"
			>
				<div class="uplifters-site-builder-blocks-image-marquee__group">
					<?php foreach ( $uplifters_site_builder_blocks_images as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_image ) : ?>
						<?php
						$uplifters_site_builder_blocks_image_id = isset( $uplifters_site_builder_blocks_image['id'] )
							? absint( $uplifters_site_builder_blocks_image['id'] )
							: 0;

						$uplifters_site_builder_blocks_image_url = esc_url( $uplifters_site_builder_blocks_image['url'] );

						$uplifters_site_builder_blocks_image_alt = '';

						if ( $uplifters_site_builder_blocks_image_id ) {
							$uplifters_site_builder_blocks_image_alt_value = get_post_meta(
								$uplifters_site_builder_blocks_image_id,
								'_wp_attachment_image_alt',
								true
							);

							if ( is_string( $uplifters_site_builder_blocks_image_alt_value ) ) {
								$uplifters_site_builder_blocks_image_alt = $uplifters_site_builder_blocks_image_alt_value;
							}
						}
						?>

						<span class="uplifters-site-builder-blocks-image-marquee__image-frame">
							<img
								class="uplifters-site-builder-blocks-image-marquee__image"
								src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>"
								alt="<?php echo esc_attr( $uplifters_site_builder_blocks_image_alt ); ?>"
								loading="lazy"
								decoding="async"
								data-image-marquee-index="<?php echo esc_attr( $uplifters_site_builder_blocks_index ); ?>"
							/>
						</span>
					<?php endforeach; ?>
				</div>

				<div
					class="uplifters-site-builder-blocks-image-marquee__group uplifters-site-builder-blocks-image-marquee__group--duplicate"
					aria-hidden="true"
				>
					<?php foreach ( $uplifters_site_builder_blocks_images as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_image ) : ?>
						<span class="uplifters-site-builder-blocks-image-marquee__image-frame">
							<img
								class="uplifters-site-builder-blocks-image-marquee__image"
								src="<?php echo esc_url( $uplifters_site_builder_blocks_image['url'] ); ?>"
								alt=""
								loading="lazy"
								decoding="async"
								data-image-marquee-index="<?php echo esc_attr( $uplifters_site_builder_blocks_index ); ?>"
							/>
						</span>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	<?php endif; ?>
</div>
