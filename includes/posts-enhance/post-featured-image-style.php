<?php
/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS PostsFeaturedImage frontend single post featured image style handler.
 *
 * This file:
 * - Registers the post meta used by edit.js.
 * - Reads the saved featured image style from the current single post.
 * - Prints pure CSS in frontend <head>.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\PostsEnhance;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

	final class PostFeaturedImageStyle {
		const META_KEY = 'uplifters_site_builder_blocks_post_featured_image_style';

		public static function register() {
			add_action( 'init', array( __CLASS__, 'register_meta' ) );
			add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_single_post_featured_image_style' ) );
		}

		public static function register_meta() {
			register_post_meta(
				'post',
				self::META_KEY,
				array(
					'type'              => 'object',
					'single'            => true,
					'default'           => self::get_default_style(),
					'sanitize_callback' => array( __CLASS__, 'sanitize_meta' ),
					'auth_callback'     => array( __CLASS__, 'auth_meta' ),
					'show_in_rest'      => array(
						'schema' => array(
							'type'       => 'object',
							'properties' => array(
								'imageBackgroundColor' => array(
									'type' => 'string',
								),
								'imageBorderRadius' => array(
									'type' => 'number',
								),
								'imageShadowX' => array(
									'type' => 'number',
								),
								'imageShadowY' => array(
									'type' => 'number',
								),
								'imageShadowBlur' => array(
									'type' => 'number',
								),
								'imageShadowSpread' => array(
									'type' => 'number',
								),
								'imageShadowOpacity' => array(
									'type' => 'number',
								),
							),
						),
					),
				)
			);
		}

		public static function auth_meta( $allowed, $meta_key, $post_id ) {
			return current_user_can( 'edit_post', $post_id );
		}

		private static function get_default_style() {
			return array(
				'imageBackgroundColor' => '#ffffff',
				'imageBorderRadius'    => 12,
				'imageShadowX'         => 0,
				'imageShadowY'         => 10,
				'imageShadowBlur'      => 30,
				'imageShadowSpread'    => 0,
				'imageShadowOpacity'   => 0.18,
			);
		}

		private static function clamp( $value, $min, $max, $fallback ) {
			if ( ! is_numeric( $value ) ) {
				return $fallback;
			}

			$value = floatval( $value );

			if ( $value < $min ) {
				return $min;
			}

			if ( $value > $max ) {
				return $max;
			}

			return $value;
		}

		public static function sanitize_meta( $value ) {
			if ( ! is_array( $value ) ) {
				return self::get_default_style();
			}

			$image_background_color = isset( $value['imageBackgroundColor'] ) ? sanitize_text_field( $value['imageBackgroundColor'] ) : '#ffffff';
			$hex_color              = sanitize_hex_color( $image_background_color );

			if ( $hex_color ) {
				$image_background_color = $hex_color;
			} else {
				$image_background_color = '#ffffff';
			}

			return array(
				'imageBackgroundColor' => $image_background_color,
				'imageBorderRadius'    => self::clamp( $value['imageBorderRadius'] ?? 12, 0, 200, 12 ),
				'imageShadowX'         => self::clamp( $value['imageShadowX'] ?? 0, -100, 100, 0 ),
				'imageShadowY'         => self::clamp( $value['imageShadowY'] ?? 10, -100, 100, 10 ),
				'imageShadowBlur'      => self::clamp( $value['imageShadowBlur'] ?? 30, 0, 200, 30 ),
				'imageShadowSpread'    => self::clamp( $value['imageShadowSpread'] ?? 0, -100, 100, 0 ),
				'imageShadowOpacity'   => self::clamp( $value['imageShadowOpacity'] ?? 0.18, 0, 1, 0.18 ),
			);
		}

		public static function enqueue_single_post_featured_image_style() {
			if ( is_admin() ) {
				return;
			}

			if ( ! is_singular( 'post' ) ) {
				return;
			}

			$post_id = get_queried_object_id();

			if ( ! $post_id ) {
				return;
			}

			$image_selector = 'body.single-post .wp-block-post-featured-image, body.single-post .post-thumbnail, body.single-post .entry-featured-image, body.single-post .featured-image';

			$css = '';

			/*
			 * The Posts Layout block renders its own featured image inside
			 * the post content. When it is present, the theme's separate
			 * featured image output must be hidden or the same image shows
			 * twice on the page.
			 */
			if ( has_block( 'uplifters-site-builder-blocks/posts-layout', $post_id ) ) {
				$css .= $image_selector . '{display:none !important;}';
			}

			$style = get_post_meta( $post_id, self::META_KEY, true );

			if ( ! empty( $style ) && is_array( $style ) ) {
				$image_background_color = isset( $style['imageBackgroundColor'] ) ? sanitize_hex_color( $style['imageBackgroundColor'] ) : '#ffffff';
				$image_border_radius    = self::clamp( $style['imageBorderRadius'] ?? 12, 0, 200, 12 );
				$image_shadow_x         = self::clamp( $style['imageShadowX'] ?? 0, -100, 100, 0 );
				$image_shadow_y         = self::clamp( $style['imageShadowY'] ?? 10, -100, 100, 10 );
				$image_shadow_blur      = self::clamp( $style['imageShadowBlur'] ?? 30, 0, 200, 30 );
				$image_shadow_spread    = self::clamp( $style['imageShadowSpread'] ?? 0, -100, 100, 0 );
				$image_shadow_opacity   = self::clamp( $style['imageShadowOpacity'] ?? 0.18, 0, 1, 0.18 );

				$box_shadow = $image_shadow_x . 'px ' . $image_shadow_y . 'px ' . $image_shadow_blur . 'px ' . $image_shadow_spread . 'px rgba(0, 0, 0, ' . $image_shadow_opacity . ')';

				$css .= $image_selector . '{';
				$css .= 'background-color:' . esc_html( $image_background_color ) . ' !important;';
				$css .= 'border-radius:' . esc_html( $image_border_radius ) . 'px !important;';
				$css .= 'box-shadow:' . esc_html( $box_shadow ) . ' !important;';
				$css .= 'overflow:hidden !important;';
				$css .= '}';
				$css .= 'body.single-post .wp-block-post-featured-image img,';
				$css .= 'body.single-post .post-thumbnail img,';
				$css .= 'body.single-post .entry-featured-image img,';
				$css .= 'body.single-post .featured-image img{';
				$css .= 'display:block !important;';
				$css .= 'width:100% !important;';
				$css .= 'height:auto !important;';
				$css .= 'border-radius:' . esc_html( $image_border_radius ) . 'px !important;';
				$css .= '}';
			}

			if ( '' === $css ) {
				return;
			}

			$version = defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION' ) ? UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION : '1.0.0';

			wp_register_style( 'uplifters-site-builder-blocks-posts-featured-image-style', false, array(), $version );
			wp_enqueue_style( 'uplifters-site-builder-blocks-posts-featured-image-style' );
			wp_add_inline_style( 'uplifters-site-builder-blocks-posts-featured-image-style', wp_strip_all_tags( $css ) );
		}
}
