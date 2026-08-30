<?php
/**
 * Server-side render for the UpliftersSiteBuilderBlocks Video Embed Grid block.
 *
 * @param array $attributes Block attributes.
 * @return void
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_responsive_value' ) ) {
	function uplifters_site_builder_blocks_video_embed_responsive_value( array $source, string $key, string $device, $fallback = '' ) {
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

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_responsive_box' ) ) {
	function uplifters_site_builder_blocks_video_embed_responsive_box( array $source, string $key, string $device ): array {
		$empty = array(
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
		);

		if ( empty( $source[ $key ] ) || ! is_array( $source[ $key ] ) ) {
			return $empty;
		}

		$value = $source[ $key ];

		if ( isset( $value['desktop'] ) || isset( $value['tablet'] ) || isset( $value['mobile'] ) ) {
			$branch_value = array();

			if ( isset( $value[ $device ] ) && is_array( $value[ $device ] ) ) {
				$branch_value = $value[ $device ];
			} elseif ( isset( $value['desktop'] ) && is_array( $value['desktop'] ) ) {
				$branch_value = $value['desktop'];
			} elseif ( isset( $value['tablet'] ) && is_array( $value['tablet'] ) ) {
				$branch_value = $value['tablet'];
			} elseif ( isset( $value['mobile'] ) && is_array( $value['mobile'] ) ) {
				$branch_value = $value['mobile'];
			}

			return array_merge( $empty, $branch_value );
		}

		return array_merge( $empty, $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_box_to_style' ) ) {
	function uplifters_site_builder_blocks_video_embed_box_to_style( string $prefix, array $box ): string {
		$map   = array(
			'top'    => 'top',
			'right'  => 'right',
			'bottom' => 'bottom',
			'left'   => 'left',
		);
		$style = '';

		foreach ( $map as $key => $suffix ) {
			$value = isset( $box[ $key ] ) ? trim( (string) $box[ $key ] ) : '';

			if ( '' !== $value ) {
				$value  = wp_strip_all_tags( $value );
				$value  = str_replace( array( '<', '>', '{', '}', ';' ), '', $value );
				$style .= sprintf( '%1$s-%2$s:%3$s;', $prefix, $suffix, $value );
			}
		}

		return $style;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_safe_color_value' ) ) {
	function uplifters_site_builder_blocks_video_embed_safe_color_value( $value, string $property = 'color' ): string {
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

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_allowed_html' ) ) {
	function uplifters_site_builder_blocks_video_embed_allowed_html(): array {
		return array(
			'iframe' => array(
				'src'             => true,
				'title'           => true,
				'width'           => true,
				'height'          => true,
				'frameborder'     => true,
				'allow'           => true,
				'allowfullscreen' => true,
				'loading'         => true,
				'referrerpolicy'  => true,
				'style'           => true,
				'class'           => true,
			),
			'video'  => array(
				'src'      => true,
				'controls' => true,
				'poster'   => true,
				'width'    => true,
				'height'   => true,
				'style'    => true,
				'class'    => true,
			),
			'source' => array(
				'src'  => true,
				'type' => true,
			),
			'embed'  => array(
				'src'    => true,
				'type'   => true,
				'width'  => true,
				'height' => true,
				'style'  => true,
				'class'  => true,
			),
			'object' => array(
				'data'   => true,
				'type'   => true,
				'width'  => true,
				'height' => true,
				'style'  => true,
				'class'  => true,
			),
			'param'  => array(
				'name'  => true,
				'value' => true,
			),
		);
	}
}

$uplifters_site_builder_blocks_items = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();

$uplifters_site_builder_blocks_block_id = ! empty( $attributes['blockId'] ) ? sanitize_html_class( $attributes['blockId'] ) : wp_unique_id( 'uplifters-site-builder-blocks-video-embed-' );

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-video-embed',
	)
);

$uplifters_site_builder_blocks_desktop_cols = max( 1, min( absint( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'embedsPerRow', 'desktop', 2 ) ), 6 ) );
$uplifters_site_builder_blocks_tablet_cols  = max( 1, min( absint( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'embedsPerRow', 'tablet', $uplifters_site_builder_blocks_desktop_cols ) ), 6 ) );
$uplifters_site_builder_blocks_mobile_cols  = max( 1, min( absint( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'embedsPerRow', 'mobile', 1 ) ), 6 ) );

$uplifters_site_builder_blocks_desktop_font_family_key = uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'fontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_tablet_font_family_key  = uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'fontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_mobile_font_family_key  = uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'fontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_desktop_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_desktop_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_tablet_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_tablet_font_family_key ) ?: 'inherit';
$uplifters_site_builder_blocks_mobile_font_family  = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_mobile_font_family_key ) ?: 'inherit';

$uplifters_site_builder_blocks_desktop_text_color = uplifters_site_builder_blocks_video_embed_safe_color_value( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'textColor', 'desktop', '#0f172a' ) );
$uplifters_site_builder_blocks_tablet_text_color  = uplifters_site_builder_blocks_video_embed_safe_color_value( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'textColor', 'tablet', $uplifters_site_builder_blocks_desktop_text_color ) );
$uplifters_site_builder_blocks_mobile_text_color  = uplifters_site_builder_blocks_video_embed_safe_color_value( uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'textColor', 'mobile', $uplifters_site_builder_blocks_desktop_text_color ) );

$uplifters_site_builder_blocks_desktop_padding = uplifters_site_builder_blocks_video_embed_box_to_style( 'padding', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'padding', 'desktop' ) );
$uplifters_site_builder_blocks_tablet_padding  = uplifters_site_builder_blocks_video_embed_box_to_style( 'padding', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'padding', 'tablet' ) );
$uplifters_site_builder_blocks_mobile_padding  = uplifters_site_builder_blocks_video_embed_box_to_style( 'padding', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'padding', 'mobile' ) );

$uplifters_site_builder_blocks_desktop_margin = uplifters_site_builder_blocks_video_embed_box_to_style( 'margin', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'margin', 'desktop' ) );
$uplifters_site_builder_blocks_tablet_margin  = uplifters_site_builder_blocks_video_embed_box_to_style( 'margin', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'margin', 'tablet' ) );
$uplifters_site_builder_blocks_mobile_margin  = uplifters_site_builder_blocks_video_embed_box_to_style( 'margin', uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'margin', 'mobile' ) );

$uplifters_site_builder_blocks_static_css = '';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed *,#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed *::before,#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed *::after{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-shell{border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;padding:16px;box-shadow:0 1px 2px rgba(15,23,42,0.08);}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-grid{display:grid;gap:16px;grid-template-columns:repeat(var(--uplifters-site-builder-blocks-video-embed-cols,2),minmax(0,1fr));}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-item{min-width:0;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;padding:12px;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-frame{position:relative;overflow:hidden;width:100%;padding-top:56.25%;border-radius:16px;background:#0b1220;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-frame iframe,#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-frame video,#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-frame embed,#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-frame object{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;border:0!important;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_block_id . ' .uplifters-site-builder-blocks-video-embed-fallback-link{overflow-wrap:anywhere;color:currentColor;}';

$uplifters_site_builder_blocks_dynamic_css = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed{--uplifters-site-builder-blocks-video-embed-cols:' . $uplifters_site_builder_blocks_desktop_cols . ';font-family:' . $uplifters_site_builder_blocks_desktop_font_family . ';color:' . $uplifters_site_builder_blocks_desktop_text_color . ';' . $uplifters_site_builder_blocks_desktop_padding . $uplifters_site_builder_blocks_desktop_margin . '}';
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed{--uplifters-site-builder-blocks-video-embed-cols:' . $uplifters_site_builder_blocks_tablet_cols . ';font-family:' . $uplifters_site_builder_blocks_tablet_font_family . ';color:' . $uplifters_site_builder_blocks_tablet_text_color . ';' . $uplifters_site_builder_blocks_tablet_padding . $uplifters_site_builder_blocks_tablet_margin . '}}';
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed{--uplifters-site-builder-blocks-video-embed-cols:' . $uplifters_site_builder_blocks_mobile_cols . ';font-family:' . $uplifters_site_builder_blocks_mobile_font_family . ';color:' . $uplifters_site_builder_blocks_mobile_text_color . ';' . $uplifters_site_builder_blocks_mobile_padding . $uplifters_site_builder_blocks_mobile_margin . '}}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;
?>
<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<div class="uplifters-site-builder-blocks-video-embed-shell">
		<div class="uplifters-site-builder-blocks-video-embed-grid">
			<?php foreach ( $uplifters_site_builder_blocks_items as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_item ) : ?>
				<?php
				$uplifters_site_builder_blocks_html = isset( $uplifters_site_builder_blocks_item['embedHtml'] ) ? trim( (string) $uplifters_site_builder_blocks_item['embedHtml'] ) : '';
				$uplifters_site_builder_blocks_url  = isset( $uplifters_site_builder_blocks_item['url'] ) ? trim( (string) $uplifters_site_builder_blocks_item['url'] ) : '';
				?>
				<div class="uplifters-site-builder-blocks-video-embed-item">
					<?php if ( '' !== $uplifters_site_builder_blocks_html ) : ?>
						<div class="uplifters-site-builder-blocks-video-embed-frame">
							<?php echo wp_kses( $uplifters_site_builder_blocks_html, uplifters_site_builder_blocks_video_embed_allowed_html() ); ?>
						</div>
					<?php elseif ( '' !== $uplifters_site_builder_blocks_url ) : ?>
						<a class="uplifters-site-builder-blocks-video-embed-fallback-link" href="<?php echo esc_url( $uplifters_site_builder_blocks_url ); ?>" target="_blank" rel="noopener noreferrer">
							<?php echo esc_html( $uplifters_site_builder_blocks_url ); ?>
						</a>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
