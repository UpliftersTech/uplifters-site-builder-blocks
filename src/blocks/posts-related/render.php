<?php
/**
 * Server-side renderer for the PostsRelated block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Current block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clamp an integer.
 *
 * @param mixed $value    Input value.
 * @param int   $minimum  Minimum value.
 * @param int   $maximum  Maximum value.
 * @param int   $fallback Fallback value.
 *
 * @return int
 */
$uplifters_site_builder_blocks_related_clamp_int = static function (
	$value,
	int $minimum,
	int $maximum,
	int $fallback
): int {
	if ( ! is_numeric( $value ) ) {
		return $fallback;
	}

	return min(
		$maximum,
		max( $minimum, (int) $value )
	);
};

/**
 * Read a responsive attribute.
 *
 * Old scalar values remain supported.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute name.
 * @param string $device     Device branch.
 * @param mixed  $fallback   Fallback.
 *
 * @return mixed
 */
$uplifters_site_builder_blocks_related_responsive_value = static function (
	array $attributes,
	string $key,
	string $device,
	$fallback = ''
) {
	if ( ! array_key_exists( $key, $attributes ) ) {
		return $fallback;
	}

	$value = $attributes[ $key ];

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
 * Sanitize a hexadecimal color.
 *
 * @param mixed  $value    Color value.
 * @param string $fallback Fallback.
 *
 * @return string
 */
$uplifters_site_builder_blocks_related_color = static function (
	$value,
	string $fallback
): string {
	$color = is_string( $value ) ? trim( $value ) : '';
	$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
		|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color )
		|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $color );

	return $is_valid ? $color : $fallback;
};

/**
 * Trim plain text by word count.
 *
 * @param string $text  Text.
 * @param int    $words Maximum words.
 *
 * @return string
 */
$uplifters_site_builder_blocks_related_trim_words = static function (
	string $text,
	int $words
): string {
	$text = trim(
		(string) preg_replace(
			'/\s+/u',
			' ',
			wp_strip_all_tags( $text )
		)
	);

	if ( '' === $text ) {
		return '';
	}

	$words = max( 1, $words );

	$parts = preg_split(
		'/\s+/u',
		$text,
		-1,
		PREG_SPLIT_NO_EMPTY
	);

	if (
		! is_array( $parts ) ||
		count( $parts ) <= $words
	) {
		return $text;
	}

	return implode(
		' ',
		array_slice( $parts, 0, $words )
	) . '…';
};

/**
 * Build responsive CSS for one device.
 *
 * @param string $selector Unique selector.
 * @param array  $settings Device settings.
 *
 * @return string
 */
$uplifters_site_builder_blocks_related_device_css = static function (
	string $selector,
	array $settings
): string {
	$css  = '';

	$css .= $selector . ' .up2-rp-grid{';
	$css .= 'display:grid;';
	$css .= 'grid-template-columns:repeat(' .
		$settings['columns'] .
		',minmax(0,1fr));';
	$css .= 'gap:' . $settings['gap'] . 'px;';
	$css .= 'width:100%;';
	$css .= '}';

	$css .= $selector . ' .up2-rp-card{';
	$css .= 'background:' .
		$settings['card_background'] . ';';
	$css .= 'border:1px solid ' .
		$settings['card_border'] . ';';
	$css .= '}';

	$css .= $selector . ' .up2-rp-image-wrapper{';
	$css .= 'display:' .
		( $settings['show_featured_image']
			? 'block'
			: 'none' ) .
		';';
	$css .= 'height:' .
		$settings['image_height'] .
		'px;';
	$css .= '}';

	$css .= $selector . ' .up2-rp-title{';
	$css .= 'color:' .
		$settings['title_color'] . ' !important;';
	$css .= '-webkit-text-fill-color:' .
		$settings['title_color'] . ' !important;';
	$css .= 'font-family:' .
		$settings['title_font_family'] . ';';
	$css .= '}';

	$css .= $selector . ' .up2-rp-meta{';
	$css .= 'display:' .
		( $settings['show_meta']
			? 'flex'
			: 'none' ) .
		';';
	$css .= 'color:' .
		$settings['meta_color'] . ';';
	$css .= '}';

	$css .= $selector . ' .up2-rp-date{';
	$css .= 'display:' .
		(
			$settings['show_meta'] &&
			$settings['show_date']
				? 'inline'
				: 'none'
		) .
		';';
	$css .= '}';

	$css .= $selector . ' .up2-rp-author{';
	$css .= 'display:' .
		(
			$settings['show_meta'] &&
			$settings['show_author']
				? 'inline'
				: 'none'
		) .
		';';
	$css .= '}';

	$css .= $selector . ' .up2-rp-excerpt{';
	$css .= 'display:' .
		( $settings['show_excerpt']
			? 'block'
			: 'none' ) .
		';';
	$css .= 'color:' .
		$settings['excerpt_color'] . ' !important;';
	$css .= '-webkit-text-fill-color:' .
		$settings['excerpt_color'] . ' !important;';
	$css .= '}';

	$css .= $selector . ' .up2-rp-empty{';
	$css .= 'color:' .
		$settings['meta_color'] . ';';
	$css .= '}';

	return $css;
};

/*
 * Non-responsive query settings.
 */
$uplifters_site_builder_blocks_per_page = $uplifters_site_builder_blocks_related_clamp_int(
	$attributes['perPage'] ?? 6,
	1,
	24,
	6
);

$uplifters_site_builder_blocks_order = (
	isset( $attributes['order'] ) &&
	'asc' === strtolower(
		(string) $attributes['order']
	)
)
	? 'ASC'
	: 'DESC';

$uplifters_site_builder_blocks_allowed_order_by = array(
	'date',
	'modified',
	'title',
	'menu_order',
	'rand',
);

$uplifters_site_builder_blocks_order_by = isset( $attributes['orderBy'] )
	? sanitize_key( $attributes['orderBy'] )
	: 'date';

if (
	! in_array(
		$uplifters_site_builder_blocks_order_by,
		$uplifters_site_builder_blocks_allowed_order_by,
		true
	)
) {
	$uplifters_site_builder_blocks_order_by = 'date';
}

$uplifters_site_builder_blocks_relate_by = isset( $attributes['relateBy'] )
	? sanitize_key( $attributes['relateBy'] )
	: 'categories';

if (
	! in_array(
		$uplifters_site_builder_blocks_relate_by,
		array(
			'categories',
			'tags',
			'both',
		),
		true
	)
) {
	$uplifters_site_builder_blocks_relate_by = 'categories';
}

$uplifters_site_builder_blocks_fallback_to_recent =
	! array_key_exists(
		'fallbackToRecent',
		$attributes
	) ||
	(bool) $attributes['fallbackToRecent'];

$uplifters_site_builder_blocks_empty_text = isset( $attributes['emptyText'] )
	? sanitize_text_field(
		$attributes['emptyText']
	)
	: __(
		'No related posts found.',
		'uplifters-site-builder-blocks'
	);

/*
 * Responsive settings.
 */
$uplifters_site_builder_blocks_device_defaults = array(
	'desktop' => array(
		'columns'             => 3,
		'gap'                 => 16,
		'show_featured_image' => true,
		'image_height'        => 180,
		'show_excerpt'        => true,
		'excerpt_length'      => 20,
		'show_meta'           => true,
		'show_date'           => true,
		'show_author'         => true,
		'title_color'         => '#111827',
		'meta_color'          => '#6b7280',
		'excerpt_color'       => '#374151',
		'card_background'     => '#ffffff',
		'card_border'         => '#e5e7eb',
	),
	'tablet' => array(
		'columns'             => 2,
		'gap'                 => 14,
		'show_featured_image' => true,
		'image_height'        => 170,
		'show_excerpt'        => true,
		'excerpt_length'      => 18,
		'show_meta'           => true,
		'show_date'           => true,
		'show_author'         => true,
		'title_color'         => '#111827',
		'meta_color'          => '#6b7280',
		'excerpt_color'       => '#374151',
		'card_background'     => '#ffffff',
		'card_border'         => '#e5e7eb',
	),
	'mobile' => array(
		'columns'             => 1,
		'gap'                 => 12,
		'show_featured_image' => true,
		'image_height'        => 200,
		'show_excerpt'        => true,
		'excerpt_length'      => 15,
		'show_meta'           => true,
		'show_date'           => true,
		'show_author'         => true,
		'title_color'         => '#111827',
		'meta_color'          => '#6b7280',
		'excerpt_color'       => '#374151',
		'card_background'     => '#ffffff',
		'card_border'         => '#e5e7eb',
	),
);

$uplifters_site_builder_blocks_devices = array();

foreach (
	$uplifters_site_builder_blocks_device_defaults as
	$uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_defaults
) {
	$uplifters_site_builder_blocks_devices[ $uplifters_site_builder_blocks_device ] = array(
		'columns' => $uplifters_site_builder_blocks_related_clamp_int(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'columns',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['columns']
			),
			1,
			4,
			$uplifters_site_builder_blocks_defaults['columns']
		),
		'gap' => $uplifters_site_builder_blocks_related_clamp_int(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'gap',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['gap']
			),
			8,
			28,
			$uplifters_site_builder_blocks_defaults['gap']
		),
		'show_featured_image' => (bool)
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'showFeaturedImage',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults[
					'show_featured_image'
				]
			),
		'image_height' => $uplifters_site_builder_blocks_related_clamp_int(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'imageHeight',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['image_height']
			),
			120,
			320,
			$uplifters_site_builder_blocks_defaults['image_height']
		),
		'show_excerpt' => (bool)
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'showExcerpt',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_excerpt']
			),
		'excerpt_length' => $uplifters_site_builder_blocks_related_clamp_int(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'excerptLength',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['excerpt_length']
			),
			8,
			60,
			$uplifters_site_builder_blocks_defaults['excerpt_length']
		),
		'show_meta' => (bool)
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'showMeta',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_meta']
			),
		'show_date' => (bool)
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'showDate',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_date']
			),
		'show_author' => (bool)
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'showAuthor',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_author']
			),
		'title_color' => $uplifters_site_builder_blocks_related_color(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'titleColor',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['title_color']
			),
			$uplifters_site_builder_blocks_defaults['title_color']
		),
		'title_font_family' => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'titleFontFamily',
				$uplifters_site_builder_blocks_device,
				'inherit'
			)
		) ?: 'inherit',
		'meta_color' => $uplifters_site_builder_blocks_related_color(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'metaColor',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['meta_color']
			),
			$uplifters_site_builder_blocks_defaults['meta_color']
		),
		'excerpt_color' => $uplifters_site_builder_blocks_related_color(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'excerptColor',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['excerpt_color']
			),
			$uplifters_site_builder_blocks_defaults['excerpt_color']
		),
		'card_background' => $uplifters_site_builder_blocks_related_color(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'cardBg',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['card_background']
			),
			$uplifters_site_builder_blocks_defaults['card_background']
		),
		'card_border' => $uplifters_site_builder_blocks_related_color(
			$uplifters_site_builder_blocks_related_responsive_value(
				$attributes,
				'cardBorder',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['card_border']
			),
			$uplifters_site_builder_blocks_defaults['card_border']
		),
	);
}

/*
 * Resolve current post.
 */
$uplifters_site_builder_blocks_current_post_id = 0;

if (
	isset( $block ) &&
	$block instanceof WP_Block &&
	! empty( $block->context['postId'] )
) {
	$uplifters_site_builder_blocks_current_post_id = absint(
		$block->context['postId']
	);
}

if ( ! $uplifters_site_builder_blocks_current_post_id ) {
	$uplifters_site_builder_blocks_current_post_id =
		absint( get_the_ID() );
}

if ( ! $uplifters_site_builder_blocks_current_post_id ) {
	$uplifters_site_builder_blocks_current_post_id =
		absint(
			get_queried_object_id()
		);
}

/*
 * Frontend placement guard.
 *
 * Related posts only make sense on a real single post view. Keep it out of
 * archives, pages, and other singular post types.
 */
if (
	! is_admin() &&
	(
		! function_exists( 'is_singular' ) ||
		! is_singular( 'post' )
	)
) {
	return '';
}

/*
 * Get current post taxonomy terms.
 */
$uplifters_site_builder_blocks_category_ids = array();
$uplifters_site_builder_blocks_tag_ids      = array();

if ( $uplifters_site_builder_blocks_current_post_id ) {
	$uplifters_site_builder_blocks_category_ids =
		wp_get_post_categories(
			$uplifters_site_builder_blocks_current_post_id,
			array(
				'fields' => 'ids',
			)
		);

	$uplifters_site_builder_blocks_tag_ids = wp_get_post_tags(
		$uplifters_site_builder_blocks_current_post_id,
		array(
			'fields' => 'ids',
		)
	);

	if ( is_wp_error( $uplifters_site_builder_blocks_category_ids ) ) {
		$uplifters_site_builder_blocks_category_ids = array();
	}

	if ( is_wp_error( $uplifters_site_builder_blocks_tag_ids ) ) {
		$uplifters_site_builder_blocks_tag_ids = array();
	}

	$uplifters_site_builder_blocks_category_ids = array_map(
		'absint',
		(array) $uplifters_site_builder_blocks_category_ids
	);

	$uplifters_site_builder_blocks_tag_ids = array_map(
		'absint',
		(array) $uplifters_site_builder_blocks_tag_ids
	);
}

/*
 * SQL for 'both' relate-by mode: posts in the current post's categories OR
 * its tags. WP_Query's tax_query can express this, but that construct is
 * flagged as a slow-query risk regardless of which relate-by mode a given
 * request actually uses. category__in/tag__in below cover the single-taxonomy
 * modes natively; 'both' needs a real OR-across-taxonomies join, done here by
 * hand and scoped to only this query via a custom, plugin-prefixed query var
 * so it never touches any other WP_Query on the page.
 */
$uplifters_site_builder_blocks_related_terms_join = static function ( string $join, WP_Query $query ): string {
	global $wpdb;

	if ( ! $query->get( 'uplifters_site_builder_blocks_both_relate_active' ) ) {
		return $join;
	}

	$join .= " INNER JOIN {$wpdb->term_relationships} uplifters_site_builder_blocks_tr ON ( {$wpdb->posts}.ID = uplifters_site_builder_blocks_tr.object_id )";
	$join .= " INNER JOIN {$wpdb->term_taxonomy} uplifters_site_builder_blocks_tt ON ( uplifters_site_builder_blocks_tr.term_taxonomy_id = uplifters_site_builder_blocks_tt.term_taxonomy_id )";

	return $join;
};

$uplifters_site_builder_blocks_related_terms_where = static function ( string $where, WP_Query $query ): string {
	if ( ! $query->get( 'uplifters_site_builder_blocks_both_relate_active' ) ) {
		return $where;
	}

	$category_ids = array_map( 'absint', (array) $query->get( 'uplifters_site_builder_blocks_both_relate_category_ids' ) );
	$tag_ids      = array_map( 'absint', (array) $query->get( 'uplifters_site_builder_blocks_both_relate_tag_ids' ) );

	// Every term ID is re-cast to (int) right here, at the point it's
	// concatenated into the clause, so each value is provably a plain
	// integer - no string or array data ever reaches the SQL, so there is
	// nothing $wpdb->prepare() would add here.
	$term_clauses = array();

	foreach ( $category_ids as $category_id ) {
		$term_clauses[] =
			"( uplifters_site_builder_blocks_tt.taxonomy = 'category' AND uplifters_site_builder_blocks_tt.term_id = " .
			(int) $category_id .
			' )';
	}

	foreach ( $tag_ids as $tag_id ) {
		$term_clauses[] =
			"( uplifters_site_builder_blocks_tt.taxonomy = 'post_tag' AND uplifters_site_builder_blocks_tt.term_id = " .
			(int) $tag_id .
			' )';
	}

	if ( empty( $term_clauses ) ) {
		return $where;
	}

	return $where . ' AND ( ' . implode( ' OR ', $term_clauses ) . ' )';
};

$uplifters_site_builder_blocks_related_terms_groupby = static function ( string $groupby, WP_Query $query ): string {
	global $wpdb;

	if ( ! $query->get( 'uplifters_site_builder_blocks_both_relate_active' ) ) {
		return $groupby;
	}

	// The term-relationship join can multiply-match a post (e.g. two matching
	// categories); group by post ID so each post appears once.
	return "{$wpdb->posts}.ID";
};

/*
 * Query configuration.
 */
$uplifters_site_builder_blocks_query_args = array(
	'post_type'              => 'post',
	'post_status'            => 'publish',
	'posts_per_page'         => $uplifters_site_builder_blocks_per_page,
	'order'                  => $uplifters_site_builder_blocks_order,
	'orderby'                => $uplifters_site_builder_blocks_order_by,
	'ignore_sticky_posts'    => true,
	'no_found_rows'          => true,
	'update_post_meta_cache' => true,
	'update_post_term_cache' => false,
);

$uplifters_site_builder_blocks_has_related_terms  = false;
$uplifters_site_builder_blocks_both_relate_active = false;

if (
	'categories' === $uplifters_site_builder_blocks_relate_by &&
	! empty( $uplifters_site_builder_blocks_category_ids )
) {
	$uplifters_site_builder_blocks_query_args['category__in'] = $uplifters_site_builder_blocks_category_ids;
	$uplifters_site_builder_blocks_has_related_terms           = true;
}

if (
	'tags' === $uplifters_site_builder_blocks_relate_by &&
	! empty( $uplifters_site_builder_blocks_tag_ids )
) {
	$uplifters_site_builder_blocks_query_args['tag__in'] = $uplifters_site_builder_blocks_tag_ids;
	$uplifters_site_builder_blocks_has_related_terms      = true;
}

if (
	'both' === $uplifters_site_builder_blocks_relate_by &&
	(
		! empty( $uplifters_site_builder_blocks_category_ids ) ||
		! empty( $uplifters_site_builder_blocks_tag_ids )
	)
) {
	$uplifters_site_builder_blocks_both_relate_active = true;
	$uplifters_site_builder_blocks_has_related_terms  = true;

	$uplifters_site_builder_blocks_query_args['uplifters_site_builder_blocks_both_relate_active']       = true;
	$uplifters_site_builder_blocks_query_args['uplifters_site_builder_blocks_both_relate_category_ids'] = $uplifters_site_builder_blocks_category_ids;
	$uplifters_site_builder_blocks_query_args['uplifters_site_builder_blocks_both_relate_tag_ids']       = $uplifters_site_builder_blocks_tag_ids;
}

if (
	! $uplifters_site_builder_blocks_has_related_terms &&
	! $uplifters_site_builder_blocks_fallback_to_recent
) {
	$uplifters_site_builder_blocks_query_args['post__in'] =
		array( 0 );
}

if ( $uplifters_site_builder_blocks_both_relate_active ) {
	add_filter( 'posts_join', $uplifters_site_builder_blocks_related_terms_join, 10, 2 );
	add_filter( 'posts_where', $uplifters_site_builder_blocks_related_terms_where, 10, 2 );
	add_filter( 'posts_groupby', $uplifters_site_builder_blocks_related_terms_groupby, 10, 2 );
}

$uplifters_site_builder_blocks_related_query =
	new WP_Query( $uplifters_site_builder_blocks_query_args );

if ( $uplifters_site_builder_blocks_both_relate_active ) {
	remove_filter( 'posts_join', $uplifters_site_builder_blocks_related_terms_join, 10 );
	remove_filter( 'posts_where', $uplifters_site_builder_blocks_related_terms_where, 10 );
	remove_filter( 'posts_groupby', $uplifters_site_builder_blocks_related_terms_groupby, 10 );
}

/*
 * Nothing excludes the current post from the query itself (see the render
 * loop below, which skips its card instead). So that the fallback-to-recent
 * behavior still matches "are there any OTHER related posts" rather than
 * "did the query return anything at all", check the fetched results for at
 * least one non-self post before deciding whether to fall back.
 */
$uplifters_site_builder_blocks_has_non_self_results = false;

foreach ( $uplifters_site_builder_blocks_related_query->posts as $uplifters_site_builder_blocks_candidate_post ) {
	if (
		! $uplifters_site_builder_blocks_current_post_id ||
		(int) $uplifters_site_builder_blocks_candidate_post->ID !== $uplifters_site_builder_blocks_current_post_id
	) {
		$uplifters_site_builder_blocks_has_non_self_results = true;
		break;
	}
}

if (
	! $uplifters_site_builder_blocks_has_non_self_results &&
	$uplifters_site_builder_blocks_fallback_to_recent
) {
	wp_reset_postdata();

	$uplifters_site_builder_blocks_fallback_args = array(
		'post_type'              => 'post',
		'post_status'            => 'publish',
		'posts_per_page'         => $uplifters_site_builder_blocks_per_page,
		'order'                  => $uplifters_site_builder_blocks_order,
		'orderby'                => $uplifters_site_builder_blocks_order_by,
		'ignore_sticky_posts'    => true,
		'no_found_rows'          => true,
		'update_post_meta_cache' => true,
		'update_post_term_cache' => false,
	);

	$uplifters_site_builder_blocks_related_query =
		new WP_Query(
			$uplifters_site_builder_blocks_fallback_args
		);
}

/*
 * Scoped responsive CSS.
 */
$uplifters_site_builder_blocks_instance_id = wp_unique_id(
	'uplifters-site-builder-blocks-posts-related-'
);

$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_instance_id;

$uplifters_site_builder_blocks_responsive_css =
	$uplifters_site_builder_blocks_related_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['desktop']
	);

$uplifters_site_builder_blocks_responsive_css .=
	'@media(max-width:1024px){' .
	$uplifters_site_builder_blocks_related_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['tablet']
	) .
	'}';

$uplifters_site_builder_blocks_responsive_css .=
	'@media(max-width:767px){' .
	$uplifters_site_builder_blocks_related_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['mobile']
	) .
	'}';

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'    => $uplifters_site_builder_blocks_instance_id,
			'class' => 'up2-related-posts-block',
			'style' =>
				'width:100%;box-sizing:border-box',
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
		echo wp_kses( wp_strip_all_tags( $uplifters_site_builder_blocks_responsive_css ), array() );
		?>

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?>,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> * {
			box-sizing: border-box;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-card {
			display: flex;
			flex-direction: column;
			min-width: 0;
			overflow: hidden;
			border-radius: 16px;
			box-shadow:
				0 1px 2px rgba(0, 0, 0, 0.04);
			color: inherit;
			text-decoration: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-image-wrapper {
			width: 100%;
			overflow: hidden;
			background: #f3f4f6;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-image-wrapper img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-body {
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding: 12px 12px 14px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-title {
			margin: 0;
			font-size: 15px;
			font-weight: 800;
			line-height: 1.35;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-meta {
			flex-wrap: wrap;
			gap: 8px;
			font-size: 12px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt {
			margin: 0;
			font-size: 13px;
			line-height: 1.65;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-empty {
			margin: 0;
			padding: 18px 0;
			text-align: center;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-tablet,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-mobile {
			display: none;
		}

		@media (max-width: 1024px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-mobile {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-tablet {
				display: inline;
			}
		}

		@media (max-width: 767px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-tablet {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-rp-excerpt-mobile {
				display: inline;
			}
		}
	<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

	<?php if ( $uplifters_site_builder_blocks_related_query->have_posts() ) : ?>
		<div class="up2-rp-grid">
			<?php
			while (
				$uplifters_site_builder_blocks_related_query->have_posts()
			) :
				$uplifters_site_builder_blocks_related_query->the_post();

				$uplifters_site_builder_blocks_related_post_id =
					get_the_ID();

				if (
					$uplifters_site_builder_blocks_current_post_id &&
					$uplifters_site_builder_blocks_related_post_id === $uplifters_site_builder_blocks_current_post_id
				) {
					continue;
				}

				$uplifters_site_builder_blocks_title = get_the_title(
					$uplifters_site_builder_blocks_related_post_id
				);

				$uplifters_site_builder_blocks_permalink = get_permalink(
					$uplifters_site_builder_blocks_related_post_id
				);

				$uplifters_site_builder_blocks_author_name =
					get_the_author_meta(
						'display_name',
						(int) get_post_field(
							'post_author',
							$uplifters_site_builder_blocks_related_post_id
						)
					);

				$uplifters_site_builder_blocks_date = get_the_date(
					'',
					$uplifters_site_builder_blocks_related_post_id
				);

				$uplifters_site_builder_blocks_raw_excerpt =
					get_the_excerpt(
						$uplifters_site_builder_blocks_related_post_id
					);

				$uplifters_site_builder_blocks_desktop_excerpt =
					$uplifters_site_builder_blocks_related_trim_words(
						$uplifters_site_builder_blocks_raw_excerpt,
						$uplifters_site_builder_blocks_devices['desktop'][
							'excerpt_length'
						]
					);

				$uplifters_site_builder_blocks_tablet_excerpt =
					$uplifters_site_builder_blocks_related_trim_words(
						$uplifters_site_builder_blocks_raw_excerpt,
						$uplifters_site_builder_blocks_devices['tablet'][
							'excerpt_length'
						]
					);

				$uplifters_site_builder_blocks_mobile_excerpt =
					$uplifters_site_builder_blocks_related_trim_words(
						$uplifters_site_builder_blocks_raw_excerpt,
						$uplifters_site_builder_blocks_devices['mobile'][
							'excerpt_length'
						]
					);

				$uplifters_site_builder_blocks_thumbnail_id =
					get_post_thumbnail_id(
						$uplifters_site_builder_blocks_related_post_id
					);

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
				<a
					class="up2-rp-card"
					href="<?php echo esc_url( $uplifters_site_builder_blocks_permalink ); ?>"
					aria-label="<?php echo esc_attr( $uplifters_site_builder_blocks_title ); ?>"
				>
					<div class="up2-rp-image-wrapper">
						<?php if ( has_post_thumbnail( $uplifters_site_builder_blocks_related_post_id ) ) : ?>
							<?php
							echo get_the_post_thumbnail(
								$uplifters_site_builder_blocks_related_post_id,
								'medium_large',
								array(
									'alt'     =>
										$uplifters_site_builder_blocks_thumbnail_alt,
									'loading' =>
										'lazy',
								)
							);
							?>
						<?php endif; ?>
					</div>

					<div class="up2-rp-body">
						<p class="up2-rp-title">
							<?php
							echo esc_html(
								$uplifters_site_builder_blocks_title
							);
							?>
						</p>

						<div class="up2-rp-meta">
							<span class="up2-rp-date">
								<?php
								echo esc_html(
									$uplifters_site_builder_blocks_date
								);
								?>
							</span>

							<?php if ( $uplifters_site_builder_blocks_author_name ) : ?>
								<span class="up2-rp-author">
									<?php
									echo esc_html(
										'• ' .
										$uplifters_site_builder_blocks_author_name
									);
									?>
								</span>
							<?php endif; ?>
						</div>

						<p class="up2-rp-excerpt">
							<span class="up2-rp-excerpt-desktop">
								<?php
								echo esc_html(
									$uplifters_site_builder_blocks_desktop_excerpt
								);
								?>
							</span>

							<span class="up2-rp-excerpt-tablet">
								<?php
								echo esc_html(
									$uplifters_site_builder_blocks_tablet_excerpt
								);
								?>
							</span>

							<span class="up2-rp-excerpt-mobile">
								<?php
								echo esc_html(
									$uplifters_site_builder_blocks_mobile_excerpt
								);
								?>
							</span>
						</p>
					</div>
				</a>
			<?php endwhile; ?>
		</div>

		<?php wp_reset_postdata(); ?>

	<?php else : ?>
		<p class="up2-rp-empty">
			<?php
			echo esc_html(
				$uplifters_site_builder_blocks_empty_text
			);
			?>
		</p>

		<?php wp_reset_postdata(); ?>
	<?php endif; ?>
</div>
