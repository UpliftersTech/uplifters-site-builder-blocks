<?php
/**
 * Server-side render for the UpliftersSiteBuilderBlocks Loading Screen Animated block.
 *
 * @param array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_responsive_value' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
		if ( ! isset( $attributes[ $key ] ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}

			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
				if ( isset( $value[ $fallback_device ] ) && '' !== $value[ $fallback_device ] && null !== $value[ $fallback_device ] ) {
					return $value[ $fallback_device ];
				}
			}

			return $fallback;
		}

		return '' !== $value && null !== $value ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_clamp_number' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_clamp_number( $value, float $min, float $max, float $fallback ): float {
		$value = is_numeric( $value ) ? (float) $value : $fallback;

		return max( $min, min( $max, $value ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_sanitize_css_value( $value ): string {
		$value = wp_strip_all_tags( (string) $value );
		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_sanitize_color( $value ): string {
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

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_prepare_devices' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_prepare_devices( array $attributes ): array {
		$devices = array(
			'desktop' => array(
				'overlay'     => '#f8fafc',
				'shimmer'     => 'rgba(148, 163, 184, 0.22)',
				'highlight'   => 'rgba(255, 255, 255, 0.78)',
				'text_color'  => '#334155',
				'duration'    => 1.8,
				'max_wait'    => 8000,
				'font_family' => 'default',
				'font_size'   => 28,
				'font_weight' => '700',
				'line_height' => 1.2,
				'width'       => '480px',
				'padding'     => '24px',
			),
			'tablet'  => array(
				'overlay'     => '#f8fafc',
				'shimmer'     => 'rgba(148, 163, 184, 0.22)',
				'highlight'   => 'rgba(255, 255, 255, 0.78)',
				'text_color'  => '#334155',
				'duration'    => 1.8,
				'max_wait'    => 8000,
				'font_family' => 'default',
				'font_size'   => 26,
				'font_weight' => '700',
				'line_height' => 1.2,
				'width'       => '440px',
				'padding'     => '24px',
			),
			'mobile'  => array(
				'overlay'     => '#f8fafc',
				'shimmer'     => 'rgba(148, 163, 184, 0.22)',
				'highlight'   => 'rgba(255, 255, 255, 0.78)',
				'text_color'  => '#334155',
				'duration'    => 1.8,
				'max_wait'    => 8000,
				'font_family' => 'default',
				'font_size'   => 22,
				'font_weight' => '700',
				'line_height' => 1.25,
				'width'       => '320px',
				'padding'     => '18px',
			),
		);

		foreach ( array_keys( $devices ) as $device ) {
			$devices[ $device ]['overlay'] = uplifters_site_builder_blocks_loading_screen_animate_sanitize_color( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'overlayColor', $device, $devices[ $device ]['overlay'] ) ) ?: $devices[ $device ]['overlay'];
			$devices[ $device ]['shimmer'] = uplifters_site_builder_blocks_loading_screen_animate_sanitize_color( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'shimmerColor', $device, $devices[ $device ]['shimmer'] ) ) ?: $devices[ $device ]['shimmer'];
			$devices[ $device ]['highlight'] = uplifters_site_builder_blocks_loading_screen_animate_sanitize_color( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'highlightColor', $device, $devices[ $device ]['highlight'] ) ) ?: $devices[ $device ]['highlight'];
			$devices[ $device ]['text_color'] = uplifters_site_builder_blocks_loading_screen_animate_sanitize_color( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'textColor', $device, $devices[ $device ]['text_color'] ) ) ?: $devices[ $device ]['text_color'];

			$devices[ $device ]['duration'] = uplifters_site_builder_blocks_loading_screen_animate_clamp_number( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'duration', $device, $devices[ $device ]['duration'] ), 0.8, 4, $devices[ $device ]['duration'] );
			$devices[ $device ]['max_wait'] = (int) uplifters_site_builder_blocks_loading_screen_animate_clamp_number( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'maxWait', $device, $devices[ $device ]['max_wait'] ), 1000, 30000, $devices[ $device ]['max_wait'] );
			$devices[ $device ]['font_family_key'] = (string) uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'fontFamily', $device, $devices[ $device ]['font_family'] );
			$devices[ $device ]['font_family'] = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $devices[ $device ]['font_family_key'] ) ?: 'inherit';
			$devices[ $device ]['font_size'] = uplifters_site_builder_blocks_loading_screen_animate_clamp_number( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'fontSize', $device, $devices[ $device ]['font_size'] ), 12, 72, $devices[ $device ]['font_size'] );

			$font_weight = (string) uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'fontWeight', $device, $devices[ $device ]['font_weight'] );
			$devices[ $device ]['font_weight'] = preg_match( '/^(100|200|300|400|500|600|700|800|900)$/', $font_weight ) ? $font_weight : '700';

			$devices[ $device ]['line_height'] = uplifters_site_builder_blocks_loading_screen_animate_clamp_number( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'lineHeight', $device, $devices[ $device ]['line_height'] ), 0.8, 3, $devices[ $device ]['line_height'] );
			$devices[ $device ]['width']       = uplifters_site_builder_blocks_loading_screen_animate_sanitize_css_value( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'contentWidth', $device, $devices[ $device ]['width'] ) );
			$devices[ $device ]['padding']     = uplifters_site_builder_blocks_loading_screen_animate_sanitize_css_value( uplifters_site_builder_blocks_loading_screen_animate_responsive_value( $attributes, 'padding', $device, $devices[ $device ]['padding'] ) );
		}

		return $devices;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_loading_screen_animate_render_markup' ) ) {
	function uplifters_site_builder_blocks_loading_screen_animate_render_markup( array $attributes ): void {
		$enable_loader = ! array_key_exists( 'enableLoader', $attributes ) || (bool) $attributes['enableLoader'];

		if ( ! $enable_loader ) {
			return;
		}

		$GLOBALS['uplifters_site_builder_blocks_loading_screen_animate_rendered_current_request'] = true;

		$message     = isset( $attributes['message'] ) ? wp_kses_post( $attributes['message'] ) : esc_html__( 'Loading page...', 'uplifters-site-builder-blocks' );
		$min_visible = 2200;
		$unique_id   = wp_unique_id( 'uplifters-site-builder-blocks-loading-screen-animate-' );
		$devices     = uplifters_site_builder_blocks_loading_screen_animate_prepare_devices( $attributes );

		$class_names = array(
			'uplifters-site-builder-blocks-loading-screen-animate',
			'uplifters-site-builder-blocks-loading-screen-animate--visible',
		);

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id'                                                        => $unique_id,
				'class'                                                     => implode( ' ', $class_names ),
				'data-uplifters-site-builder-blocks-loading-screen-animate' => 'true',
				'data-max-wait-desktop'                                     => (string) $devices['desktop']['max_wait'],
				'data-max-wait-tablet'                                      => (string) $devices['tablet']['max_wait'],
				'data-max-wait-mobile'                                      => (string) $devices['mobile']['max_wait'],
				'data-min-visible'                                          => (string) $min_visible,
			)
		);
		?>
<?php ob_start(); ?>
@keyframes upliftersSiteBuilderBlocksLoadingScreenAnimateSweep{0%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(240%) skewX(-18deg)}}
#<?php echo esc_attr( $unique_id ); ?>.uplifters-site-builder-blocks-loading-screen-animate{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100vw!important;height:100vh!important;min-height:100vh!important;overflow:hidden!important;box-sizing:border-box!important;pointer-events:none!important;opacity:1;visibility:visible;transition:opacity .35s ease,visibility .35s ease;background:var(--uplifters-site-builder-blocks-loading-screen-animate-overlay,#f8fafc)!important;color:var(--uplifters-site-builder-blocks-loading-screen-animate-text,#334155)!important;padding:var(--uplifters-site-builder-blocks-loading-screen-animate-padding,24px)!important;--uplifters-site-builder-blocks-loading-screen-animate-max-wait:<?php echo esc_html( $devices['desktop']['max_wait'] ); ?>ms;animation:upliftersSiteBuilderBlocksLoadingScreenAnimateCssAutoHide .001s linear var(--uplifters-site-builder-blocks-loading-screen-animate-max-wait) forwards}
#<?php echo esc_attr( $unique_id ); ?>.uplifters-site-builder-blocks-loading-screen-animate.is-hidden{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
@keyframes upliftersSiteBuilderBlocksLoadingScreenAnimateCssAutoHide{to{opacity:0;visibility:hidden;pointer-events:none}}
#<?php echo esc_attr( $unique_id ); ?>{--uplifters-site-builder-blocks-loading-screen-animate-overlay:<?php echo esc_html( $devices['desktop']['overlay'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-shimmer:<?php echo esc_html( $devices['desktop']['shimmer'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-highlight:<?php echo esc_html( $devices['desktop']['highlight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-text:<?php echo esc_html( $devices['desktop']['text_color'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-duration:<?php echo esc_html( $devices['desktop']['duration'] ); ?>s;--uplifters-site-builder-blocks-loading-screen-animate-font-family:<?php echo esc_html( $devices['desktop']['font_family'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-font-size:<?php echo esc_html( $devices['desktop']['font_size'] ); ?>px;--uplifters-site-builder-blocks-loading-screen-animate-font-weight:<?php echo esc_html( $devices['desktop']['font_weight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-line-height:<?php echo esc_html( $devices['desktop']['line_height'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-content-width:<?php echo esc_html( $devices['desktop']['width'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-padding:<?php echo esc_html( $devices['desktop']['padding'] ); ?>}
@media(max-width:1024px){#<?php echo esc_attr( $unique_id ); ?>{--uplifters-site-builder-blocks-loading-screen-animate-overlay:<?php echo esc_html( $devices['tablet']['overlay'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-shimmer:<?php echo esc_html( $devices['tablet']['shimmer'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-highlight:<?php echo esc_html( $devices['tablet']['highlight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-text:<?php echo esc_html( $devices['tablet']['text_color'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-duration:<?php echo esc_html( $devices['tablet']['duration'] ); ?>s;--uplifters-site-builder-blocks-loading-screen-animate-font-family:<?php echo esc_html( $devices['tablet']['font_family'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-font-size:<?php echo esc_html( $devices['tablet']['font_size'] ); ?>px;--uplifters-site-builder-blocks-loading-screen-animate-font-weight:<?php echo esc_html( $devices['tablet']['font_weight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-line-height:<?php echo esc_html( $devices['tablet']['line_height'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-content-width:<?php echo esc_html( $devices['tablet']['width'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-padding:<?php echo esc_html( $devices['tablet']['padding'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-max-wait:<?php echo esc_html( $devices['tablet']['max_wait'] ); ?>ms}}
@media(max-width:767px){#<?php echo esc_attr( $unique_id ); ?>{--uplifters-site-builder-blocks-loading-screen-animate-overlay:<?php echo esc_html( $devices['mobile']['overlay'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-shimmer:<?php echo esc_html( $devices['mobile']['shimmer'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-highlight:<?php echo esc_html( $devices['mobile']['highlight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-text:<?php echo esc_html( $devices['mobile']['text_color'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-duration:<?php echo esc_html( $devices['mobile']['duration'] ); ?>s;--uplifters-site-builder-blocks-loading-screen-animate-font-family:<?php echo esc_html( $devices['mobile']['font_family'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-font-size:<?php echo esc_html( $devices['mobile']['font_size'] ); ?>px;--uplifters-site-builder-blocks-loading-screen-animate-font-weight:<?php echo esc_html( $devices['mobile']['font_weight'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-line-height:<?php echo esc_html( $devices['mobile']['line_height'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-content-width:<?php echo esc_html( $devices['mobile']['width'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-padding:<?php echo esc_html( $devices['mobile']['padding'] ); ?>;--uplifters-site-builder-blocks-loading-screen-animate-max-wait:<?php echo esc_html( $devices['mobile']['max_wait'] ); ?>ms}}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__gloss{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.24) 0%,rgba(255,255,255,0) 100%)}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__shine-wrap{position:absolute;inset:0;overflow:hidden}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__shine{position:absolute;top:0;left:-45%;width:40%;height:100%;background:linear-gradient(90deg,transparent 0%,var(--uplifters-site-builder-blocks-loading-screen-animate-shimmer,rgba(148,163,184,.22)) 40%,var(--uplifters-site-builder-blocks-loading-screen-animate-highlight,rgba(255,255,255,.78)) 52%,var(--uplifters-site-builder-blocks-loading-screen-animate-shimmer,rgba(148,163,184,.22)) 64%,transparent 100%);animation:upliftersSiteBuilderBlocksLoadingScreenAnimateSweep var(--uplifters-site-builder-blocks-loading-screen-animate-duration,1.8s) linear infinite;will-change:transform}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__content{position:relative;z-index:1;display:flex;width:min(100%,var(--uplifters-site-builder-blocks-loading-screen-animate-content-width,480px));flex-direction:column;align-items:flex-start;gap:16px}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__message{margin:0;color:var(--uplifters-site-builder-blocks-loading-screen-animate-text,#334155);font-family:var(--uplifters-site-builder-blocks-loading-screen-animate-font-family,inherit);font-size:var(--uplifters-site-builder-blocks-loading-screen-animate-font-size,28px);font-weight:var(--uplifters-site-builder-blocks-loading-screen-animate-font-weight,700);line-height:var(--uplifters-site-builder-blocks-loading-screen-animate-line-height,1.2);letter-spacing:-.03em}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__bar{width:100%;height:16px;border-radius:999px;background:rgba(148,163,184,.18)}
#<?php echo esc_attr( $unique_id ); ?> .uplifters-site-builder-blocks-loading-screen-animate__bar--short{width:72%;background:rgba(148,163,184,.12)}
<?php
$css = ob_get_clean();
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( 'uplifters-site-builder-blocks/loading-screen-animate', $css );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $wrapper_attributes, array() );
?>>
	<div class="uplifters-site-builder-blocks-loading-screen-animate__gloss" aria-hidden="true"></div>
	<div class="uplifters-site-builder-blocks-loading-screen-animate__shine-wrap" aria-hidden="true"><div class="uplifters-site-builder-blocks-loading-screen-animate__shine"></div></div>
	<div class="uplifters-site-builder-blocks-loading-screen-animate__content">
		<p class="uplifters-site-builder-blocks-loading-screen-animate__message"><?php echo wp_kses_post( $message ); ?></p>
		<div class="uplifters-site-builder-blocks-loading-screen-animate__bar" aria-hidden="true"></div>
		<div class="uplifters-site-builder-blocks-loading-screen-animate__bar uplifters-site-builder-blocks-loading-screen-animate__bar--short" aria-hidden="true"></div>
	</div>
</div>
		<?php
	}
}

if ( isset( $attributes ) && is_array( $attributes ) ) {
	uplifters_site_builder_blocks_loading_screen_animate_render_markup( $attributes );
}
