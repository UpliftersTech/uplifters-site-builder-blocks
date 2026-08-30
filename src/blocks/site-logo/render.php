<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS Site Logo block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_site_logo_responsive_value' ) ) {
	function uplifters_site_builder_blocks_site_logo_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] ) {
				return $value[ $device ];
			}

			if ( isset( $value['desktop'] ) && '' !== $value['desktop'] ) {
				return $value['desktop'];
			}

			if ( isset( $value['tablet'] ) && '' !== $value['tablet'] ) {
				return $value['tablet'];
			}

			if ( isset( $value['mobile'] ) && '' !== $value['mobile'] ) {
				return $value['mobile'];
			}

			return $fallback;
		}

		if ( '' !== $value && null !== $value ) {
			return $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_site_logo_sanitize_number' ) ) {
	function uplifters_site_builder_blocks_site_logo_sanitize_number( $value, int $fallback = 0 ): int {
		if ( is_numeric( $value ) ) {
			return (int) $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_site_logo_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_site_logo_sanitize_color( $value ): string {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^var\(--[a-zA-Z0-9\-_]+\)$/', $value ) ) {
			return $value;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_site_logo_sanitize_position' ) ) {
	function uplifters_site_builder_blocks_site_logo_sanitize_position( $value ): string {
		$value   = (string) $value;
		$allowed = array( 'start', 'center', 'end', 'left', 'right' );

		return in_array( $value, $allowed, true ) ? $value : 'center';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_site_logo_justify_content' ) ) {
	function uplifters_site_builder_blocks_site_logo_justify_content( string $position ): string {
		if ( 'start' === $position || 'left' === $position ) {
			return 'flex-start';
		}

		if ( 'end' === $position || 'right' === $position ) {
			return 'flex-end';
		}

		return 'center';
	}
}

$uplifters_site_builder_blocks_logo_url  = isset( $attributes['logoUrl'] ) ? esc_url( $attributes['logoUrl'] ) : '';
$uplifters_site_builder_blocks_is_linked = array_key_exists( 'isLinked', $attributes ) ? (bool) $attributes['isLinked'] : true;

if ( '' === $uplifters_site_builder_blocks_logo_url ) {
	return;
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-site-logo-' );

$uplifters_site_builder_blocks_desktop_width = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoWidth', 'desktop', 80 ),
	80
);
$uplifters_site_builder_blocks_tablet_width = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoWidth', 'tablet', $uplifters_site_builder_blocks_desktop_width ),
	$uplifters_site_builder_blocks_desktop_width
);
$uplifters_site_builder_blocks_mobile_width = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoWidth', 'mobile', $uplifters_site_builder_blocks_desktop_width ),
	$uplifters_site_builder_blocks_desktop_width
);

$uplifters_site_builder_blocks_desktop_height = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoHeight', 'desktop', 80 ),
	80
);
$uplifters_site_builder_blocks_tablet_height = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoHeight', 'tablet', $uplifters_site_builder_blocks_desktop_height ),
	$uplifters_site_builder_blocks_desktop_height
);
$uplifters_site_builder_blocks_mobile_height = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'logoHeight', 'mobile', $uplifters_site_builder_blocks_desktop_height ),
	$uplifters_site_builder_blocks_desktop_height
);

$uplifters_site_builder_blocks_desktop_padding = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'padding', 'desktop', 0 ),
	0
);
$uplifters_site_builder_blocks_tablet_padding = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'padding', 'tablet', $uplifters_site_builder_blocks_desktop_padding ),
	$uplifters_site_builder_blocks_desktop_padding
);
$uplifters_site_builder_blocks_mobile_padding = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'padding', 'mobile', $uplifters_site_builder_blocks_desktop_padding ),
	$uplifters_site_builder_blocks_desktop_padding
);

$uplifters_site_builder_blocks_desktop_margin = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'margin', 'desktop', 0 ),
	0
);
$uplifters_site_builder_blocks_tablet_margin = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'margin', 'tablet', $uplifters_site_builder_blocks_desktop_margin ),
	$uplifters_site_builder_blocks_desktop_margin
);
$uplifters_site_builder_blocks_mobile_margin = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'margin', 'mobile', $uplifters_site_builder_blocks_desktop_margin ),
	$uplifters_site_builder_blocks_desktop_margin
);

$uplifters_site_builder_blocks_desktop_radius = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'borderRadius', 'desktop', 0 ),
	0
);
$uplifters_site_builder_blocks_tablet_radius = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'borderRadius', 'tablet', $uplifters_site_builder_blocks_desktop_radius ),
	$uplifters_site_builder_blocks_desktop_radius
);
$uplifters_site_builder_blocks_mobile_radius = uplifters_site_builder_blocks_site_logo_sanitize_number(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'borderRadius', 'mobile', $uplifters_site_builder_blocks_desktop_radius ),
	$uplifters_site_builder_blocks_desktop_radius
);

$uplifters_site_builder_blocks_desktop_bg = uplifters_site_builder_blocks_site_logo_sanitize_color(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'backgroundColor', 'desktop', '' )
);
$uplifters_site_builder_blocks_tablet_bg = uplifters_site_builder_blocks_site_logo_sanitize_color(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'backgroundColor', 'tablet', $uplifters_site_builder_blocks_desktop_bg )
);
$uplifters_site_builder_blocks_mobile_bg = uplifters_site_builder_blocks_site_logo_sanitize_color(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'backgroundColor', 'mobile', $uplifters_site_builder_blocks_desktop_bg )
);

$uplifters_site_builder_blocks_desktop_position = uplifters_site_builder_blocks_site_logo_sanitize_position(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'position', 'desktop', 'center' )
);
$uplifters_site_builder_blocks_tablet_position = uplifters_site_builder_blocks_site_logo_sanitize_position(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'position', 'tablet', $uplifters_site_builder_blocks_desktop_position )
);
$uplifters_site_builder_blocks_mobile_position = uplifters_site_builder_blocks_site_logo_sanitize_position(
	uplifters_site_builder_blocks_site_logo_responsive_value( $attributes, 'position', 'mobile', $uplifters_site_builder_blocks_desktop_position )
);

$uplifters_site_builder_blocks_desktop_justify = uplifters_site_builder_blocks_site_logo_justify_content( $uplifters_site_builder_blocks_desktop_position );
$uplifters_site_builder_blocks_tablet_justify  = uplifters_site_builder_blocks_site_logo_justify_content( $uplifters_site_builder_blocks_tablet_position );
$uplifters_site_builder_blocks_mobile_justify  = uplifters_site_builder_blocks_site_logo_justify_content( $uplifters_site_builder_blocks_mobile_position );

$uplifters_site_builder_blocks_css  = '';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{display:flex;justify-content:' . $uplifters_site_builder_blocks_desktop_justify . ';width:100%;}';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-site-logo-wrapper{';
$uplifters_site_builder_blocks_css .= 'width:' . $uplifters_site_builder_blocks_desktop_width . 'px;';
$uplifters_site_builder_blocks_css .= 'height:' . $uplifters_site_builder_blocks_desktop_height . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_desktop_padding . 'px;';
$uplifters_site_builder_blocks_css .= 'margin:' . $uplifters_site_builder_blocks_desktop_margin . 'px;';
$uplifters_site_builder_blocks_css .= 'border-radius:' . $uplifters_site_builder_blocks_desktop_radius . 'px;';
$uplifters_site_builder_blocks_css .= 'display:inline-block;';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';

if ( 0 < $uplifters_site_builder_blocks_desktop_radius ) {
	$uplifters_site_builder_blocks_css .= 'overflow:hidden;';
}

if ( '' !== $uplifters_site_builder_blocks_desktop_bg ) {
	$uplifters_site_builder_blocks_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_bg . ';';
}

$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-site-logo-link{display:block;width:100%;height:100%;}';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-site-logo-image{width:100%;height:100%;object-fit:contain;display:block;}';

$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{justify-content:' . $uplifters_site_builder_blocks_tablet_justify . ';}';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-site-logo-wrapper{';
$uplifters_site_builder_blocks_css .= 'width:' . $uplifters_site_builder_blocks_tablet_width . 'px;';
$uplifters_site_builder_blocks_css .= 'height:' . $uplifters_site_builder_blocks_tablet_height . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_tablet_padding . 'px;';
$uplifters_site_builder_blocks_css .= 'margin:' . $uplifters_site_builder_blocks_tablet_margin . 'px;';
$uplifters_site_builder_blocks_css .= 'border-radius:' . $uplifters_site_builder_blocks_tablet_radius . 'px;';

if ( 0 < $uplifters_site_builder_blocks_tablet_radius ) {
	$uplifters_site_builder_blocks_css .= 'overflow:hidden;';
} else {
	$uplifters_site_builder_blocks_css .= 'overflow:visible;';
}

if ( '' !== $uplifters_site_builder_blocks_tablet_bg ) {
	$uplifters_site_builder_blocks_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_bg . ';';
} else {
	$uplifters_site_builder_blocks_css .= 'background-color:transparent;';
}

$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{justify-content:' . $uplifters_site_builder_blocks_mobile_justify . ';}';
$uplifters_site_builder_blocks_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-site-logo-wrapper{';
$uplifters_site_builder_blocks_css .= 'width:' . $uplifters_site_builder_blocks_mobile_width . 'px;';
$uplifters_site_builder_blocks_css .= 'height:' . $uplifters_site_builder_blocks_mobile_height . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_mobile_padding . 'px;';
$uplifters_site_builder_blocks_css .= 'margin:' . $uplifters_site_builder_blocks_mobile_margin . 'px;';
$uplifters_site_builder_blocks_css .= 'border-radius:' . $uplifters_site_builder_blocks_mobile_radius . 'px;';

if ( 0 < $uplifters_site_builder_blocks_mobile_radius ) {
	$uplifters_site_builder_blocks_css .= 'overflow:hidden;';
} else {
	$uplifters_site_builder_blocks_css .= 'overflow:visible;';
}

if ( '' !== $uplifters_site_builder_blocks_mobile_bg ) {
	$uplifters_site_builder_blocks_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_bg . ';';
} else {
	$uplifters_site_builder_blocks_css .= 'background-color:transparent;';
}

$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_home_url = home_url( '/' );
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

<div id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>" class="uplifters-site-builder-blocks-site-logo">
	<div class="uplifters-site-builder-blocks-site-logo-wrapper">
		<?php if ( $uplifters_site_builder_blocks_is_linked ) : ?>
			<a class="uplifters-site-builder-blocks-site-logo-link" href="<?php echo esc_url( $uplifters_site_builder_blocks_home_url ); ?>">
				<img class="uplifters-site-builder-blocks-site-logo-image" src="<?php echo esc_url( $uplifters_site_builder_blocks_logo_url ); ?>" alt="<?php echo esc_attr__( 'Website Logo', 'uplifters-site-builder-blocks' ); ?>" />
			</a>
		<?php else : ?>
			<img class="uplifters-site-builder-blocks-site-logo-image" src="<?php echo esc_url( $uplifters_site_builder_blocks_logo_url ); ?>" alt="<?php echo esc_attr__( 'Website Logo', 'uplifters-site-builder-blocks' ); ?>" />
		<?php endif; ?>
	</div>
</div>
