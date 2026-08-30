<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS PostsSocialShare block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_responsive_value' ) ) {
	/**
	 * Get a responsive attribute value for a specific device,
	 * falling back through desktop → tablet → mobile.
	 */
	function uplifters_site_builder_blocks_posts_social_share_responsive_value(
		array  $attributes,
		string $key,
		string $device,
		       $fallback = ''
	) {
		if ( empty( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			return $fallback;
		}
		$obj = $attributes[ $key ];
		if ( isset( $obj[ $device ] ) && '' !== (string) $obj[ $device ] ) {
			return $obj[ $device ];
		}
		if ( isset( $obj['desktop'] ) && '' !== (string) $obj['desktop'] ) {
			return $obj['desktop'];
		}
		if ( isset( $obj['tablet'] ) && '' !== (string) $obj['tablet'] ) {
			return $obj['tablet'];
		}
		if ( isset( $obj['mobile'] ) && '' !== (string) $obj['mobile'] ) {
			return $obj['mobile'];
		}
		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_sanitize_position' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_sanitize_position( string $value ): string {
		return in_array( $value, [ 'start', 'center', 'end' ], true ) ? $value : 'start';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_positive_int' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_positive_int( $value, int $fallback ): int {
		$int = (int) $value;
		return $int > 0 ? $int : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_is_enabled' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_is_enabled( array $attributes, string $key ): bool {
		return isset( $attributes[ $key ] ) && true === $attributes[ $key ];
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_sanitize_variant' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_sanitize_variant( string $value ): string {
		$valid = [ 'solid', 'outline', 'rounded', 'square', 'black', 'white', 'outline-black', 'outline-white' ];
		return in_array( $value, $valid, true ) ? $value : 'solid';
	}
}

/**
 * Build the CSS rules for one variant on one device scope.
 *
 * @param string $id             CSS selector prefix, e.g. '#uplifters-site-builder-blocks-posts-social-share-1'
 * @param string $scope_class    Extra class that scopes these rules, e.g. '.uplifters-site-builder-blocks-posts-social-share-d'
 * @param string $variant        One of the 8 variant slugs
 * @param array  $platforms      Full platforms config array
 * @param array  $attributes     Block attributes (used to check enabled platforms)
 * @return string CSS string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_variant_css' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_variant_css(
		string $id,
		string $scope_class,
		string $variant,
		array  $platforms,
		array  $attributes
	): string {
		$css = '';

		// border-radius: square → 6px, everything else → 50%
		$radius = ( 'square' === $variant ) ? '6px' : '50%';
		$css   .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link{border-radius:{$radius};}";

		// Determine if this is a b/w variant (all platforms share one color set)
		$bw_variants = [ 'black', 'white', 'outline-black', 'outline-white' ];
		$is_bw       = in_array( $variant, $bw_variants, true );

		if ( $is_bw ) {
			switch ( $variant ) {
				case 'black':
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link{background-color:#000000;}";
					// Icon color handled via SVG fill/stroke in markup (set per platform below)
					break;
				case 'white':
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link{background-color:#ffffff;border:1.5px solid #e0e0e0;}";
					break;
				case 'outline-black':
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link{background-color:transparent;border:2px solid #000000;}";
					break;
				case 'outline-white':
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link{background-color:transparent;border:2px solid #ffffff;}";
					break;
			}
		} else {
			// Per-platform brand colors
			foreach ( $platforms as $key => $config ) {
				if ( ! uplifters_site_builder_blocks_posts_social_share_is_enabled( $attributes, $key ) ) {
					continue;
				}
				$css_key = strtolower( $key );
				$color   = esc_attr( $config['color'] );

				if ( 'outline' === $variant ) {
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link-{$css_key}{background-color:transparent;border:2px solid {$color};}";
				} else {
					// solid / rounded / square
					$css .= "{$id}{$scope_class} .uplifters-site-builder-blocks-posts-social-share-link-{$css_key}{background-color:{$color};}";
				}
			}
		}

		return $css;
	}
}

/**
 * Build the SVG inner markup for one platform under a given variant.
 * Icon colors differ per variant (white icons on dark bg, dark icons on white bg, etc.)
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_posts_social_share_svg_inner' ) ) {
	function uplifters_site_builder_blocks_posts_social_share_svg_inner( string $key, array $config, string $variant ): string {
		$bw_variants = [ 'black', 'white', 'outline-black', 'outline-white' ];
		$is_bw       = in_array( $variant, $bw_variants, true );

		// Determine icon (path/stroke) color
		if ( $is_bw ) {
			switch ( $variant ) {
				case 'black':
					$icon_color = '#ffffff';
					break;
				case 'white':
					$icon_color = '#000000';
					break;
				case 'outline-black':
					$icon_color = '#000000';
					break;
				case 'outline-white':
					$icon_color = '#ffffff';
					break;
				default:
					$icon_color = '#ffffff';
			}
		} elseif ( 'outline' === $variant ) {
			$icon_color = esc_attr( $config['color'] );
		} else {
			// solid / rounded / square — white icons on brand bg
			$icon_color = '#ffffff';
		}

		if ( 'reddit' === $key ) {
			// Reddit SVG has its own background circle — we must colour it correctly.
			if ( $is_bw ) {
				switch ( $variant ) {
					case 'black':
						$circle_color = '#000000';
						$face_color   = '#ffffff';
						break;
					case 'white':
						$circle_color = '#ffffff';
						$face_color   = '#000000';
						break;
					case 'outline-black':
						// transparent bg, so circle = black, face = white
						$circle_color = '#000000';
						$face_color   = '#ffffff';
						break;
					case 'outline-white':
						// transparent bg, so circle = white, face = black
						$circle_color = '#ffffff';
						$face_color   = '#000000';
						break;
					default:
						$circle_color = '#000000';
						$face_color   = '#ffffff';
				}
			} else {
				$circle_color = esc_attr( $config['color'] );
				$face_color   = '#ffffff';
			}
			return str_replace(
				[ '{BG_COLOR}',   '{ICON_COLOR}' ],
				[ esc_attr( $circle_color ), esc_attr( $face_color ) ],
				$config['svg_fill']
			);
		}

		// Standard fill + stroke icons
		return str_replace(
			'{COLOR}',
			esc_attr( $icon_color ),
			$config['svg_fill'] . $config['svg_stroke']
		);
	}
}

// ─── Platform config ──────────────────────────────────────────────────────────

$uplifters_site_builder_blocks_platforms = [
	'facebook' => [
		'label'      => 'Facebook',
		'color'      => '#1877F2',
		'url'        => 'https://www.facebook.com/sharer/sharer.php?u={URL}',
		'svg_fill'   => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="{COLOR}"/>',
		'svg_stroke' => '',
	],
	'x' => [
		'label'      => 'X',
		'color'      => '#000000',
		'url'        => 'https://x.com/intent/tweet?url={URL}&text={TITLE}',
		'svg_fill'   => '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="{COLOR}"/>',
		'svg_stroke' => '',
	],
	'whatsapp' => [
		'label'      => 'WhatsApp',
		'color'      => '#25D366',
		'url'        => 'https://wa.me/?text={TITLE}%20{URL}',
		'svg_fill'   => '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" fill="{COLOR}"/>',
		'svg_stroke' => '',
	],
	'email' => [
		'label'      => 'Email',
		'color'      => '#EA4335',
		'url'        => 'mailto:?subject={TITLE}&body={URL}',
		'svg_fill'   => '',
		'svg_stroke' => '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="{COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" fill="none" stroke="{COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
	],
	'reddit' => [
		'label'      => 'Reddit',
		'color'      => '#FF4500',
		'url'        => 'https://www.reddit.com/submit?url={URL}&title={TITLE}',
		'svg_fill'   => '<circle cx="12" cy="12" r="10" fill="{BG_COLOR}"/><path d="M14.5 9A1.5 1.5 0 1 0 16 10.5 1.5 1.5 0 0 0 14.5 9zM9.5 9A1.5 1.5 0 1 0 11 10.5 1.5 1.5 0 0 0 9.5 9zM12 18a6 6 0 0 0 5-2.69A4 4 0 0 1 12 16a4 4 0 0 1-5-.69A6 6 0 0 0 12 18z" fill="{ICON_COLOR}"/><circle cx="20" cy="9" r="2" fill="{BG_COLOR}"/>',
		'svg_stroke' => '',
	],
	'copyLink' => [
		'label'      => 'Copy Link',
		'color'      => '#6B7280',
		'url'        => '',
		'svg_fill'   => '',
		'svg_stroke' => '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="{COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="{COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
	],
];

// ─── Attribute resolution ─────────────────────────────────────────────────────

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-posts-social-share-' );

// Resolve per-device variants (with fallback cascade)
$uplifters_site_builder_blocks_d_variant = uplifters_site_builder_blocks_posts_social_share_sanitize_variant( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'variant', 'desktop', 'solid' ) );
$uplifters_site_builder_blocks_t_variant = uplifters_site_builder_blocks_posts_social_share_sanitize_variant( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'variant', 'tablet',  $uplifters_site_builder_blocks_d_variant ) );
$uplifters_site_builder_blocks_m_variant = uplifters_site_builder_blocks_posts_social_share_sanitize_variant( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'variant', 'mobile',  $uplifters_site_builder_blocks_d_variant ) );

$uplifters_site_builder_blocks_open_new_tab = isset( $attributes['openInNewTab'] ) && true === $attributes['openInNewTab'];

// Per-device layout values
$uplifters_site_builder_blocks_d_position = uplifters_site_builder_blocks_posts_social_share_sanitize_position( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'position',   'desktop', 'start' ) );
$uplifters_site_builder_blocks_d_size     = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconSize',   'desktop', 50  ), 50  );
$uplifters_site_builder_blocks_d_gap      = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconGap',    'desktop', 8   ), 8   );
$uplifters_site_builder_blocks_d_padding  = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxPadding', 'desktop', 16  ), 16  );
$uplifters_site_builder_blocks_d_margin   = (int) uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxMargin', 'desktop', 0 );

$uplifters_site_builder_blocks_t_position = uplifters_site_builder_blocks_posts_social_share_sanitize_position( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'position',   'tablet', $uplifters_site_builder_blocks_d_position ) );
$uplifters_site_builder_blocks_t_size     = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconSize',   'tablet', $uplifters_site_builder_blocks_d_size    ), $uplifters_site_builder_blocks_d_size    );
$uplifters_site_builder_blocks_t_gap      = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconGap',    'tablet', $uplifters_site_builder_blocks_d_gap     ), $uplifters_site_builder_blocks_d_gap     );
$uplifters_site_builder_blocks_t_padding  = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxPadding', 'tablet', $uplifters_site_builder_blocks_d_padding ), $uplifters_site_builder_blocks_d_padding );
$uplifters_site_builder_blocks_t_margin   = (int) uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxMargin', 'tablet', $uplifters_site_builder_blocks_d_margin );

$uplifters_site_builder_blocks_m_position = uplifters_site_builder_blocks_posts_social_share_sanitize_position( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'position',   'mobile', $uplifters_site_builder_blocks_d_position ) );
$uplifters_site_builder_blocks_m_size     = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconSize',   'mobile', $uplifters_site_builder_blocks_d_size    ), $uplifters_site_builder_blocks_d_size    );
$uplifters_site_builder_blocks_m_gap      = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'iconGap',    'mobile', $uplifters_site_builder_blocks_d_gap     ), $uplifters_site_builder_blocks_d_gap     );
$uplifters_site_builder_blocks_m_padding  = uplifters_site_builder_blocks_posts_social_share_positive_int( uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxPadding', 'mobile', $uplifters_site_builder_blocks_d_padding ), $uplifters_site_builder_blocks_d_padding );
$uplifters_site_builder_blocks_m_margin   = (int) uplifters_site_builder_blocks_posts_social_share_responsive_value( $attributes, 'boxMargin', 'mobile', $uplifters_site_builder_blocks_d_margin );

$uplifters_site_builder_blocks_d_svg = (int) round( $uplifters_site_builder_blocks_d_size * 0.5 );
$uplifters_site_builder_blocks_t_svg = (int) round( $uplifters_site_builder_blocks_t_size * 0.5 );
$uplifters_site_builder_blocks_m_svg = (int) round( $uplifters_site_builder_blocks_m_size * 0.5 );

$uplifters_site_builder_blocks_id = '#' . $uplifters_site_builder_blocks_unique_id;

// ─── CSS ──────────────────────────────────────────────────────────────────────

$uplifters_site_builder_blocks_css = '';

// ── Static base rules ──
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-wrapper{box-sizing:border-box;}';
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-list{display:flex;flex-wrap:wrap;list-style:none;margin:0;padding:0;}';
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-item{display:flex;}';
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-link{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;text-decoration:none!important;border:0;cursor:pointer;transition:transform 160ms ease,box-shadow 160ms ease;}';
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-link:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.18);}';
// .uplifters-site-builder-blocks-posts-social-share-svg-single: the SVG used when all three device variants are identical (single output).
// Deliberately NOT targeting .uplifters-site-builder-blocks-posts-social-share-svg-d/t/m here — those must stay hidden until the
// per-breakpoint show/hide block fires. A generic svg{display:block} would override
// their inline style="display:none" and break the multi-SVG switching.
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-svg-single{display:block;overflow:visible;}';
$uplifters_site_builder_blocks_css .= '.uplifters-site-builder-blocks-posts-social-share-svg-d,.uplifters-site-builder-blocks-posts-social-share-svg-t,.uplifters-site-builder-blocks-posts-social-share-svg-m{overflow:visible;}';
$uplifters_site_builder_blocks_css .= '@media(prefers-reduced-motion:reduce){.uplifters-site-builder-blocks-posts-social-share-link{transition:none;}.uplifters-site-builder-blocks-posts-social-share-link:hover{transform:none;box-shadow:none;}}';

// Shared SVG size selector — targets both single and multi-SVG elements.
// Written once to avoid repetition; sizing applies to whichever SVG is visible.
$uplifters_site_builder_blocks_svg_sel = "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-svg-single,$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-svg-d,$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-svg-t,$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-svg-m";

// ── Desktop layout (default, no media query) ──
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-list{justify-content:{$uplifters_site_builder_blocks_d_position};gap:{$uplifters_site_builder_blocks_d_gap}px;padding:{$uplifters_site_builder_blocks_d_padding}px;margin:{$uplifters_site_builder_blocks_d_margin}px;}";
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-link{width:{$uplifters_site_builder_blocks_d_size}px;height:{$uplifters_site_builder_blocks_d_size}px;}";
$uplifters_site_builder_blocks_css .= "{$uplifters_site_builder_blocks_svg_sel}{width:{$uplifters_site_builder_blocks_d_svg}px;height:{$uplifters_site_builder_blocks_d_svg}px;}";

// ── Desktop variant styles — scoped to .uplifters-site-builder-blocks-posts-social-share-d class ──
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_social_share_variant_css( $uplifters_site_builder_blocks_id, '.uplifters-site-builder-blocks-posts-social-share-d', $uplifters_site_builder_blocks_d_variant, $uplifters_site_builder_blocks_platforms, $attributes );

// ── Tablet layout ──
$uplifters_site_builder_blocks_css .= "@media(max-width:1024px){";
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-list{justify-content:{$uplifters_site_builder_blocks_t_position};gap:{$uplifters_site_builder_blocks_t_gap}px;padding:{$uplifters_site_builder_blocks_t_padding}px;margin:{$uplifters_site_builder_blocks_t_margin}px;}";
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-link{width:{$uplifters_site_builder_blocks_t_size}px;height:{$uplifters_site_builder_blocks_t_size}px;}";
$uplifters_site_builder_blocks_css .= "{$uplifters_site_builder_blocks_svg_sel}{width:{$uplifters_site_builder_blocks_t_svg}px;height:{$uplifters_site_builder_blocks_t_svg}px;}";
$uplifters_site_builder_blocks_css .= "}";

// ── Tablet variant styles — scoped to .uplifters-site-builder-blocks-posts-social-share-t class (active at ≤1024px) ──
$uplifters_site_builder_blocks_css .= "@media(max-width:1024px){";
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_social_share_variant_css( $uplifters_site_builder_blocks_id, '.uplifters-site-builder-blocks-posts-social-share-t', $uplifters_site_builder_blocks_t_variant, $uplifters_site_builder_blocks_platforms, $attributes );
$uplifters_site_builder_blocks_css .= "}";

// ── Mobile layout ──
$uplifters_site_builder_blocks_css .= "@media(max-width:767px){";
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-list{justify-content:{$uplifters_site_builder_blocks_m_position};gap:{$uplifters_site_builder_blocks_m_gap}px;padding:{$uplifters_site_builder_blocks_m_padding}px;margin:{$uplifters_site_builder_blocks_m_margin}px;}";
$uplifters_site_builder_blocks_css .= "$uplifters_site_builder_blocks_id .uplifters-site-builder-blocks-posts-social-share-link{width:{$uplifters_site_builder_blocks_m_size}px;height:{$uplifters_site_builder_blocks_m_size}px;}";
$uplifters_site_builder_blocks_css .= "{$uplifters_site_builder_blocks_svg_sel}{width:{$uplifters_site_builder_blocks_m_svg}px;height:{$uplifters_site_builder_blocks_m_svg}px;}";
$uplifters_site_builder_blocks_css .= "}";

// ── Mobile variant styles — scoped to .uplifters-site-builder-blocks-posts-social-share-m class (active at ≤767px) ──
$uplifters_site_builder_blocks_css .= "@media(max-width:767px){";
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_social_share_variant_css( $uplifters_site_builder_blocks_id, '.uplifters-site-builder-blocks-posts-social-share-m', $uplifters_site_builder_blocks_m_variant, $uplifters_site_builder_blocks_platforms, $attributes );
$uplifters_site_builder_blocks_css .= "}";

/*
 * How variant-per-device works on the frontend:
 *
 * The wrapper gets THREE variant classes: uplifters-site-builder-blocks-posts-social-share-d, uplifters-site-builder-blocks-posts-social-share-t, uplifters-site-builder-blocks-posts-social-share-m.
 * Each class has its own scoped CSS rules, gated behind the matching media query.
 * So at ≤767px only .uplifters-site-builder-blocks-posts-social-share-m rules apply, at 768–1024px only .uplifters-site-builder-blocks-posts-social-share-t rules
 * apply (because the desktop .uplifters-site-builder-blocks-posts-social-share-d rules have no media query but are
 * overridden by the higher-specificity .uplifters-site-builder-blocks-posts-social-share-t rules inside the media query),
 * and above 1024px only .uplifters-site-builder-blocks-posts-social-share-d rules apply.
 *
 * SVG icon markup: because icon COLOR can differ per variant and SVG paths use
 * inline fill/stroke attributes (not CSS), we output THREE sets of <use> or
 * hidden SVG containers — one per device — and show/hide them via CSS.
 */

?>
<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<?php
// Tracks whether any platform entered the multi-SVG branch.
// Set to true inside the else below; read after the closing </div>
// to decide whether to output the SVG show/hide <style> block.
$uplifters_site_builder_blocks_has_multi_svg = false;
?>

<div
	id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>"
	class="uplifters-site-builder-blocks-posts-social-share-wrapper uplifters-site-builder-blocks-posts-social-share-d uplifters-site-builder-blocks-posts-social-share-t uplifters-site-builder-blocks-posts-social-share-m"
>
	<ul class="uplifters-site-builder-blocks-posts-social-share-list">

		<?php foreach ( $uplifters_site_builder_blocks_platforms as $uplifters_site_builder_blocks_key => $uplifters_site_builder_blocks_config ) : ?>
			<?php if ( ! uplifters_site_builder_blocks_posts_social_share_is_enabled( $attributes, $uplifters_site_builder_blocks_key ) ) : continue; endif; ?>
			<?php
			$uplifters_site_builder_blocks_is_copy = 'copyLink' === $uplifters_site_builder_blocks_key;
			$uplifters_site_builder_blocks_css_key = strtolower( $uplifters_site_builder_blocks_key );

			$uplifters_site_builder_blocks_share_url = $uplifters_site_builder_blocks_is_copy
				? '#'
				: str_replace(
					[ '{URL}',                         '{TITLE}'                       ],
					[ rawurlencode( get_permalink() ), rawurlencode( get_the_title() ) ],
					$uplifters_site_builder_blocks_config['url']
				);

			// Build SVG inner markup for each device variant.
			// When all three are identical, one SVG is output (no hide/show needed).
			// When they differ, three SVGs are output — all hidden inline —
			// and $has_multi_svg is flagged so the CSS reveal block is emitted below.
			$uplifters_site_builder_blocks_svg_d = uplifters_site_builder_blocks_posts_social_share_svg_inner( $uplifters_site_builder_blocks_key, $uplifters_site_builder_blocks_config, $uplifters_site_builder_blocks_d_variant );
			$uplifters_site_builder_blocks_svg_t = uplifters_site_builder_blocks_posts_social_share_svg_inner( $uplifters_site_builder_blocks_key, $uplifters_site_builder_blocks_config, $uplifters_site_builder_blocks_t_variant );
			$uplifters_site_builder_blocks_svg_m = uplifters_site_builder_blocks_posts_social_share_svg_inner( $uplifters_site_builder_blocks_key, $uplifters_site_builder_blocks_config, $uplifters_site_builder_blocks_m_variant );
			?>
			<li class="uplifters-site-builder-blocks-posts-social-share-item">
				<a
					class="uplifters-site-builder-blocks-posts-social-share-link uplifters-site-builder-blocks-posts-social-share-link-<?php echo esc_attr( $uplifters_site_builder_blocks_css_key ); ?>"
					href="<?php echo esc_url( $uplifters_site_builder_blocks_share_url ); ?>"
					aria-label="<?php
					/* translators: %s: Social network name. */
					echo esc_attr( sprintf( __( 'Share on %s', 'uplifters-site-builder-blocks' ), $uplifters_site_builder_blocks_config['label'] ) );
					?>"
					<?php if ( $uplifters_site_builder_blocks_is_copy ) : ?>
						data-uplifters-site-builder-blocks-posts-social-share-copy-link="<?php echo esc_url( get_permalink() ); ?>"
					<?php else : ?>
						<?php if ( $uplifters_site_builder_blocks_open_new_tab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
					<?php endif; ?>
				>
					<?php
					// If all three variants produce identical SVG, output once — no JS/CSS needed.
					if ( $uplifters_site_builder_blocks_svg_d === $uplifters_site_builder_blocks_svg_t && $uplifters_site_builder_blocks_svg_t === $uplifters_site_builder_blocks_svg_m ) : ?>
						<svg class="uplifters-site-builder-blocks-posts-social-share-svg-single" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
							<?php echo wp_kses( $uplifters_site_builder_blocks_svg_d, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
						</svg>
					<?php else :
						// Variants differ across devices: output all three SVGs hidden.
						// CSS below reveals the correct one per breakpoint.
						$uplifters_site_builder_blocks_has_multi_svg = true;
					?>
						<svg class="uplifters-site-builder-blocks-posts-social-share-svg-d" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:none">
							<?php echo wp_kses( $uplifters_site_builder_blocks_svg_d, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
						</svg>
						<svg class="uplifters-site-builder-blocks-posts-social-share-svg-t" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:none">
							<?php echo wp_kses( $uplifters_site_builder_blocks_svg_t, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
						</svg>
						<svg class="uplifters-site-builder-blocks-posts-social-share-svg-m" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:none">
							<?php echo wp_kses( $uplifters_site_builder_blocks_svg_m, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
						</svg>
					<?php endif; ?>
				</a>
			</li>
		<?php endforeach; ?>

	</ul>
</div>

<?php
/*
 * ── SVG show/hide CSS ─────────────────────────────────────────────────────────
 *
 * When variants differ across devices, three SVG elements are output per icon
 * (all hidden via inline style="display:none"). We need CSS to reveal exactly
 * the right one at each breakpoint.
 *
 * This block runs whenever the else branch above was entered, i.e. whenever
 * $svg_d !== $svg_t OR $svg_t !== $svg_m for ANY platform. We track that with
 * $has_multi_svg, set inside the foreach loop above.
 *
 * CSS structure:
 *   Default (no media query) : show desktop SVG  (.uplifters-site-builder-blocks-posts-social-share-svg-d)
 *   ≤1024px                  : swap to tablet SVG (.uplifters-site-builder-blocks-posts-social-share-svg-t)
 *   ≤767px                   : swap to mobile SVG (.uplifters-site-builder-blocks-posts-social-share-svg-m)
 */
if ( $uplifters_site_builder_blocks_has_multi_svg ) :
?>
<?php ob_start(); ?>
/* Desktop: reveal desktop SVG — beats the inline style="display:none" */
#<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-posts-social-share-svg-d{display:block!important;}
/* Tablet ≤1024px: swap to tablet SVG */
@media(max-width:1024px){
	#<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-posts-social-share-svg-d{display:none!important;}
	#<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-posts-social-share-svg-t{display:block!important;}
}
/* Mobile ≤767px: swap to mobile SVG */
@media(max-width:767px){
	#<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-posts-social-share-svg-t{display:none!important;}
	#<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?> .uplifters-site-builder-blocks-posts-social-share-svg-m{display:block!important;}
}
<?php $uplifters_site_builder_blocks_multi_svg_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_multi_svg_css ); ?>
<?php endif; ?>
