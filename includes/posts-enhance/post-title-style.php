<?php
/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS PostsTitle frontend single post title style handler.
 *
 * This file:
 * - Registers the post meta used by edit.js.
 * - Reads the saved title style from the current single post.
 * - Prints pure CSS in frontend <head>.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\PostsEnhance;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

	final class PostTitleStyle {
		const META_KEY = 'uplifters_site_builder_blocks_post_title_style';

		public static function register() {
			add_action( 'init', array( __CLASS__, 'register_meta' ) );
			add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_single_post_title_style' ) );
		}

		public static function register_meta() {
			register_post_meta(
				'post',
				self::META_KEY,
				array(
					'type'              => 'object',
					'single'            => true,
					'default'           => array(
						'titleColor'      => array(
							'desktop' => '#111827',
							'tablet'  => '#111827',
							'mobile'  => '#111827',
						),
						'titleFontSize'   => array(
							'desktop' => 18,
							'tablet'  => 17,
							'mobile'  => 16,
						),
						'titleFontFamily' => array(
							'desktop' => 'inherit',
							'tablet'  => 'inherit',
							'mobile'  => 'inherit',
						),
					),
					'sanitize_callback' => array( __CLASS__, 'sanitize_meta' ),
					'auth_callback'     => array( __CLASS__, 'auth_meta' ),
					'show_in_rest'      => array(
						'schema' => array(
							'type'       => 'object',
							'properties' => array(
								'titleColor' => array(
									'type'       => 'object',
									'properties' => array(
										'desktop' => array(
											'type' => 'string',
										),
										'tablet'  => array(
											'type' => 'string',
										),
										'mobile'  => array(
											'type' => 'string',
										),
									),
								),
								'titleFontSize' => array(
									'type'       => 'object',
									'properties' => array(
										'desktop' => array(
											'type' => 'number',
										),
										'tablet'  => array(
											'type' => 'number',
										),
										'mobile'  => array(
											'type' => 'number',
										),
									),
								),
								'titleFontFamily' => array(
									'type'       => 'object',
									'properties' => array(
										'desktop' => array(
											'type' => 'string',
										),
										'tablet'  => array(
											'type' => 'string',
										),
										'mobile'  => array(
											'type' => 'string',
										),
									),
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

		public static function sanitize_meta( $value ) {
			if ( ! is_array( $value ) ) {
				return array(
					'titleColor'      => array(
						'desktop' => '#111827',
						'tablet'  => '#111827',
						'mobile'  => '#111827',
					),
					'titleFontSize'   => array(
						'desktop' => 18,
						'tablet'  => 17,
						'mobile'  => 16,
					),
					'titleFontFamily' => array(
						'desktop' => 'inherit',
						'tablet'  => 'inherit',
						'mobile'  => 'inherit',
					),
				);
			}

			$title_color       = self::sanitize_responsive_color( $value['titleColor'] ?? '#111827' );
			$title_font_size   = self::sanitize_responsive_font_size( $value['titleFontSize'] ?? 18 );
			$title_font_family = self::sanitize_responsive_font_family( $value['titleFontFamily'] ?? 'inherit' );

			return array(
				'titleColor'      => $title_color,
				'titleFontSize'   => $title_font_size,
				'titleFontFamily' => $title_font_family,
			);
		}

		private static function sanitize_responsive_color( $value ) {
			$defaults = array(
				'desktop' => '#111827',
				'tablet'  => '#111827',
				'mobile'  => '#111827',
			);

			if ( ! is_array( $value ) ) {
				$value = array(
					'desktop' => $value,
					'tablet'  => $value,
					'mobile'  => $value,
				);
			}

			$sanitized = array();

			foreach ( $defaults as $device => $fallback ) {
				$color = isset( $value[ $device ] ) ? sanitize_text_field( $value[ $device ] ) : $fallback;
				$color = sanitize_hex_color( $color ) ?: $fallback;

				$sanitized[ $device ] = $color;
			}

			return $sanitized;
		}

		private static function sanitize_responsive_font_size( $value ) {
			$defaults = array(
				'desktop' => 18,
				'tablet'  => 17,
				'mobile'  => 16,
			);

			if ( ! is_array( $value ) ) {
				$value = array(
					'desktop' => $value,
					'tablet'  => $value,
					'mobile'  => $value,
				);
			}

			$sanitized = array();

			foreach ( $defaults as $device => $fallback ) {
				$font_size = isset( $value[ $device ] ) ? absint( $value[ $device ] ) : $fallback;

				if ( $font_size < 1 ) {
					$font_size = $fallback;
				}

				if ( $font_size > 300 ) {
					$font_size = 300;
				}

				$sanitized[ $device ] = $font_size;
			}

			return $sanitized;
		}

		private static function sanitize_responsive_font_family( $value ) {
			$defaults = array(
				'desktop' => 'inherit',
				'tablet'  => 'inherit',
				'mobile'  => 'inherit',
			);

			if ( ! is_array( $value ) ) {
				$value = array(
					'desktop' => $value,
					'tablet'  => $value,
					'mobile'  => $value,
				);
			}

			$sanitized = array();

			foreach ( $defaults as $device => $fallback ) {
				$sanitized[ $device ] = isset( $value[ $device ] ) ? sanitize_text_field( $value[ $device ] ) : $fallback;
			}

			return $sanitized;
		}

		private static function responsive_value( array $style, string $key, string $device, $fallback ) {
			if ( ! array_key_exists( $key, $style ) ) {
				return $fallback;
			}

			$value = $style[ $key ];

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

			return '' !== $value && null !== $value ? $value : $fallback;
		}

		private static function title_css_rules( array $style, string $device ) : string {
			$title_color = sanitize_hex_color(
				self::responsive_value( $style, 'titleColor', $device, '#111827' )
			);
			$font_size   = absint(
				self::responsive_value( $style, 'titleFontSize', $device, 18 )
			);

			$css_rules = array();

			if ( $title_color ) {
				$css_rules[] = 'color: ' . $title_color . ' !important';
			}

			if ( $font_size > 0 ) {
				$css_rules[] = 'font-size: ' . $font_size . 'px !important';
			}

			$font_family_key = self::responsive_value( $style, 'titleFontFamily', $device, 'inherit' );
			$font_family_css = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $font_family_key );

			if ( $font_family_css ) {
				$css_rules[] = 'font-family: ' . $font_family_css . ' !important';

				/*
				 * This meta-driven CSS renders on the single-post page, which is a
				 * different request than wherever the PostsTitle controller block
				 * itself sits — the render_block_data auto-enqueue filter in
				 * FontsRegister never sees this page, so the font has to be
				 * enqueued explicitly right here, the only place that knows it's
				 * about to be used.
				 */
				\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::enqueue_for_family( $font_family_key );
			}

			return empty( $css_rules ) ? '' : implode( '; ', $css_rules ) . ';';
		}

		public static function enqueue_single_post_title_style() {
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

			$selector = 'body.single-post h1.wp-block-post-title, body.single-post .wp-block-post-title, body.single-post .entry-title, body.single-post h1.entry-title';

			$css = '';

			/*
			 * The Posts Layout block renders its own title inside the post
			 * content. When it is present, the theme's separate title output
			 * must be hidden or the same title shows twice on the page.
			 */
			if ( has_block( 'uplifters-site-builder-blocks/posts-layout', $post_id ) ) {
				$css .= $selector . '{display:none !important;}';
			}

			$style = get_post_meta( $post_id, self::META_KEY, true );

			if ( ! empty( $style ) && is_array( $style ) ) {
				$desktop_css = self::title_css_rules( $style, 'desktop' );
				$tablet_css  = self::title_css_rules( $style, 'tablet' );
				$mobile_css  = self::title_css_rules( $style, 'mobile' );

				if ( $desktop_css || $tablet_css || $mobile_css ) {
					$css .= $selector . '{' . $desktop_css . '}';
					$css .= '@media (max-width: 1024px){' . $selector . '{' . $tablet_css . '}}';
					$css .= '@media (max-width: 767px){' . $selector . '{' . $mobile_css . '}}';
				}
			}

			if ( '' === $css ) {
				return;
			}

			$version = defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION' ) ? UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION : '1.0.0';

			wp_register_style( 'uplifters-site-builder-blocks-posts-title-single-style', false, array(), $version );
			wp_enqueue_style( 'uplifters-site-builder-blocks-posts-title-single-style' );
			wp_add_inline_style( 'uplifters-site-builder-blocks-posts-title-single-style', wp_strip_all_tags( $css ) );
		}
}
