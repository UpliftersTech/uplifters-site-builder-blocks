<?php
/**
 * Server-side render for the UpliftersSiteBuilderBlocks Video Embed block.
 *
 * The block renders one embed at the full width of its container. Only the
 * responsive padding, margin and border radius vary per instance, so those
 * three are generated here and attached to the block's registered style
 * handle; everything structural lives in style.scss.
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

			/*
			 * An all-empty branch falls through to the next one, so tablet and
			 * mobile inherit the desktop box unless they set one of their own.
			 * The editor resolves these the same way.
			 */
			foreach ( array( $device, 'desktop', 'tablet', 'mobile' ) as $branch ) {
				if ( empty( $value[ $branch ] ) || ! is_array( $value[ $branch ] ) ) {
					continue;
				}

				foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
					if ( isset( $value[ $branch ][ $side ] ) && '' !== trim( (string) $value[ $branch ][ $side ] ) ) {
						$branch_value = $value[ $branch ];
						break 2;
					}
				}
			}

			return array_merge( $empty, $branch_value );
		}

		return array_merge( $empty, $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_box_to_style' ) ) {
	function uplifters_site_builder_blocks_video_embed_box_to_style( string $prefix, array $box ): string {
		$style = '';

		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$value = isset( $box[ $side ] ) ? trim( (string) $box[ $side ] ) : '';

			if ( '' === $value ) {
				continue;
			}

			$value = str_replace( array( '<', '>', '{', '}', ';' ), '', wp_strip_all_tags( $value ) );

			// A unitless number is not valid CSS, so treat it as pixels the
			// same way the editor does rather than emitting a dead rule.
			if ( preg_match( '/^-?\d*\.?\d+$/', $value ) ) {
				$value .= 'px';
			}

			$style .= sprintf( '%1$s-%2$s:%3$s;', $prefix, $side, $value );
		}

		return $style;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_video_embed_length' ) ) {
	/**
	 * Sanitise a single CSS length such as "12px".
	 *
	 * @param mixed $value Raw value.
	 * @return string Safe CSS length, or an empty string.
	 */
	function uplifters_site_builder_blocks_video_embed_length( $value ): string {
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';

		if ( '' === $value ) {
			return '';
		}

		$value = str_replace( array( '<', '>', '{', '}', ';' ), '', wp_strip_all_tags( $value ) );

		return preg_match( '/^-?\d*\.?\d+(px|em|rem|%|vw|vh)?$/', $value ) ? $value : '';
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

$uplifters_site_builder_blocks_html = isset( $attributes['embedHtml'] ) ? trim( (string) $attributes['embedHtml'] ) : '';
$uplifters_site_builder_blocks_url  = isset( $attributes['url'] ) ? trim( (string) $attributes['url'] ) : '';

/**
 * Legacy fallback.
 *
 * This block used to hold a grid of embeds in an `items` array. Posts saved
 * back then are migrated to the flat attributes the next time the block is
 * opened in the editor, so until that happens the first saved item is
 * rendered here.
 */
if (
	'' === $uplifters_site_builder_blocks_html &&
	'' === $uplifters_site_builder_blocks_url &&
	! empty( $attributes['items'] ) &&
	is_array( $attributes['items'] ) &&
	is_array( $attributes['items'][0] )
) {
	$uplifters_site_builder_blocks_legacy = $attributes['items'][0];

	$uplifters_site_builder_blocks_html = isset( $uplifters_site_builder_blocks_legacy['embedHtml'] )
		? trim( (string) $uplifters_site_builder_blocks_legacy['embedHtml'] )
		: '';
	$uplifters_site_builder_blocks_url  = isset( $uplifters_site_builder_blocks_legacy['url'] )
		? trim( (string) $uplifters_site_builder_blocks_legacy['url'] )
		: '';
}

if ( '' === $uplifters_site_builder_blocks_html && '' === $uplifters_site_builder_blocks_url ) {
	return;
}

$uplifters_site_builder_blocks_block_id = wp_unique_id( 'uplifters-site-builder-blocks-video-embed-' );

$uplifters_site_builder_blocks_devices = array(
	'desktop' => '',
	'tablet'  => '(max-width:1024px)',
	'mobile'  => '(max-width:767px)',
);

$uplifters_site_builder_blocks_css = '';

foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_media_query ) {
	$uplifters_site_builder_blocks_declarations = '';

	$uplifters_site_builder_blocks_declarations .= uplifters_site_builder_blocks_video_embed_box_to_style(
		'padding',
		uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'padding', $uplifters_site_builder_blocks_device )
	);

	$uplifters_site_builder_blocks_declarations .= uplifters_site_builder_blocks_video_embed_box_to_style(
		'margin',
		uplifters_site_builder_blocks_video_embed_responsive_box( $attributes, 'margin', $uplifters_site_builder_blocks_device )
	);

	$uplifters_site_builder_blocks_radius = uplifters_site_builder_blocks_video_embed_length(
		uplifters_site_builder_blocks_video_embed_responsive_value( $attributes, 'borderRadius', $uplifters_site_builder_blocks_device, '' )
	);

	if ( '' !== $uplifters_site_builder_blocks_radius ) {
		$uplifters_site_builder_blocks_declarations .= '--uplifters-site-builder-blocks-video-embed-radius:' . $uplifters_site_builder_blocks_radius . ';';
	}

	if ( '' === $uplifters_site_builder_blocks_declarations ) {
		continue;
	}

	$uplifters_site_builder_blocks_rule = '#' . $uplifters_site_builder_blocks_block_id . '.uplifters-site-builder-blocks-video-embed{' . $uplifters_site_builder_blocks_declarations . '}';

	if ( '' === $uplifters_site_builder_blocks_media_query ) {
		$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_rule;
		continue;
	}

	$uplifters_site_builder_blocks_css .= '@media ' . $uplifters_site_builder_blocks_media_query . '{' . $uplifters_site_builder_blocks_rule . '}';
}

\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue(
	$block,
	wp_strip_all_tags( $uplifters_site_builder_blocks_css )
);

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-video-embed',
	)
);
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php if ( '' !== $uplifters_site_builder_blocks_html ) : ?>
		<div class="uplifters-site-builder-blocks-video-embed-frame">
			<?php echo wp_kses( $uplifters_site_builder_blocks_html, uplifters_site_builder_blocks_video_embed_allowed_html() ); ?>
		</div>
	<?php else : ?>
		<a class="uplifters-site-builder-blocks-video-embed-fallback-link" href="<?php echo esc_url( $uplifters_site_builder_blocks_url ); ?>" target="_blank" rel="noopener noreferrer">
			<?php echo esc_html( $uplifters_site_builder_blocks_url ); ?>
		</a>
	<?php endif; ?>
</div>
