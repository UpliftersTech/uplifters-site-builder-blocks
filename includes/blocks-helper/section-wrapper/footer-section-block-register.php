<?php
/**
 * Manual (no block.json) server-side registration for the Footer Section
 * block, now that it lives inside the Footer Layout folder as
 * footer-section.js with no editor Inspector of its own. Every user-facing
 * spacing/color/mobile-stack control for this section lives on the parent
 * Footer Layout block; this file only keeps the dynamic rendering
 * (responsive column widths, per-device markup) working exactly as it did
 * when the block had its own build/blocks/footer-section/block.json +
 * render.php.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class FooterSectionBlockRegister {

	const BLOCK_NAME   = 'uplifters-site-builder-blocks/footer-section';
	const STYLE_HANDLE = 'uplifters-site-builder-blocks-footer-section-style';

	/**
	 * Register the Footer Section block server-side via a plain
	 * register_block_type() args array — no block.json, no build/blocks/
	 * footer-section folder. Footer Section only ever lives inside Footer
	 * Layout (see the "parent" restriction declared in footer-section.js).
	 */
	public static function register(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		wp_register_style( self::STYLE_HANDLE, false, array(), UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION );

		register_block_type(
			self::BLOCK_NAME,
			array(
				'attributes'      => array(
					'align'                => array(
						'type'    => 'string',
						'default' => 'full',
					),
					'columnWidths'         => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => array( 25, 25, 25, 25 ),
							'tablet'  => array( 25, 25, 25, 25 ),
							'mobile'  => array( 25, 25, 25, 25 ),
						),
					),
					'verticalAlignment'    => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 'center',
							'tablet'  => 'center',
							'mobile'  => 'center',
						),
					),
					'responsiveBlockOrder' => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => array(),
							'tablet'  => array(),
							'mobile'  => array(),
						),
					),
					'height'               => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'mobileStack'          => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'borderRadius'         => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'gap'                  => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'backgroundColor'      => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => '',
							'tablet'  => '',
							'mobile'  => '',
						),
					),
				),
				'supports'        => array(
					'align' => array( 'full' ),
					'html'  => false,
				),
				'style'           => self::STYLE_HANDLE,
				'render_callback' => array( __CLASS__, 'render' ),
			)
		);
	}

	/**
	 * Server-side render for Footer Section.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block default content.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block ) {
		$max_column_count = 4;

		$get_equal_widths = static function ( $count ) {
			return array_fill( 0, $count, 100 / $count );
		};

		$is_list_array = static function ( $value ) {
			if ( ! is_array( $value ) ) {
				return false;
			}

			if ( array() === $value ) {
				return true;
			}

			return array_keys( $value ) === range( 0, count( $value ) - 1 );
		};

		$normalize_widths = static function ( $widths, $count ) use ( $get_equal_widths ) {
			if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
				return $get_equal_widths( $count );
			}

			$numeric_widths = array_map(
				static function ( $width ) {
					return is_numeric( $width ) ? (float) $width : 0;
				},
				$widths
			);

			$total = array_sum( $numeric_widths );

			if ( $total <= 0 ) {
				return $get_equal_widths( $count );
			}

			return array_map(
				static function ( $width ) use ( $total ) {
					return round( ( $width / $total ) * 100, 4 );
				},
				$numeric_widths
			);
		};

		$normalize_vertical_alignment = static function ( $alignment ) {
			$allowed_alignments = array( 'start', 'center', 'end' );

			if ( in_array( $alignment, $allowed_alignments, true ) ) {
				return $alignment;
			}

			return 'center';
		};

		$get_responsive_widths = static function ( $column_widths, $device, $column_count ) use ( $normalize_widths, $is_list_array ) {
			if ( $is_list_array( $column_widths ) ) {
				return $normalize_widths( $column_widths, $column_count );
			}

			if (
				is_array( $column_widths ) &&
				isset( $column_widths[ $device ] ) &&
				is_array( $column_widths[ $device ] )
			) {
				return $normalize_widths( $column_widths[ $device ], $column_count );
			}

			if (
				is_array( $column_widths ) &&
				isset( $column_widths['desktop'] ) &&
				is_array( $column_widths['desktop'] )
			) {
				return $normalize_widths( $column_widths['desktop'], $column_count );
			}

			return $normalize_widths( array(), $column_count );
		};

		$get_responsive_vertical_alignment = static function ( $vertical_alignment, $device ) use ( $normalize_vertical_alignment ) {
			if ( is_string( $vertical_alignment ) ) {
				return $normalize_vertical_alignment( $vertical_alignment );
			}

			if (
				is_array( $vertical_alignment ) &&
				isset( $vertical_alignment[ $device ] ) &&
				is_string( $vertical_alignment[ $device ] )
			) {
				return $normalize_vertical_alignment( $vertical_alignment[ $device ] );
			}

			if (
				is_array( $vertical_alignment ) &&
				isset( $vertical_alignment['desktop'] ) &&
				is_string( $vertical_alignment['desktop'] )
			) {
				return $normalize_vertical_alignment( $vertical_alignment['desktop'] );
			}

			return 'center';
		};

		$normalize_css_size_value = static function ( $value ) {
			if ( is_int( $value ) || is_float( $value ) ) {
				return $value . 'px';
			}

			if ( ! is_string( $value ) ) {
				return '';
			}

			$value = trim( $value );

			if ( '' === $value ) {
				return '';
			}

			if ( preg_match( '/^[0-9.]+(?:px|%|em|rem|vw|vh)?$/', $value ) ) {
				return $value;
			}

			return '';
		};

		$normalize_height_value = static function ( $value ) {
			if ( is_int( $value ) || is_float( $value ) || is_numeric( $value ) ) {
				$number = (float) $value;

				return $number > 0 ? round( $number ) . 'px' : '';
			}

			if ( ! is_string( $value ) ) {
				return '';
			}

			$value = trim( $value );

			if ( '' === $value ) {
				return '';
			}

			if ( preg_match( '/^[0-9.]+(?:px)?$/', $value ) ) {
				$number = (float) $value;

				return $number > 0 ? round( $number ) . 'px' : '';
			}

			return '';
		};

		$normalize_color_value = static function ( $value ) {
			if ( ! is_string( $value ) ) {
				return '';
			}

			$value = trim( $value );

			if ( '' === $value ) {
				return '';
			}

			if ( preg_match( '/^#[0-9a-fA-F]{3,8}$/', $value ) ) {
				return $value;
			}

			if ( preg_match( '/^var\(--[a-zA-Z0-9_-]+\)$/', $value ) ) {
				return $value;
			}

			return '';
		};

		$get_responsive_style_value = static function ( $values, $device, $normalize_value ) {
			if ( is_string( $values ) || is_numeric( $values ) ) {
				return $normalize_value( $values );
			}

			if (
				is_array( $values ) &&
				isset( $values[ $device ] )
			) {
				return $normalize_value( $values[ $device ] );
			}

			if (
				is_array( $values ) &&
				isset( $values['desktop'] )
			) {
				return $normalize_value( $values['desktop'] );
			}

			return '';
		};

		$get_grid_template_columns = static function ( $widths, $column_count ) use ( $normalize_widths ) {
			$normalized_widths = $normalize_widths( $widths, $column_count );

			$columns = array_map(
				static function ( $width ) {
					return 'minmax(0, ' . esc_attr( $width ) . 'fr)';
				},
				$normalized_widths
			);

			return implode( ' ', $columns );
		};

		$get_inner_blocks = static function ( $block_instance ) {
			if (
				! $block_instance ||
				! isset( $block_instance->parsed_block ) ||
				! isset( $block_instance->parsed_block['innerBlocks'] ) ||
				! is_array( $block_instance->parsed_block['innerBlocks'] )
			) {
				return array();
			}

			return $block_instance->parsed_block['innerBlocks'];
		};

		$get_active_column_count = static function ( $inner_blocks ) use ( $max_column_count ) {
			$count = is_array( $inner_blocks ) ? count( $inner_blocks ) : 0;

			if ( $count > 0 ) {
				return $count;
			}

			return $max_column_count;
		};

		$render_inner_blocks = static function ( $inner_blocks ) {
			$output = '';

			foreach ( $inner_blocks as $inner_block ) {
				$output .= render_block( $inner_block );
			}

			return $output;
		};

		$column_widths      = isset( $attributes['columnWidths'] ) ? $attributes['columnWidths'] : array();
		$vertical_alignment = isset( $attributes['verticalAlignment'] ) ? $attributes['verticalAlignment'] : array();
		$height             = isset( $attributes['height'] ) ? $attributes['height'] : array();
		$mobile_stack       = isset( $attributes['mobileStack'] ) ? (bool) $attributes['mobileStack'] : false;
		$border_radius      = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : array();
		$gap                = isset( $attributes['gap'] ) ? $attributes['gap'] : array();
		$background_color   = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : array();

		$inner_blocks = $get_inner_blocks( isset( $block ) ? $block : null );

		$active_column_count = $get_active_column_count( $inner_blocks );

		$desktop_widths = $get_responsive_widths( $column_widths, 'desktop', $active_column_count );
		$tablet_widths  = $get_responsive_widths( $column_widths, 'tablet', $active_column_count );
		$mobile_widths  = $get_responsive_widths( $column_widths, 'mobile', $active_column_count );

		$desktop_vertical_alignment = $get_responsive_vertical_alignment( $vertical_alignment, 'desktop' );
		$tablet_vertical_alignment  = $get_responsive_vertical_alignment( $vertical_alignment, 'tablet' );
		$mobile_vertical_alignment  = $get_responsive_vertical_alignment( $vertical_alignment, 'mobile' );

		$desktop_height = $get_responsive_style_value( $height, 'desktop', $normalize_height_value );
		$tablet_height  = $get_responsive_style_value( $height, 'tablet', $normalize_height_value );
		$mobile_height  = $get_responsive_style_value( $height, 'mobile', $normalize_height_value );

		$desktop_gap = $get_responsive_style_value( $gap, 'desktop', $normalize_css_size_value );
		$tablet_gap  = $get_responsive_style_value( $gap, 'tablet', $normalize_css_size_value );
		$mobile_gap  = $get_responsive_style_value( $gap, 'mobile', $normalize_css_size_value );

		$desktop_border_radius    = $get_responsive_style_value( $border_radius, 'desktop', $normalize_css_size_value );
		$tablet_border_radius     = $get_responsive_style_value( $border_radius, 'tablet', $normalize_css_size_value );
		$mobile_border_radius     = $get_responsive_style_value( $border_radius, 'mobile', $normalize_css_size_value );
		$desktop_background_color = $get_responsive_style_value( $background_color, 'desktop', $normalize_color_value );
		$tablet_background_color  = $get_responsive_style_value( $background_color, 'tablet', $normalize_color_value );
		$mobile_background_color  = $get_responsive_style_value( $background_color, 'mobile', $normalize_color_value );

		/*
		 * Footer blocks render in the same natural innerBlocks order on every
		 * device — footer-section has no per-device reorder feature. Each device
		 * still gets its own <div> below because column widths and visibility
		 * remain per-device via the resizer; only the order is shared.
		 */
		$desktop_inner_blocks = $inner_blocks;
		$tablet_inner_blocks  = $inner_blocks;
		$mobile_inner_blocks  = $inner_blocks;

		$block_id = 'uplifters-site-builder-blocks-footer-section-' . wp_unique_id();

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id'                                                 => $block_id,
				'class'                                              => 'uplifters-site-builder-blocks-footer-section',
				'data-uplifters-site-builder-blocks-footer-section' => 'true',
				'data-uplifters-site-builder-blocks-column-count'   => (string) $active_column_count,
				'data-uplifters-site-builder-blocks-mobile-stack'   => $mobile_stack ? 'true' : 'false',
				'style'                                              => 'box-sizing:border-box;position:relative;width:100%;',
			)
		);

		$desktop_columns = $get_grid_template_columns( $desktop_widths, $active_column_count );
		$tablet_columns  = $get_grid_template_columns( $tablet_widths, $active_column_count );
		$mobile_columns  = $mobile_stack ? 'minmax(0, 1fr)' : $get_grid_template_columns( $mobile_widths, $active_column_count );

		$css  = '#' . $block_id . '{';
		if ( '' !== $desktop_background_color ) {
			$css .= 'background-color:' . $desktop_background_color . ';';
		}
		if ( '' !== $desktop_border_radius ) {
			$css .= 'border-radius:' . $desktop_border_radius . ';';
		}
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner{';
		$css .= 'box-sizing:border-box;display:grid;grid-auto-flow:column;min-width:0;width:100%;';
		$css .= 'gap:' . ( '' !== $desktop_gap ? $desktop_gap : '0px' ) . ';';
		$css .= '--wp--style--block-gap:' . ( '' !== $desktop_gap ? $desktop_gap : '0px' ) . ';';
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner > *{';
		$css .= 'box-sizing:border-box;min-width:0;';
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--desktop{';
		$css .= 'align-content:' . $desktop_vertical_alignment . ';align-items:' . $desktop_vertical_alignment . ';';
		if ( '' !== $desktop_height ) {
			$css .= 'height:' . $desktop_height . ';';
		}
		$css .= 'grid-template-columns:' . $desktop_columns . ';';
		if ( '' !== $desktop_background_color ) {
			$css .= 'background-color:' . $desktop_background_color . ';';
		}
		if ( '' !== $desktop_border_radius ) {
			$css .= 'border-radius:' . $desktop_border_radius . ';overflow:hidden;';
		}
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--tablet,';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--mobile{display:none;}';

		$css .= '@media (max-width:1024px){';
		$css .= '#' . $block_id . '{';
		if ( '' !== $tablet_background_color ) {
			$css .= 'background-color:' . $tablet_background_color . ';';
		}
		if ( '' !== $tablet_border_radius ) {
			$css .= 'border-radius:' . $tablet_border_radius . ';';
		}
		$css .= '}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--desktop{display:none;}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--tablet{';
		$css .= 'align-content:' . $tablet_vertical_alignment . ';align-items:' . $tablet_vertical_alignment . ';';
		if ( '' !== $tablet_height ) {
			$css .= 'height:' . $tablet_height . ';';
		}
		$css .= 'display:grid;grid-auto-flow:column;grid-template-columns:' . $tablet_columns . ';';
		$css .= 'gap:' . ( '' !== $tablet_gap ? $tablet_gap : '0px' ) . ';';
		$css .= '--wp--style--block-gap:' . ( '' !== $tablet_gap ? $tablet_gap : '0px' ) . ';';
		if ( '' !== $tablet_background_color ) {
			$css .= 'background-color:' . $tablet_background_color . ';';
		}
		if ( '' !== $tablet_border_radius ) {
			$css .= 'border-radius:' . $tablet_border_radius . ';overflow:hidden;';
		}
		$css .= '}';
		$css .= '}';

		$css .= '@media (max-width:767px){';
		$css .= '#' . $block_id . '{';
		if ( '' !== $mobile_background_color ) {
			$css .= 'background-color:' . $mobile_background_color . ';';
		}
		if ( '' !== $mobile_border_radius ) {
			$css .= 'border-radius:' . $mobile_border_radius . ';';
		}
		$css .= '}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--tablet{display:none;}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-footer-section__inner--mobile{';
		$css .= 'align-content:' . $mobile_vertical_alignment . ';align-items:' . $mobile_vertical_alignment . ';';
		if ( '' !== $mobile_height ) {
			$css .= 'height:' . $mobile_height . ';';
		}
		$css .= 'display:grid;grid-auto-flow:' . ( $mobile_stack ? 'row' : 'column' ) . ';grid-template-columns:' . $mobile_columns . ';';
		$css .= 'gap:' . ( '' !== $mobile_gap ? $mobile_gap : '0px' ) . ';';
		$css .= '--wp--style--block-gap:' . ( '' !== $mobile_gap ? $mobile_gap : '0px' ) . ';';
		if ( '' !== $mobile_background_color ) {
			$css .= 'background-color:' . $mobile_background_color . ';';
		}
		if ( '' !== $mobile_border_radius ) {
			$css .= 'border-radius:' . $mobile_border_radius . ';overflow:hidden;';
		}
		$css .= '}';
		$css .= '}';

		\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $css );

		$html = '<div ' . wp_kses( $wrapper_attributes, array() ) . '>';

		if ( ! empty( $desktop_inner_blocks ) ) {
			$html .= '<div class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--desktop" data-uplifters-site-builder-blocks-footer-section-inner="desktop">';
			$html .= wp_kses( $render_inner_blocks( $desktop_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		}

		if ( ! empty( $tablet_inner_blocks ) ) {
			$html .= '<div class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--tablet" data-uplifters-site-builder-blocks-footer-section-inner="tablet">';
			$html .= wp_kses( $render_inner_blocks( $tablet_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		}

		if ( ! empty( $mobile_inner_blocks ) ) {
			$html .= '<div class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--mobile" data-uplifters-site-builder-blocks-footer-section-inner="mobile">';
			$html .= wp_kses( $render_inner_blocks( $mobile_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		}

		if ( empty( $inner_blocks ) ) {
			$html .= '<div class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--desktop" data-uplifters-site-builder-blocks-footer-section-inner="desktop">';
			$html .= wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		}

		$html .= '</div>';

		return $html;
	}
}
