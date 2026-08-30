<?php
/**
 * Server-side rendering for the UpliftersSiteBuilderBlocks Image block.
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
 * Read a responsive attribute.
 *
 * Scalar values are also supported for compatibility with blocks
 * saved before responsive objects were introduced.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_single_get_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_single_get_responsive_value(
		array $attributes,
		string $key,
		string $device,
		string $fallback = ''
	): string {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( ! is_array( $value ) ) {
			return is_scalar( $value )
				? (string) $value
				: $fallback;
		}

		if (
			array_key_exists( $device, $value ) &&
			null !== $value[ $device ]
		) {
			return (string) $value[ $device ];
		}

		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
			if (
				array_key_exists( $fallback_device, $value ) &&
				null !== $value[ $fallback_device ]
			) {
				return (string) $value[ $fallback_device ];
			}
		}

		return $fallback;
	}
}

/**
 * Sanitize a CSS property value.
 *
 * Removes characters that could terminate the current declaration
 * or inject additional CSS rules.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_single_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_image_single_sanitize_css_value( string $value ): string {
		$value = wp_strip_all_tags( $value );

		$value = str_replace(
			array(
				'<',
				'>',
				'{',
				'}',
				';',
				'\\',
			),
			'',
			$value
		);

		return trim( $value );
	}
}

/**
 * Sanitize supported CSS colors.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_single_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_image_single_sanitize_color( string $value ): string {
		$value = trim( $value );

		if ( '' === $value ) {
			return '';
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if (
			preg_match(
				'/^rgba?\([0-9.,\s%]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^hsla?\([0-9.,\s%deg]+\)$/i',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^var\(--[a-zA-Z0-9_-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^[a-zA-Z]+$/',
				$value
			)
		) {
			return sanitize_key( $value );
		}

		return '';
	}
}

/**
 * Restrict object-fit to valid CSS values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_single_sanitize_object_fit' ) ) {
	function uplifters_site_builder_blocks_image_single_sanitize_object_fit( string $value ): string {
		$allowed_values = array(
			'cover',
			'contain',
			'fill',
			'none',
			'scale-down',
		);

		return in_array( $value, $allowed_values, true )
			? $value
			: 'cover';
	}
}

$uplifters_site_builder_blocks_image_id = isset( $attributes['imageId'] )
	? absint( $attributes['imageId'] )
	: 0;

$uplifters_site_builder_blocks_image_url = isset( $attributes['imageUrl'] )
	? esc_url_raw( $attributes['imageUrl'] )
	: '';

$uplifters_site_builder_blocks_alt = isset( $attributes['alt'] )
	? sanitize_text_field( $attributes['alt'] )
	: '';

$uplifters_site_builder_blocks_caption = isset( $attributes['caption'] )
	? (string) $attributes['caption']
	: '';

$uplifters_site_builder_blocks_size_slug = isset( $attributes['sizeSlug'] )
	? sanitize_key( $attributes['sizeSlug'] )
	: 'full';

$uplifters_site_builder_blocks_link_to = isset( $attributes['linkTo'] )
	? sanitize_key( $attributes['linkTo'] )
	: 'none';

$uplifters_site_builder_blocks_custom_link = isset( $attributes['customLink'] )
	? esc_url_raw( $attributes['customLink'] )
	: '';

$uplifters_site_builder_blocks_open_in_new_tab = ! empty(
	$attributes['openInNewTab']
);

/**
 * Retrieve the appropriate WordPress image URL.
 */
if ( $uplifters_site_builder_blocks_image_id ) {
	$uplifters_site_builder_blocks_attachment_image_url = wp_get_attachment_image_url(
		$uplifters_site_builder_blocks_image_id,
		$uplifters_site_builder_blocks_size_slug ?: 'full'
	);

	if ( $uplifters_site_builder_blocks_attachment_image_url ) {
		$uplifters_site_builder_blocks_image_url = $uplifters_site_builder_blocks_attachment_image_url;
	}

	/*
	 * Use the Media Library alt text only when the block's
	 * own alt text has not been entered.
	 */
	if ( '' === $uplifters_site_builder_blocks_alt ) {
		$uplifters_site_builder_blocks_attachment_alt = get_post_meta(
			$uplifters_site_builder_blocks_image_id,
			'_wp_attachment_image_alt',
			true
		);

		if ( is_string( $uplifters_site_builder_blocks_attachment_alt ) ) {
			$uplifters_site_builder_blocks_alt = sanitize_text_field(
				$uplifters_site_builder_blocks_attachment_alt
			);
		}
	}
}

/**
 * Responsive object-fit values.
 */
$uplifters_site_builder_blocks_desktop_object_fit = uplifters_site_builder_blocks_image_single_sanitize_object_fit(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'objectFit',
		'desktop',
		'cover'
	)
);

$uplifters_site_builder_blocks_tablet_object_fit = uplifters_site_builder_blocks_image_single_sanitize_object_fit(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'objectFit',
		'tablet',
		$uplifters_site_builder_blocks_desktop_object_fit
	)
);

$uplifters_site_builder_blocks_mobile_object_fit = uplifters_site_builder_blocks_image_single_sanitize_object_fit(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'objectFit',
		'mobile',
		$uplifters_site_builder_blocks_tablet_object_fit
	)
);

/**
 * Responsive image height.
 */
$uplifters_site_builder_blocks_desktop_height = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'height',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_height = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'height',
		'tablet',
		$uplifters_site_builder_blocks_desktop_height
	)
);

$uplifters_site_builder_blocks_mobile_height = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'height',
		'mobile',
		$uplifters_site_builder_blocks_tablet_height
	)
);

/**
 * Responsive background colors.
 */
$uplifters_site_builder_blocks_desktop_background_color = uplifters_site_builder_blocks_image_single_sanitize_color(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_background_color = uplifters_site_builder_blocks_image_single_sanitize_color(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_background_color
	)
);

$uplifters_site_builder_blocks_mobile_background_color = uplifters_site_builder_blocks_image_single_sanitize_color(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_background_color
	)
);

/**
 * Responsive spacing.
 */
$uplifters_site_builder_blocks_desktop_padding = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'padding',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_padding = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'padding',
		'tablet',
		$uplifters_site_builder_blocks_desktop_padding
	)
);

$uplifters_site_builder_blocks_mobile_padding = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'padding',
		'mobile',
		$uplifters_site_builder_blocks_tablet_padding
	)
);

$uplifters_site_builder_blocks_desktop_margin = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'margin',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_margin = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'margin',
		'tablet',
		$uplifters_site_builder_blocks_desktop_margin
	)
);

$uplifters_site_builder_blocks_mobile_margin = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'margin',
		'mobile',
		$uplifters_site_builder_blocks_tablet_margin
	)
);

/**
 * Responsive shadow and radius.
 */
$uplifters_site_builder_blocks_desktop_box_shadow = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'boxShadow',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_box_shadow = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'boxShadow',
		'tablet',
		$uplifters_site_builder_blocks_desktop_box_shadow
	)
);

$uplifters_site_builder_blocks_mobile_box_shadow = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'boxShadow',
		'mobile',
		$uplifters_site_builder_blocks_tablet_box_shadow
	)
);

$uplifters_site_builder_blocks_desktop_border_radius = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'borderRadius',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_border_radius = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'borderRadius',
		'tablet',
		$uplifters_site_builder_blocks_desktop_border_radius
	)
);

$uplifters_site_builder_blocks_mobile_border_radius = uplifters_site_builder_blocks_image_single_sanitize_css_value(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'borderRadius',
		'mobile',
		$uplifters_site_builder_blocks_tablet_border_radius
	)
);

/**
 * Responsive caption font family.
 */
$uplifters_site_builder_blocks_desktop_caption_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'captionFontFamily',
		'desktop',
		'inherit'
	)
) ?: 'inherit';

$uplifters_site_builder_blocks_tablet_caption_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'captionFontFamily',
		'tablet',
		'inherit'
	)
) ?: 'inherit';

$uplifters_site_builder_blocks_mobile_caption_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	uplifters_site_builder_blocks_image_single_get_responsive_value(
		$attributes,
		'captionFontFamily',
		'mobile',
		'inherit'
	)
) ?: 'inherit';

/**
 * Resolve the image link.
 */
$uplifters_site_builder_blocks_link_url = '';

if ( 'media' === $uplifters_site_builder_blocks_link_to ) {
	$uplifters_site_builder_blocks_link_url = $uplifters_site_builder_blocks_image_url;
} elseif ( 'custom' === $uplifters_site_builder_blocks_link_to ) {
	$uplifters_site_builder_blocks_link_url = $uplifters_site_builder_blocks_custom_link;
}

/**
 * Create a unique selector so responsive CSS from one Image
 * block cannot affect another Image block.
 */
$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-image-single-'
);

/**
 * Static block styles.
 */
$uplifters_site_builder_blocks_static_css  = '';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-image-single{width:100%;box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-image-single *,.wp-block-uplifters-site-builder-blocks-image-single *::before,.wp-block-uplifters-site-builder-blocks-image-single *::after{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-image-single__link{display:block;color:inherit;text-decoration:none;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-image-single__img{display:block;width:100%;height:var(--uplifters-site-builder-blocks-image-single-height,auto);max-width:100%;object-fit:var(--uplifters-site-builder-blocks-image-single-object-fit,cover);}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-image-single__caption{margin:8px 0 0;font-size:14px;line-height:1.5;opacity:.8;}';

/**
 * Desktop styles.
 */
$uplifters_site_builder_blocks_dynamic_css  = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-object-fit:' . $uplifters_site_builder_blocks_desktop_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-height:' . ( '' !== $uplifters_site_builder_blocks_desktop_height ? $uplifters_site_builder_blocks_desktop_height : 'auto' ) . ';';

if ( '' !== $uplifters_site_builder_blocks_desktop_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_background_color . ';';
}

if ( '' !== $uplifters_site_builder_blocks_desktop_padding ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_desktop_padding . ';';
}

if ( '' !== $uplifters_site_builder_blocks_desktop_margin ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_desktop_margin . ';';
}

if ( '' !== $uplifters_site_builder_blocks_desktop_box_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:' . $uplifters_site_builder_blocks_desktop_box_shadow . ';';
}

if ( '' !== $uplifters_site_builder_blocks_desktop_border_radius ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_desktop_border_radius . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'overflow:hidden;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .wp-block-uplifters-site-builder-blocks-image-single__caption{font-family:' . $uplifters_site_builder_blocks_desktop_caption_font_family . ';}';

/**
 * Tablet styles.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-object-fit:' . $uplifters_site_builder_blocks_tablet_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-height:' . ( '' !== $uplifters_site_builder_blocks_tablet_height ? $uplifters_site_builder_blocks_tablet_height : 'auto' ) . ';';

if ( '' !== $uplifters_site_builder_blocks_tablet_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_background_color . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:transparent;';
}

if ( '' !== $uplifters_site_builder_blocks_tablet_padding ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_tablet_padding . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:0;';
}

if ( '' !== $uplifters_site_builder_blocks_tablet_margin ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_tablet_margin . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:0;';
}

if ( '' !== $uplifters_site_builder_blocks_tablet_box_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:' . $uplifters_site_builder_blocks_tablet_box_shadow . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:none;';
}

if ( '' !== $uplifters_site_builder_blocks_tablet_border_radius ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_tablet_border_radius . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'overflow:hidden;';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:0;';
	$uplifters_site_builder_blocks_dynamic_css .= 'overflow:visible;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .wp-block-uplifters-site-builder-blocks-image-single__caption{font-family:' . $uplifters_site_builder_blocks_tablet_caption_font_family . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

/**
 * Mobile styles.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-object-fit:' . $uplifters_site_builder_blocks_mobile_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-single-height:' . ( '' !== $uplifters_site_builder_blocks_mobile_height ? $uplifters_site_builder_blocks_mobile_height : 'auto' ) . ';';

if ( '' !== $uplifters_site_builder_blocks_mobile_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_background_color . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:transparent;';
}

if ( '' !== $uplifters_site_builder_blocks_mobile_padding ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_mobile_padding . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:0;';
}

if ( '' !== $uplifters_site_builder_blocks_mobile_margin ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_mobile_margin . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:0;';
}

if ( '' !== $uplifters_site_builder_blocks_mobile_box_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:' . $uplifters_site_builder_blocks_mobile_box_shadow . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:none;';
}

if ( '' !== $uplifters_site_builder_blocks_mobile_border_radius ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_mobile_border_radius . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'overflow:hidden;';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:0;';
	$uplifters_site_builder_blocks_dynamic_css .= 'overflow:visible;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .wp-block-uplifters-site-builder-blocks-image-single__caption{font-family:' . $uplifters_site_builder_blocks_mobile_caption_font_family . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_unique_id,
		'class' => 'wp-block-uplifters-site-builder-blocks-image-single',
	)
);
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

	<figure <?php
		// get_block_wrapper_attributes() already escapes every value with
		// esc_attr() before returning. wp_kses() with an empty allowlist
		// leaves that string unchanged and satisfies static analysis.
		echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
	?>>
	<?php if ( $uplifters_site_builder_blocks_image_url ) : ?>

		<?php if ( $uplifters_site_builder_blocks_link_url ) : ?>
			<a
				class="wp-block-uplifters-site-builder-blocks-image-single__link"
				href="<?php echo esc_url( $uplifters_site_builder_blocks_link_url ); ?>"
				<?php if ( $uplifters_site_builder_blocks_open_in_new_tab ) : ?>
					target="_blank"
					rel="noopener noreferrer"
				<?php endif; ?>
			>
				<img
					class="wp-block-uplifters-site-builder-blocks-image-single__img"
					src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>"
					alt="<?php echo esc_attr( $uplifters_site_builder_blocks_alt ); ?>"
				/>
			</a>
		<?php else : ?>
			<img
				class="wp-block-uplifters-site-builder-blocks-image-single__img"
				src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>"
				alt="<?php echo esc_attr( $uplifters_site_builder_blocks_alt ); ?>"
			/>
		<?php endif; ?>

		<?php if ( '' !== trim( $uplifters_site_builder_blocks_caption ) ) : ?>
			<figcaption class="wp-block-uplifters-site-builder-blocks-image-single__caption">
				<?php echo wp_kses_post( $uplifters_site_builder_blocks_caption ); ?>
			</figcaption>
		<?php endif; ?>

	<?php endif; ?>
</figure>
