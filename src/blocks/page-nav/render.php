<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS PageNav block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_responsive_value' ) ) {
	function uplifters_site_builder_blocks_page_nav_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if (
			empty( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if (
			array_key_exists( $device, $value ) &&
			null !== $value[ $device ] &&
			'' !== $value[ $device ]
		) {
			return $value[ $device ];
		}

		if (
			array_key_exists( 'desktop', $value ) &&
			null !== $value['desktop'] &&
			'' !== $value['desktop']
		) {
			return $value['desktop'];
		}

		if (
			array_key_exists( 'tablet', $value ) &&
			null !== $value['tablet'] &&
			'' !== $value['tablet']
		) {
			return $value['tablet'];
		}

		if (
			array_key_exists( 'mobile', $value ) &&
			null !== $value['mobile'] &&
			'' !== $value['mobile']
		) {
			return $value['mobile'];
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_page_nav_sanitize_css_value( $value ): string {
		$value = wp_strip_all_tags( (string) $value );

		$value = str_replace(
			array( '<', '>', '{', '}', ';' ),
			'',
			$value
		);

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_page_nav_sanitize_color( $value ): string {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		if (
			preg_match(
				'/^#[a-fA-F0-9]{3,8}$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^rgb[a]?\([0-9.,\s%]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^hsla?\([0-9.,\s%deg]+\)$/',
				$value
			)
		) {
			return $value;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_sanitize_position' ) ) {
	function uplifters_site_builder_blocks_page_nav_sanitize_position( $value ): string {
		$value = (string) $value;

		$allowed = array(
			'start',
			'center',
			'end',
			'left',
			'right',
		);

		return in_array( $value, $allowed, true )
			? $value
			: 'center';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_position_justify' ) ) {
	function uplifters_site_builder_blocks_page_nav_position_justify( string $position ): string {
		if (
			'start' === $position ||
			'left' === $position
		) {
			return 'flex-start';
		}

		if (
			'end' === $position ||
			'right' === $position
		) {
			return 'flex-end';
		}

		return 'center';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_box_value' ) ) {
	function uplifters_site_builder_blocks_page_nav_box_value(
		$box,
		string $side,
		string $fallback = '0px'
	): string {
		if ( ! is_array( $box ) ) {
			return $fallback;
		}

		return uplifters_site_builder_blocks_page_nav_sanitize_css_value(
			$box[ $side ] ?? $fallback
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_font_size' ) ) {
	function uplifters_site_builder_blocks_page_nav_font_size(
		$value,
		int $fallback = 16
	): string {
		$value = is_numeric( $value )
			? (float) $value
			: (float) $fallback;

		if ( $value <= 0 ) {
			$value = $fallback;
		}

		return rtrim(
			rtrim(
				(string) $value,
				'0'
			),
			'.'
		) . 'px';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_sort_pages' ) ) {
	function uplifters_site_builder_blocks_page_nav_sort_pages( array $pages ): array {
		usort(
			$pages,
			static function ( $a, $b ) {
				$order_a = isset( $a->menu_order )
					? (int) $a->menu_order
					: 0;

				$order_b = isset( $b->menu_order )
					? (int) $b->menu_order
					: 0;

				if ( $order_a !== $order_b ) {
					return $order_a <=> $order_b;
				}

				return strcasecmp(
					get_the_title( $a ),
					get_the_title( $b )
				);
			}
		);

		return $pages;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_get_pages' ) ) {
	function uplifters_site_builder_blocks_page_nav_get_pages(
		int $per_page,
		array $selected_page_ids
	): array {
		$args = array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'posts_per_page' => max(
				1,
				min( 1000, $per_page )
			),
			'orderby'        => array(
				'menu_order' => 'ASC',
				'title'      => 'ASC',
			),
			'no_found_rows'  => true,
		);

		if ( ! empty( $selected_page_ids ) ) {
			$args['post__in'] =
				$selected_page_ids;

			$args['posts_per_page'] =
				count( $selected_page_ids );

			$args['orderby'] = 'post__in';
		}

		$query = new WP_Query( $args );
		$pages = $query->posts;

		wp_reset_postdata();

		return uplifters_site_builder_blocks_page_nav_sort_pages(
			$pages
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_page_nav_render_list' ) ) {
	function uplifters_site_builder_blocks_page_nav_render_list(
		array $pages,
		string $title_class
	): string {
		if ( empty( $pages ) ) {
			return '';
		}

		$html = '<ul class="uplifters-site-builder-blocks-page-menu-list">';

		foreach ( $pages as $page ) {
			$page_id = isset( $page->ID )
				? (int) $page->ID
				: 0;

			$title = get_the_title( $page_id );
			$permalink = get_permalink( $page_id );

			if ( ! $page_id || ! $permalink ) {
				continue;
			}

			$html .= '<li>';

			$html .=
				'<a href="' .
				esc_url( $permalink ) .
				'" data-page-id="' .
				esc_attr( $page_id ) .
				'" class="uplifters-site-builder-blocks-page-menu-item">';

			$html .=
				'<div class="uplifters-site-builder-blocks-page-menu-title ' .
				esc_attr( $title_class ) .
				'">' .
				esc_html(
					$title
						? $title
						: __( 'Untitled', 'uplifters-site-builder-blocks' )
				) .
				'</div>';

			$html .= '</a>';
			$html .= '</li>';
		}

		$html .= '</ul>';

		return $html;
	}
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-page-nav-'
);

$uplifters_site_builder_blocks_per_page = isset( $attributes['perPage'] )
	? absint( $attributes['perPage'] )
	: 50;

$uplifters_site_builder_blocks_per_page = $uplifters_site_builder_blocks_per_page > 0
	? $uplifters_site_builder_blocks_per_page
	: 50;

$uplifters_site_builder_blocks_selected_page_ids = array();

if (
	! empty( $attributes['selectedPageIds'] ) &&
	is_array( $attributes['selectedPageIds'] )
) {
	$uplifters_site_builder_blocks_selected_page_ids = array_values(
		array_filter(
			array_map(
				'absint',
				$attributes['selectedPageIds']
			)
		)
	);
}

$uplifters_site_builder_blocks_pages = uplifters_site_builder_blocks_page_nav_get_pages(
	$uplifters_site_builder_blocks_per_page,
	$uplifters_site_builder_blocks_selected_page_ids
);

$uplifters_site_builder_blocks_desktop_position =
	uplifters_site_builder_blocks_page_nav_sanitize_position(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'pagePosition',
			'desktop',
			'center'
		)
	);

$uplifters_site_builder_blocks_tablet_position =
	uplifters_site_builder_blocks_page_nav_sanitize_position(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'pagePosition',
			'tablet',
			$uplifters_site_builder_blocks_desktop_position
		)
	);

$uplifters_site_builder_blocks_mobile_position =
	uplifters_site_builder_blocks_page_nav_sanitize_position(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'pagePosition',
			'mobile',
			$uplifters_site_builder_blocks_desktop_position
		)
	);

$uplifters_site_builder_blocks_desktop_padding =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titlePadding',
		'desktop',
		array(
			'top'    => '2px',
			'right'  => '2px',
			'bottom' => '2px',
			'left'   => '2px',
		)
	);

$uplifters_site_builder_blocks_tablet_padding =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titlePadding',
		'tablet',
		$uplifters_site_builder_blocks_desktop_padding
	);

$uplifters_site_builder_blocks_mobile_padding =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titlePadding',
		'mobile',
		$uplifters_site_builder_blocks_desktop_padding
	);

$uplifters_site_builder_blocks_desktop_margin =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleMargin',
		'desktop',
		array(
			'top'    => '0px',
			'right'  => '0px',
			'bottom' => '0px',
			'left'   => '0px',
		)
	);

$uplifters_site_builder_blocks_tablet_margin =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleMargin',
		'tablet',
		$uplifters_site_builder_blocks_desktop_margin
	);

$uplifters_site_builder_blocks_mobile_margin =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleMargin',
		'mobile',
		$uplifters_site_builder_blocks_desktop_margin
	);

$uplifters_site_builder_blocks_desktop_title_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleBg',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_tablet_title_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleBg',
			'tablet',
			$uplifters_site_builder_blocks_desktop_title_bg
		)
	);

$uplifters_site_builder_blocks_mobile_title_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleBg',
			'mobile',
			$uplifters_site_builder_blocks_desktop_title_bg
		)
	);

$uplifters_site_builder_blocks_desktop_title_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleColor',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_tablet_title_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_title_color
		)
	);

$uplifters_site_builder_blocks_mobile_title_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_title_color
		)
	);

$uplifters_site_builder_blocks_desktop_font_family_key =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleFontFamily',
		'desktop',
		'default'
	);

$uplifters_site_builder_blocks_tablet_font_family_key =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleFontFamily',
		'tablet',
		$uplifters_site_builder_blocks_desktop_font_family_key
	);

$uplifters_site_builder_blocks_mobile_font_family_key =
	uplifters_site_builder_blocks_page_nav_responsive_value(
		$attributes,
		'titleFontFamily',
		'mobile',
		$uplifters_site_builder_blocks_desktop_font_family_key
	);

$uplifters_site_builder_blocks_desktop_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_tablet_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_mobile_font_family =
	\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_font_size =
	uplifters_site_builder_blocks_page_nav_font_size(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleFontSize',
			'desktop',
			16
		),
		16
	);

$uplifters_site_builder_blocks_tablet_font_size =
	uplifters_site_builder_blocks_page_nav_font_size(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleFontSize',
			'tablet',
			16
		),
		16
	);

$uplifters_site_builder_blocks_mobile_font_size =
	uplifters_site_builder_blocks_page_nav_font_size(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'titleFontSize',
			'mobile',
			16
		),
		16
	);

$uplifters_site_builder_blocks_desktop_hover_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverBg',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_tablet_hover_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverBg',
			'tablet',
			$uplifters_site_builder_blocks_desktop_hover_bg
		)
	);

$uplifters_site_builder_blocks_mobile_hover_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverBg',
			'mobile',
			$uplifters_site_builder_blocks_desktop_hover_bg
		)
	);

$uplifters_site_builder_blocks_desktop_hover_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverTextColor',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_tablet_hover_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverTextColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_hover_text
		)
	);

$uplifters_site_builder_blocks_mobile_hover_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hoverTextColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_hover_text
		)
	);

$uplifters_site_builder_blocks_desktop_active_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'activeTextColor',
			'desktop',
			'#dc2626'
		)
	);

$uplifters_site_builder_blocks_tablet_active_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'activeTextColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_active_text
		)
	);

$uplifters_site_builder_blocks_mobile_active_text =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'activeTextColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_active_text
		)
	);

$uplifters_site_builder_blocks_desktop_hamburger_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerBg',
			'desktop',
			'#ffffff'
		)
	);

$uplifters_site_builder_blocks_tablet_hamburger_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerBg',
			'tablet',
			$uplifters_site_builder_blocks_desktop_hamburger_bg
		)
	);

$uplifters_site_builder_blocks_mobile_hamburger_bg =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerBg',
			'mobile',
			$uplifters_site_builder_blocks_desktop_hamburger_bg
		)
	);

$uplifters_site_builder_blocks_desktop_hamburger_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerColor',
			'desktop',
			'#334155'
		)
	);

$uplifters_site_builder_blocks_tablet_hamburger_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_hamburger_color
		)
	);

$uplifters_site_builder_blocks_mobile_hamburger_color =
	uplifters_site_builder_blocks_page_nav_sanitize_color(
		uplifters_site_builder_blocks_page_nav_responsive_value(
			$attributes,
			'hamburgerColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_hamburger_color
		)
	);

$uplifters_site_builder_blocks_title_class =
	$uplifters_site_builder_blocks_unique_id . '-title';

$uplifters_site_builder_blocks_list_html =
	uplifters_site_builder_blocks_page_nav_render_list(
		$uplifters_site_builder_blocks_pages,
		$uplifters_site_builder_blocks_title_class
	);

$uplifters_site_builder_blocks_panel_id =
	$uplifters_site_builder_blocks_unique_id . '-panel';

$uplifters_site_builder_blocks_css  = '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-page-position-justify:' .
	uplifters_site_builder_blocks_page_nav_position_justify(
		$uplifters_site_builder_blocks_desktop_position
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-bg:' .
	(
		$uplifters_site_builder_blocks_desktop_hover_bg
			? $uplifters_site_builder_blocks_desktop_hover_bg
			: 'transparent'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-text:' .
	(
		$uplifters_site_builder_blocks_desktop_hover_text
			? $uplifters_site_builder_blocks_desktop_hover_text
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-active-text:' .
	(
		$uplifters_site_builder_blocks_desktop_active_text
			? $uplifters_site_builder_blocks_desktop_active_text
			: '#dc2626'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-color:' .
	(
		$uplifters_site_builder_blocks_desktop_title_color
			? $uplifters_site_builder_blocks_desktop_title_color
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-font-family:' .
	$uplifters_site_builder_blocks_desktop_font_family .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-bg:' .
	(
		$uplifters_site_builder_blocks_desktop_hamburger_bg
			? $uplifters_site_builder_blocks_desktop_hamburger_bg
			: '#ffffff'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-color:' .
	(
		$uplifters_site_builder_blocks_desktop_hamburger_color
			? $uplifters_site_builder_blocks_desktop_hamburger_color
			: '#334155'
	) .
	';';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_css .= 'width:100%!important;';
$uplifters_site_builder_blocks_css .= 'max-width:100%!important;';
$uplifters_site_builder_blocks_css .= 'display:block!important;';
$uplifters_site_builder_blocks_css .= 'flex:0 0 auto!important;';
$uplifters_site_builder_blocks_css .= 'align-self:flex-start!important;';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box!important;';
$uplifters_site_builder_blocks_css .= 'position:relative!important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	',#' . $uplifters_site_builder_blocks_unique_id .
	' *{box-sizing:border-box;}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id . ' a,' .
	'#' . $uplifters_site_builder_blocks_unique_id . ' a:visited,' .
	'#' . $uplifters_site_builder_blocks_unique_id . ' a:hover,' .
	'#' . $uplifters_site_builder_blocks_unique_id . ' a:focus,' .
	'#' . $uplifters_site_builder_blocks_unique_id . ' a:active{' .
	'text-decoration:none!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id . ' ul,' .
	'#' . $uplifters_site_builder_blocks_unique_id . ' ol{' .
	'list-style:none!important;' .
	'padding:0!important;' .
	'margin:0!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id . ' li{' .
	'list-style:none!important;' .
	'margin:0!important;' .
	'padding:0!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' li::marker{' .
	'content:""!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-list{' .
	'display:flex!important;' .
	'flex-direction:row!important;' .
	'flex-wrap:wrap!important;' .
	'gap:0!important;' .
	'align-items:flex-start!important;' .
	'justify-content:var(--uplifters-site-builder-blocks-page-position-justify,center)!important;' .
	'overflow:visible!important;' .
	'padding-bottom:0!important;' .
	'width:100%!important;' .
	'max-width:100%!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-list>li{' .
	'flex:0 0 auto!important;' .
	'width:auto!important;' .
	'min-width:0!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-item{' .
	'display:inline-block!important;' .
	'width:auto!important;' .
	'max-width:100%!important;' .
	'border-radius:12px;' .
	'border:0;' .
	'background:transparent;' .
	'box-shadow:none;' .
	'transition:' .
	'box-shadow .2s ease,' .
	'background-color .2s ease,' .
	'color .2s ease;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-title{' .
	'display:inline-block!important;' .
	'width:auto!important;' .
	'max-width:100%!important;' .
	'color:var(--uplifters-site-builder-blocks-title-color,inherit)!important;' .
	'font-family:var(--uplifters-site-builder-blocks-title-font-family,inherit)!important;' .
	'transition:' .
	'background-color .2s ease,' .
	'color .2s ease,' .
	'box-shadow .2s ease!important;' .
	'line-height:1.375!important;' .
	'font-weight:600!important;' .
	'word-break:break-word;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-item:hover{' .
	'background-color:var(--uplifters-site-builder-blocks-hover-bg,transparent)!important;' .
	'box-shadow:none;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-item:hover ' .
	'.uplifters-site-builder-blocks-page-menu-title{' .
	'background-color:var(--uplifters-site-builder-blocks-hover-bg,transparent)!important;' .
	'color:var(--uplifters-site-builder-blocks-hover-text,inherit)!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-item.is-active ' .
	'.uplifters-site-builder-blocks-page-menu-title{' .
	'color:var(--uplifters-site-builder-blocks-active-text,var(--uplifters-site-builder-blocks-title-color,inherit))!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-desktop-shell{' .
	'display:block;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-shell{' .
	'display:none;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-trigger{' .
	'position:relative;' .
	'z-index:10001;' .
	'display:inline-flex;' .
	'align-items:center;' .
	'justify-content:center;' .
	'width:auto;' .
	'min-width:0;' .
	'max-width:max-content;' .
	'line-height:0;' .
	'border:1px solid rgba(148,163,184,.35);' .
	'border-radius:12px;' .
	'padding:10px;' .
	'background:var(--uplifters-site-builder-blocks-hamburger-bg,#ffffff);' .
	'color:var(--uplifters-site-builder-blocks-hamburger-color,#334155);' .
	'box-shadow:0 2px 10px rgba(15,23,42,.08);' .
	'cursor:pointer;' .
	'appearance:none;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-hamburger{' .
	'display:inline-flex;' .
	'flex-direction:column;' .
	'justify-content:center;' .
	'gap:4px;' .
	'width:20px;' .
	'height:16px;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-hamburger span{' .
	'display:block;' .
	'width:20px;' .
	'height:2px;' .
	'border-radius:999px;' .
	'background:var(--uplifters-site-builder-blocks-hamburger-color,#334155);' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .' . $uplifters_site_builder_blocks_title_class . '{';

$uplifters_site_builder_blocks_css .=
	'padding-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_padding,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_padding,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_padding,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_padding,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_margin,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_margin,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_margin,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_desktop_margin,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'font-size:' .
	$uplifters_site_builder_blocks_desktop_font_size .
	';';

$uplifters_site_builder_blocks_css .=
	'font-family:' .
	$uplifters_site_builder_blocks_desktop_font_family .
	'!important;';

$uplifters_site_builder_blocks_css .=
	'text-align:center;' .
	'border-radius:8px;';

if ( $uplifters_site_builder_blocks_desktop_title_bg ) {
	$uplifters_site_builder_blocks_css .=
		'background-color:' .
		$uplifters_site_builder_blocks_desktop_title_bg .
		';';
}

if ( $uplifters_site_builder_blocks_desktop_title_color ) {
	$uplifters_site_builder_blocks_css .=
		'color:' .
		$uplifters_site_builder_blocks_desktop_title_color .
		';';
}

$uplifters_site_builder_blocks_css .= '}';

/* Tablet */
$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-page-position-justify:' .
	uplifters_site_builder_blocks_page_nav_position_justify(
		$uplifters_site_builder_blocks_tablet_position
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-bg:' .
	(
		$uplifters_site_builder_blocks_tablet_hover_bg
			? $uplifters_site_builder_blocks_tablet_hover_bg
			: 'transparent'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-text:' .
	(
		$uplifters_site_builder_blocks_tablet_hover_text
			? $uplifters_site_builder_blocks_tablet_hover_text
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-active-text:' .
	(
		$uplifters_site_builder_blocks_tablet_active_text
			? $uplifters_site_builder_blocks_tablet_active_text
			: '#dc2626'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-color:' .
	(
		$uplifters_site_builder_blocks_tablet_title_color
			? $uplifters_site_builder_blocks_tablet_title_color
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-font-family:' .
	$uplifters_site_builder_blocks_tablet_font_family .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-bg:' .
	(
		$uplifters_site_builder_blocks_tablet_hamburger_bg
			? $uplifters_site_builder_blocks_tablet_hamburger_bg
			: '#ffffff'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-color:' .
	(
		$uplifters_site_builder_blocks_tablet_hamburger_color
			? $uplifters_site_builder_blocks_tablet_hamburger_color
			: '#334155'
	) .
	';';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .' . $uplifters_site_builder_blocks_title_class . '{';

$uplifters_site_builder_blocks_css .=
	'padding-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_padding,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_padding,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_padding,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_padding,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_margin,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_margin,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_margin,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_tablet_margin,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'font-size:' .
	$uplifters_site_builder_blocks_tablet_font_size .
	';';

$uplifters_site_builder_blocks_css .=
	'font-family:' .
	$uplifters_site_builder_blocks_tablet_font_family .
	'!important;';

if ( $uplifters_site_builder_blocks_tablet_title_bg ) {
	$uplifters_site_builder_blocks_css .=
		'background-color:' .
		$uplifters_site_builder_blocks_tablet_title_bg .
		';';
}

if ( $uplifters_site_builder_blocks_tablet_title_color ) {
	$uplifters_site_builder_blocks_css .=
		'color:' .
		$uplifters_site_builder_blocks_tablet_title_color .
		';';
}

$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '}';

/* Mobile */
$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';

$uplifters_site_builder_blocks_css .=
	'display:inline-block!important;' .
	'width:auto!important;' .
	'min-width:0!important;' .
	'max-width:max-content!important;' .
	'vertical-align:top!important;';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-page-position-justify:' .
	uplifters_site_builder_blocks_page_nav_position_justify(
		$uplifters_site_builder_blocks_mobile_position
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-bg:' .
	(
		$uplifters_site_builder_blocks_mobile_hover_bg
			? $uplifters_site_builder_blocks_mobile_hover_bg
			: 'transparent'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hover-text:' .
	(
		$uplifters_site_builder_blocks_mobile_hover_text
			? $uplifters_site_builder_blocks_mobile_hover_text
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-active-text:' .
	(
		$uplifters_site_builder_blocks_mobile_active_text
			? $uplifters_site_builder_blocks_mobile_active_text
			: '#dc2626'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-color:' .
	(
		$uplifters_site_builder_blocks_mobile_title_color
			? $uplifters_site_builder_blocks_mobile_title_color
			: 'inherit'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-title-font-family:' .
	$uplifters_site_builder_blocks_mobile_font_family .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-bg:' .
	(
		$uplifters_site_builder_blocks_mobile_hamburger_bg
			? $uplifters_site_builder_blocks_mobile_hamburger_bg
			: '#ffffff'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'--uplifters-site-builder-blocks-hamburger-color:' .
	(
		$uplifters_site_builder_blocks_mobile_hamburger_color
			? $uplifters_site_builder_blocks_mobile_hamburger_color
			: '#334155'
	) .
	';';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-desktop-shell{' .
	'display:none!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-shell{' .
	'display:inline-flex!important;' .
	'width:auto!important;' .
	'min-width:0!important;' .
	'max-width:max-content!important;' .
	'align-items:center!important;' .
	'justify-content:flex-start!important;' .
	'position:static!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-list{' .
	'flex-direction:column!important;' .
	'align-items:stretch!important;' .
	'justify-content:flex-start!important;' .
	'gap:.5rem!important;' .
	'width:100%!important;' .
	'max-width:100%!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-list>li{' .
	'width:100%!important;' .
	'flex:0 0 auto!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-item{' .
	'display:block!important;' .
	'width:100%!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-title{' .
	'display:block!important;' .
	'width:100%!important;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .' . $uplifters_site_builder_blocks_title_class . '{';

$uplifters_site_builder_blocks_css .=
	'padding-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_padding,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_padding,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_padding,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'padding-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_padding,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-top:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_margin,
		'top'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-right:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_margin,
		'right'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-bottom:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_margin,
		'bottom'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'margin-left:' .
	uplifters_site_builder_blocks_page_nav_box_value(
		$uplifters_site_builder_blocks_mobile_margin,
		'left'
	) .
	';';

$uplifters_site_builder_blocks_css .=
	'font-size:' .
	$uplifters_site_builder_blocks_mobile_font_size .
	';';

$uplifters_site_builder_blocks_css .=
	'font-family:' .
	$uplifters_site_builder_blocks_mobile_font_family .
	'!important;';

if ( $uplifters_site_builder_blocks_mobile_title_bg ) {
	$uplifters_site_builder_blocks_css .=
		'background-color:' .
		$uplifters_site_builder_blocks_mobile_title_bg .
		';';
}

if ( $uplifters_site_builder_blocks_mobile_title_color ) {
	$uplifters_site_builder_blocks_css .=
		'color:' .
		$uplifters_site_builder_blocks_mobile_title_color .
		';';
}

$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-layer{' .
	'position:fixed;' .
	'inset:0;' .
	'z-index:99999;' .
	'display:block;' .
	'pointer-events:none;' .
	'visibility:hidden;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-layer.is-open{' .
	'pointer-events:auto;' .
	'visibility:visible;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-backdrop{' .
	'position:fixed;' .
	'inset:0;' .
	'z-index:1;' .
	'display:block;' .
	'width:100%;' .
	'height:100%;' .
	'border:0;' .
	'padding:0;' .
	'background:rgba(15,23,42,0);' .
	'opacity:0;' .
	'transition:' .
	'opacity .25s ease,' .
	'background-color .25s ease;' .
	'cursor:pointer;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-layer.is-open ' .
	'.uplifters-site-builder-blocks-page-menu-backdrop{' .
	'opacity:1;' .
	'background:rgba(15,23,42,.45);' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-panel{' .
	'position:fixed;' .
	'top:0;' .
	'left:0;' .
	'z-index:2;' .
	'width:min(82vw,340px);' .
	'max-width:340px;' .
	'height:100vh;' .
	'height:100dvh;' .
	'background:#ffffff;' .
	'transform:translateX(-105%);' .
	'transition:transform .28s ease;' .
	'box-shadow:16px 0 36px rgba(15,23,42,.22);' .
	'overflow-y:auto;' .
	'padding:1rem;' .
	'border-right:1px solid rgba(148,163,184,.35);' .
	'border-radius:0;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-mobile-layer.is-open ' .
	'.uplifters-site-builder-blocks-page-menu-panel{' .
	'transform:translateX(0);' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-panel-header{' .
	'display:flex;' .
	'align-items:center;' .
	'justify-content:space-between;' .
	'gap:12px;' .
	'margin-bottom:12px;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'#' . $uplifters_site_builder_blocks_unique_id .
	' .uplifters-site-builder-blocks-page-menu-close-btn{' .
	'display:inline-flex;' .
	'align-items:center;' .
	'justify-content:center;' .
	'border:1px solid #cbd5e1;' .
	'background:#fff;' .
	'color:#0f172a;' .
	'border-radius:10px;' .
	'width:36px;' .
	'height:36px;' .
	'cursor:pointer;' .
	'font-size:22px;' .
	'line-height:1;' .
	'}';

$uplifters_site_builder_blocks_css .=
	'body.uplifters-site-builder-blocks-page-menu-lock-scroll{' .
	'overflow:hidden;' .
	'}';
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

<div
	id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>"
	class="uplifters-site-builder-blocks-fse-page-menu"
>
	<div class="uplifters-site-builder-blocks-page-menu-desktop-shell">
		<?php
		echo wp_kses( $uplifters_site_builder_blocks_list_html, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
		?>
	</div>

	<div class="uplifters-site-builder-blocks-page-menu-mobile-shell">
		<button
			type="button"
			class="uplifters-site-builder-blocks-page-menu-mobile-trigger"
			aria-expanded="false"
			aria-controls="<?php echo esc_attr( $uplifters_site_builder_blocks_panel_id ); ?>"
			aria-label="<?php echo esc_attr__( 'Open menu', 'uplifters-site-builder-blocks' ); ?>"
		>
			<span
				class="uplifters-site-builder-blocks-page-menu-hamburger"
				aria-hidden="true"
			>
				<span></span>
				<span></span>
				<span></span>
			</span>
		</button>

		<div
			id="<?php echo esc_attr( $uplifters_site_builder_blocks_panel_id ); ?>"
			class="uplifters-site-builder-blocks-page-menu-mobile-layer"
		>
			<button
				type="button"
				class="uplifters-site-builder-blocks-page-menu-backdrop"
				aria-label="<?php echo esc_attr__( 'Close menu', 'uplifters-site-builder-blocks' ); ?>"
			></button>

			<div
				class="uplifters-site-builder-blocks-page-menu-panel"
				role="dialog"
				aria-modal="true"
				aria-label="<?php echo esc_attr__( 'Pages menu', 'uplifters-site-builder-blocks' ); ?>"
			>
				<div class="uplifters-site-builder-blocks-page-menu-panel-header">
					<strong>
						<?php
						echo esc_html__( 'Pages', 'uplifters-site-builder-blocks' );
						?>
					</strong>

					<button
						type="button"
						class="uplifters-site-builder-blocks-page-menu-close-btn"
						aria-label="<?php echo esc_attr__( 'Close menu', 'uplifters-site-builder-blocks' ); ?>"
					>
						×
					</button>
				</div>

				<?php
				echo wp_kses( $uplifters_site_builder_blocks_list_html, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
				?>
			</div>
		</div>
	</div>
</div>
