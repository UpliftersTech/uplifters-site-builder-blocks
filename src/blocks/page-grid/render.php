<?php
/**
 * Server-side render for uplifters-site-builder-blocks/page-grid.
 *
 * @package uplifters-site-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_responsive_value' ) ) {
	function uplifters_site_builder_blocks_page_grid_responsive_value( $value, string $device, $fallback = '' ) {
		if ( is_array( $value ) ) {
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
		}

		return null !== $value ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_clean_css_value' ) ) {
	function uplifters_site_builder_blocks_page_grid_clean_css_value( $value, string $fallback = '0px' ): string {
		$value = is_scalar( $value ) ? (string) $value : '';
		$value = trim( $value );

		if ( '' === $value ) {
			return $fallback;
		}

		$value = wp_strip_all_tags( $value );

		$value = str_replace(
			array( '<', '>', '{', '}', ';' ),
			'',
			$value
		);

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_page_grid_sanitize_color( $value, string $fallback = '' ): string {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( '' === $value ) {
			return $fallback;
		}

		if ( 'transparent' === strtolower( $value ) ) {
			return 'transparent';
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ) {
			return $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_number' ) ) {
	function uplifters_site_builder_blocks_page_grid_number( $value, float $fallback = 0 ): float {
		return is_numeric( $value )
			? (float) $value
			: $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_box_value' ) ) {
	function uplifters_site_builder_blocks_page_grid_box_value( $value, array $fallback ): array {
		return is_array( $value )
			? array_merge( $fallback, $value )
			: $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_position' ) ) {
	function uplifters_site_builder_blocks_page_grid_position( $value, string $fallback = 'start' ): string {
		$value = is_string( $value )
			? strtolower( trim( $value ) )
			: '';

		return in_array(
			$value,
			array( 'start', 'center', 'end' ),
			true
		)
			? $value
			: $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_grid_position_margins' ) ) {
	function uplifters_site_builder_blocks_page_grid_position_margins( string $position ): array {
		if ( 'center' === $position ) {
			return array(
				'left'  => 'auto',
				'right' => 'auto',
			);
		}

		if ( 'end' === $position ) {
			return array(
				'left'  => 'auto',
				'right' => '0',
			);
		}

		return array(
			'left'  => '0',
			'right' => 'auto',
		);
	}
}

$uplifters_site_builder_blocks_per_page = isset( $attributes['perPage'] )
	? absint( $attributes['perPage'] )
	: 10;

$uplifters_site_builder_blocks_per_page = $uplifters_site_builder_blocks_per_page > 0
	? min( $uplifters_site_builder_blocks_per_page, 1000 )
	: 10;

$uplifters_site_builder_blocks_selected_page_ids =
	isset( $attributes['selectedPageIds'] ) &&
	is_array( $attributes['selectedPageIds'] )
		? array_map(
			'absint',
			$attributes['selectedPageIds']
		)
		: array();

$uplifters_site_builder_blocks_fallback_padding = array(
	'top'    => '3px',
	'right'  => '3px',
	'bottom' => '3px',
	'left'   => '3px',
);

/*
 * Items per row.
 */
$uplifters_site_builder_blocks_desktop_items_per_row = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['itemsPerRow'] ?? '',
		'desktop',
		3
	),
	3
);

$uplifters_site_builder_blocks_tablet_items_per_row = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['itemsPerRow'] ?? '',
		'tablet',
		2
	),
	2
);

$uplifters_site_builder_blocks_mobile_items_per_row = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['itemsPerRow'] ?? '',
		'mobile',
		1
	),
	1
);

$uplifters_site_builder_blocks_desktop_items_per_row = max(
	1,
	min( absint( $uplifters_site_builder_blocks_desktop_items_per_row ), 12 )
);

$uplifters_site_builder_blocks_tablet_items_per_row = max(
	1,
	min( absint( $uplifters_site_builder_blocks_tablet_items_per_row ), 12 )
);

$uplifters_site_builder_blocks_mobile_items_per_row = max(
	1,
	min( absint( $uplifters_site_builder_blocks_mobile_items_per_row ), 12 )
);

/*
 * Grid position.
 */
$uplifters_site_builder_blocks_desktop_position = uplifters_site_builder_blocks_page_grid_position(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['position'] ?? '',
		'desktop',
		'start'
	),
	'start'
);

$uplifters_site_builder_blocks_tablet_position = uplifters_site_builder_blocks_page_grid_position(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['position'] ?? '',
		'tablet',
		'start'
	),
	'start'
);

$uplifters_site_builder_blocks_mobile_position = uplifters_site_builder_blocks_page_grid_position(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['position'] ?? '',
		'mobile',
		'start'
	),
	'start'
);

$uplifters_site_builder_blocks_desktop_position_margins =
	uplifters_site_builder_blocks_page_grid_position_margins(
		$uplifters_site_builder_blocks_desktop_position
	);

$uplifters_site_builder_blocks_tablet_position_margins =
	uplifters_site_builder_blocks_page_grid_position_margins(
		$uplifters_site_builder_blocks_tablet_position
	);

$uplifters_site_builder_blocks_mobile_position_margins =
	uplifters_site_builder_blocks_page_grid_position_margins(
		$uplifters_site_builder_blocks_mobile_position
	);

/*
 * Title padding.
 */
$uplifters_site_builder_blocks_desktop_title_padding = uplifters_site_builder_blocks_page_grid_box_value(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titlePadding'] ?? '',
		'desktop',
		$uplifters_site_builder_blocks_fallback_padding
	),
	$uplifters_site_builder_blocks_fallback_padding
);

$uplifters_site_builder_blocks_tablet_title_padding = uplifters_site_builder_blocks_page_grid_box_value(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titlePadding'] ?? '',
		'tablet',
		$uplifters_site_builder_blocks_fallback_padding
	),
	$uplifters_site_builder_blocks_fallback_padding
);

$uplifters_site_builder_blocks_mobile_title_padding = uplifters_site_builder_blocks_page_grid_box_value(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titlePadding'] ?? '',
		'mobile',
		$uplifters_site_builder_blocks_fallback_padding
	),
	$uplifters_site_builder_blocks_fallback_padding
);

/*
 * Title background.
 */
$uplifters_site_builder_blocks_desktop_title_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleBg'] ?? '',
		'desktop',
		''
	),
	'transparent'
);

$uplifters_site_builder_blocks_tablet_title_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleBg'] ?? '',
		'tablet',
		''
	),
	'transparent'
);

$uplifters_site_builder_blocks_mobile_title_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleBg'] ?? '',
		'mobile',
		''
	),
	'transparent'
);

/*
 * Title color.
 */
$uplifters_site_builder_blocks_desktop_title_color = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleColor'] ?? '',
		'desktop',
		'#0f172a'
	),
	'#0f172a'
);

$uplifters_site_builder_blocks_tablet_title_color = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleColor'] ?? '',
		'tablet',
		$uplifters_site_builder_blocks_desktop_title_color
	),
	$uplifters_site_builder_blocks_desktop_title_color
);

$uplifters_site_builder_blocks_mobile_title_color = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleColor'] ?? '',
		'mobile',
		$uplifters_site_builder_blocks_desktop_title_color
	),
	$uplifters_site_builder_blocks_desktop_title_color
);

/*
 * Title font size.
 */
$uplifters_site_builder_blocks_desktop_title_font_size = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleFontSize'] ?? '',
		'desktop',
		13
	),
	13
);

$uplifters_site_builder_blocks_tablet_title_font_size = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleFontSize'] ?? '',
		'tablet',
		11
	),
	11
);

$uplifters_site_builder_blocks_mobile_title_font_size = uplifters_site_builder_blocks_page_grid_number(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['titleFontSize'] ?? '',
		'mobile',
		14
	),
	14
);

/*
 * Title font family.
 */
/*
 * get_css_stack() also understands this block's older stored format (a full
 * CSS font-family stack value instead of a bare slug), so already-published
 * content keeps rendering the same font without a migration.
 */
$uplifters_site_builder_blocks_desktop_title_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['titleFontFamily'] ?? '',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_tablet_title_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['titleFontFamily'] ?? '',
			'tablet',
			''
		)
	);

$uplifters_site_builder_blocks_mobile_title_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['titleFontFamily'] ?? '',
			'mobile',
			''
		)
	);

/*
 * Hover background.
 */
$uplifters_site_builder_blocks_desktop_hover_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['hoverBg'] ?? '',
		'desktop',
		'#e2e8f0'
	),
	'#e2e8f0'
);

$uplifters_site_builder_blocks_tablet_hover_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['hoverBg'] ?? '',
		'tablet',
		$uplifters_site_builder_blocks_desktop_hover_bg
	),
	$uplifters_site_builder_blocks_desktop_hover_bg
);

$uplifters_site_builder_blocks_mobile_hover_bg = uplifters_site_builder_blocks_page_grid_sanitize_color(
	uplifters_site_builder_blocks_page_grid_responsive_value(
		$attributes['hoverBg'] ?? '',
		'mobile',
		$uplifters_site_builder_blocks_desktop_hover_bg
	),
	$uplifters_site_builder_blocks_desktop_hover_bg
);

/*
 * Hover text color.
 */
$uplifters_site_builder_blocks_desktop_hover_text_color =
	uplifters_site_builder_blocks_page_grid_sanitize_color(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['hoverTextColor'] ?? '',
			'desktop',
			'#0f172a'
		),
		'#0f172a'
	);

$uplifters_site_builder_blocks_tablet_hover_text_color =
	uplifters_site_builder_blocks_page_grid_sanitize_color(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['hoverTextColor'] ?? '',
			'tablet',
			$uplifters_site_builder_blocks_desktop_hover_text_color
		),
		$uplifters_site_builder_blocks_desktop_hover_text_color
	);

$uplifters_site_builder_blocks_mobile_hover_text_color =
	uplifters_site_builder_blocks_page_grid_sanitize_color(
		uplifters_site_builder_blocks_page_grid_responsive_value(
			$attributes['hoverTextColor'] ?? '',
			'mobile',
			$uplifters_site_builder_blocks_desktop_hover_text_color
		),
		$uplifters_site_builder_blocks_desktop_hover_text_color
	);

/*
 * Query pages.
 */
$uplifters_site_builder_blocks_pages_query = new WP_Query(
	array(
		'post_type'              => 'page',
		'post_status'            => 'publish',
		'posts_per_page'         => $uplifters_site_builder_blocks_per_page,
		'orderby'                => array(
			'menu_order' => 'ASC',
			'title'      => 'ASC',
		),
		'order'                  => 'ASC',
		'no_found_rows'          => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	)
);

$uplifters_site_builder_blocks_all_pages = array();

if ( $uplifters_site_builder_blocks_pages_query->have_posts() ) {
	foreach ( $uplifters_site_builder_blocks_pages_query->posts as $uplifters_site_builder_blocks_page_post ) {
		$uplifters_site_builder_blocks_all_pages[] = array(
			'id'         => (int) $uplifters_site_builder_blocks_page_post->ID,
			'parent'     => (int) $uplifters_site_builder_blocks_page_post->post_parent,
			'menu_order' => (int) $uplifters_site_builder_blocks_page_post->menu_order,
			'title'      => get_the_title( $uplifters_site_builder_blocks_page_post ),
			'permalink'  => get_permalink( $uplifters_site_builder_blocks_page_post ),
		);
	}
}

wp_reset_postdata();

/*
 * Build parent/child tree.
 */
$uplifters_site_builder_blocks_build_tree = static function ( $pages ) {
	$by_parent = array();

	foreach ( $pages as $page ) {
		$parent = isset( $page['parent'] )
			? (int) $page['parent']
			: 0;

		if ( ! isset( $by_parent[ $parent ] ) ) {
			$by_parent[ $parent ] = array();
		}

		$by_parent[ $parent ][] = $page;
	}

	foreach ( $by_parent as $parent_id => $children ) {
		usort(
			$children,
			static function ( $a, $b ) {
				$order_a = isset( $a['menu_order'] )
					? (int) $a['menu_order']
					: 0;

				$order_b = isset( $b['menu_order'] )
					? (int) $b['menu_order']
					: 0;

				if ( $order_a !== $order_b ) {
					return $order_a <=> $order_b;
				}

				return strcasecmp(
					isset( $a['title'] )
						? (string) $a['title']
						: '',
					isset( $b['title'] )
						? (string) $b['title']
						: ''
				);
			}
		);

		$by_parent[ $parent_id ] = $children;
	}

	return $by_parent;
};

/*
 * Move a selected page to root when its parent is not visible.
 */
$uplifters_site_builder_blocks_normalize_orphan_parents_to_root =
	static function ( $pages, $visible_set ) {
		$normalized = array();

		foreach ( $pages as $page ) {
			$parent = isset( $page['parent'] )
				? (int) $page['parent']
				: 0;

			if (
				0 !== $parent &&
				! isset( $visible_set[ $parent ] )
			) {
				$page['parent'] = 0;
			}

			$normalized[] = $page;
		}

		return $normalized;
	};

/*
 * Determine visible pages.
 */
$uplifters_site_builder_blocks_compute_visible_pages =
	static function (
		$all_pages,
		$selected_ids
	) use ( $uplifters_site_builder_blocks_normalize_orphan_parents_to_root ) {
		$selected = array();

		foreach ( $selected_ids as $id ) {
			$id = absint( $id );

			if ( $id > 0 ) {
				$selected[ $id ] = true;
			}
		}

		if ( empty( $selected ) ) {
			$visible_set = array();

			foreach ( $all_pages as $page ) {
				$visible_set[
					(int) $page['id']
				] = true;
			}

			return array(
				'visible_pages' => $all_pages,
				'visible_set'   => $visible_set,
			);
		}

		$children_by_parent = array();

		foreach ( $all_pages as $page ) {
			$parent = isset( $page['parent'] )
				? (int) $page['parent']
				: 0;

			if (
				! isset(
					$children_by_parent[ $parent ]
				)
			) {
				$children_by_parent[
					$parent
				] = array();
			}

			$children_by_parent[ $parent ][] =
				(int) $page['id'];
		}

		$visible_set = $selected;

		$add_descendants =
			function ( $id ) use (
				&$add_descendants,
				&$visible_set,
				$children_by_parent
			) {
				$children = isset(
					$children_by_parent[ $id ]
				)
					? $children_by_parent[ $id ]
					: array();

				foreach ( $children as $child_id ) {
					if (
						! isset(
							$visible_set[
								$child_id
							]
						)
					) {
						$visible_set[
							$child_id
						] = true;

						$add_descendants(
							$child_id
						);
					}
				}
			};

		foreach (
			array_keys( $selected )
			as $selected_id
		) {
			$add_descendants( $selected_id );
		}

		$filtered = array();

		foreach ( $all_pages as $page ) {
			if (
				isset(
					$visible_set[
						(int) $page['id']
					]
				)
			) {
				$filtered[] = $page;
			}
		}

		$normalized =
			$uplifters_site_builder_blocks_normalize_orphan_parents_to_root(
				$filtered,
				$visible_set
			);

		return array(
			'visible_pages' => $normalized,
			'visible_set'   => $visible_set,
		);
	};

$uplifters_site_builder_blocks_visible_result = $uplifters_site_builder_blocks_compute_visible_pages(
	$uplifters_site_builder_blocks_all_pages,
	$uplifters_site_builder_blocks_selected_page_ids
);

$uplifters_site_builder_blocks_visible_pages = isset(
	$uplifters_site_builder_blocks_visible_result['visible_pages']
)
	? $uplifters_site_builder_blocks_visible_result['visible_pages']
	: array();

$uplifters_site_builder_blocks_tree = $uplifters_site_builder_blocks_build_tree( $uplifters_site_builder_blocks_visible_pages );

/*
 * Render nested page list.
 */
$uplifters_site_builder_blocks_render_list =
	static function (
		$tree,
		$parent_id = 0,
		$depth = 0
	) use ( &$uplifters_site_builder_blocks_render_list ) {
		$children = isset( $tree[ $parent_id ] )
			? $tree[ $parent_id ]
			: array();

		if ( empty( $children ) ) {
			return '';
		}

		$ul_class = 0 === $depth
			? 'up2-root-grid'
			: 'up2-nested';

		$html  = '<ul class="' .
			esc_attr( $ul_class ) .
			'" style="list-style:none;padding:0;';
		$html .= 'margin-top:0;margin-bottom:0;">';

		foreach ( $children as $page ) {
			$title =
				isset( $page['title'] ) &&
				'' !== $page['title']
					? $page['title']
					: __( 'Untitled', 'uplifters-site-builder-blocks' );

			$url =
				isset( $page['permalink'] ) &&
				'' !== $page['permalink']
					? $page['permalink']
					: '#';

			$child_html = $uplifters_site_builder_blocks_render_list(
				$tree,
				(int) $page['id'],
				$depth + 1
			);

			$html .= '<li class="up2-page-li"';
			$html .= ' style="list-style:none;';
			$html .= 'margin:0;padding:0;';
			$html .= 'display:block;';
			$html .= 'width:max-content;';
			$html .= 'max-width:100%;">';

			$html .= '<a href="' .
				esc_url( $url ) .
				'" class="up2-item"';

			$html .= ' style="display:inline-block;';
			$html .= 'width:auto;max-width:100%;';
			$html .= 'border-radius:0.75rem;';
			$html .= 'background-color:transparent;';
			$html .= 'transition:';
			$html .= 'background-color 0.15s ease,';
			$html .= 'color 0.15s ease;">';

			$html .= '<div class="up2-title">';
			$html .= esc_html( $title );
			$html .= '</div>';

			$html .= '</a>';
			$html .= $child_html;
			$html .= '</li>';
		}

		$html .= '</ul>';

		return $html;
	};

$uplifters_site_builder_blocks_list_html = $uplifters_site_builder_blocks_render_list( $uplifters_site_builder_blocks_tree, 0, 0 );

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-page-grid-'
);

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'    => $uplifters_site_builder_blocks_unique_id,
			'class' => 'up2-m-sub',
		)
	);

$uplifters_site_builder_blocks_css = '';

/*
 * Reset styles.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ',';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' *{';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' a,';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' a:visited,';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' a:hover,';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' a:focus,';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' a:active{';
$uplifters_site_builder_blocks_css .= 'text-decoration:none!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' ul,';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' ol{';
$uplifters_site_builder_blocks_css .= 'list-style:none!important;';
$uplifters_site_builder_blocks_css .= 'padding-left:0!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' li{';
$uplifters_site_builder_blocks_css .= 'list-style:none!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' li::marker{';
$uplifters_site_builder_blocks_css .= 'content:""!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_css .= 'width:100%;';
$uplifters_site_builder_blocks_css .= 'max-width:100%;';
$uplifters_site_builder_blocks_css .= 'overflow:visible;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Root grid.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-root-grid{';
$uplifters_site_builder_blocks_css .= 'display:grid!important;';
$uplifters_site_builder_blocks_css .= 'grid-template-columns:';
$uplifters_site_builder_blocks_css .= 'repeat(';
$uplifters_site_builder_blocks_css .= 'var(--up2-items-per-row,3),';
$uplifters_site_builder_blocks_css .= 'max-content';
$uplifters_site_builder_blocks_css .= ')!important;';
$uplifters_site_builder_blocks_css .= 'gap:0.5rem!important;';
$uplifters_site_builder_blocks_css .= 'align-items:start!important;';
$uplifters_site_builder_blocks_css .= 'justify-content:start!important;';
$uplifters_site_builder_blocks_css .= 'width:max-content!important;';
$uplifters_site_builder_blocks_css .= 'max-width:100%!important;';
$uplifters_site_builder_blocks_css .= 'overflow:visible!important;';
$uplifters_site_builder_blocks_css .= 'margin-left:';
$uplifters_site_builder_blocks_css .= 'var(--up2-grid-margin-left,0)';
$uplifters_site_builder_blocks_css .= '!important;';
$uplifters_site_builder_blocks_css .= 'margin-right:';
$uplifters_site_builder_blocks_css .= 'var(--up2-grid-margin-right,auto)';
$uplifters_site_builder_blocks_css .= '!important;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * List item.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-page-li{';
$uplifters_site_builder_blocks_css .= 'display:block!important;';
$uplifters_site_builder_blocks_css .= 'width:max-content!important;';
$uplifters_site_builder_blocks_css .= 'max-width:100%!important;';
$uplifters_site_builder_blocks_css .= 'margin:0!important;';
$uplifters_site_builder_blocks_css .= 'padding:0!important;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Link.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-item{';
$uplifters_site_builder_blocks_css .= 'display:inline-block!important;';
$uplifters_site_builder_blocks_css .= 'width:auto!important;';
$uplifters_site_builder_blocks_css .= 'max-width:100%!important;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Title.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-title{';
$uplifters_site_builder_blocks_css .= 'display:inline-block!important;';
$uplifters_site_builder_blocks_css .= 'width:auto!important;';
$uplifters_site_builder_blocks_css .= 'max-width:100%!important;';
$uplifters_site_builder_blocks_css .= 'white-space:normal!important;';
$uplifters_site_builder_blocks_css .= 'overflow-wrap:break-word;';
$uplifters_site_builder_blocks_css .= 'word-break:break-word;';
$uplifters_site_builder_blocks_css .= 'line-height:1.375;';
$uplifters_site_builder_blocks_css .= 'font-weight:600;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Nested pages.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-nested{';
$uplifters_site_builder_blocks_css .= 'display:flex!important;';
$uplifters_site_builder_blocks_css .= 'flex-direction:column!important;';
$uplifters_site_builder_blocks_css .= 'gap:0.5rem!important;';
$uplifters_site_builder_blocks_css .= 'margin-top:0.5rem!important;';
$uplifters_site_builder_blocks_css .= 'padding-left:1rem!important;';
$uplifters_site_builder_blocks_css .= 'border-left:';
$uplifters_site_builder_blocks_css .= '1px solid #e2e8f0!important;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Hover.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-item:hover{';
$uplifters_site_builder_blocks_css .= 'background-color:transparent';
$uplifters_site_builder_blocks_css .= '!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id;
$uplifters_site_builder_blocks_css .= ' .up2-item:hover .up2-title{';
$uplifters_site_builder_blocks_css .= 'background-color:';
$uplifters_site_builder_blocks_css .= 'var(--up2-hover-bg,transparent)';
$uplifters_site_builder_blocks_css .= '!important;';
$uplifters_site_builder_blocks_css .= 'color:';
$uplifters_site_builder_blocks_css .= 'var(--up2-hover-text,inherit)';
$uplifters_site_builder_blocks_css .= '!important;';
$uplifters_site_builder_blocks_css .= '}';

/*
 * Desktop variables.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .= '--up2-items-per-row:' .
	$uplifters_site_builder_blocks_desktop_items_per_row .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-left:' .
	$uplifters_site_builder_blocks_desktop_position_margins['left'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-right:' .
	$uplifters_site_builder_blocks_desktop_position_margins['right'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-bg:' .
	$uplifters_site_builder_blocks_desktop_hover_bg .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-text:' .
	$uplifters_site_builder_blocks_desktop_hover_text_color .
	';';

$uplifters_site_builder_blocks_css .= '}';

/*
 * Desktop title styles.
 */
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-title{';

$uplifters_site_builder_blocks_css .= 'padding-top:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_desktop_title_padding['top'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-right:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_desktop_title_padding['right'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-bottom:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_desktop_title_padding['bottom'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-left:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_desktop_title_padding['left'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'background-color:' .
	$uplifters_site_builder_blocks_desktop_title_bg .
	';';

$uplifters_site_builder_blocks_css .= 'color:' .
	$uplifters_site_builder_blocks_desktop_title_color .
	';';

$uplifters_site_builder_blocks_css .= 'font-size:' .
	$uplifters_site_builder_blocks_desktop_title_font_size .
	'px;';

/*
 * Do not use esc_attr() here.
 * The value is already strictly whitelisted.
 */
if ( '' !== $uplifters_site_builder_blocks_desktop_title_font_family ) {
	$uplifters_site_builder_blocks_css .= 'font-family:' .
		$uplifters_site_builder_blocks_desktop_title_font_family .
		'!important;';
}

$uplifters_site_builder_blocks_css .= '}';

/*
 * Tablet.
 */
$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .= '--up2-items-per-row:' .
	$uplifters_site_builder_blocks_tablet_items_per_row .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-left:' .
	$uplifters_site_builder_blocks_tablet_position_margins['left'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-right:' .
	$uplifters_site_builder_blocks_tablet_position_margins['right'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-bg:' .
	$uplifters_site_builder_blocks_tablet_hover_bg .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-text:' .
	$uplifters_site_builder_blocks_tablet_hover_text_color .
	';';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-title{';

$uplifters_site_builder_blocks_css .= 'padding-top:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_tablet_title_padding['top'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-right:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_tablet_title_padding['right'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-bottom:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_tablet_title_padding['bottom'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-left:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_tablet_title_padding['left'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'background-color:' .
	$uplifters_site_builder_blocks_tablet_title_bg .
	';';

$uplifters_site_builder_blocks_css .= 'color:' .
	$uplifters_site_builder_blocks_tablet_title_color .
	';';

$uplifters_site_builder_blocks_css .= 'font-size:' .
	$uplifters_site_builder_blocks_tablet_title_font_size .
	'px;';

if ( '' !== $uplifters_site_builder_blocks_tablet_title_font_family ) {
	$uplifters_site_builder_blocks_css .= 'font-family:' .
		$uplifters_site_builder_blocks_tablet_title_font_family .
		'!important;';
}

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '}';

/*
 * Mobile.
 */
$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .= '--up2-items-per-row:' .
	$uplifters_site_builder_blocks_mobile_items_per_row .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-left:' .
	$uplifters_site_builder_blocks_mobile_position_margins['left'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-grid-margin-right:' .
	$uplifters_site_builder_blocks_mobile_position_margins['right'] .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-bg:' .
	$uplifters_site_builder_blocks_mobile_hover_bg .
	';';

$uplifters_site_builder_blocks_css .= '--up2-hover-text:' .
	$uplifters_site_builder_blocks_mobile_hover_text_color .
	';';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .up2-title{';

$uplifters_site_builder_blocks_css .= 'padding-top:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_mobile_title_padding['top'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-right:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_mobile_title_padding['right'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-bottom:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_mobile_title_padding['bottom'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'padding-left:' .
	uplifters_site_builder_blocks_page_grid_clean_css_value(
		$uplifters_site_builder_blocks_mobile_title_padding['left'] ?? '3px',
		'3px'
	) .
	';';

$uplifters_site_builder_blocks_css .= 'background-color:' .
	$uplifters_site_builder_blocks_mobile_title_bg .
	';';

$uplifters_site_builder_blocks_css .= 'color:' .
	$uplifters_site_builder_blocks_mobile_title_color .
	';';

$uplifters_site_builder_blocks_css .= 'font-size:' .
	$uplifters_site_builder_blocks_mobile_title_font_size .
	'px;';

if ( '' !== $uplifters_site_builder_blocks_mobile_title_font_family ) {
	$uplifters_site_builder_blocks_css .= 'font-family:' .
		$uplifters_site_builder_blocks_mobile_title_font_family .
		'!important;';
}

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '}';

?>

<?php
/*
 * The constructed CSS values have already been sanitized or whitelisted.
 * Do not run wp_strip_all_tags()/wp_kses() here because it may alter CSS content.
 */
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php
	if ( ! empty( $uplifters_site_builder_blocks_list_html ) ) {
		echo wp_kses( $uplifters_site_builder_blocks_list_html, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
	} else {
		echo '<div style="display:inline-block;font-size:0.875rem;color:#475569;">';
		echo esc_html__( 'No pages found.', 'uplifters-site-builder-blocks' );
		echo '</div>';
	}
	?>
</div>
