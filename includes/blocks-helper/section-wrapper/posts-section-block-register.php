<?php
/**
 * Manual (no block.json) server-side registration for the Posts Section
 * block, now that it lives inside the Posts Layout folder as posts-section.js
 * with no editor Inspector of its own. Every user-facing control for this
 * section lives on the parent Posts Layout block; this file only keeps the
 * dynamic rendering (context propagation, singular-post guard, child
 * fallback rendering, per-instance CSS) working exactly as it did when the
 * block had its own build/blocks/posts-section/block.json + render.php.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_section_responsive_object' ) ) {
	function uplifters_site_builder_blocks_b_posts_section_responsive_object( $value, $fallback ) {
		if ( is_array( $value ) ) {
			return array(
				'desktop' => array_key_exists( 'desktop', $value ) ? $value['desktop'] : $fallback,
				'tablet'  => array_key_exists( 'tablet', $value ) ? $value['tablet'] : $fallback,
				'mobile'  => array_key_exists( 'mobile', $value ) ? $value['mobile'] : $fallback,
			);
		}

		if ( null !== $value ) {
			return array(
				'desktop' => $value,
				'tablet'  => $fallback,
				'mobile'  => $fallback,
			);
		}

		return array(
			'desktop' => $fallback,
			'tablet'  => $fallback,
			'mobile'  => $fallback,
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_section_number' ) ) {
	function uplifters_site_builder_blocks_b_posts_section_number( $value, $fallback = 0 ) {
		if ( is_numeric( $value ) ) {
			return (float) $value;
		}

		return (float) $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_section_css_number' ) ) {
	function uplifters_site_builder_blocks_b_posts_section_css_number( $value ) {
		$value = uplifters_site_builder_blocks_b_posts_section_number( $value, 0 );

		if ( (float) (int) $value === $value ) {
			return (string) (int) $value;
		}

		return rtrim( rtrim( (string) $value, '0' ), '.' );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_section_safe_color' ) ) {
	function uplifters_site_builder_blocks_b_posts_section_safe_color( $value ) {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		if ( preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\([0-9\s.,%\/+-]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^var\(--[a-zA-Z0-9_-]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^[a-zA-Z]+$/', $value ) ) {
			return $value;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_section_device_css' ) ) {
	function uplifters_site_builder_blocks_b_posts_section_device_css( $selector, $device_values ) {
		$padding          = uplifters_site_builder_blocks_b_posts_section_number( $device_values['padding'], 0 );
		$gap              = uplifters_site_builder_blocks_b_posts_section_number( $device_values['gap'], 0 );
		$border_radius    = uplifters_site_builder_blocks_b_posts_section_number( $device_values['borderRadius'], 0 );
		$background_color = uplifters_site_builder_blocks_b_posts_section_safe_color( $device_values['backgroundColor'] );

		$css  = $selector . '{';
		$css .= 'padding:' . uplifters_site_builder_blocks_b_posts_section_css_number( $padding ) . 'px;';
		$css .= 'gap:' . uplifters_site_builder_blocks_b_posts_section_css_number( $gap ) . 'px;';
		$css .= '--wp--style--block-gap:' . uplifters_site_builder_blocks_b_posts_section_css_number( $gap ) . 'px;';
		$css .= 'border-radius:' . uplifters_site_builder_blocks_b_posts_section_css_number( $border_radius ) . 'px;';

		if ( '' !== $background_color ) {
			$css .= 'background-color:' . $background_color . ';';
		} else {
			$css .= 'background-color:initial;';
		}

		$css .= '}';

		return $css;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_first' ) ) {
	/**
	 * Return the first non-empty attribute from a list of keys.
	 *
	 * @param array $attrs    Block attributes.
	 * @param array $keys     Candidate keys.
	 * @param mixed $fallback Fallback value.
	 * @return mixed
	 */
	function uplifters_site_builder_blocks_posts_section_first( $attrs, $keys, $fallback = '' ) {
		foreach ( (array) $keys as $key ) {
			if ( isset( $attrs[ $key ] ) && '' !== $attrs[ $key ] && null !== $attrs[ $key ] ) {
				return $attrs[ $key ];
			}
		}
		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_css_unit' ) ) {
	/**
	 * Normalise a length value into a safe CSS unit string.
	 *
	 * @param mixed $value    Raw value.
	 * @param mixed $fallback Fallback value.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_css_unit( $value, $fallback = '' ) {
		if ( '' === $value || null === $value ) {
			return '';
		}
		if ( is_numeric( $value ) ) {
			return (string) $value . 'px';
		}
		$value = (string) $value;
		if ( 0 === strpos( $value, 'var:preset|spacing|' ) ) {
			$slug = sanitize_title( str_replace( 'var:preset|spacing|', '', $value ) );
			return 'var(--wp--preset--spacing--' . $slug . ')';
		}
		if ( 0 === strpos( $value, 'var:preset|font-size|' ) ) {
			$slug = sanitize_title( str_replace( 'var:preset|font-size|', '', $value ) );
			return 'var(--wp--preset--font-size--' . $slug . ')';
		}
		return sanitize_text_field( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_current_post_id' ) ) {
	/**
	 * Resolve the post ID this section should render against.
	 *
	 * @param WP_Block|null $parent_block Parent block instance.
	 * @param array         $attrs        Child attributes.
	 * @return int
	 */
	function uplifters_site_builder_blocks_posts_section_current_post_id( $parent_block = null, $attrs = array() ) {
		$post_id = absint( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'selectedPostId', 'postId' ), 0 ) );

		if ( ! $post_id && is_object( $parent_block ) && ! empty( $parent_block->context['postId'] ) ) {
			$post_id = absint( $parent_block->context['postId'] );
		}
		if ( ! $post_id ) {
			$post_id = absint( get_the_ID() );
		}
		if ( ! $post_id ) {
			$post_id = absint( get_queried_object_id() );
		}

		return $post_id;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_responsive_attr' ) ) {
	/**
	 * Read one device's value out of a {desktop,tablet,mobile} attribute,
	 * falling back to desktop, then any other device, then $fallback.
	 *
	 * @param array  $attrs    Block attributes.
	 * @param string $key      Attribute key.
	 * @param string $device   'desktop' | 'tablet' | 'mobile'.
	 * @param mixed  $fallback Fallback value.
	 * @return mixed
	 */
	function uplifters_site_builder_blocks_posts_section_responsive_attr( $attrs, $key, $device, $fallback = '' ) {
		$value = isset( $attrs[ $key ] ) ? $attrs[ $key ] : null;

		if ( ! is_array( $value ) ) {
			return ( '' !== $value && null !== $value ) ? $value : $fallback;
		}

		foreach ( array( $device, 'desktop', 'tablet', 'mobile' ) as $candidate ) {
			if ( isset( $value[ $candidate ] ) && '' !== $value[ $candidate ] && null !== $value[ $candidate ] ) {
				return $value[ $candidate ];
			}
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_title_device_vars' ) ) {
	/**
	 * Build the posts-title CSS custom-property assignments for one device,
	 * matching PostTitleStyle::title_css_rules()'s own resolution of the
	 * same titleColor/titleFontSize/titleFontFamily attributes.
	 *
	 * @param array  $attrs  Child attributes.
	 * @param string $device 'desktop' | 'tablet' | 'mobile'.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_title_device_vars( array $attrs, string $device ): string {
		$color     = sanitize_hex_color( (string) uplifters_site_builder_blocks_posts_section_responsive_attr( $attrs, 'titleColor', $device, '' ) );
		$font_size = absint( uplifters_site_builder_blocks_posts_section_responsive_attr( $attrs, 'titleFontSize', $device, 0 ) );

		$font_family_key = uplifters_site_builder_blocks_posts_section_responsive_attr( $attrs, 'titleFontFamily', $device, 'inherit' );
		$font_family_css = class_exists( '\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister' )
			? \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $font_family_key )
			: '';
		if ( $font_family_css ) {
			\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::enqueue_for_family( $font_family_key );
		}

		$vars   = array();
		$vars[] = '--uplifters-posts-title-color:' . ( $color ? $color : 'inherit' );
		$vars[] = '--uplifters-posts-title-font-size:' . ( $font_size > 0 ? $font_size . 'px' : 'inherit' );
		$vars[] = '--uplifters-posts-title-font-family:' . ( $font_family_css ? $font_family_css : 'inherit' );

		return implode( ';', $vars ) . ';';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_featured_image_vars' ) ) {
	/**
	 * Build the posts-featured-image CSS custom-property assignments,
	 * matching PostFeaturedImageStyle::enqueue_single_post_featured_image_style()'s
	 * own resolution of the same imageBackgroundColor/imageBorderRadius/
	 * imageShadow* attributes. Not device-specific: posts-featured-image
	 * does not expose per-device style controls.
	 *
	 * @param array $attrs Child attributes.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_featured_image_vars( array $attrs ): string {
		$background_color = isset( $attrs['imageBackgroundColor'] ) ? sanitize_hex_color( (string) $attrs['imageBackgroundColor'] ) : '';
		$border_radius     = isset( $attrs['imageBorderRadius'] ) && is_numeric( $attrs['imageBorderRadius'] ) ? (float) $attrs['imageBorderRadius'] : 12;
		$border_radius     = max( 0, min( 200, $border_radius ) );

		$shadow_x       = isset( $attrs['imageShadowX'] ) && is_numeric( $attrs['imageShadowX'] ) ? (float) $attrs['imageShadowX'] : 0;
		$shadow_y       = isset( $attrs['imageShadowY'] ) && is_numeric( $attrs['imageShadowY'] ) ? (float) $attrs['imageShadowY'] : 10;
		$shadow_blur    = isset( $attrs['imageShadowBlur'] ) && is_numeric( $attrs['imageShadowBlur'] ) ? (float) $attrs['imageShadowBlur'] : 30;
		$shadow_spread  = isset( $attrs['imageShadowSpread'] ) && is_numeric( $attrs['imageShadowSpread'] ) ? (float) $attrs['imageShadowSpread'] : 0;
		$shadow_opacity = isset( $attrs['imageShadowOpacity'] ) && is_numeric( $attrs['imageShadowOpacity'] ) ? (float) $attrs['imageShadowOpacity'] : 0.18;

		$box_shadow = $shadow_x . 'px ' . $shadow_y . 'px ' . $shadow_blur . 'px ' . $shadow_spread . 'px rgba(0, 0, 0, ' . $shadow_opacity . ')';

		$vars   = array();
		$vars[] = '--uplifters-posts-featured-image-bg:' . ( $background_color ? $background_color : '#ffffff' );
		$vars[] = '--uplifters-posts-featured-image-radius:' . $border_radius . 'px';
		$vars[] = '--uplifters-posts-featured-image-shadow:' . $box_shadow;

		return implode( ';', $vars ) . ';';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_child_attrs_html' ) ) {
	/**
	 * Build the class/style attribute string for a child block wrapper.
	 *
	 * @param string $block_name    Child block name.
	 * @param array  $attrs         Child attributes.
	 * @param array  $extra_classes Extra class names.
	 * @param string $style         Inline style string.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_child_attrs_html( $block_name, $attrs, $extra_classes = array(), $style = '' ) {
		$classes = array( 'wp-block-' . str_replace( '/', '-', $block_name ) );
		$classes = array_merge( $classes, (array) $extra_classes );

		if ( ! empty( $attrs['className'] ) ) {
			$classes[] = sanitize_html_class( $attrs['className'] );
		}
		if ( ! empty( $attrs['align'] ) ) {
			$classes[] = 'align' . sanitize_html_class( $attrs['align'] );
		}
		if ( ! empty( $attrs['textColor'] ) ) {
			$classes[] = 'has-text-color';
			$classes[] = 'has-' . sanitize_html_class( $attrs['textColor'] ) . '-color';
		}
		if ( ! empty( $attrs['backgroundColor'] ) ) {
			$classes[] = 'has-background';
			$classes[] = 'has-' . sanitize_html_class( $attrs['backgroundColor'] ) . '-background-color';
		}
		if ( ! empty( $attrs['fontSize'] ) && is_string( $attrs['fontSize'] ) && ! is_numeric( $attrs['fontSize'] ) ) {
			$classes[] = 'has-' . sanitize_html_class( $attrs['fontSize'] ) . '-font-size';
		}

		$html = ' class="' . esc_attr( implode( ' ', array_unique( array_filter( $classes ) ) ) ) . '"';
		if ( '' !== $style ) {
			$html .= ' style="' . esc_attr( $style ) . '"';
		}
		return $html;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_is_empty_render' ) ) {
	/**
	 * Detect whether a child render produced no visible output.
	 *
	 * @param string $html Rendered HTML.
	 * @return bool
	 */
	function uplifters_site_builder_blocks_posts_section_is_empty_render( $html ) {
		$plain = trim( wp_strip_all_tags( (string) $html ) );
		if ( '' !== $plain ) {
			return false;
		}
		foreach ( array( '<img', '<picture', '<svg', '<iframe', '<video' ) as $needle ) {
			if ( false !== stripos( $html, $needle ) ) {
				return false;
			}
		}
		return true;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_render_child_custom' ) ) {
	/**
	 * Fallback renderer for the two style-only controller child blocks.
	 *
	 * @param string        $block_name   Child block name.
	 * @param array         $attrs        Child attributes.
	 * @param WP_Block|null $parent_block Parent block instance.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_render_child_custom( $block_name, $attrs = array(), $parent_block = null ) {
		$post_id = uplifters_site_builder_blocks_posts_section_current_post_id( $parent_block, $attrs );
		$url     = $post_id ? get_permalink( $post_id ) : '#';
		$title   = $post_id ? get_the_title( $post_id ) : '';

		if ( '' === trim( wp_strip_all_tags( $title ) ) ) {
			$title = __( 'Post Title', 'uplifters-site-builder-blocks' );
		}

		switch ( $block_name ) {
			case 'uplifters-site-builder-blocks/posts-title':
				$tag        = sanitize_key( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'level', 'tagName', 'htmlTag' ), 'h1' ) );
				$tag        = in_array( $tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div' ), true ) ? $tag : 'h1';
				$link_title = array_key_exists( 'linkTitle', $attrs ) ? (bool) $attrs['linkTitle'] : ( array_key_exists( 'isLink', $attrs ) ? (bool) $attrs['isLink'] : true );

				/*
				 * Follows the plugin's CSS custom-properties architecture
				 * (see posts-previous-next/render.php): the declarations
				 * that consume the color/size/family via var() are written
				 * once, and only the custom-property VALUES are redefined
				 * per breakpoint through cascading @media queries. Emitted
				 * as a stylesheet via BlocksDynamicStyle, the same mechanism
				 * every other Posts Section child block uses — no inline
				 * style="" attribute.
				 */
				$unique_id   = wp_unique_id( 'uplifters-posts-title-' );
				$line_height = sanitize_text_field( (string) uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'titleLineHeight', 'lineHeight' ), '1.12' ) );

				$title_css  = '#' . $unique_id . '{';
				$title_css .= uplifters_site_builder_blocks_posts_section_title_device_vars( $attrs, 'desktop' );
				$title_css .= 'color:var(--uplifters-posts-title-color) !important;';
				$title_css .= 'font-size:var(--uplifters-posts-title-font-size) !important;';
				$title_css .= 'font-family:var(--uplifters-posts-title-font-family) !important;';
				$title_css .= 'margin:0;';
				$title_css .= 'line-height:' . $line_height . ';';
				$title_css .= '}';
				$title_css .= '@media (max-width: 1024px){#' . $unique_id . '{' . uplifters_site_builder_blocks_posts_section_title_device_vars( $attrs, 'tablet' ) . '}}';
				$title_css .= '@media (max-width: 767px){#' . $unique_id . '{' . uplifters_site_builder_blocks_posts_section_title_device_vars( $attrs, 'mobile' ) . '}}';

				\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $parent_block, $title_css );

				$inner = $link_title
					? '<a class="uplifters-posts-title__link" href="' . esc_url( $url ) . '">' . esc_html( $title ) . '</a>'
					: esc_html( $title );

				return '<' . tag_escape( $tag ) . ' id="' . esc_attr( $unique_id ) . '"'
					. uplifters_site_builder_blocks_posts_section_child_attrs_html( $block_name, $attrs, array( 'uplifters-posts-title' ) )
					. '>' . $inner . '</' . tag_escape( $tag ) . '>';

			case 'uplifters-site-builder-blocks/posts-featured-image':
				$size         = sanitize_key( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'imageSize', 'sizeSlug', 'size' ), 'large' ) );
				$radius_value = isset( $attrs['imageBorderRadius'] ) && is_numeric( $attrs['imageBorderRadius'] ) ? max( 0, min( 200, (float) $attrs['imageBorderRadius'] ) ) : 12;
				$radius       = $radius_value . 'px';
				$height       = uplifters_site_builder_blocks_posts_section_css_unit( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'imageHeight', 'height', 'minHeight' ), '' ) );
				$aspect_ratio = sanitize_text_field( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'aspectRatio', 'ratio' ), '16/9' ) );
				$object_fit   = sanitize_text_field( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'objectFit', 'fit' ), 'cover' ) );
				$object_pos   = sanitize_text_field( uplifters_site_builder_blocks_posts_section_first( $attrs, array( 'objectPosition', 'focalPoint' ), 'center center' ) );
				$link_image   = array_key_exists( 'linkToPost', $attrs ) ? (bool) $attrs['linkToPost'] : ( array_key_exists( 'isLink', $attrs ) ? (bool) $attrs['isLink'] : false );
				$show_caption = array_key_exists( 'showCaption', $attrs ) ? (bool) $attrs['showCaption'] : false;

				/*
				 * Follows the same custom-properties architecture as the
				 * title case above (imageBackgroundColor/imageBorderRadius/
				 * imageShadow* aren't device-specific — posts-featured-image
				 * has no per-device style controls — so there is only one
				 * rule, no @media cascade needed). Emitted as a stylesheet
				 * via BlocksDynamicStyle, scoped to a unique per-instance ID.
				 * No inline style="" attribute.
				 */
				$unique_id = wp_unique_id( 'uplifters-posts-featured-image-' );

				$image_css  = '#' . $unique_id . '{';
				$image_css .= uplifters_site_builder_blocks_posts_section_featured_image_vars( $attrs );
				$image_css .= 'background-color:var(--uplifters-posts-featured-image-bg);';
				$image_css .= 'border-radius:var(--uplifters-posts-featured-image-radius);';
				$image_css .= 'box-shadow:var(--uplifters-posts-featured-image-shadow);';
				$image_css .= 'overflow:hidden;';
				$image_css .= 'margin:0;';
				$image_css .= '}';

				\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $parent_block, $image_css );

				$media_style = 'aspect-ratio:' . ( $aspect_ratio ? $aspect_ratio : '16/9' );
				if ( $height ) {
					$media_style .= ';height:' . $height . ';aspect-ratio:auto';
				}
				$media_style .= ';border-radius:' . $radius;

				if ( $post_id && has_post_thumbnail( $post_id ) ) {
					$image_html = get_the_post_thumbnail(
						$post_id,
						$size,
						array(
							'class' => 'uplifters-posts-featured-image__img',
							'style' => 'object-fit:' . $object_fit . ';object-position:' . $object_pos,
						)
					);

					if ( $link_image ) {
						$image_html = '<a class="uplifters-posts-featured-image__link" href="' . esc_url( $url ) . '">' . $image_html . '</a>';
					}

					$caption_html = '';
					$thumb_id     = get_post_thumbnail_id( $post_id );
					$caption      = $thumb_id ? wp_get_attachment_caption( $thumb_id ) : '';
					if ( $show_caption && $caption ) {
						$caption_html = '<figcaption class="uplifters-posts-featured-image__caption">' . esc_html( $caption ) . '</figcaption>';
					}

					return '<figure id="' . esc_attr( $unique_id ) . '"'
						. uplifters_site_builder_blocks_posts_section_child_attrs_html( $block_name, $attrs, array( 'uplifters-posts-featured-image', 'uplifters-posts-featured-image--default' ) )
						. '><div class="uplifters-posts-featured-image__media" style="' . esc_attr( $media_style ) . '">'
						. $image_html . '</div>' . $caption_html . '</figure>';
				}

				return '<figure id="' . esc_attr( $unique_id ) . '"'
					. uplifters_site_builder_blocks_posts_section_child_attrs_html( $block_name, $attrs, array( 'uplifters-posts-featured-image', 'uplifters-posts-featured-image--default', 'uplifters-posts-featured-image--placeholder' ) )
					. '><div class="uplifters-posts-featured-image__media" style="' . esc_attr( $media_style ) . '">'
					. '<div class="uplifters-posts-featured-image__placeholder">'
					. '<span class="uplifters-posts-featured-image__placeholder-icon" aria-hidden="true">&#9639;</span>'
					. '<span>' . esc_html__( 'Featured Image', 'uplifters-site-builder-blocks' ) . '</span>'
					. '</div></div></figure>';
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_posts_section_render_one_inner' ) ) {
	/**
	 * Render a single inner block, falling back to the custom renderer.
	 *
	 * @param mixed         $inner_block  WP_Block instance or parsed block array.
	 * @param WP_Block|null $parent_block Parent block instance.
	 * @return string
	 */
	function uplifters_site_builder_blocks_posts_section_render_one_inner( $inner_block, $parent_block = null ) {
		$name     = '';
		$attrs    = array();
		$rendered = '';

		if ( is_object( $inner_block ) ) {
			$parsed = isset( $inner_block->parsed_block ) && is_array( $inner_block->parsed_block ) ? $inner_block->parsed_block : array();
			$name   = isset( $inner_block->name ) ? $inner_block->name : ( $parsed['blockName'] ?? '' );
			$attrs  = isset( $inner_block->attributes ) && is_array( $inner_block->attributes ) ? $inner_block->attributes : ( $parsed['attrs'] ?? array() );
			if ( method_exists( $inner_block, 'render' ) ) {
				$rendered = $inner_block->render();
			}
		} elseif ( is_array( $inner_block ) ) {
			$name  = $inner_block['blockName'] ?? '';
			$attrs = isset( $inner_block['attrs'] ) && is_array( $inner_block['attrs'] ) ? $inner_block['attrs'] : array();
			if ( ! empty( $name ) ) {
				$rendered = render_block( $inner_block );
			}
		}

		/* Prefer the child's own render callback whenever it produces markup. */
		if ( ! uplifters_site_builder_blocks_posts_section_is_empty_render( $rendered ) ) {
			return $rendered;
		}

		return uplifters_site_builder_blocks_posts_section_render_child_custom( $name, $attrs, $parent_block );
	}
}

final class PostsSectionBlockRegister {

	const BLOCK_NAME  = 'uplifters-site-builder-blocks/posts-section';
	const STYLE_HANDLE = 'uplifters-site-builder-blocks-posts-section-style';

	/**
	 * Register the Posts Section block server-side via a plain
	 * register_block_type() args array — no block.json, no build/blocks/
	 * posts-section folder. Posts Section only ever lives inside Posts
	 * Layout (see the "parent" restriction declared in posts-section.js).
	 */
	public static function register(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		/*
		 * A no-source style handle purely so BlocksDynamicStyleGenerator can
		 * attach this block's per-instance responsive CSS to something WP
		 * will auto-enqueue whenever a Posts Section instance is rendered
		 * (the same mechanism block.json's "style" property drives).
		 */
		wp_register_style( self::STYLE_HANDLE, false, array(), UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION );

		register_block_type(
			self::BLOCK_NAME,
			array(
				'attributes'       => array(
					'align'           => array(
						'type'    => 'string',
						'default' => 'full',
					),
					'padding'         => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'gap'             => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 18,
							'tablet'  => 18,
							'mobile'  => 18,
						),
					),
					'borderRadius'    => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'backgroundColor' => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => '',
							'tablet'  => '',
							'mobile'  => '',
						),
					),
				),
				'uses_context'     => array( 'postId', 'postType' ),
				'provides_context' => array(
					'postId'   => 'postId',
					'postType' => 'postType',
				),
				'supports'         => array(
					'align' => array( 'full' ),
					'html'  => false,
				),
				'style'            => self::STYLE_HANDLE,
				'render_callback'  => array( __CLASS__, 'render' ),
			)
		);
	}

	/**
	 * Server-side render for Posts Section.
	 *
	 * Posts Section accepts any block as a child — it does not restrict its
	 * inner blocks. Every inner block is rendered through WordPress's normal
	 * render path ($inner_block->render() / render_block()) with no allowlist.
	 *
	 * Two of the original ten Posts blocks — posts-title and posts-featured-image
	 * — are style-only controller blocks whose own render.php always returns ''.
	 * When a child's normal render comes back empty, this fills in a
	 * controlled fallback for those two specifically (real post title / featured
	 * image markup, still carrying the child's saved attributes, classes, align,
	 * and common style settings). Any other block that renders empty on its own
	 * simply stays empty — nothing else receives fallback markup.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block default content.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block ) {
		/*
		 * View guard: Posts Section only ever renders inside Posts Layout,
		 * which is a single-post template block. On anything other than a
		 * real single post view it must render nothing at all, so the
		 * theme's own default post listing output is left completely
		 * untouched.
		 */
		if ( ! is_singular( 'post' ) ) {
			return '';
		}

		$padding_values          = uplifters_site_builder_blocks_b_posts_section_responsive_object( $attributes['padding'] ?? null, 0 );
		$gap_values              = uplifters_site_builder_blocks_b_posts_section_responsive_object( $attributes['gap'] ?? null, 18 );
		$border_radius_values    = uplifters_site_builder_blocks_b_posts_section_responsive_object( $attributes['borderRadius'] ?? null, 0 );
		$background_color_values = uplifters_site_builder_blocks_b_posts_section_responsive_object( $attributes['backgroundColor'] ?? null, '' );

		$unique_class = wp_unique_id( 'uplifters-site-builder-blocks-posts-section-' );
		$selector     = '.uplifters-site-builder-blocks-posts-section.' . $unique_class;

		$desktop_values = array(
			'padding'         => $padding_values['desktop'],
			'gap'             => $gap_values['desktop'],
			'borderRadius'    => $border_radius_values['desktop'],
			'backgroundColor' => $background_color_values['desktop'],
		);

		$tablet_values = array(
			'padding'         => $padding_values['tablet'],
			'gap'             => $gap_values['tablet'],
			'borderRadius'    => $border_radius_values['tablet'],
			'backgroundColor' => $background_color_values['tablet'],
		);

		$mobile_values = array(
			'padding'         => $padding_values['mobile'],
			'gap'             => $gap_values['mobile'],
			'borderRadius'    => $border_radius_values['mobile'],
			'backgroundColor' => $background_color_values['mobile'],
		);

		$css  = '';
		$css .= $selector . ' .uplifters-site-builder-blocks-posts-section__inner{';
		$css .= 'box-sizing:border-box;';
		$css .= 'display:flex;';
		$css .= 'flex-direction:column;';
		$css .= 'width:100%;';
		$css .= 'min-width:0;';
		$css .= '}';

		$css .= uplifters_site_builder_blocks_b_posts_section_device_css( $selector . ' .uplifters-site-builder-blocks-posts-section__inner', $desktop_values );
		$css .= '@media (max-width:1024px){' . uplifters_site_builder_blocks_b_posts_section_device_css( $selector . ' .uplifters-site-builder-blocks-posts-section__inner', $tablet_values ) . '}';
		$css .= '@media (max-width:767px){' . uplifters_site_builder_blocks_b_posts_section_device_css( $selector . ' .uplifters-site-builder-blocks-posts-section__inner', $mobile_values ) . '}';

		$inner_content = '';

		/* Parsed inner blocks first: names and attributes survive even when a child render is empty. */
		if ( isset( $block ) && ! empty( $block->parsed_block['innerBlocks'] ) && is_array( $block->parsed_block['innerBlocks'] ) ) {
			foreach ( $block->parsed_block['innerBlocks'] as $parsed_inner_block ) {
				$inner_content .= uplifters_site_builder_blocks_posts_section_render_one_inner( $parsed_inner_block, $block );
			}
		}

		/* Fallback to the WP_Block inner block objects. */
		if ( '' === trim( $inner_content ) && isset( $block ) && ! empty( $block->inner_blocks ) && is_array( $block->inner_blocks ) ) {
			foreach ( $block->inner_blocks as $inner_block ) {
				$inner_content .= uplifters_site_builder_blocks_posts_section_render_one_inner( $inner_block, $block );
			}
		}

		/* Nothing saved yet: show the demo layout instead of an empty box. */
		if ( '' === trim( $inner_content ) ) {
			$default_blocks = array(
				'uplifters-site-builder-blocks/posts-featured-image',
				'uplifters-site-builder-blocks/posts-title',
			);
			foreach ( $default_blocks as $default_block_name ) {
				$inner_content .= uplifters_site_builder_blocks_posts_section_render_child_custom( $default_block_name, array(), $block ?? null );
			}
		}

		if ( '' === trim( $inner_content ) ) {
			return '';
		}

		\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $css );

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => 'uplifters-site-builder-blocks-posts-section ' . $unique_class,
			)
		);

		$html  = '<div ' . wp_kses( $wrapper_attributes, array() ) . '>';
		$html .= '<div class="uplifters-site-builder-blocks-posts-section__inner" data-uplifters-site-builder-blocks-posts-section-inner="true">';
		$html .= wp_kses( $inner_content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
		$html .= '</div></div>';

		return $html;
	}
}
