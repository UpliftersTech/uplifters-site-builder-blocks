<?php
/**
 * Manual (no block.json) server-side registration for the Header Section
 * block, now that it lives inside the Header Layout folder as
 * header-section.js with no editor Inspector of its own. Every user-facing
 * spacing/color control for this section lives on the parent Header Layout
 * block; this file only keeps the dynamic rendering (responsive column
 * widths/order, per-device markup) working exactly as it did when the block
 * had its own build/blocks/header-section/block.json + render.php.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class HeaderSectionBlockRegister {

	const BLOCK_NAME   = 'uplifters-site-builder-blocks/header-section';
	const STYLE_HANDLE = 'uplifters-site-builder-blocks-header-section-style';

	/**
	 * Register the Header Section block server-side via a plain
	 * register_block_type() args array — no block.json, no build/blocks/
	 * header-section folder. Header Section only ever lives inside Header
	 * Layout (see the "parent" restriction declared in header-section.js).
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
					'height'               => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => '',
							'tablet'  => '',
							'mobile'  => '',
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
					'borderRadius'         => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => '',
							'tablet'  => '',
							'mobile'  => '',
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
	 * Server-side render for Header Section.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block default content.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block ) {
		$default_column_count = 4;

		$get_default_widths_for_count = static function ( $count ) {
			if ( 4 === (int) $count ) {
				return array( 25, 25, 25, 25 );
			}

			if ( 3 === (int) $count ) {
				return array( 33, 34, 33 );
			}

			if ( 2 === (int) $count ) {
				return array( 50, 50 );
			}

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

		$normalize_widths = static function ( $widths, $count ) use ( $get_default_widths_for_count ) {
			if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
				return $get_default_widths_for_count( $count );
			}

			$numeric_widths = array_map(
				static function ( $width ) {
					return is_numeric( $width ) ? (float) $width : 0;
				},
				$widths
			);

			$total = array_sum( $numeric_widths );

			if ( $total <= 0 ) {
				return $get_default_widths_for_count( $count );
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

		/*
		 * Order entries are "block-name#occurrence" composite keys, not raw block
		 * names — mirrors header-section.js exactly. A legacy entry (no "#")
		 * is migrated in place as occurrence 0, since every pre-existing saved
		 * array had at most one entry per name by construction. The migration is
		 * naturally idempotent: an already-migrated entry already contains "#"
		 * and passes through unchanged.
		 */
		$migrate_order_entry = static function ( $entry ) {
			if ( ! is_string( $entry ) || '' === $entry ) {
				return '';
			}

			return ( false !== strpos( $entry, '#' ) ) ? $entry : $entry . '#0';
		};

		$get_composite_block_keys = static function ( $inner_blocks ) {
			$occurrence_counts = array();
			$keys              = array();

			foreach ( $inner_blocks as $inner_block ) {
				$name = isset( $inner_block['blockName'] ) ? $inner_block['blockName'] : '';

				if ( '' === $name ) {
					$keys[] = '';
					continue;
				}

				$occurrence                 = isset( $occurrence_counts[ $name ] ) ? $occurrence_counts[ $name ] : 0;
				$occurrence_counts[ $name ] = $occurrence + 1;

				$keys[] = $name . '#' . $occurrence;
			}

			return $keys;
		};

		$normalize_block_order = static function ( $order ) use ( $migrate_order_entry ) {
			if ( ! is_array( $order ) ) {
				return array();
			}

			$normalized_order = array();
			$used_keys        = array();

			foreach ( $order as $raw_entry ) {
				$key = $migrate_order_entry( $raw_entry );

				if ( '' !== $key && ! isset( $used_keys[ $key ] ) ) {
					$normalized_order[] = $key;
					$used_keys[ $key ]  = true;
				}
			}

			return $normalized_order;
		};

		$get_responsive_widths = static function ( $column_widths, $device, $count ) use ( $normalize_widths, $is_list_array ) {
			if ( $is_list_array( $column_widths ) ) {
				return $normalize_widths( $column_widths, $count );
			}

			if (
				is_array( $column_widths ) &&
				isset( $column_widths[ $device ] ) &&
				is_array( $column_widths[ $device ] )
			) {
				return $normalize_widths( $column_widths[ $device ], $count );
			}

			if (
				is_array( $column_widths ) &&
				isset( $column_widths['desktop'] ) &&
				is_array( $column_widths['desktop'] )
			) {
				return $normalize_widths( $column_widths['desktop'], $count );
			}

			return $normalize_widths( array(), $count );
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

		$get_responsive_block_order = static function ( $responsive_block_order, $device ) use ( $normalize_block_order ) {
			if (
				is_array( $responsive_block_order ) &&
				isset( $responsive_block_order[ $device ] ) &&
				is_array( $responsive_block_order[ $device ] )
			) {
				return $normalize_block_order( $responsive_block_order[ $device ] );
			}

			return array();
		};

		$get_grid_template_columns = static function ( $widths, $count ) use ( $normalize_widths ) {
			$normalized_widths = $normalize_widths( $widths, $count );

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

		$sort_inner_blocks_by_saved_order = static function ( $inner_blocks, $saved_order ) use ( $get_composite_block_keys ) {
			if ( empty( $saved_order ) ) {
				return $inner_blocks;
			}

			$composite_keys = $get_composite_block_keys( $inner_blocks );

			$sorted_blocks = array();
			$used_indexes  = array();

			foreach ( $saved_order as $saved_key ) {
				foreach ( $inner_blocks as $index => $inner_block ) {
					if (
						isset( $composite_keys[ $index ] ) &&
						$composite_keys[ $index ] === $saved_key &&
						! isset( $used_indexes[ $index ] )
					) {
						$sorted_blocks[]        = $inner_block;
						$used_indexes[ $index ] = true;
						break;
					}
				}
			}

			foreach ( $inner_blocks as $index => $inner_block ) {
				if ( ! isset( $used_indexes[ $index ] ) ) {
					$sorted_blocks[] = $inner_block;
				}
			}

			return $sorted_blocks;
		};

		$render_inner_blocks = static function ( $inner_blocks ) {
			$output = '';

			foreach ( $inner_blocks as $inner_block ) {
				$output .= render_block( $inner_block );
			}

			return $output;
		};

		$column_widths          = isset( $attributes['columnWidths'] ) ? $attributes['columnWidths'] : array();
		$vertical_alignment     = isset( $attributes['verticalAlignment'] ) ? $attributes['verticalAlignment'] : array();
		$responsive_block_order = isset( $attributes['responsiveBlockOrder'] ) ? $attributes['responsiveBlockOrder'] : array();
		$border_radius          = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : array();
		$background_color       = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : array();
		$height                 = isset( $attributes['height'] ) ? $attributes['height'] : array();

		$inner_blocks = $get_inner_blocks( isset( $block ) ? $block : null );

		$active_column_count = ! empty( $inner_blocks ) ? count( $inner_blocks ) : $default_column_count;

		$desktop_widths = $get_responsive_widths( $column_widths, 'desktop', $active_column_count );
		$tablet_widths  = $get_responsive_widths( $column_widths, 'tablet', $active_column_count );
		$mobile_widths  = $get_responsive_widths( $column_widths, 'mobile', $active_column_count );

		$desktop_vertical_alignment = $get_responsive_vertical_alignment( $vertical_alignment, 'desktop' );
		$tablet_vertical_alignment  = $get_responsive_vertical_alignment( $vertical_alignment, 'tablet' );
		$mobile_vertical_alignment  = $get_responsive_vertical_alignment( $vertical_alignment, 'mobile' );

		$desktop_border_radius = $get_responsive_style_value( $border_radius, 'desktop', $normalize_css_size_value );
		$tablet_border_radius  = $get_responsive_style_value( $border_radius, 'tablet', $normalize_css_size_value );
		$mobile_border_radius  = $get_responsive_style_value( $border_radius, 'mobile', $normalize_css_size_value );

		/*
		 * Background color follows the active-device pattern used in the editor:
		 * an explicitly empty device value stays empty instead of inheriting Desktop.
		 * Legacy attributes that do not contain the device key may still fall back to Desktop.
		 */
		$get_responsive_background_color = static function ( $values, $device ) use ( $normalize_color_value ) {
			if ( is_string( $values ) ) {
				return $normalize_color_value( $values );
			}

			if ( ! is_array( $values ) ) {
				return '';
			}

			if ( array_key_exists( $device, $values ) ) {
				return $normalize_color_value( $values[ $device ] );
			}

			if ( 'desktop' !== $device && array_key_exists( 'desktop', $values ) ) {
				return $normalize_color_value( $values['desktop'] );
			}

			return '';
		};

		$desktop_background_color = $get_responsive_background_color( $background_color, 'desktop' );
		$tablet_background_color  = $get_responsive_background_color( $background_color, 'tablet' );
		$mobile_background_color  = $get_responsive_background_color( $background_color, 'mobile' );
		$desktop_height           = $get_responsive_style_value( $height, 'desktop', $normalize_css_size_value );
		$tablet_height            = $get_responsive_style_value( $height, 'tablet', $normalize_css_size_value );
		$mobile_height            = $get_responsive_style_value( $height, 'mobile', $normalize_css_size_value );

		$desktop_block_order = $get_responsive_block_order( $responsive_block_order, 'desktop' );
		$tablet_block_order  = $get_responsive_block_order( $responsive_block_order, 'tablet' );
		$mobile_block_order  = $get_responsive_block_order( $responsive_block_order, 'mobile' );

		$desktop_inner_blocks = $sort_inner_blocks_by_saved_order( $inner_blocks, $desktop_block_order );
		$tablet_inner_blocks  = $sort_inner_blocks_by_saved_order( $inner_blocks, $tablet_block_order );
		$mobile_inner_blocks  = $sort_inner_blocks_by_saved_order( $inner_blocks, $mobile_block_order );

		$block_id = 'uplifters-site-builder-blocks-header-section-' . wp_unique_id();

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id'    => $block_id,
				'class' => 'uplifters-site-builder-blocks-header-section',
				'style' => 'box-sizing:border-box;position:relative;width:100%;',
			)
		);

		$desktop_columns = $get_grid_template_columns( $desktop_widths, $active_column_count );
		$tablet_columns  = $get_grid_template_columns( $tablet_widths, $active_column_count );
		$mobile_columns  = $get_grid_template_columns( $mobile_widths, $active_column_count );

		$css  = '#' . $block_id . '{';
		$css .= 'background-color:' . ( '' !== $desktop_background_color ? $desktop_background_color : 'transparent' ) . ';';
		if ( '' !== $desktop_border_radius ) {
			$css .= 'border-radius:' . $desktop_border_radius . ';';
		}
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner{';
		$css .= 'box-sizing:border-box;display:grid;min-width:0;width:100%;--wp--style--block-gap:0px;';
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner > *{';
		$css .= 'box-sizing:border-box;min-width:0;';
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--desktop{';
		$css .= 'align-items:' . $desktop_vertical_alignment . ';';
		if ( '' !== $desktop_height ) {
			$css .= 'height:' . $desktop_height . ';';
		}
		$css .= 'grid-template-columns:' . $desktop_columns . ';';
		$css .= '}';

		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--tablet,';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--mobile{display:none;}';

		$css .= '@media (max-width:1024px){';
		$css .= '#' . $block_id . '{background-color:' . ( '' !== $tablet_background_color ? $tablet_background_color : 'transparent' ) . ';';
		if ( '' !== $tablet_border_radius ) {
			$css .= 'border-radius:' . $tablet_border_radius . ';';
		}
		$css .= '}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--desktop{display:none;}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--tablet{';
		$css .= 'align-items:' . $tablet_vertical_alignment . ';display:grid;';
		if ( '' !== $tablet_height ) {
			$css .= 'height:' . $tablet_height . ';';
		}
		$css .= 'grid-template-columns:' . $tablet_columns . ';';
		$css .= '}';
		$css .= '}';

		$css .= '@media (max-width:767px){';
		$css .= '#' . $block_id . '{background-color:' . ( '' !== $mobile_background_color ? $mobile_background_color : 'transparent' ) . ';';
		if ( '' !== $mobile_border_radius ) {
			$css .= 'border-radius:' . $mobile_border_radius . ';';
		}
		$css .= '}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--tablet{display:none;}';
		$css .= '#' . $block_id . ' .uplifters-site-builder-blocks-header-section__inner--mobile{';
		$css .= 'align-items:' . $mobile_vertical_alignment . ';display:grid;';
		if ( '' !== $mobile_height ) {
			$css .= 'height:' . $mobile_height . ';';
		}
		$css .= 'grid-template-columns:' . $mobile_columns . ';';
		$css .= '}';
		$css .= '}';

		\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $css );

		$html = '<div ' . wp_kses( $wrapper_attributes, array() ) . '>';

		if ( ! empty( $inner_blocks ) ) {
			$html .= '<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--desktop">';
			$html .= wp_kses( $render_inner_blocks( $desktop_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';

			$html .= '<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--tablet">';
			$html .= wp_kses( $render_inner_blocks( $tablet_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';

			$html .= '<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--mobile">';
			$html .= wp_kses( $render_inner_blocks( $mobile_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		} else {
			$html .= '<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--desktop">';
			$html .= wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			$html .= '</div>';
		}

		$html .= '</div>';

		return $html;
	}
}
