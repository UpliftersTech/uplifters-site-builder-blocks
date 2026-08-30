<?php
/**
 * Server-side render for the responsive Posts Previous Next block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_previous_next_responsive_value' ) ) {
	function uplifters_site_builder_blocks_posts_previous_next_responsive_value( $value, string $device, $fallback = '' ) {
		if ( is_array( $value ) ) {
			if ( array_key_exists( $device, $value ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}

			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
				if ( array_key_exists( $fallback_device, $value ) && '' !== $value[ $fallback_device ] && null !== $value[ $fallback_device ] ) {
					return $value[ $fallback_device ];
				}
			}

			return $fallback;
		}

		return ( null !== $value && '' !== $value ) ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_previous_next_color' ) ) {
	function uplifters_site_builder_blocks_posts_previous_next_color( $value, string $fallback ): string {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( '' === $value ) {
			return $fallback;
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\([0-9\s.,%\/+\-]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^var\(--[a-zA-Z0-9_-]+\)$/', $value ) ) {
			return $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_previous_next_device_css' ) ) {
	function uplifters_site_builder_blocks_posts_previous_next_device_css( string $selector, array $settings ): string {
		$css  = $selector . '{display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;';
		$css .= 'gap:' . $settings['gap'] . 'px;';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-radius:' . $settings['button_radius'] . 'px;';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-padding-y:' . $settings['button_padding_y'] . 'px;';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-padding-x:' . $settings['button_padding_x'] . 'px;';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-font-size:' . $settings['font_size'] . 'px;';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-font-weight:' . $settings['font_weight'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-font-family:' . $settings['font_family'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-text:' . $settings['text_color'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-bg:' . $settings['background_color'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-border:' . $settings['border_color'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-hover-text:' . $settings['hover_text_color'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-hover-bg:' . $settings['hover_background_color'] . ';';
		$css .= '--uplifters-site-builder-blocks-posts-previous-next-hover-border:' . $settings['hover_border_color'] . ';';
		$css .= '}';

		if ( 'mobile' === $settings['device'] ) {
			$css .= $selector . '{flex-direction:column;align-items:stretch;}';
			$css .= $selector . ' .uplifters-site-builder-blocks-posts-previous-next-button{width:100%;}';
			$css .= $selector . ' .uplifters-site-builder-blocks-posts-previous-next-spacer{display:none;}';
		}

		return $css;
	}
}

$uplifters_site_builder_blocks_devices  = array( 'desktop', 'tablet', 'mobile' );
$uplifters_site_builder_blocks_settings = array();

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) {
	$uplifters_site_builder_blocks_font_weight = (int) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['fontWeight'] ?? array(), $uplifters_site_builder_blocks_device, 600 );
	$uplifters_site_builder_blocks_font_weight = min( 900, max( 100, (int) ( round( $uplifters_site_builder_blocks_font_weight / 100 ) * 100 ) ) );

	$uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ] = array(
		'device'                 => $uplifters_site_builder_blocks_device,
		'show_previous'          => (bool) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['showPrevious'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'show_next'              => (bool) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['showNext'] ?? array(), $uplifters_site_builder_blocks_device, true ),
		'previous_label'         => sanitize_text_field( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['previousLabel'] ?? array(), $uplifters_site_builder_blocks_device, __( 'Previous Post', 'uplifters-site-builder-blocks' ) ) ),
		'next_label'             => sanitize_text_field( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['nextLabel'] ?? array(), $uplifters_site_builder_blocks_device, __( 'Next Post', 'uplifters-site-builder-blocks' ) ) ),
		'previous_arrow'         => sanitize_text_field( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['previousArrow'] ?? array(), $uplifters_site_builder_blocks_device, '←' ) ),
		'next_arrow'             => sanitize_text_field( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['nextArrow'] ?? array(), $uplifters_site_builder_blocks_device, '→' ) ),
		'button_radius'          => max( 0, (float) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['buttonRadius'] ?? array(), $uplifters_site_builder_blocks_device, 999 ) ),
		'button_padding_y'       => max( 0, (float) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['buttonPaddingY'] ?? array(), $uplifters_site_builder_blocks_device, 12 ) ),
		'button_padding_x'       => max( 0, (float) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['buttonPaddingX'] ?? array(), $uplifters_site_builder_blocks_device, 18 ) ),
		'gap'                    => max( 0, (float) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['gap'] ?? array(), $uplifters_site_builder_blocks_device, 12 ) ),
		'font_size'              => max( 1, (float) uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['fontSize'] ?? array(), $uplifters_site_builder_blocks_device, 15 ) ),
		'font_weight'            => $uplifters_site_builder_blocks_font_weight,
		'font_family'            => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['fontFamily'] ?? array(), $uplifters_site_builder_blocks_device, 'inherit' ) ) ?: 'inherit',
		'text_color'             => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['textColor'] ?? array(), $uplifters_site_builder_blocks_device, '#111827' ), '#111827' ),
		'background_color'       => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['backgroundColor'] ?? array(), $uplifters_site_builder_blocks_device, '#ffffff' ), '#ffffff' ),
		'border_color'           => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['borderColor'] ?? array(), $uplifters_site_builder_blocks_device, '#d1d5db' ), '#d1d5db' ),
		'hover_text_color'       => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['hoverTextColor'] ?? array(), $uplifters_site_builder_blocks_device, '#ffffff' ), '#ffffff' ),
		'hover_background_color' => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['hoverBackgroundColor'] ?? array(), $uplifters_site_builder_blocks_device, '#111827' ), '#111827' ),
		'hover_border_color'     => uplifters_site_builder_blocks_posts_previous_next_color( uplifters_site_builder_blocks_posts_previous_next_responsive_value( $attributes['hoverBorderColor'] ?? array(), $uplifters_site_builder_blocks_device, '#111827' ), '#111827' ),
	);
}

$uplifters_site_builder_blocks_previous_post = get_previous_post();
$uplifters_site_builder_blocks_next_post     = get_next_post();

$uplifters_site_builder_blocks_has_any_navigation = false;
foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) {
	if ( ( $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]['show_previous'] && $uplifters_site_builder_blocks_previous_post ) || ( $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]['show_next'] && $uplifters_site_builder_blocks_next_post ) ) {
		$uplifters_site_builder_blocks_has_any_navigation = true;
		break;
	}
}

if ( ! $uplifters_site_builder_blocks_has_any_navigation ) {
	return '';
}

$uplifters_site_builder_blocks_block_id = wp_unique_id( 'uplifters-site-builder-blocks-posts-previous-next-' );
$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_block_id;
$uplifters_site_builder_blocks_target   = ! isset( $attributes['openInSameTab'] ) || $attributes['openInSameTab'] ? '_self' : '_blank';
$uplifters_site_builder_blocks_rel      = '_blank' === $uplifters_site_builder_blocks_target ? 'noopener noreferrer' : '';

$uplifters_site_builder_blocks_css  = $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border:1px solid var(--uplifters-site-builder-blocks-posts-previous-next-border);border-radius:var(--uplifters-site-builder-blocks-posts-previous-next-radius);padding:var(--uplifters-site-builder-blocks-posts-previous-next-padding-y) var(--uplifters-site-builder-blocks-posts-previous-next-padding-x);font-size:var(--uplifters-site-builder-blocks-posts-previous-next-font-size);font-weight:var(--uplifters-site-builder-blocks-posts-previous-next-font-weight);font-family:var(--uplifters-site-builder-blocks-posts-previous-next-font-family);line-height:1.2;color:var(--uplifters-site-builder-blocks-posts-previous-next-text);background:var(--uplifters-site-builder-blocks-posts-previous-next-bg);white-space:nowrap;box-sizing:border-box;transition:color .18s ease,background-color .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button:hover,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button:focus-visible{color:var(--uplifters-site-builder-blocks-posts-previous-next-hover-text);background:var(--uplifters-site-builder-blocks-posts-previous-next-hover-bg);border-color:var(--uplifters-site-builder-blocks-posts-previous-next-hover-border);transform:translateY(-1px);box-shadow:0 10px 24px rgba(15,23,42,.12);outline:none;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button:focus-visible{box-shadow:0 0 0 3px rgba(17,24,39,.18),0 10px 24px rgba(15,23,42,.12);}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-arrow{display:inline-flex;align-items:center;justify-content:center;font-size:1.1em;line-height:1;transition:transform .18s ease;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button-previous:hover .uplifters-site-builder-blocks-posts-previous-next-arrow,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button-previous:focus-visible .uplifters-site-builder-blocks-posts-previous-next-arrow{transform:translateX(-2px);}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button-next:hover .uplifters-site-builder-blocks-posts-previous-next-arrow,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-button-next:focus-visible .uplifters-site-builder-blocks-posts-previous-next-arrow{transform:translateX(2px);}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-spacer{flex:1 1 auto;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-tablet,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-mobile{display:none;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_previous_next_device_css( $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-desktop', $uplifters_site_builder_blocks_settings['desktop'] );
$uplifters_site_builder_blocks_css .= '@media(max-width:1024px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-desktop,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-mobile{display:none;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-tablet{display:flex;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_previous_next_device_css( $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-tablet', $uplifters_site_builder_blocks_settings['tablet'] );
$uplifters_site_builder_blocks_css .= '}';
$uplifters_site_builder_blocks_css .= '@media(max-width:767px){';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-desktop,' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-tablet{display:none;}';
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-mobile{display:flex;}';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_posts_previous_next_device_css( $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-posts-previous-next-row-mobile', $uplifters_site_builder_blocks_settings['mobile'] );
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-posts-previous-next uplifters-site-builder-blocks-posts-previous-next-responsive',
	)
);
?>
<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device ) : ?>
		<?php $uplifters_site_builder_blocks_device_settings = $uplifters_site_builder_blocks_settings[ $uplifters_site_builder_blocks_device ]; ?>
		<nav
			class="uplifters-site-builder-blocks-posts-previous-next-row uplifters-site-builder-blocks-posts-previous-next-row-<?php echo esc_attr( $uplifters_site_builder_blocks_device ); ?>"
			aria-label="<?php
			/* translators: %s: Device name, such as desktop, tablet, or mobile. */
			echo esc_attr( sprintf( __( 'Post navigation for %s', 'uplifters-site-builder-blocks' ), ucfirst( $uplifters_site_builder_blocks_device ) ) );
			?>"
		>
			<?php if ( $uplifters_site_builder_blocks_device_settings['show_previous'] && $uplifters_site_builder_blocks_previous_post ) : ?>
				<a
					class="uplifters-site-builder-blocks-posts-previous-next-button uplifters-site-builder-blocks-posts-previous-next-button-previous"
					href="<?php echo esc_url( get_permalink( $uplifters_site_builder_blocks_previous_post ) ); ?>"
					target="<?php echo esc_attr( $uplifters_site_builder_blocks_target ); ?>"
					<?php if ( '' !== $uplifters_site_builder_blocks_rel ) : ?>rel="<?php echo esc_attr( $uplifters_site_builder_blocks_rel ); ?>"<?php endif; ?>
					aria-label="<?php
					/* translators: %s: Previous post title. */
					echo esc_attr( sprintf( __( 'Go to previous post: %s', 'uplifters-site-builder-blocks' ), get_the_title( $uplifters_site_builder_blocks_previous_post ) ) );
					?>"
				>
					<span class="uplifters-site-builder-blocks-posts-previous-next-arrow" aria-hidden="true"><?php echo esc_html( $uplifters_site_builder_blocks_device_settings['previous_arrow'] ); ?></span>
					<span class="uplifters-site-builder-blocks-posts-previous-next-label"><?php echo esc_html( $uplifters_site_builder_blocks_device_settings['previous_label'] ); ?></span>
				</a>
			<?php endif; ?>

			<span class="uplifters-site-builder-blocks-posts-previous-next-spacer" aria-hidden="true"></span>

			<?php if ( $uplifters_site_builder_blocks_device_settings['show_next'] && $uplifters_site_builder_blocks_next_post ) : ?>
				<a
					class="uplifters-site-builder-blocks-posts-previous-next-button uplifters-site-builder-blocks-posts-previous-next-button-next"
					href="<?php echo esc_url( get_permalink( $uplifters_site_builder_blocks_next_post ) ); ?>"
					target="<?php echo esc_attr( $uplifters_site_builder_blocks_target ); ?>"
					<?php if ( '' !== $uplifters_site_builder_blocks_rel ) : ?>rel="<?php echo esc_attr( $uplifters_site_builder_blocks_rel ); ?>"<?php endif; ?>
					aria-label="<?php
					/* translators: %s: Next post title. */
					echo esc_attr( sprintf( __( 'Go to next post: %s', 'uplifters-site-builder-blocks' ), get_the_title( $uplifters_site_builder_blocks_next_post ) ) );
					?>"
				>
					<span class="uplifters-site-builder-blocks-posts-previous-next-label"><?php echo esc_html( $uplifters_site_builder_blocks_device_settings['next_label'] ); ?></span>
					<span class="uplifters-site-builder-blocks-posts-previous-next-arrow" aria-hidden="true"><?php echo esc_html( $uplifters_site_builder_blocks_device_settings['next_arrow'] ); ?></span>
				</a>
			<?php endif; ?>
		</nav>
	<?php endforeach; ?>
</div>
