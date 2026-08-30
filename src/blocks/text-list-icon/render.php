<?php
/**
 * Server-side render for the UpliftersSiteBuilderBlocks Text List Icon block.
 *
 * @param array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_text_list_icon_normalize_items' ) ) {
	function uplifters_site_builder_blocks_text_list_icon_normalize_items( $raw_value ) {
		$items = array();

		if ( is_array( $raw_value ) ) {
			$raw_items = $raw_value;
		} else {
			$raw_items = explode( "\n", (string) $raw_value );
		}

		foreach ( $raw_items as $raw_item ) {
			$parts = preg_split( '/<br\s*\/?>|\r\n|\r|\n/i', (string) $raw_item );

			foreach ( $parts as $part ) {
				$item       = trim( wp_kses_post( $part ) );
				$plain_text = trim( wp_strip_all_tags( str_replace( '&nbsp;', ' ', $item ) ) );

				if ( '' !== $plain_text ) {
					$items[] = $item;
				}
			}
		}

		return $items;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_text_list_icon_responsive_value' ) ) {
	function uplifters_site_builder_blocks_text_list_icon_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}

			if ( isset( $value['desktop'] ) && '' !== $value['desktop'] && null !== $value['desktop'] ) {
				return $value['desktop'];
			}

			if ( isset( $value['tablet'] ) && '' !== $value['tablet'] && null !== $value['tablet'] ) {
				return $value['tablet'];
			}

			if ( isset( $value['mobile'] ) && '' !== $value['mobile'] && null !== $value['mobile'] ) {
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

if ( ! function_exists( 'uplifters_site_builder_blocks_text_list_icon_clamp_number' ) ) {
	function uplifters_site_builder_blocks_text_list_icon_clamp_number( $value, float $min, float $max, float $fallback ): float {
		$number = is_numeric( $value ) ? (float) $value : $fallback;

		return max( $min, min( $max, $number ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_text_list_icon_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_text_list_icon_sanitize_color( $value, string $fallback = '' ): string {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( '' === $value ) {
			return $fallback;
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

if ( ! function_exists( 'uplifters_site_builder_blocks_text_list_icon_marker_icon' ) ) {
	function uplifters_site_builder_blocks_text_list_icon_marker_icon( string $marker ): string {
		$marker_map = array(
			'check'     => '✓',
			'arrow'     => '→',
			'bullet'    => '•',
			'circle'    => '○',
			'square'    => '■',
			'star'      => '★',
			'heart'     => '♥',
			'dash'      => '—',
			'plus'      => '+',
			'box-check' => '☑',
		);

		$marker = sanitize_key( $marker );

		return isset( $marker_map[ $marker ] )
			? $marker_map[ $marker ]
			: '✓';
	}
}

$uplifters_site_builder_blocks_items = isset( $attributes['items'] )
	? uplifters_site_builder_blocks_text_list_icon_normalize_items( $attributes['items'] )
	: array(
		'First list item',
		'Second list item',
		'Third list item',
	);

if ( empty( $uplifters_site_builder_blocks_items ) ) {
	$uplifters_site_builder_blocks_items = array(
		'First list item',
		'Second list item',
		'Third list item',
	);
}

$uplifters_site_builder_blocks_devices = array(
	'desktop' => array(
		'font_size_fallback' => 18,
		'item_gap_fallback'  => 14,
		'padding_fallback'   => 0,
	),
	'tablet'  => array(
		'font_size_fallback' => 17,
		'item_gap_fallback'  => 12,
		'padding_fallback'   => 0,
	),
	'mobile'  => array(
		'font_size_fallback' => 16,
		'item_gap_fallback'  => 10,
		'padding_fallback'   => 0,
	),
);

$uplifters_site_builder_blocks_styles = array();

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_fallbacks ) {
	$uplifters_site_builder_blocks_font_family_key = sanitize_key(
		(string) uplifters_site_builder_blocks_text_list_icon_responsive_value(
			$attributes,
			'fontFamily',
			$uplifters_site_builder_blocks_device,
			'default'
		)
	);

	$uplifters_site_builder_blocks_styles[ $uplifters_site_builder_blocks_device ] = array(
		'marker'       => sanitize_key(
			(string) uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'marker',
				$uplifters_site_builder_blocks_device,
				'check'
			)
		),
		'font_family'  => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_font_family_key ) ?: 'inherit',
		'text_color'   => uplifters_site_builder_blocks_text_list_icon_sanitize_color(
			(string) uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'textColor',
				$uplifters_site_builder_blocks_device,
				'#0f172a'
			),
			'#0f172a'
		),
		'marker_color' => uplifters_site_builder_blocks_text_list_icon_sanitize_color(
			(string) uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'markerColor',
				$uplifters_site_builder_blocks_device,
				'#2563eb'
			),
			'#2563eb'
		),
		'font_size'    => uplifters_site_builder_blocks_text_list_icon_clamp_number(
			uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'fontSize',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_fallbacks['font_size_fallback']
			),
			12,
			48,
			$uplifters_site_builder_blocks_fallbacks['font_size_fallback']
		),
		'item_gap'     => uplifters_site_builder_blocks_text_list_icon_clamp_number(
			uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'itemGap',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_fallbacks['item_gap_fallback']
			),
			0,
			48,
			$uplifters_site_builder_blocks_fallbacks['item_gap_fallback']
		),
		'padding'      => uplifters_site_builder_blocks_text_list_icon_clamp_number(
			uplifters_site_builder_blocks_text_list_icon_responsive_value(
				$attributes,
				'padding',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_fallbacks['padding_fallback']
			),
			0,
			120,
			$uplifters_site_builder_blocks_fallbacks['padding_fallback']
		),
	);
}

$uplifters_site_builder_blocks_unique_class = 'uplifters-site-builder-blocks-text-list-icon-' . wp_unique_id();

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'uplifters-site-builder-blocks-text-list-icon ' . $uplifters_site_builder_blocks_unique_class,
	)
);

$uplifters_site_builder_blocks_desktop_marker_icon = uplifters_site_builder_blocks_text_list_icon_marker_icon( $uplifters_site_builder_blocks_styles['desktop']['marker'] );
$uplifters_site_builder_blocks_tablet_marker_icon  = uplifters_site_builder_blocks_text_list_icon_marker_icon( $uplifters_site_builder_blocks_styles['tablet']['marker'] );
$uplifters_site_builder_blocks_mobile_marker_icon  = uplifters_site_builder_blocks_text_list_icon_marker_icon( $uplifters_site_builder_blocks_styles['mobile']['marker'] );

$uplifters_site_builder_blocks_css  = '';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . '{';
$uplifters_site_builder_blocks_css .= 'display:grid;';
$uplifters_site_builder_blocks_css .= 'list-style:none;';
$uplifters_site_builder_blocks_css .= 'margin:0;';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_css .= 'font-family:' . $uplifters_site_builder_blocks_styles['desktop']['font_family'] . ';';
$uplifters_site_builder_blocks_css .= 'gap:' . $uplifters_site_builder_blocks_styles['desktop']['item_gap'] . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_styles['desktop']['padding'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' li{';
$uplifters_site_builder_blocks_css .= 'display:flex;';
$uplifters_site_builder_blocks_css .= 'align-items:flex-start;';
$uplifters_site_builder_blocks_css .= 'gap:12px;';
$uplifters_site_builder_blocks_css .= 'margin:0;';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['desktop']['marker_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['desktop']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= 'line-height:1.4;';
$uplifters_site_builder_blocks_css .= 'font-weight:700;';
$uplifters_site_builder_blocks_css .= 'min-width:1em;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__text{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['desktop']['text_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['desktop']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= 'line-height:1.6;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-tablet,';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-mobile{display:none;}';

$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . '{';
$uplifters_site_builder_blocks_css .= 'font-family:' . $uplifters_site_builder_blocks_styles['tablet']['font_family'] . ';';
$uplifters_site_builder_blocks_css .= 'gap:' . $uplifters_site_builder_blocks_styles['tablet']['item_gap'] . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_styles['tablet']['padding'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['tablet']['marker_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['tablet']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__text{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['tablet']['text_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['tablet']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-desktop,';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-mobile{display:none;}';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-tablet{display:inline;}';

$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . '{';
$uplifters_site_builder_blocks_css .= 'font-family:' . $uplifters_site_builder_blocks_styles['mobile']['font_family'] . ';';
$uplifters_site_builder_blocks_css .= 'gap:' . $uplifters_site_builder_blocks_styles['mobile']['item_gap'] . 'px;';
$uplifters_site_builder_blocks_css .= 'padding:' . $uplifters_site_builder_blocks_styles['mobile']['padding'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['mobile']['marker_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['mobile']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__text{';
$uplifters_site_builder_blocks_css .= 'color:' . $uplifters_site_builder_blocks_styles['mobile']['text_color'] . ';';
$uplifters_site_builder_blocks_css .= 'font-size:' . $uplifters_site_builder_blocks_styles['mobile']['font_size'] . 'px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-desktop,';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-tablet{display:none;}';
$uplifters_site_builder_blocks_css .= '.' . $uplifters_site_builder_blocks_unique_class . ' .uplifters-site-builder-blocks-text-list-icon__marker-mobile{display:inline;}';

$uplifters_site_builder_blocks_css .= '}';
?>

<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<ul <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php foreach ( $uplifters_site_builder_blocks_items as $uplifters_site_builder_blocks_item ) : ?>
		<li>
			<span class="uplifters-site-builder-blocks-text-list-icon__marker" aria-hidden="true">
				<span class="uplifters-site-builder-blocks-text-list-icon__marker-desktop"><?php echo esc_html( $uplifters_site_builder_blocks_desktop_marker_icon ); ?></span>
				<span class="uplifters-site-builder-blocks-text-list-icon__marker-tablet"><?php echo esc_html( $uplifters_site_builder_blocks_tablet_marker_icon ); ?></span>
				<span class="uplifters-site-builder-blocks-text-list-icon__marker-mobile"><?php echo esc_html( $uplifters_site_builder_blocks_mobile_marker_icon ); ?></span>
			</span>

			<span class="uplifters-site-builder-blocks-text-list-icon__text">
				<?php echo wp_kses_post( $uplifters_site_builder_blocks_item ); ?>
			</span>
		</li>
	<?php endforeach; ?>
</ul>
