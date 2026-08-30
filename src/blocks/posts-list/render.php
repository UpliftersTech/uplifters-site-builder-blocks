<?php
/**
 * Server-side render callback for the PostsList block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return a responsive attribute value.
 *
 * Supports both the new responsive object format and old scalar values.
 *
 * @param array  $attributes     Block attributes.
 * @param string $attribute_name Attribute name.
 * @param string $device         desktop, tablet or mobile.
 * @param mixed  $fallback       Fallback value.
 *
 * @return mixed
 */
$uplifters_site_builder_blocks_posts_responsive_value = static function (
	array $attributes,
	string $attribute_name,
	string $device,
	$fallback = ''
) {
	if ( ! array_key_exists( $attribute_name, $attributes ) ) {
		return $fallback;
	}

	$value = $attributes[ $attribute_name ];

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
 * Return a valid layout name.
 *
 * @param mixed  $value    Layout value.
 * @param string $fallback Fallback layout.
 *
 * @return string
 */
$uplifters_site_builder_blocks_posts_layout = static function ( $value, string $fallback = 'classic-list' ): string {
	$allowed_layouts = array(
		'classic-list',
		'grid-cards',
		'compact-list',
		'minimal-feed',
	);

	$layout = is_string( $value )
		? sanitize_key( $value )
		: '';

	return in_array( $layout, $allowed_layouts, true )
		? $layout
		: $fallback;
};

/**
 * Return a valid hexadecimal color.
 *
 * @param mixed  $value    Color value.
 * @param string $fallback Fallback color.
 *
 * @return string
 */
$uplifters_site_builder_blocks_posts_color = static function ( $value, string $fallback ): string {
	$color = is_string( $value ) ? trim( $value ) : '';
	$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
		|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color )
		|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $color );

	return $is_valid ? $color : $fallback;
};

/**
 * Return a bounded integer.
 *
 * @param mixed $value    Number.
 * @param int   $fallback Fallback.
 * @param int   $minimum  Minimum.
 * @param int   $maximum  Maximum.
 *
 * @return int
 */
$uplifters_site_builder_blocks_posts_number = static function (
	$value,
	int $fallback,
	int $minimum,
	int $maximum
): int {
	if ( ! is_numeric( $value ) ) {
		return $fallback;
	}

	$value = absint( $value );

	return max( $minimum, min( $maximum, $value ) );
};

/**
 * Convert a value to boolean.
 *
 * @param mixed $value    Value.
 * @param bool  $fallback Fallback.
 *
 * @return bool
 */
$uplifters_site_builder_blocks_posts_boolean = static function ( $value, bool $fallback = true ): bool {
	if ( null === $value ) {
		return $fallback;
	}

	return (bool) $value;
};

/**
 * Shorten text by character count.
 *
 * @param string $text      Text.
 * @param int    $max_chars Maximum character count.
 *
 * @return string
 */
$uplifters_site_builder_blocks_posts_trim_chars = static function ( string $text, int $max_chars ): string {
	$text = trim( wp_strip_all_tags( $text ) );

	if ( '' === $text ) {
		return '';
	}

	$max_chars = max( 1, $max_chars );

	if (
		function_exists( 'mb_strlen' ) &&
		function_exists( 'mb_substr' )
	) {
		if ( mb_strlen( $text, 'UTF-8' ) <= $max_chars ) {
			return $text;
		}

		return rtrim(
			mb_substr(
				$text,
				0,
				$max_chars,
				'UTF-8'
			)
		) . '…';
	}

	if ( strlen( $text ) <= $max_chars ) {
		return $text;
	}

	return rtrim( substr( $text, 0, $max_chars ) ) . '…';
};

/**
 * Create CSS for one responsive device.
 *
 * @param string $selector      Unique block selector.
 * @param string $layout        Layout type.
 * @param int    $columns       Grid columns.
 * @param string $title_color   Title color.
 * @param bool   $show_image    Image visibility.
 * @param bool   $show_date     Date visibility.
 * @param bool   $show_excerpt  Excerpt visibility.
 * @param bool   $show_readmore Read-more visibility.
 * @param int    $date_size     Date font size.
 * @param string $button_color  Button background.
 * @param int    $button_size   Button font size.
 *
 * @return string
 */
$uplifters_site_builder_blocks_posts_device_css = static function (
	string $selector,
	string $layout,
	int $columns,
	string $title_color,
	bool $show_image,
	bool $show_date,
	bool $show_excerpt,
	bool $show_readmore,
	int $date_size,
	string $button_color,
	int $button_size,
	string $title_font_family
): string {
	$is_grid    = 'grid-cards' === $layout;
	$is_compact = 'compact-list' === $layout;
	$is_minimal = 'minimal-feed' === $layout;

	$list_display = $is_grid ? 'grid' : 'flex';

	$list_columns = $is_grid
		? sprintf(
			'repeat(%d,minmax(0,1fr))',
			max( 1, $columns )
		)
		: 'none';

	$list_direction = $is_grid ? 'initial' : 'column';

	$list_gap = $is_grid
		? '24px'
		: (
			$is_compact
				? '14px'
				: ( $is_minimal ? '0' : '24px' )
		);

	$card_radius = $is_minimal ? '0' : '16px';

	$card_border = $is_minimal
		? '1px solid #e5e7eb'
		: '0';

	$card_shadow = $is_minimal
		? 'none'
		: '0 10px 15px -3px rgba(0,0,0,0.10),0 4px 6px -4px rgba(0,0,0,0.10)';

	$inner_padding = $is_minimal
		? '14px 0'
		: ( $is_compact ? '12px' : '16px' );

	$inner_direction = ( $is_grid || $is_minimal )
		? 'column'
		: 'row';

	$inner_gap = $is_compact ? '12px' : '16px';

	$image_width = $is_grid
		? '100%'
		: ( $is_compact ? '120px' : '176px' );

	$image_height = $is_grid
		? '190px'
		: ( $is_compact ? '96px' : '144px' );

	$image_radius = $is_compact ? '10px' : '12px';

	$title_size = $is_compact
		? '16px'
		: ( $is_minimal ? '17px' : '18px' );

	$excerpt_margin = $is_compact ? '6px' : '10px';
	$excerpt_size   = $is_compact ? '13px' : '14px';
	$button_margin  = $is_compact ? '8px' : '12px';
	$button_padding = $is_compact ? '6px 12px' : '8px 16px';

	$css  = '';
	$css .= $selector . ' .e2pu-posts{';
	$css .= 'display:' . $list_display . ';';
	$css .= 'grid-template-columns:' . $list_columns . ';';
	$css .= 'flex-direction:' . $list_direction . ';';
	$css .= 'gap:' . $list_gap . ';';
	$css .= 'width:100%;';
	$css .= '}';

	$css .= $selector . ' .e2pu-post-card{';
	$css .= 'background:#fff;';
	$css .= 'border-radius:' . $card_radius . ';';
	$css .= 'overflow:hidden;';
	$css .= 'border-bottom:' . $card_border . ';';
	$css .= 'box-shadow:' . $card_shadow . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-card-inner{';
	$css .= 'display:flex;';
	$css .= 'flex-direction:' . $inner_direction . ';';
	$css .= 'gap:' . $inner_gap . ';';
	$css .= 'align-items:stretch;';
	$css .= 'padding:' . $inner_padding . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-card-left{';
	$css .= 'display:' . ( $show_image ? 'block' : 'none' ) . ';';
	$css .= 'width:' . $image_width . ';';
	$css .= 'flex-shrink:0;';
	$css .= '}';

	$css .= $selector . ' .e2pu-image-box{';
	$css .= 'height:' . $image_height . ';';
	$css .= 'border-radius:' . $image_radius . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-post-title,';
	$css .= $selector . ' .e2pu-post-title a{';
	$css .= 'color:' . $title_color . ';';
	$css .= 'font-size:' . $title_size . ';';
	$css .= 'font-family:' . $title_font_family . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-post-date{';
	$css .= 'display:' . ( $show_date ? 'block' : 'none' ) . ';';
	$css .= 'font-size:' . $date_size . 'px;';
	$css .= '}';

	$css .= $selector . ' .e2pu-post-excerpt{';
	$css .= 'display:' . ( $show_excerpt ? 'block' : 'none' ) . ';';
	$css .= 'margin-top:' . $excerpt_margin . ';';
	$css .= 'font-size:' . $excerpt_size . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-read-more-line{';
	$css .= 'display:' . ( $show_readmore ? 'block' : 'none' ) . ';';
	$css .= 'margin-top:' . $button_margin . ';';
	$css .= '}';

	$css .= $selector . ' .e2pu-read-more{';
	$css .= 'background-color:' . $button_color . ';';
	$css .= 'font-size:' . $button_size . 'px;';
	$css .= 'padding:' . $button_padding . ';';
	$css .= '}';

	return $css;
};

/*
 * Global attributes.
 */
$uplifters_site_builder_blocks_per_page = isset( $attributes['perPage'] )
	? absint( $attributes['perPage'] )
	: 6;

$uplifters_site_builder_blocks_per_page = max( 1, min( 20, $uplifters_site_builder_blocks_per_page ) );

$uplifters_site_builder_blocks_link_title = ! empty( $attributes['linkTitle'] );

/*
 * Desktop responsive values.
 */
$uplifters_site_builder_blocks_desktop_layout = $uplifters_site_builder_blocks_posts_layout(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'layoutType',
		'desktop',
		'classic-list'
	)
);

$uplifters_site_builder_blocks_desktop_columns = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'columns',
		'desktop',
		3
	),
	3,
	1,
	4
);

$uplifters_site_builder_blocks_desktop_title_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleColor',
		'desktop',
		'#111827'
	),
	'#111827'
);

$uplifters_site_builder_blocks_desktop_show_image = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showImage',
		'desktop',
		true
	)
);

$uplifters_site_builder_blocks_desktop_show_date = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showDate',
		'desktop',
		true
	)
);

$uplifters_site_builder_blocks_desktop_show_excerpt = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showExcerpt',
		'desktop',
		true
	)
);

$uplifters_site_builder_blocks_desktop_show_read_more = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showReadMore',
		'desktop',
		true
	)
);

$uplifters_site_builder_blocks_desktop_date_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'dateFontSize',
		'desktop',
		14
	),
	14,
	10,
	22
);

$uplifters_site_builder_blocks_desktop_excerpt_chars = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'excerptMaxChars',
		'desktop',
		40
	),
	40,
	10,
	200
);

$uplifters_site_builder_blocks_desktop_button_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreBgColor',
		'desktop',
		'#111827'
	),
	'#111827'
);

$uplifters_site_builder_blocks_desktop_button_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreFontSize',
		'desktop',
		14
	),
	14,
	10,
	22
);

$uplifters_site_builder_blocks_desktop_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleFontFamily',
		'desktop',
		'inherit'
	)
) ?: 'inherit';

/*
 * Tablet responsive values.
 */
$uplifters_site_builder_blocks_tablet_layout = $uplifters_site_builder_blocks_posts_layout(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'layoutType',
		'tablet',
		$uplifters_site_builder_blocks_desktop_layout
	),
	$uplifters_site_builder_blocks_desktop_layout
);

$uplifters_site_builder_blocks_tablet_columns = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'columns',
		'tablet',
		$uplifters_site_builder_blocks_desktop_columns
	),
	$uplifters_site_builder_blocks_desktop_columns,
	1,
	4
);

$uplifters_site_builder_blocks_tablet_title_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_title_color
	),
	$uplifters_site_builder_blocks_desktop_title_color
);

$uplifters_site_builder_blocks_tablet_show_image = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showImage',
		'tablet',
		$uplifters_site_builder_blocks_desktop_show_image
	),
	$uplifters_site_builder_blocks_desktop_show_image
);

$uplifters_site_builder_blocks_tablet_show_date = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showDate',
		'tablet',
		$uplifters_site_builder_blocks_desktop_show_date
	),
	$uplifters_site_builder_blocks_desktop_show_date
);

$uplifters_site_builder_blocks_tablet_show_excerpt = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showExcerpt',
		'tablet',
		$uplifters_site_builder_blocks_desktop_show_excerpt
	),
	$uplifters_site_builder_blocks_desktop_show_excerpt
);

$uplifters_site_builder_blocks_tablet_show_read_more = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showReadMore',
		'tablet',
		$uplifters_site_builder_blocks_desktop_show_read_more
	),
	$uplifters_site_builder_blocks_desktop_show_read_more
);

$uplifters_site_builder_blocks_tablet_date_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'dateFontSize',
		'tablet',
		$uplifters_site_builder_blocks_desktop_date_size
	),
	$uplifters_site_builder_blocks_desktop_date_size,
	10,
	22
);

$uplifters_site_builder_blocks_tablet_excerpt_chars = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'excerptMaxChars',
		'tablet',
		$uplifters_site_builder_blocks_desktop_excerpt_chars
	),
	$uplifters_site_builder_blocks_desktop_excerpt_chars,
	10,
	200
);

$uplifters_site_builder_blocks_tablet_button_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreBgColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_button_color
	),
	$uplifters_site_builder_blocks_desktop_button_color
);

$uplifters_site_builder_blocks_tablet_button_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreFontSize',
		'tablet',
		$uplifters_site_builder_blocks_desktop_button_size
	),
	$uplifters_site_builder_blocks_desktop_button_size,
	10,
	22
);

$uplifters_site_builder_blocks_tablet_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleFontFamily',
		'tablet',
		'inherit'
	)
) ?: 'inherit';

/*
 * Mobile responsive values.
 */
$uplifters_site_builder_blocks_mobile_layout = $uplifters_site_builder_blocks_posts_layout(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'layoutType',
		'mobile',
		$uplifters_site_builder_blocks_tablet_layout
	),
	$uplifters_site_builder_blocks_tablet_layout
);

$uplifters_site_builder_blocks_mobile_columns = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'columns',
		'mobile',
		$uplifters_site_builder_blocks_tablet_columns
	),
	$uplifters_site_builder_blocks_tablet_columns,
	1,
	4
);

$uplifters_site_builder_blocks_mobile_title_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_title_color
	),
	$uplifters_site_builder_blocks_tablet_title_color
);

$uplifters_site_builder_blocks_mobile_show_image = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showImage',
		'mobile',
		$uplifters_site_builder_blocks_tablet_show_image
	),
	$uplifters_site_builder_blocks_tablet_show_image
);

$uplifters_site_builder_blocks_mobile_show_date = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showDate',
		'mobile',
		$uplifters_site_builder_blocks_tablet_show_date
	),
	$uplifters_site_builder_blocks_tablet_show_date
);

$uplifters_site_builder_blocks_mobile_show_excerpt = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showExcerpt',
		'mobile',
		$uplifters_site_builder_blocks_tablet_show_excerpt
	),
	$uplifters_site_builder_blocks_tablet_show_excerpt
);

$uplifters_site_builder_blocks_mobile_show_read_more = $uplifters_site_builder_blocks_posts_boolean(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'showReadMore',
		'mobile',
		$uplifters_site_builder_blocks_tablet_show_read_more
	),
	$uplifters_site_builder_blocks_tablet_show_read_more
);

$uplifters_site_builder_blocks_mobile_date_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'dateFontSize',
		'mobile',
		$uplifters_site_builder_blocks_tablet_date_size
	),
	$uplifters_site_builder_blocks_tablet_date_size,
	10,
	22
);

$uplifters_site_builder_blocks_mobile_excerpt_chars = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'excerptMaxChars',
		'mobile',
		$uplifters_site_builder_blocks_tablet_excerpt_chars
	),
	$uplifters_site_builder_blocks_tablet_excerpt_chars,
	10,
	200
);

$uplifters_site_builder_blocks_mobile_button_color = $uplifters_site_builder_blocks_posts_color(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreBgColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_button_color
	),
	$uplifters_site_builder_blocks_tablet_button_color
);

$uplifters_site_builder_blocks_mobile_button_size = $uplifters_site_builder_blocks_posts_number(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'readMoreFontSize',
		'mobile',
		$uplifters_site_builder_blocks_tablet_button_size
	),
	$uplifters_site_builder_blocks_tablet_button_size,
	10,
	22
);

$uplifters_site_builder_blocks_mobile_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
	$uplifters_site_builder_blocks_posts_responsive_value(
		$attributes,
		'titleFontFamily',
		'mobile',
		'inherit'
	)
) ?: 'inherit';

/*
 * Query posts.
 */
$uplifters_site_builder_blocks_posts_query = new WP_Query(
	array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'posts_per_page'      => $uplifters_site_builder_blocks_per_page,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	)
);

$uplifters_site_builder_blocks_instance_id = wp_unique_id( 'uplifters-site-builder-blocks-posts-list-' );
$uplifters_site_builder_blocks_selector    = '#' . $uplifters_site_builder_blocks_instance_id;

$uplifters_site_builder_blocks_css  = $uplifters_site_builder_blocks_posts_device_css(
	$uplifters_site_builder_blocks_selector,
	$uplifters_site_builder_blocks_desktop_layout,
	$uplifters_site_builder_blocks_desktop_columns,
	$uplifters_site_builder_blocks_desktop_title_color,
	$uplifters_site_builder_blocks_desktop_show_image,
	$uplifters_site_builder_blocks_desktop_show_date,
	$uplifters_site_builder_blocks_desktop_show_excerpt,
	$uplifters_site_builder_blocks_desktop_show_read_more,
	$uplifters_site_builder_blocks_desktop_date_size,
	$uplifters_site_builder_blocks_desktop_button_color,
	$uplifters_site_builder_blocks_desktop_button_size,
	$uplifters_site_builder_blocks_desktop_title_font_family
);

$uplifters_site_builder_blocks_css .= '@media(max-width:1024px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_posts_device_css(
	$uplifters_site_builder_blocks_selector,
	$uplifters_site_builder_blocks_tablet_layout,
	$uplifters_site_builder_blocks_tablet_columns,
	$uplifters_site_builder_blocks_tablet_title_color,
	$uplifters_site_builder_blocks_tablet_show_image,
	$uplifters_site_builder_blocks_tablet_show_date,
	$uplifters_site_builder_blocks_tablet_show_excerpt,
	$uplifters_site_builder_blocks_tablet_show_read_more,
	$uplifters_site_builder_blocks_tablet_date_size,
	$uplifters_site_builder_blocks_tablet_button_color,
	$uplifters_site_builder_blocks_tablet_button_size,
	$uplifters_site_builder_blocks_tablet_title_font_family
);
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '@media(max-width:767px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_posts_device_css(
	$uplifters_site_builder_blocks_selector,
	$uplifters_site_builder_blocks_mobile_layout,
	$uplifters_site_builder_blocks_mobile_columns,
	$uplifters_site_builder_blocks_mobile_title_color,
	$uplifters_site_builder_blocks_mobile_show_image,
	$uplifters_site_builder_blocks_mobile_show_date,
	$uplifters_site_builder_blocks_mobile_show_excerpt,
	$uplifters_site_builder_blocks_mobile_show_read_more,
	$uplifters_site_builder_blocks_mobile_date_size,
	$uplifters_site_builder_blocks_mobile_button_color,
	$uplifters_site_builder_blocks_mobile_button_size,
	$uplifters_site_builder_blocks_mobile_title_font_family
);
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_instance_id,
		'class' => 'e2pu-post-custom-block',
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
		<?php
		echo wp_kses( wp_strip_all_tags( $uplifters_site_builder_blocks_css ), array() );
		?>

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?>,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> * {
			box-sizing: border-box;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-posts {
			margin: 0;
			padding: 0;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-image-box {
			overflow: hidden;
			background: #f3f4f6;
			box-shadow:
				0 10px 15px -3px rgba(0, 0, 0, 0.12),
				0 4px 6px -4px rgba(0, 0, 0, 0.12);
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-image-box img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-image-placeholder {
			width: 100%;
			height: 100%;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-card-content {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-post-title {
			margin: 0;
			font-weight: 700;
			line-height: 1.3;
			word-break: break-word;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-post-title a {
			text-decoration: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-post-date {
			margin-top: 6px;
			color: #6b7280;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-post-excerpt {
			margin-bottom: 0;
			color: #4b5563;
			line-height: 1.6;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-read-more {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border-radius: 10px;
			color: #ffffff;
			font-weight: 600;
			text-decoration: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-no-posts {
			padding: 40px 0;
			color: #6b7280;
			text-align: center;
		}

		@media (prefers-reduced-motion: reduce) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> *,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> *::before,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> *::after {
				scroll-behavior: auto !important;
				transition-duration: 0.01ms !important;
				animation-duration: 0.01ms !important;
				animation-iteration-count: 1 !important;
			}
		}
	<?php $uplifters_site_builder_blocks_dynamic_style_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css ); ?>

	<div class="e2pu-posts">
		<?php if ( $uplifters_site_builder_blocks_posts_query->have_posts() ) : ?>
			<?php
			while ( $uplifters_site_builder_blocks_posts_query->have_posts() ) :
				$uplifters_site_builder_blocks_posts_query->the_post();

				$uplifters_site_builder_blocks_post_id   = get_the_ID();
				$uplifters_site_builder_blocks_title     = get_the_title( $uplifters_site_builder_blocks_post_id );
				$uplifters_site_builder_blocks_permalink = get_permalink( $uplifters_site_builder_blocks_post_id );
				$uplifters_site_builder_blocks_date      = get_the_date( '', $uplifters_site_builder_blocks_post_id );

				$uplifters_site_builder_blocks_raw_excerpt = get_the_excerpt( $uplifters_site_builder_blocks_post_id );

				$uplifters_site_builder_blocks_desktop_excerpt = $uplifters_site_builder_blocks_posts_trim_chars(
					$uplifters_site_builder_blocks_raw_excerpt,
					$uplifters_site_builder_blocks_desktop_excerpt_chars
				);

				$uplifters_site_builder_blocks_tablet_excerpt = $uplifters_site_builder_blocks_posts_trim_chars(
					$uplifters_site_builder_blocks_raw_excerpt,
					$uplifters_site_builder_blocks_tablet_excerpt_chars
				);

				$uplifters_site_builder_blocks_mobile_excerpt = $uplifters_site_builder_blocks_posts_trim_chars(
					$uplifters_site_builder_blocks_raw_excerpt,
					$uplifters_site_builder_blocks_mobile_excerpt_chars
				);

				$uplifters_site_builder_blocks_thumbnail_id  = get_post_thumbnail_id( $uplifters_site_builder_blocks_post_id );
				$uplifters_site_builder_blocks_thumbnail_alt = '';

				if ( $uplifters_site_builder_blocks_thumbnail_id ) {
					$uplifters_site_builder_blocks_thumbnail_alt = trim(
						(string) get_post_meta(
							$uplifters_site_builder_blocks_thumbnail_id,
							'_wp_attachment_image_alt',
							true
						)
					);
				}

				if ( '' === $uplifters_site_builder_blocks_thumbnail_alt ) {
					$uplifters_site_builder_blocks_thumbnail_alt = $uplifters_site_builder_blocks_title;
				}
				?>
				<article class="e2pu-post-card">
					<div class="e2pu-card-inner">
						<div class="e2pu-card-left">
							<div class="e2pu-image-box">
								<?php if ( has_post_thumbnail( $uplifters_site_builder_blocks_post_id ) ) : ?>
									<?php
									echo get_the_post_thumbnail(
										$uplifters_site_builder_blocks_post_id,
										'large',
										array(
											'alt'     => $uplifters_site_builder_blocks_thumbnail_alt,
											'loading' => 'lazy',
										)
									);
									?>
								<?php else : ?>
									<div
										class="e2pu-image-placeholder"
										aria-hidden="true"
									></div>
								<?php endif; ?>
							</div>
						</div>

						<div class="e2pu-card-content">
							<h3 class="e2pu-post-title">
								<?php if ( $uplifters_site_builder_blocks_link_title ) : ?>
									<a
										href="<?php echo esc_url( $uplifters_site_builder_blocks_permalink ); ?>"
										target="_blank"
										rel="noopener noreferrer"
									>
										<?php echo esc_html( $uplifters_site_builder_blocks_title ); ?>
									</a>
								<?php else : ?>
									<?php echo esc_html( $uplifters_site_builder_blocks_title ); ?>
								<?php endif; ?>
							</h3>

							<?php if ( $uplifters_site_builder_blocks_date ) : ?>
								<div class="e2pu-post-date">
									<?php echo esc_html( $uplifters_site_builder_blocks_date ); ?>
								</div>
							<?php endif; ?>

							<?php if ( '' !== $uplifters_site_builder_blocks_raw_excerpt ) : ?>
								<div class="e2pu-post-excerpt">
									<span class="e2pu-excerpt-desktop">
										<?php echo esc_html( $uplifters_site_builder_blocks_desktop_excerpt ); ?>
									</span>

									<span class="e2pu-excerpt-tablet">
										<?php echo esc_html( $uplifters_site_builder_blocks_tablet_excerpt ); ?>
									</span>

									<span class="e2pu-excerpt-mobile">
										<?php echo esc_html( $uplifters_site_builder_blocks_mobile_excerpt ); ?>
									</span>
								</div>
							<?php endif; ?>

							<div class="e2pu-read-more-line">
								<a
									class="e2pu-read-more"
									href="<?php echo esc_url( $uplifters_site_builder_blocks_permalink ); ?>"
								>
									<?php
									echo esc_html__(
										'Read More',
										'uplifters-site-builder-blocks'
									);
									?>
								</a>
							</div>
						</div>
					</div>
				</article>
			<?php endwhile; ?>

			<?php wp_reset_postdata(); ?>
		<?php else : ?>
			<p class="e2pu-no-posts">
				<?php
				echo esc_html__(
					'No posts found.',
					'uplifters-site-builder-blocks'
				);
				?>
			</p>
		<?php endif; ?>
	</div>

	<?php ob_start(); ?>
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-tablet,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-mobile {
			display: none;
		}

		@media (max-width: 1024px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-mobile {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-tablet {
				display: inline;
			}
		}

		@media (max-width: 767px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-tablet {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .e2pu-excerpt-mobile {
				display: inline;
			}
		}
	<?php $uplifters_site_builder_blocks_dynamic_style_css_excerpt = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css_excerpt ); ?>
</div>
