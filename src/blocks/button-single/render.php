<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS Button block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_button_single_responsive_value' ) ) {
	function uplifters_site_builder_blocks_button_single_responsive_value(
		array $attributes,
		string $key,
		string $device,
		string $fallback = ''
	): string {
		if (
			empty( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if (
			isset( $value[ $device ] ) &&
			'' !== $value[ $device ]
		) {
			return (string) $value[ $device ];
		}

		if (
			isset( $value['desktop'] ) &&
			'' !== $value['desktop']
		) {
			return (string) $value['desktop'];
		}

		if (
			isset( $value['tablet'] ) &&
			'' !== $value['tablet']
		) {
			return (string) $value['tablet'];
		}

		if (
			isset( $value['mobile'] ) &&
			'' !== $value['mobile']
		) {
			return (string) $value['mobile'];
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_button_single_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_button_single_sanitize_css_value(
		string $value
	): string {
		$value = wp_strip_all_tags( $value );

		$value = str_replace(
			array( '<', '>', '{', '}', ';' ),
			'',
			$value
		);

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_button_single_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_button_single_sanitize_color(
		string $value
	): string {
		$value = trim( $value );

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

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_button_single_sanitize_align' ) ) {
	function uplifters_site_builder_blocks_button_single_sanitize_align(
		string $value
	): string {
		$allowed = array(
			'left',
			'center',
			'right',
		);

		return in_array( $value, $allowed, true )
			? $value
			: 'left';
	}
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-button-single-' );

$uplifters_site_builder_blocks_url = isset( $attributes['url'] )
	? esc_url( $attributes['url'] )
	: '#';

$uplifters_site_builder_blocks_open_in_new_tab = ! empty(
	$attributes['openInNewTab']
);

$uplifters_site_builder_blocks_desktop_text = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'text',
	'desktop',
	'Click Me'
);

$uplifters_site_builder_blocks_tablet_text = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'text',
	'tablet',
	$uplifters_site_builder_blocks_desktop_text
);

$uplifters_site_builder_blocks_mobile_text = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'text',
	'mobile',
	$uplifters_site_builder_blocks_desktop_text
);

$uplifters_site_builder_blocks_desktop_align = uplifters_site_builder_blocks_button_single_sanitize_align(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'alignment',
		'desktop',
		'left'
	)
);

$uplifters_site_builder_blocks_tablet_align = uplifters_site_builder_blocks_button_single_sanitize_align(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'alignment',
		'tablet',
		$uplifters_site_builder_blocks_desktop_align
	)
);

$uplifters_site_builder_blocks_mobile_align = uplifters_site_builder_blocks_button_single_sanitize_align(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'alignment',
		'mobile',
		$uplifters_site_builder_blocks_desktop_align
	)
);

$uplifters_site_builder_blocks_desktop_font_family_key = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'fontFamily',
	'desktop',
	'default'
);

$uplifters_site_builder_blocks_tablet_font_family_key = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'fontFamily',
	'tablet',
	'default'
);

$uplifters_site_builder_blocks_mobile_font_family_key = uplifters_site_builder_blocks_button_single_responsive_value(
	$attributes,
	'fontFamily',
	'mobile',
	'default'
);

$uplifters_site_builder_blocks_desktop_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_tablet_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_mobile_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_font_size = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'fontSize',
		'desktop',
		'16px'
	)
);

$uplifters_site_builder_blocks_tablet_font_size = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'fontSize',
		'tablet',
		$uplifters_site_builder_blocks_desktop_font_size
	)
);

$uplifters_site_builder_blocks_mobile_font_size = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'fontSize',
		'mobile',
		$uplifters_site_builder_blocks_desktop_font_size
	)
);

$uplifters_site_builder_blocks_desktop_padding = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'padding',
		'desktop',
		'14px 24px'
	)
);

$uplifters_site_builder_blocks_tablet_padding = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'padding',
		'tablet',
		$uplifters_site_builder_blocks_desktop_padding
	)
);

$uplifters_site_builder_blocks_mobile_padding = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'padding',
		'mobile',
		$uplifters_site_builder_blocks_desktop_padding
	)
);

$uplifters_site_builder_blocks_desktop_radius = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'borderRadius',
		'desktop',
		'8px'
	)
);

$uplifters_site_builder_blocks_tablet_radius = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'borderRadius',
		'tablet',
		$uplifters_site_builder_blocks_desktop_radius
	)
);

$uplifters_site_builder_blocks_mobile_radius = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'borderRadius',
		'mobile',
		$uplifters_site_builder_blocks_desktop_radius
	)
);

$uplifters_site_builder_blocks_desktop_width = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'width',
		'desktop',
		'auto'
	)
);

$uplifters_site_builder_blocks_tablet_width = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'width',
		'tablet',
		$uplifters_site_builder_blocks_desktop_width
	)
);

$uplifters_site_builder_blocks_mobile_width = uplifters_site_builder_blocks_button_single_sanitize_css_value(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'width',
		'mobile',
		$uplifters_site_builder_blocks_desktop_width
	)
);

$uplifters_site_builder_blocks_desktop_bg = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		'#111827'
	)
);

$uplifters_site_builder_blocks_tablet_bg = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_bg
	)
);

$uplifters_site_builder_blocks_mobile_bg = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_desktop_bg
	)
);

$uplifters_site_builder_blocks_desktop_color = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'textColor',
		'desktop',
		'#ffffff'
	)
);

$uplifters_site_builder_blocks_tablet_color = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'textColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_color
	)
);

$uplifters_site_builder_blocks_mobile_color = uplifters_site_builder_blocks_button_single_sanitize_color(
	uplifters_site_builder_blocks_button_single_responsive_value(
		$attributes,
		'textColor',
		'mobile',
		$uplifters_site_builder_blocks_desktop_color
	)
);

$uplifters_site_builder_blocks_static_css  = '';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-wrapper{';
$uplifters_site_builder_blocks_static_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single{';
$uplifters_site_builder_blocks_static_css .= 'display:inline-flex;';
$uplifters_site_builder_blocks_static_css .= 'align-items:center;';
$uplifters_site_builder_blocks_static_css .= 'justify-content:center;';
$uplifters_site_builder_blocks_static_css .= 'border:0;';
$uplifters_site_builder_blocks_static_css .= 'text-decoration:none!important;';
$uplifters_site_builder_blocks_static_css .= 'line-height:1.2;';
$uplifters_site_builder_blocks_static_css .= 'font-weight:600;';
$uplifters_site_builder_blocks_static_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_static_css .= 'cursor:pointer;';
$uplifters_site_builder_blocks_static_css .= 'transition:transform 160ms ease,box-shadow 160ms ease;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single:hover{';
$uplifters_site_builder_blocks_static_css .= 'transform:translateY(-1px);';
$uplifters_site_builder_blocks_static_css .= 'box-shadow:0 8px 20px rgba(0,0,0,0.18);';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-tablet,';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-mobile{';
$uplifters_site_builder_blocks_static_css .= 'display:none;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-desktop,';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-mobile{';
$uplifters_site_builder_blocks_static_css .= 'display:none;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-tablet{';
$uplifters_site_builder_blocks_static_css .= 'display:inline;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-desktop,';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-tablet{';
$uplifters_site_builder_blocks_static_css .= 'display:none;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single-label-mobile{';
$uplifters_site_builder_blocks_static_css .= 'display:inline;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '@media (prefers-reduced-motion:reduce){';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single{';
$uplifters_site_builder_blocks_static_css .= 'transition:none;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-button-single:hover{';
$uplifters_site_builder_blocks_static_css .= 'transform:none;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_dynamic_css  = '';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'text-align:' . $uplifters_site_builder_blocks_desktop_align . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-button-single{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_desktop_font_family . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . $uplifters_site_builder_blocks_desktop_font_size . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_desktop_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_desktop_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_desktop_width . ';';

if ( $uplifters_site_builder_blocks_desktop_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_bg . ';';
}

if ( $uplifters_site_builder_blocks_desktop_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_desktop_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'text-align:' . $uplifters_site_builder_blocks_tablet_align . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-button-single{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_tablet_font_family . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . $uplifters_site_builder_blocks_tablet_font_size . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_tablet_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_tablet_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_tablet_width . ';';

if ( $uplifters_site_builder_blocks_tablet_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_bg . ';';
}

if ( $uplifters_site_builder_blocks_tablet_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_tablet_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'text-align:' . $uplifters_site_builder_blocks_mobile_align . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-button-single{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_mobile_font_family . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . $uplifters_site_builder_blocks_mobile_font_size . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_mobile_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_mobile_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_mobile_width . ';';

if ( $uplifters_site_builder_blocks_mobile_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_bg . ';';
}

if ( $uplifters_site_builder_blocks_mobile_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_mobile_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;
?>

<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div
	id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>"
	class="uplifters-site-builder-blocks-button-single-wrapper"
>
	<a
		class="uplifters-site-builder-blocks-button-single"
		href="<?php echo esc_url( $uplifters_site_builder_blocks_url ); ?>"
		<?php if ( $uplifters_site_builder_blocks_open_in_new_tab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
	>
		<span class="uplifters-site-builder-blocks-button-single-label uplifters-site-builder-blocks-button-single-label-desktop">
			<?php echo esc_html( $uplifters_site_builder_blocks_desktop_text ); ?>
		</span>

		<span class="uplifters-site-builder-blocks-button-single-label uplifters-site-builder-blocks-button-single-label-tablet">
			<?php echo esc_html( $uplifters_site_builder_blocks_tablet_text ); ?>
		</span>

		<span class="uplifters-site-builder-blocks-button-single-label uplifters-site-builder-blocks-button-single-label-mobile">
			<?php echo esc_html( $uplifters_site_builder_blocks_mobile_text ); ?>
		</span>
	</a>
</div>
