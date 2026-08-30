<?php
/**
 * Server-side render callback for the CountupAutoAnimate block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_countup_auto_animate_responsive_value' ) ) {
	function uplifters_site_builder_blocks_countup_auto_animate_responsive_value( array $source, string $key, string $device, $fallback = '' ) {
		if ( ! array_key_exists( $key, $source ) ) {
			return $fallback;
		}

		$value = $source[ $key ];

		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] ) {
				return $value[ $device ];
			}

			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $branch ) {
				if ( isset( $value[ $branch ] ) && '' !== $value[ $branch ] ) {
					return $value[ $branch ];
				}
			}

			return $fallback;
		}

		return '' !== $value ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_countup_auto_animate_safe_css_value' ) ) {
	function uplifters_site_builder_blocks_countup_auto_animate_safe_css_value( $value ): string {
		$value = is_scalar( $value ) ? (string) $value : '';
		$value = wp_strip_all_tags( $value );
		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_countup_auto_animate_safe_color_value' ) ) {
	function uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( $value, string $property = 'color' ): string {
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';

		if ( '' === $value ) {
			return '';
		}

		$safe = safecss_filter_attr( $property . ':' . $value );

		if ( '' === $safe ) {
			return '';
		}

		return trim( (string) preg_replace( '/^' . preg_quote( $property, '/' ) . '\s*:\s*/i', '', $safe ) );
	}
}

$uplifters_site_builder_blocks_heading = isset( $attributes['heading'] ) ? $attributes['heading'] : 'Counters';
$uplifters_site_builder_blocks_counters = isset( $attributes['counters'] ) && is_array( $attributes['counters'] ) ? $attributes['counters'] : array();

if ( empty( $uplifters_site_builder_blocks_counters ) ) {
	$uplifters_site_builder_blocks_counters = array(
		array(
			'title'      => 'Counter 1',
			'titleColor' => '#111827',
			'titleSize'  => 16,
			'value'      => 100,
			'color'      => '#ff0000',
		),
		array(
			'title'      => 'Counter 2',
			'titleColor' => '#111827',
			'titleSize'  => 16,
			'value'      => 200,
			'color'      => '#00ff00',
		),
		array(
			'title'      => 'Counter 3',
			'titleColor' => '#111827',
			'titleSize'  => 16,
			'value'      => 300,
			'color'      => '#0000ff',
		),
	);
}

$uplifters_site_builder_blocks_block_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( $attributes['blockId'] ) : wp_unique_id( 'uplifters-site-builder-blocks-countup-auto-animate-' );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-countup-auto-animate',
	)
);

$uplifters_site_builder_blocks_desktop_heading_font_family_key = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_tablet_heading_font_family_key  = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_mobile_heading_font_family_key  = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_desktop_heading_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_heading_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_tablet_heading_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_heading_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_mobile_heading_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_heading_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_heading_color = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingColor', 'desktop', '#000000' ) );
$uplifters_site_builder_blocks_tablet_heading_color  = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingColor', 'tablet', $uplifters_site_builder_blocks_desktop_heading_color ) );
$uplifters_site_builder_blocks_mobile_heading_color  = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingColor', 'mobile', $uplifters_site_builder_blocks_desktop_heading_color ) );

$uplifters_site_builder_blocks_desktop_heading_size = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingSize', 'desktop', 24 ) );
$uplifters_site_builder_blocks_tablet_heading_size  = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingSize', 'tablet', $uplifters_site_builder_blocks_desktop_heading_size ) );
$uplifters_site_builder_blocks_mobile_heading_size  = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'headingSize', 'mobile', $uplifters_site_builder_blocks_desktop_heading_size ) );

$uplifters_site_builder_blocks_desktop_background_color = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'backgroundColor', 'desktop', '#ffffff' ), 'background-color' );
$uplifters_site_builder_blocks_tablet_background_color  = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'backgroundColor', 'tablet', $uplifters_site_builder_blocks_desktop_background_color ), 'background-color' );
$uplifters_site_builder_blocks_mobile_background_color  = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $attributes, 'backgroundColor', 'mobile', $uplifters_site_builder_blocks_desktop_background_color ), 'background-color' );

$uplifters_site_builder_blocks_static_css = '';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-countup-auto-animate{';
$uplifters_site_builder_blocks_static_css .= 'padding:24px;text-align:center;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;';
$uplifters_site_builder_blocks_static_css .= '}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__heading{line-height:1.2;margin:0;text-align:center;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__items{margin-top:16px;display:flex;width:100%;justify-content:center;align-items:stretch;gap:24px;flex-wrap:wrap;box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__item{min-width:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__number{min-width:3ch;font-weight:700;line-height:1;display:flex;align-items:center;justify-content:center;text-align:center;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__title{line-height:1.25;text-align:center;}';

$uplifters_site_builder_blocks_dynamic_css = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-countup-auto-animate{background-color:' . $uplifters_site_builder_blocks_desktop_background_color . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__heading{font-family:' . $uplifters_site_builder_blocks_desktop_heading_font_family . ';color:' . $uplifters_site_builder_blocks_desktop_heading_color . ';font-size:' . $uplifters_site_builder_blocks_desktop_heading_size . 'px;}';

foreach ( $uplifters_site_builder_blocks_counters as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_counter ) {
	$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__item--' . absint( $uplifters_site_builder_blocks_index );

	$uplifters_site_builder_blocks_number_font_family_key = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberFontFamily', 'desktop', 'default' );
	$uplifters_site_builder_blocks_title_font_family_key  = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleFontFamily', 'desktop', 'default' );

	$uplifters_site_builder_blocks_number_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_number_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_number_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberSize', 'desktop', 30 ) );
	$uplifters_site_builder_blocks_number_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'color', 'desktop', '#000000' ) );

	$uplifters_site_builder_blocks_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_title_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_title_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleSize', 'desktop', 16 ) );
	$uplifters_site_builder_blocks_title_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleColor', 'desktop', '#111827' ) );

	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__number{font-family:' . $uplifters_site_builder_blocks_number_font_family . ';font-size:' . $uplifters_site_builder_blocks_number_size . 'px;color:' . $uplifters_site_builder_blocks_number_color . ';}';
	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__title{font-family:' . $uplifters_site_builder_blocks_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_title_size . 'px;color:' . $uplifters_site_builder_blocks_title_color . ';}';
}

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-countup-auto-animate{background-color:' . $uplifters_site_builder_blocks_tablet_background_color . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__heading{font-family:' . $uplifters_site_builder_blocks_tablet_heading_font_family . ';color:' . $uplifters_site_builder_blocks_tablet_heading_color . ';font-size:' . $uplifters_site_builder_blocks_tablet_heading_size . 'px;}';

foreach ( $uplifters_site_builder_blocks_counters as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_counter ) {
	$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__item--' . absint( $uplifters_site_builder_blocks_index );

	$uplifters_site_builder_blocks_number_font_family_key = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberFontFamily', 'tablet', 'default' );
	$uplifters_site_builder_blocks_title_font_family_key  = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleFontFamily', 'tablet', 'default' );

	$uplifters_site_builder_blocks_number_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_number_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_number_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberSize', 'tablet', 30 ) );
	$uplifters_site_builder_blocks_number_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'color', 'tablet', '#000000' ) );

	$uplifters_site_builder_blocks_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_title_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_title_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleSize', 'tablet', 16 ) );
	$uplifters_site_builder_blocks_title_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleColor', 'tablet', '#111827' ) );

	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__number{font-family:' . $uplifters_site_builder_blocks_number_font_family . ';font-size:' . $uplifters_site_builder_blocks_number_size . 'px;color:' . $uplifters_site_builder_blocks_number_color . ';}';
	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__title{font-family:' . $uplifters_site_builder_blocks_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_title_size . 'px;color:' . $uplifters_site_builder_blocks_title_color . ';}';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-countup-auto-animate{background-color:' . $uplifters_site_builder_blocks_mobile_background_color . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__items{gap:16px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__item{min-width:100%;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__heading{font-family:' . $uplifters_site_builder_blocks_mobile_heading_font_family . ';color:' . $uplifters_site_builder_blocks_mobile_heading_color . ';font-size:' . $uplifters_site_builder_blocks_mobile_heading_size . 'px;}';

foreach ( $uplifters_site_builder_blocks_counters as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_counter ) {
	$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-countup-auto-animate__item--' . absint( $uplifters_site_builder_blocks_index );

	$uplifters_site_builder_blocks_number_font_family_key = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberFontFamily', 'mobile', 'default' );
	$uplifters_site_builder_blocks_title_font_family_key  = uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleFontFamily', 'mobile', 'default' );

	$uplifters_site_builder_blocks_number_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_number_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_number_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'numberSize', 'mobile', 30 ) );
	$uplifters_site_builder_blocks_number_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'color', 'mobile', '#000000' ) );

	$uplifters_site_builder_blocks_title_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_title_font_family_key ) ?: 'inherit';
	$uplifters_site_builder_blocks_title_size        = absint( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleSize', 'mobile', 16 ) );
	$uplifters_site_builder_blocks_title_color       = uplifters_site_builder_blocks_countup_auto_animate_safe_color_value( uplifters_site_builder_blocks_countup_auto_animate_responsive_value( $uplifters_site_builder_blocks_counter, 'titleColor', 'mobile', '#111827' ) );

	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__number{font-family:' . $uplifters_site_builder_blocks_number_font_family . ';font-size:' . $uplifters_site_builder_blocks_number_size . 'px;color:' . $uplifters_site_builder_blocks_number_color . ';}';
	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-countup-auto-animate__title{font-family:' . $uplifters_site_builder_blocks_title_font_family . ';font-size:' . $uplifters_site_builder_blocks_title_size . 'px;color:' . $uplifters_site_builder_blocks_title_color . ';}';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;

\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php if ( '' !== trim( wp_strip_all_tags( $uplifters_site_builder_blocks_heading ) ) ) : ?>
		<h2 class="uplifters-site-builder-blocks-countup-auto-animate__heading">
			<?php echo wp_kses_post( $uplifters_site_builder_blocks_heading ); ?>
		</h2>
	<?php endif; ?>

	<div class="uplifters-site-builder-blocks-countup-auto-animate__items">
		<?php foreach ( $uplifters_site_builder_blocks_counters as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_counter ) : ?>
			<?php
			$uplifters_site_builder_blocks_counter_title = isset( $uplifters_site_builder_blocks_counter['title'] ) ? $uplifters_site_builder_blocks_counter['title'] : sprintf( 'Counter %d', $uplifters_site_builder_blocks_index + 1 );
			$uplifters_site_builder_blocks_counter_value = isset( $uplifters_site_builder_blocks_counter['value'] ) ? (int) $uplifters_site_builder_blocks_counter['value'] : 0;
			?>

			<div class="uplifters-site-builder-blocks-countup-auto-animate__item uplifters-site-builder-blocks-countup-auto-animate__item--<?php echo esc_attr( absint( $uplifters_site_builder_blocks_index ) ); ?>">
				<div
					class="uplifters-site-builder-blocks-countup-auto-animate__number"
					data-count="<?php echo esc_attr( $uplifters_site_builder_blocks_counter_value ); ?>"
				>
					<?php echo esc_html( $uplifters_site_builder_blocks_counter_value ); ?>
				</div>

				<div class="uplifters-site-builder-blocks-countup-auto-animate__title">
					<?php echo wp_kses_post( $uplifters_site_builder_blocks_counter_title ); ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>
