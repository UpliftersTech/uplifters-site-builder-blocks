<?php
/**
 * Server-side render template for the uplifters-site-builder-blocks/posts-metadata block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Current block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clamp a numeric value.
 *
 * @param mixed $value Value.
 * @param float $min   Minimum.
 * @param float $max   Maximum.
 *
 * @return float
 */
$uplifters_site_builder_blocks_metadata_clamp = static function (
	$value,
	$min,
	$max
) {
	$value = is_numeric( $value )
		? (float) $value
		: 0;

	return max(
		(float) $min,
		min(
			(float) $max,
			$value
		)
	);
};

/**
 * Read a responsive attribute.
 *
 * Old scalar values remain supported.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute name.
 * @param string $device     Device name.
 * @param mixed  $fallback   Fallback.
 *
 * @return mixed
 */
$uplifters_site_builder_blocks_metadata_responsive_value = static function (
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
	 * Compatibility with older block versions that stored
	 * responsive values as scalar values.
	 */
	if ( ! is_array( $value ) ) {
		return $value;
	}

	if ( array_key_exists( $device, $value ) ) {
		return $value[ $device ];
	}

	if ( array_key_exists( 'desktop', $value ) ) {
		return $value['desktop'];
	}

	if ( array_key_exists( 'tablet', $value ) ) {
		return $value['tablet'];
	}

	if ( array_key_exists( 'mobile', $value ) ) {
		return $value['mobile'];
	}

	return $fallback;
};

/**
 * Convert a hexadecimal color to rgba().
 *
 * @param mixed $hex   Hexadecimal color.
 * @param mixed $alpha Opacity.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_hex_to_rgba = static function (
	$hex,
	$alpha = 1.0
) use ( $uplifters_site_builder_blocks_metadata_clamp ) {
	$hex = is_string( $hex )
		? trim( $hex )
		: '';

	$hex = ltrim( $hex, '#' );

	if ( 3 === strlen( $hex ) ) {
		$hex =
			$hex[0] . $hex[0] .
			$hex[1] . $hex[1] .
			$hex[2] . $hex[2];
	}

	if (
		6 !== strlen( $hex ) ||
		! ctype_xdigit( $hex )
	) {
		$hex = '111827';
	}

	$red = hexdec(
		substr( $hex, 0, 2 )
	);

	$green = hexdec(
		substr( $hex, 2, 2 )
	);

	$blue = hexdec(
		substr( $hex, 4, 2 )
	);

	$alpha = $uplifters_site_builder_blocks_metadata_clamp(
		$alpha,
		0,
		1
	);

	$alpha_string = number_format(
		$alpha,
		2,
		'.',
		''
	);

	$alpha_string = rtrim(
		rtrim(
			$alpha_string,
			'0'
		),
		'.'
	);

	if ( '' === $alpha_string ) {
		$alpha_string = '0';
	}

	return sprintf(
		'rgba(%d,%d,%d,%s)',
		$red,
		$green,
		$blue,
		$alpha_string
	);
};

/**
 * Format the post date.
 *
 * @param int    $post_id    Post ID.
 * @param string $format_key Format option.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_format_date = static function (
	$post_id,
	$format_key
) {
	$post_datetime =
		get_post_datetime( $post_id );

	if (
		! $post_datetime instanceof DateTimeInterface
	) {
		return '';
	}

	switch ( $format_key ) {
		case 'd/m/Y':
			$php_format = 'd/m/Y';
			break;

		case 'Mon-dd-YYYY':
			$php_format = 'M-d-Y';
			break;

		case 'Mon-dd-YYYY-time':
			$php_format = 'M-d-Y h:i a';
			break;

		case 'd-m-Y':
		default:
			$php_format = 'd-m-Y';
			break;
	}

	return wp_date(
		$php_format,
		$post_datetime->getTimestamp(),
		wp_timezone()
	);
};

/**
 * Validate text alignment.
 *
 * @param mixed $value Alignment.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_alignment = static function (
	$value
) {
	$allowed = array(
		'left',
		'center',
		'right',
	);

	return in_array(
		$value,
		$allowed,
		true
	)
		? $value
		: 'left';
};

/**
 * Validate font weight.
 *
 * @param mixed $value Font weight.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_font_weight = static function (
	$value
) {
	$value = (string) $value;

	$allowed = array(
		'400',
		'500',
		'700',
	);

	return in_array(
		$value,
		$allowed,
		true
	)
		? $value
		: '500';
};

/**
 * Return flex justification from text alignment.
 *
 * @param string $alignment Alignment.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_justify = static function (
	string $alignment
): string {
	if ( 'center' === $alignment ) {
		return 'center';
	}

	if ( 'right' === $alignment ) {
		return 'flex-end';
	}

	return 'flex-start';
};

/**
 * Build metadata SVG icon.
 *
 * The icon inherits color and font size from its parent.
 *
 * @param string $type Icon type.
 *
 * @return string
 */
$uplifters_site_builder_blocks_metadata_get_icon = static function (
	string $type
): string {
	$common_attributes =
		' viewBox="0 0 24 24"' .
		' fill="none"' .
		' stroke="currentColor"' .
		' stroke-width="1.8"' .
		' stroke-linecap="round"' .
		' stroke-linejoin="round"' .
		' aria-hidden="true"' .
		' focusable="false"';

	if ( 'author' === $type ) {
		return
			'<svg' . $common_attributes . '>' .
				'<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"></path>' .
				'<path d="M5 20a7 7 0 0 1 14 0"></path>' .
			'</svg>';
	}

	if ( 'category' === $type ) {
		return
			'<svg' . $common_attributes . '>' .
				'<path d="M20 10 12 2H4v8l8 8 8-8Z"></path>' .
				'<path d="M7.5 7.5h.01"></path>' .
			'</svg>';
	}

	return
		'<svg' . $common_attributes . '>' .
			'<rect x="3" y="5" width="18" height="16" rx="2"></rect>' .
			'<path d="M16 3v4M8 3v4M3 11h18"></path>' .
		'</svg>';
};

/*
 * Determine the current post ID.
 */
$uplifters_site_builder_blocks_post_id = 0;

if (
	isset( $block ) &&
	$block instanceof WP_Block &&
	! empty( $block->context['postId'] )
) {
	$uplifters_site_builder_blocks_post_id = absint(
		$block->context['postId']
	);
}

if ( ! $uplifters_site_builder_blocks_post_id ) {
	$uplifters_site_builder_blocks_current_post_id = get_the_ID();

	if ( $uplifters_site_builder_blocks_current_post_id ) {
		$uplifters_site_builder_blocks_post_id = absint(
			$uplifters_site_builder_blocks_current_post_id
		);
	}
}

if (
	! $uplifters_site_builder_blocks_post_id &&
	! empty( $attributes['postId'] )
) {
	$uplifters_site_builder_blocks_post_id = absint(
		$attributes['postId']
	);
}

if ( ! $uplifters_site_builder_blocks_post_id ) {
	return;
}

$uplifters_site_builder_blocks_post = get_post( $uplifters_site_builder_blocks_post_id );

if ( ! $uplifters_site_builder_blocks_post instanceof WP_Post ) {
	return;
}

/*
 * Non-responsive attributes.
 */
$uplifters_site_builder_blocks_link_author =
	! empty( $attributes['linkAuthor'] );

$uplifters_site_builder_blocks_link_category =
	! empty( $attributes['linkCategory'] );

$uplifters_site_builder_blocks_date_format =
	isset( $attributes['dateFormat'] )
		? (string) $attributes['dateFormat']
		: 'd-m-Y';

/*
 * Default responsive values.
 */
$uplifters_site_builder_blocks_devices = array(
	'desktop' => array(
		'show_author'   => true,
		'show_category' => true,
		'show_date'     => true,
		'uppercase'     => false,
		'text_color'    => '#111827',
		'text_opacity'  => 1,
		'font_family'   => 'default',
		'font_size'     => 16,
		'font_weight'   => '500',
		'text_align'    => 'left',
		'meta_gap'      => 8,
	),
	'tablet' => array(
		'show_author'   => true,
		'show_category' => true,
		'show_date'     => true,
		'uppercase'     => false,
		'text_color'    => '#111827',
		'text_opacity'  => 1,
		'font_family'   => 'default',
		'font_size'     => 15,
		'font_weight'   => '500',
		'text_align'    => 'left',
		'meta_gap'      => 7,
	),
	'mobile' => array(
		'show_author'   => true,
		'show_category' => true,
		'show_date'     => true,
		'uppercase'     => false,
		'text_color'    => '#111827',
		'text_opacity'  => 1,
		'font_family'   => 'default',
		'font_size'     => 14,
		'font_weight'   => '500',
		'text_align'    => 'left',
		'meta_gap'      => 6,
	),
);

/*
 * Resolve and validate responsive settings.
 */
foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => &$uplifters_site_builder_blocks_settings ) {
	$uplifters_site_builder_blocks_settings['show_author'] = (bool)
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'showAuthor',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['show_author']
		);

	$uplifters_site_builder_blocks_settings['show_category'] = (bool)
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'showCategory',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['show_category']
		);

	$uplifters_site_builder_blocks_settings['show_date'] = (bool)
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'showDate',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['show_date']
		);

	$uplifters_site_builder_blocks_settings['uppercase'] = (bool)
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'uppercase',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['uppercase']
		);

	$uplifters_site_builder_blocks_settings['text_color'] = (string)
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'textColor',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['text_color']
		);

	$uplifters_site_builder_blocks_text_color_valid = preg_match(
		'/^#[a-fA-F0-9]{3,8}$/',
		$uplifters_site_builder_blocks_settings['text_color']
	) || preg_match(
		'/^rgb[a]?\([0-9.,\s%]+\)$/',
		$uplifters_site_builder_blocks_settings['text_color']
	) || preg_match(
		'/^hsla?\([0-9.,\s%deg]+\)$/',
		$uplifters_site_builder_blocks_settings['text_color']
	);

	if ( ! $uplifters_site_builder_blocks_text_color_valid ) {
		$uplifters_site_builder_blocks_settings['text_color'] =
			'#111827';
	}

	$uplifters_site_builder_blocks_settings['text_opacity'] =
		$uplifters_site_builder_blocks_metadata_clamp(
			$uplifters_site_builder_blocks_metadata_responsive_value(
				$attributes,
				'textOpacity',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_settings['text_opacity']
			),
			0,
			1
		);

	$uplifters_site_builder_blocks_settings['font_family'] =
		$uplifters_site_builder_blocks_metadata_responsive_value(
			$attributes,
			'fontFamily',
			$uplifters_site_builder_blocks_device,
			$uplifters_site_builder_blocks_settings['font_family']
		);

	$uplifters_site_builder_blocks_settings['font_family_css'] =
		\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_settings['font_family'] ) ?: 'inherit';

	$uplifters_site_builder_blocks_settings['font_size'] = (int)
		$uplifters_site_builder_blocks_metadata_clamp(
			$uplifters_site_builder_blocks_metadata_responsive_value(
				$attributes,
				'fontSize',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_settings['font_size']
			),
			10,
			60
		);

	$uplifters_site_builder_blocks_settings['font_weight'] =
		$uplifters_site_builder_blocks_metadata_font_weight(
			$uplifters_site_builder_blocks_metadata_responsive_value(
				$attributes,
				'fontWeight',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_settings['font_weight']
			)
		);

	$uplifters_site_builder_blocks_settings['text_align'] =
		$uplifters_site_builder_blocks_metadata_alignment(
			$uplifters_site_builder_blocks_metadata_responsive_value(
				$attributes,
				'textAlign',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_settings['text_align']
			)
		);

	$uplifters_site_builder_blocks_settings['meta_gap'] = (int)
		$uplifters_site_builder_blocks_metadata_clamp(
			$uplifters_site_builder_blocks_metadata_responsive_value(
				$attributes,
				'metaGap',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_settings['meta_gap']
			),
			0,
			60
		);

	$uplifters_site_builder_blocks_settings['justify_content'] =
		$uplifters_site_builder_blocks_metadata_justify(
			$uplifters_site_builder_blocks_settings['text_align']
		);

	$uplifters_site_builder_blocks_settings['text_transform'] =
		$uplifters_site_builder_blocks_settings['uppercase']
			? 'uppercase'
			: 'none';

	$uplifters_site_builder_blocks_settings['color'] =
		$uplifters_site_builder_blocks_metadata_hex_to_rgba(
			$uplifters_site_builder_blocks_settings['text_color'],
			$uplifters_site_builder_blocks_settings['text_opacity']
		);
}

unset( $uplifters_site_builder_blocks_settings );

/*
 * Author metadata.
 */
$uplifters_site_builder_blocks_author_id = absint(
	$uplifters_site_builder_blocks_post->post_author
);

$uplifters_site_builder_blocks_author_name = '';
$uplifters_site_builder_blocks_author_link = '';

if ( $uplifters_site_builder_blocks_author_id ) {
	$uplifters_site_builder_blocks_author_name = get_the_author_meta(
		'display_name',
		$uplifters_site_builder_blocks_author_id
	);

	$uplifters_site_builder_blocks_author_link =
		get_author_posts_url(
			$uplifters_site_builder_blocks_author_id
		);
}

/*
 * Category metadata.
 */
$uplifters_site_builder_blocks_categories =
	get_the_category( $uplifters_site_builder_blocks_post_id );

if ( ! is_array( $uplifters_site_builder_blocks_categories ) ) {
	$uplifters_site_builder_blocks_categories = array();
}

$uplifters_site_builder_blocks_category_items = array();

foreach ( $uplifters_site_builder_blocks_categories as $uplifters_site_builder_blocks_category ) {
	if ( ! $uplifters_site_builder_blocks_category instanceof WP_Term ) {
		continue;
	}

	$uplifters_site_builder_blocks_category_name = trim(
		(string) $uplifters_site_builder_blocks_category->name
	);

	if ( '' === $uplifters_site_builder_blocks_category_name ) {
		continue;
	}

	$uplifters_site_builder_blocks_category_link = '';

	if ( $uplifters_site_builder_blocks_link_category ) {
		$uplifters_site_builder_blocks_term_link =
			get_category_link(
				$uplifters_site_builder_blocks_category->term_id
			);

		if ( ! is_wp_error( $uplifters_site_builder_blocks_term_link ) ) {
			$uplifters_site_builder_blocks_category_link = $uplifters_site_builder_blocks_term_link;
		}
	}

	$uplifters_site_builder_blocks_category_items[] = array(
		'name' => $uplifters_site_builder_blocks_category_name,
		'link' => $uplifters_site_builder_blocks_category_link,
	);
}

/*
 * Date metadata.
 */
$uplifters_site_builder_blocks_date_text =
	$uplifters_site_builder_blocks_metadata_format_date(
		$uplifters_site_builder_blocks_post_id,
		$uplifters_site_builder_blocks_date_format
	);

/*
 * Build metadata items for each responsive device.
 */
$uplifters_site_builder_blocks_device_items = array();

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_settings ) {
	$uplifters_site_builder_blocks_items = array();

	if (
		$uplifters_site_builder_blocks_settings['show_author'] &&
		'' !== $uplifters_site_builder_blocks_author_name
	) {
		$uplifters_site_builder_blocks_items[] = array(
			'type' => 'author',
			'text' => $uplifters_site_builder_blocks_author_name,
			'link' => $uplifters_site_builder_blocks_author_link,
		);
	}

	if (
		$uplifters_site_builder_blocks_settings['show_category'] &&
		! empty( $uplifters_site_builder_blocks_category_items )
	) {
		$uplifters_site_builder_blocks_items[] = array(
			'type'       => 'category',
			'categories' => $uplifters_site_builder_blocks_category_items,
		);
	}

	if (
		$uplifters_site_builder_blocks_settings['show_date'] &&
		'' !== $uplifters_site_builder_blocks_date_text
	) {
		$uplifters_site_builder_blocks_items[] = array(
			'type' => 'date',
			'text' => $uplifters_site_builder_blocks_date_text,
		);
	}

	$uplifters_site_builder_blocks_device_items[ $uplifters_site_builder_blocks_device ] = $uplifters_site_builder_blocks_items;
}

$uplifters_site_builder_blocks_instance_id =
	wp_unique_id(
		'uplifters-site-builder-blocks-posts-metadata-'
	);

$uplifters_site_builder_blocks_selector =
	'#' . $uplifters_site_builder_blocks_instance_id;

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'    => $uplifters_site_builder_blocks_instance_id,
			'class' => 'up2-metadata-block',
		)
	);
?>

<div
	<?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
	?>
>
	<?php ob_start(); ?>
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?>,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> * {
			box-sizing: border-box;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device {
			display: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-desktop {
			display: block;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-item {
			display: inline-flex;
			align-items: center;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-text-item {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			text-decoration: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-text-item svg {
			display: inline-block;
			flex-shrink: 0;
			width: 1em;
			height: 1em;
		}

		/*
		 * Desktop typography.
		 *
		 * !important prevents theme.json and theme frontend
		 * typography rules from overriding the block setting.
		 */
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-desktop .up2-metadata-content {
			justify-content: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['justify_content'] ); ?>;
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['color'] ); ?>;
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['font_family_css'] ); ?> !important;
			font-size: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['font_size'] ); ?>px;
			font-weight: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['font_weight'] ); ?>;
			text-align: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['text_align'] ); ?>;
			text-transform: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['text_transform'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-desktop .up2-metadata-separator {
			margin-right: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['meta_gap'] ); ?>px;
			margin-left: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['meta_gap'] ); ?>px;
		}

		/*
		 * Tablet typography.
		 */
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-tablet .up2-metadata-content {
			justify-content: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['justify_content'] ); ?>;
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['color'] ); ?>;
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['font_family_css'] ); ?> !important;
			font-size: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['font_size'] ); ?>px;
			font-weight: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['font_weight'] ); ?>;
			text-align: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['text_align'] ); ?>;
			text-transform: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['text_transform'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-tablet .up2-metadata-separator {
			margin-right: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['meta_gap'] ); ?>px;
			margin-left: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['meta_gap'] ); ?>px;
		}

		/*
		 * Mobile typography.
		 */
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-mobile .up2-metadata-content {
			justify-content: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['justify_content'] ); ?>;
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['color'] ); ?>;
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['font_family_css'] ); ?> !important;
			font-size: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['font_size'] ); ?>px;
			font-weight: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['font_weight'] ); ?>;
			text-align: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['text_align'] ); ?>;
			text-transform: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['text_transform'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-mobile .up2-metadata-separator {
			margin-right: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['meta_gap'] ); ?>px;
			margin-left: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['meta_gap'] ); ?>px;
		}

		/*
		 * Force every textual child to inherit the selected font.
		 *
		 * Some WordPress themes apply font-family directly to links,
		 * spans, post terms, or author links. The !important declaration
		 * ensures those rules cannot replace this block's selected font.
		 */
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content *,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content span,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content a {
			font-family: inherit !important;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content a,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content span {
			color: inherit;
			font-size: inherit;
			font-weight: inherit;
			text-transform: inherit;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-content a {
			text-decoration: none;
		}

		@media (max-width: 1024px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-mobile {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-tablet {
				display: block;
			}
		}

		@media (max-width: 767px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-tablet {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-metadata-device-mobile {
				display: block;
			}
		}
	<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

	<?php foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_settings ) : ?>
		<?php
		/*
		 * Inline font-family with !important provides an additional
		 * frontend fallback against aggressive theme styles.
		 */
		$uplifters_site_builder_blocks_content_inline_style = sprintf(
			'justify-content:%1$s;' .
			'color:%2$s;' .
			'font-family:%3$s !important;' .
			'font-size:%4$dpx;' .
			'font-weight:%5$s;' .
			'text-align:%6$s;' .
			'text-transform:%7$s;',
			$uplifters_site_builder_blocks_settings['justify_content'],
			$uplifters_site_builder_blocks_settings['color'],
			$uplifters_site_builder_blocks_settings['font_family_css'],
			(int) $uplifters_site_builder_blocks_settings['font_size'],
			$uplifters_site_builder_blocks_settings['font_weight'],
			$uplifters_site_builder_blocks_settings['text_align'],
			$uplifters_site_builder_blocks_settings['text_transform']
		);
		?>

		<div
			class="<?php echo esc_attr( 'up2-metadata-device up2-metadata-device-' . $uplifters_site_builder_blocks_device ); ?>"
		>
			<div class="up2-metadata-container">
				<div
					class="up2-metadata-content"
					style="<?php echo esc_attr( $uplifters_site_builder_blocks_content_inline_style ); ?>"
				>
					<?php
					$uplifters_site_builder_blocks_items =
						$uplifters_site_builder_blocks_device_items[ $uplifters_site_builder_blocks_device ];
					?>

					<?php foreach ( $uplifters_site_builder_blocks_items as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_item ) : ?>
						<span
							class="up2-metadata-item"
							style="font-family:inherit !important;"
						>
							<?php if ( $uplifters_site_builder_blocks_index > 0 ) : ?>
								<span
									class="up2-metadata-separator"
									aria-hidden="true"
									style="<?php echo esc_attr(
										sprintf(
											'margin-left:%1$dpx;' .
											'margin-right:%1$dpx;' .
											'font-family:inherit !important;',
											(int) $uplifters_site_builder_blocks_settings['meta_gap']
										)
									); ?>"
								>&bull;</span>
							<?php endif; ?>

							<?php if ( 'author' === $uplifters_site_builder_blocks_item['type'] ) : ?>
								<?php
								$uplifters_site_builder_blocks_author_icon =
									$uplifters_site_builder_blocks_metadata_get_icon(
										'author'
									);
								?>

								<?php if ( $uplifters_site_builder_blocks_link_author && ! empty( $uplifters_site_builder_blocks_item['link'] ) ) : ?>
									<a
										class="up2-metadata-text-item"
										href="<?php echo esc_url( $uplifters_site_builder_blocks_item['link'] ); ?>"
										style="font-family:inherit !important;color:inherit;font-size:inherit;font-weight:inherit;text-transform:inherit;text-decoration:none;"
									>
										<?php
										echo wp_kses( $uplifters_site_builder_blocks_author_icon, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
										?>

										<span
											style="font-family:inherit !important;"
										>
											<?php echo esc_html( $uplifters_site_builder_blocks_item['text'] ); ?>
										</span>
									</a>
								<?php else : ?>
									<span
										class="up2-metadata-text-item"
										style="font-family:inherit !important;color:inherit;font-size:inherit;font-weight:inherit;text-transform:inherit;"
									>
										<?php
										echo wp_kses( $uplifters_site_builder_blocks_author_icon, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
										?>

										<span
											style="font-family:inherit !important;"
										>
											<?php echo esc_html( $uplifters_site_builder_blocks_item['text'] ); ?>
										</span>
									</span>
								<?php endif; ?>

							<?php elseif ( 'category' === $uplifters_site_builder_blocks_item['type'] ) : ?>
								<?php
								$uplifters_site_builder_blocks_category_icon =
									$uplifters_site_builder_blocks_metadata_get_icon(
										'category'
									);
								?>

								<span
									class="up2-metadata-text-item"
									style="font-family:inherit !important;color:inherit;font-size:inherit;font-weight:inherit;text-transform:inherit;"
								>
									<?php
									echo wp_kses( $uplifters_site_builder_blocks_category_icon, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
									?>

									<span
										style="font-family:inherit !important;"
									>
										<?php
										$uplifters_site_builder_blocks_category_count =
											count(
												$uplifters_site_builder_blocks_item['categories']
											);
										?>

										<?php foreach ( $uplifters_site_builder_blocks_item['categories'] as $uplifters_site_builder_blocks_category_index => $uplifters_site_builder_blocks_category ) : ?>
											<?php if ( $uplifters_site_builder_blocks_link_category && ! empty( $uplifters_site_builder_blocks_category['link'] ) ) : ?>
												<a
													href="<?php echo esc_url( $uplifters_site_builder_blocks_category['link'] ); ?>"
													style="font-family:inherit !important;color:inherit;font-size:inherit;font-weight:inherit;text-transform:inherit;text-decoration:none;"
												>
													<?php echo esc_html( $uplifters_site_builder_blocks_category['name'] ); ?>
												</a>
											<?php else : ?>
												<span
													style="font-family:inherit !important;"
												>
													<?php echo esc_html( $uplifters_site_builder_blocks_category['name'] ); ?>
												</span>
											<?php endif; ?>

											<?php if ( $uplifters_site_builder_blocks_category_index < $uplifters_site_builder_blocks_category_count - 1 ) : ?>
												<?php echo esc_html( ', ' ); ?>
											<?php endif; ?>
										<?php endforeach; ?>
									</span>
								</span>

							<?php elseif ( 'date' === $uplifters_site_builder_blocks_item['type'] ) : ?>
								<?php
								$uplifters_site_builder_blocks_date_icon =
									$uplifters_site_builder_blocks_metadata_get_icon(
										'date'
									);
								?>

								<span
									class="up2-metadata-text-item"
									style="font-family:inherit !important;color:inherit;font-size:inherit;font-weight:inherit;text-transform:inherit;"
								>
									<?php
									echo wp_kses( $uplifters_site_builder_blocks_date_icon, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
									?>

									<span
										style="font-family:inherit !important;"
									>
										<?php echo esc_html( $uplifters_site_builder_blocks_item['text'] ); ?>
									</span>
								</span>
							<?php endif; ?>
						</span>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	<?php endforeach; ?>
</div>
