<?php
/**
 * Manual (no block.json) server-side registration for the Columns Section
 * block, now that it lives inside the Column Layout folder as
 * column-section.js with no editor Inspector of its own. Column Layout's
 * own Inspector gained matching padding/margin/backgroundColor controls for
 * the whole layout; each Column Section instance keeps its OWN previously
 * saved padding/margin/backgroundColor values (real per-column
 * customization survives in the data), it just can no longer be edited
 * through the UI. This file only keeps the dynamic rendering (per-instance
 * responsive CSS custom properties) working exactly as it did when the
 * block had its own build/blocks/column-section/block.json + render.php.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class ColumnSectionBlockRegister {

	const BLOCK_NAME   = 'uplifters-site-builder-blocks/column-section';
	const STYLE_HANDLE = 'uplifters-site-builder-blocks-column-section-style';

	/**
	 * Register the Columns Section block server-side via a plain
	 * register_block_type() args array — no block.json, no build/blocks/
	 * column-section folder. Columns Section only ever lives inside Column
	 * Layout (see the "parent" restriction declared in column-section.js).
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
					'padding'         => array(
						'type'    => 'object',
						'default' => array(
							'desktop' => 0,
							'tablet'  => 0,
							'mobile'  => 0,
						),
					),
					'margin'          => array(
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
				'supports'        => array(
					'html' => false,
				),
				'style'           => self::STYLE_HANDLE,
				'render_callback' => array( __CLASS__, 'render' ),
			)
		);
	}

	/**
	 * Server-side render for Columns Section.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Block default content.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block ) {
		$get_numeric_value = static function ( $value, $fallback = 0 ) {
			if ( ! is_numeric( $value ) ) {
				return (float) $fallback;
			}
			return (float) $value;
		};

		$format_css_number = static function ( $value ) {
			$formatted = number_format( (float) $value, 4, '.', '' );
			return rtrim( rtrim( $formatted, '0' ), '.' );
		};

		$padding_attr = isset( $attributes['padding'] ) && is_array( $attributes['padding'] )
			? $attributes['padding']
			: array(
				'desktop' => 0,
				'tablet'  => 0,
				'mobile'  => 0,
			);

		$margin_attr = isset( $attributes['margin'] ) && is_array( $attributes['margin'] )
			? $attributes['margin']
			: array(
				'desktop' => 0,
				'tablet'  => 0,
				'mobile'  => 0,
			);

		$bg_color_attr = isset( $attributes['backgroundColor'] ) && is_array( $attributes['backgroundColor'] )
			? $attributes['backgroundColor']
			: array(
				'desktop' => '',
				'tablet'  => '',
				'mobile'  => '',
			);

		$padding_desktop = $get_numeric_value( $padding_attr['desktop'] ?? 0, 0 );
		$padding_tablet  = $get_numeric_value( $padding_attr['tablet'] ?? 0, 0 );
		$padding_mobile  = $get_numeric_value( $padding_attr['mobile'] ?? 0, 0 );

		$margin_desktop = $get_numeric_value( $margin_attr['desktop'] ?? 0, 0 );
		$margin_tablet  = $get_numeric_value( $margin_attr['tablet'] ?? 0, 0 );
		$margin_mobile  = $get_numeric_value( $margin_attr['mobile'] ?? 0, 0 );

		$sanitize_background_color = static function ( $value ): string {
			$color    = is_string( $value ) ? trim( $value ) : '';
			$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
				|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color )
				|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $color );

			return $is_valid ? $color : '';
		};

		$bg_desktop = $sanitize_background_color( $bg_color_attr['desktop'] ?? '' );
		$bg_tablet  = $sanitize_background_color( $bg_color_attr['tablet'] ?? '' );
		$bg_mobile  = $sanitize_background_color( $bg_color_attr['mobile'] ?? '' );

		$bg_desktop = $bg_desktop ?: 'transparent';
		$bg_tablet  = $bg_tablet ?: $bg_desktop;
		$bg_mobile  = $bg_mobile ?: $bg_tablet;

		$inline_style = implode(
			'',
			array(
				'--column-section-padding-desktop:', $format_css_number( $padding_desktop ), 'px;',
				'--column-section-padding-tablet:', $format_css_number( $padding_tablet ), 'px;',
				'--column-section-padding-mobile:', $format_css_number( $padding_mobile ), 'px;',
				'--column-section-margin-desktop:', $format_css_number( $margin_desktop ), 'px;',
				'--column-section-margin-tablet:', $format_css_number( $margin_tablet ), 'px;',
				'--column-section-margin-mobile:', $format_css_number( $margin_mobile ), 'px;',
				'--column-section-background-desktop:', $bg_desktop, ';',
				'--column-section-background-tablet:', $bg_tablet, ';',
				'--column-section-background-mobile:', $bg_mobile, ';',
				'padding:var(--column-section-padding-desktop);',
				'margin:var(--column-section-margin-desktop);',
				'background-color:var(--column-section-background-desktop);',
				'box-sizing:border-box;',
				'width:100%;',
				'max-width:100%;',
				'min-width:0;',
				'overflow-wrap:anywhere;',
				'word-break:break-word;',
			)
		);

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => 'column-section',
				'style' => $inline_style,
			)
		);

		// Print responsive <style> block only once per page.
		static $style_printed = false;

		if ( ! $style_printed ) {
			$style_printed = true;

			$css  = '.column-section > *,.column-section .wp-block,.column-section p{';
			$css .= 'max-width:100%;min-width:0;overflow-wrap:anywhere;word-break:break-word;box-sizing:border-box;';
			$css .= '}';

			$css .= '@media (max-width:1024px){';
			$css .= '.column-section{';
			$css .= 'padding:var(--column-section-padding-tablet) !important;';
			$css .= 'margin:var(--column-section-margin-tablet) !important;';
			$css .= 'background-color:var(--column-section-background-tablet) !important;';
			$css .= '}';
			$css .= '}';

			$css .= '@media (max-width:767px){';
			$css .= '.column-section{';
			$css .= 'padding:var(--column-section-padding-mobile) !important;';
			$css .= 'margin:var(--column-section-margin-mobile) !important;';
			$css .= 'background-color:var(--column-section-background-mobile) !important;';
			$css .= '}';
			$css .= '}';

			\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $css );
		}

		$html  = '<div ' . wp_kses( $wrapper_attributes, array() ) . '>';
		$html .= wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
		$html .= '</div>';

		return $html;
	}
}
