<?php
/**
 * Server-side render for Social Icons block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_social_icon_responsive_value' ) ) {
	function uplifters_site_builder_blocks_social_icon_responsive_value( $value, string $device, $fallback = '' ) {
		if ( is_array( $value ) ) {
			if ( isset( $value[ $device ] ) && '' !== $value[ $device ] ) {
				return $value[ $device ];
			}

			if ( isset( $value['desktop'] ) && '' !== $value['desktop'] ) {
				return $value['desktop'];
			}

			if ( isset( $value['tablet'] ) && '' !== $value['tablet'] ) {
				return $value['tablet'];
			}

			if ( isset( $value['mobile'] ) && '' !== $value['mobile'] ) {
				return $value['mobile'];
			}

			return $fallback;
		}

		return ( null !== $value && '' !== $value ) ? $value : $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_social_icon_number' ) ) {
	function uplifters_site_builder_blocks_social_icon_number( $value, float $fallback = 0 ): float {
		return is_numeric( $value ) ? (float) $value : $fallback;
	}
}


if ( ! function_exists( 'uplifters_site_builder_blocks_social_icon_position' ) ) {
	function uplifters_site_builder_blocks_social_icon_position( $value ): string {
		$value = is_string( $value ) ? sanitize_key( $value ) : 'start';

		return in_array( $value, array( 'start', 'center', 'end' ), true ) ? $value : 'start';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_social_icon_justify_content' ) ) {
	function uplifters_site_builder_blocks_social_icon_justify_content( string $position ): string {
		if ( 'center' === $position ) {
			return 'center';
		}

		if ( 'end' === $position ) {
			return 'flex-end';
		}

		return 'flex-start';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_social_icon_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_social_icon_sanitize_color( $value ): string {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ) {
			return $value;
		}

		return '';
	}
}

$uplifters_site_builder_blocks_icons = isset( $attributes['icons'] ) && is_array( $attributes['icons'] ) ? $attributes['icons'] : array();

if ( empty( $uplifters_site_builder_blocks_icons ) ) {
	return;
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-social-icon-' );

$uplifters_site_builder_blocks_icon_paths = array(
	'FaGoogle' => array(
		'viewBox' => '0 0 488 512',
		'path'    => 'M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z',
	),
	'FaFacebookF' => array(
		'viewBox' => '0 0 320 512',
		'path'    => 'M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z',
	),
	'FaInstagram' => array(
		'viewBox' => '0 0 448 512',
		'path'    => 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.3 127.5 1.5 163.4c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
	),
	'FaLinkedinIn' => array(
		'viewBox' => '0 0 448 512',
		'path'    => 'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z',
	),
	'FaYoutube' => array(
		'viewBox' => '0 0 576 512',
		'path'    => 'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.321-42.003 24.947-48.284 48.597C15 167.007 15 256.004 15 256.004s0 88.997 11.345 131.921c6.281 23.65 24.787 41.5 48.284 47.821C117.22 447.232 288 447.232 288 447.232s170.781 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821C561 345.001 561 256.004 561 256.004s0-88.997-11.345-131.921zM232.145 337.591V174.417l142.739 81.587-142.739 81.587z',
	),
	'FaPinterestP' => array(
		'viewBox' => '0 0 384 512',
		'path'    => 'M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z',
	),
	'FaTwitter' => array(
		'viewBox' => '0 0 512 512',
		'path'    => 'M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.299 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z',
	),
	'SiGithub' => array(
		'viewBox' => '0 0 496 512',
		'path'    => 'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-2.3-2.9-3.6-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.6 5.2 61.4 2.6 67.9 16 17.6 25.8 31.4 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.7 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z',
	),
	'SiWhatsapp' => array(
		'viewBox' => '0 0 448 512',
		'path'    => 'M380.9 97.1C339 55.1 283.2 32 223.9 32 101 32 1 132 1 255c0 39.2 10.2 77.5 29.6 111.2L0 480l116.6-30.6c32.4 17.7 68.9 27 106.1 27h.1c122.9 0 222.9-100 222.9-223 0-59.3-23.1-115-64.8-156.3zM223 438.7h-.1c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.1 18.1 18.4-67.4-4.4-6.9C48.6 323.5 38.8 289.7 38.8 255 38.8 153.5 121.4 70.9 223 70.9c49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 53.9 130.5 0 101.6-82.6 183.2-184.3 183.2zm101.2-138.1c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.5-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.7-16.4-54.1-29.2-75.6-66-5.7-9.8 5.7-9.1 16.4-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.5-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.1 31.5 11.7 13.2 4.2 25.3 3.6 34.8 2.2 10.6-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z',
	),
	'SiTiktok' => array(
		'viewBox' => '0 0 448 512',
		'path'    => 'M448 209.9c-44.2 0-84.6-14.3-117.4-38.5v172.9c0 86.2-69.9 156.1-156.1 156.1S18.4 430.5 18.4 344.3s69.9-156.1 156.1-156.1c13.2 0 26 1.6 38.2 4.7v85.1c-11.5-6.4-24.7-10-38.8-10-42.3 0-76.6 34.3-76.6 76.6s34.3 76.6 76.6 76.6 76.6-34.3 76.6-76.6V12h80.1c7.6 72.1 65.4 129.9 137.4 137.4v60.5z',
	),
);

$uplifters_site_builder_blocks_desktop_canvas_background_color = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasBackgroundColor'] ?? '', 'desktop', '' ) );
$uplifters_site_builder_blocks_tablet_canvas_background_color  = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasBackgroundColor'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_canvas_background_color ) );
$uplifters_site_builder_blocks_mobile_canvas_background_color  = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasBackgroundColor'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_canvas_background_color ) );

$uplifters_site_builder_blocks_desktop_canvas_gap = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasGap'] ?? '', 'desktop', 16 ), 16 );
$uplifters_site_builder_blocks_tablet_canvas_gap  = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasGap'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_canvas_gap ), $uplifters_site_builder_blocks_desktop_canvas_gap );
$uplifters_site_builder_blocks_mobile_canvas_gap  = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['canvasGap'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_canvas_gap ), $uplifters_site_builder_blocks_desktop_canvas_gap );

$uplifters_site_builder_blocks_desktop_icon_position = uplifters_site_builder_blocks_social_icon_position( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['iconPosition'] ?? '', 'desktop', 'start' ) );
$uplifters_site_builder_blocks_tablet_icon_position  = uplifters_site_builder_blocks_social_icon_position( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['iconPosition'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_icon_position ) );
$uplifters_site_builder_blocks_mobile_icon_position  = uplifters_site_builder_blocks_social_icon_position( uplifters_site_builder_blocks_social_icon_responsive_value( $attributes['iconPosition'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_icon_position ) );

$uplifters_site_builder_blocks_desktop_justify_content = uplifters_site_builder_blocks_social_icon_justify_content( $uplifters_site_builder_blocks_desktop_icon_position );
$uplifters_site_builder_blocks_tablet_justify_content  = uplifters_site_builder_blocks_social_icon_justify_content( $uplifters_site_builder_blocks_tablet_icon_position );
$uplifters_site_builder_blocks_mobile_justify_content  = uplifters_site_builder_blocks_social_icon_justify_content( $uplifters_site_builder_blocks_mobile_icon_position );

$uplifters_site_builder_blocks_static_css  = '';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{display:flex;flex-wrap:wrap;padding:16px;box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-social-icon{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-social-icon svg{width:1em;height:1em;display:block;fill:currentColor;}';

$uplifters_site_builder_blocks_dynamic_css  = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . esc_attr( $uplifters_site_builder_blocks_desktop_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'column-gap:' . esc_attr( $uplifters_site_builder_blocks_desktop_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'row-gap:' . esc_attr( $uplifters_site_builder_blocks_desktop_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . esc_attr( $uplifters_site_builder_blocks_desktop_justify_content ) . ';';

if ( $uplifters_site_builder_blocks_desktop_canvas_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_canvas_background_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

foreach ( $uplifters_site_builder_blocks_icons as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_icon ) {
	$uplifters_site_builder_blocks_icon_index = absint( $uplifters_site_builder_blocks_index );

	$uplifters_site_builder_blocks_desktop_size             = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['size'] ?? '', 'desktop', 20 ), 20 );
	$uplifters_site_builder_blocks_desktop_color            = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['color'] ?? '', 'desktop', '#000000' ) );
	$uplifters_site_builder_blocks_desktop_opacity          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['opacity'] ?? '', 'desktop', 1 ), 1 );
	$uplifters_site_builder_blocks_desktop_border_radius    = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['borderRadius'] ?? '', 'desktop', 8 ), 8 );
	$uplifters_site_builder_blocks_desktop_background_color = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['backgroundColor'] ?? '', 'desktop', '#ffffff' ) );
	$uplifters_site_builder_blocks_desktop_padding          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['padding'] ?? '', 'desktop', 8 ), 8 );
	$uplifters_site_builder_blocks_desktop_margin           = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['margin'] ?? '', 'desktop', 8 ), 8 );

	$uplifters_site_builder_blocks_tablet_size             = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['size'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_size ), $uplifters_site_builder_blocks_desktop_size );
	$uplifters_site_builder_blocks_tablet_color            = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['color'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_color ) );
	$uplifters_site_builder_blocks_tablet_opacity          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['opacity'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_opacity ), $uplifters_site_builder_blocks_desktop_opacity );
	$uplifters_site_builder_blocks_tablet_border_radius    = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['borderRadius'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_border_radius ), $uplifters_site_builder_blocks_desktop_border_radius );
	$uplifters_site_builder_blocks_tablet_background_color = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['backgroundColor'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_background_color ) );
	$uplifters_site_builder_blocks_tablet_padding          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['padding'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_padding ), $uplifters_site_builder_blocks_desktop_padding );
	$uplifters_site_builder_blocks_tablet_margin           = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['margin'] ?? '', 'tablet', $uplifters_site_builder_blocks_desktop_margin ), $uplifters_site_builder_blocks_desktop_margin );

	$uplifters_site_builder_blocks_mobile_size             = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['size'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_size ), $uplifters_site_builder_blocks_desktop_size );
	$uplifters_site_builder_blocks_mobile_color            = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['color'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_color ) );
	$uplifters_site_builder_blocks_mobile_opacity          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['opacity'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_opacity ), $uplifters_site_builder_blocks_desktop_opacity );
	$uplifters_site_builder_blocks_mobile_border_radius    = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['borderRadius'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_border_radius ), $uplifters_site_builder_blocks_desktop_border_radius );
	$uplifters_site_builder_blocks_mobile_background_color = uplifters_site_builder_blocks_social_icon_sanitize_color( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['backgroundColor'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_background_color ) );
	$uplifters_site_builder_blocks_mobile_padding          = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['padding'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_padding ), $uplifters_site_builder_blocks_desktop_padding );
	$uplifters_site_builder_blocks_mobile_margin           = uplifters_site_builder_blocks_social_icon_number( uplifters_site_builder_blocks_social_icon_responsive_value( $uplifters_site_builder_blocks_icon['margin'] ?? '', 'mobile', $uplifters_site_builder_blocks_desktop_margin ), $uplifters_site_builder_blocks_desktop_margin );

	$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-social-icon-' . $uplifters_site_builder_blocks_icon_index;

	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . esc_attr( $uplifters_site_builder_blocks_desktop_size ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . esc_attr( $uplifters_site_builder_blocks_desktop_opacity ) . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . esc_attr( $uplifters_site_builder_blocks_desktop_border_radius ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . esc_attr( $uplifters_site_builder_blocks_desktop_padding ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . esc_attr( $uplifters_site_builder_blocks_desktop_margin ) . 'px;';

	if ( $uplifters_site_builder_blocks_desktop_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_desktop_color . ';';
	}

	if ( $uplifters_site_builder_blocks_desktop_background_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_background_color . ';';
	}

	$uplifters_site_builder_blocks_dynamic_css .= '}';

	$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){' . $uplifters_site_builder_blocks_selector . '{';
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . esc_attr( $uplifters_site_builder_blocks_tablet_size ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . esc_attr( $uplifters_site_builder_blocks_tablet_opacity ) . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . esc_attr( $uplifters_site_builder_blocks_tablet_border_radius ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . esc_attr( $uplifters_site_builder_blocks_tablet_padding ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . esc_attr( $uplifters_site_builder_blocks_tablet_margin ) . 'px;';

	if ( $uplifters_site_builder_blocks_tablet_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_tablet_color . ';';
	}

	if ( $uplifters_site_builder_blocks_tablet_background_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_background_color . ';';
	}

	$uplifters_site_builder_blocks_dynamic_css .= '}}';

	$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){' . $uplifters_site_builder_blocks_selector . '{';
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . esc_attr( $uplifters_site_builder_blocks_mobile_size ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . esc_attr( $uplifters_site_builder_blocks_mobile_opacity ) . ';';
	$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . esc_attr( $uplifters_site_builder_blocks_mobile_border_radius ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . esc_attr( $uplifters_site_builder_blocks_mobile_padding ) . 'px;';
	$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . esc_attr( $uplifters_site_builder_blocks_mobile_margin ) . 'px;';

	if ( $uplifters_site_builder_blocks_mobile_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_mobile_color . ';';
	}

	if ( $uplifters_site_builder_blocks_mobile_background_color ) {
		$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_background_color . ';';
	}

	$uplifters_site_builder_blocks_dynamic_css .= '}}';
}

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . esc_attr( $uplifters_site_builder_blocks_tablet_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'column-gap:' . esc_attr( $uplifters_site_builder_blocks_tablet_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'row-gap:' . esc_attr( $uplifters_site_builder_blocks_tablet_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . esc_attr( $uplifters_site_builder_blocks_tablet_justify_content ) . ';';

if ( $uplifters_site_builder_blocks_tablet_canvas_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_canvas_background_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . esc_attr( $uplifters_site_builder_blocks_mobile_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'column-gap:' . esc_attr( $uplifters_site_builder_blocks_mobile_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'row-gap:' . esc_attr( $uplifters_site_builder_blocks_mobile_canvas_gap ) . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . esc_attr( $uplifters_site_builder_blocks_mobile_justify_content ) . ';';

if ( $uplifters_site_builder_blocks_mobile_canvas_background_color ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_canvas_background_color . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;
$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_unique_id,
		'class' => 'uplifters-site-builder-blocks-social-icon-wrapper',
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
	<?php foreach ( $uplifters_site_builder_blocks_icons as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_icon ) : ?>
		<?php
		$uplifters_site_builder_blocks_icon_name = isset( $uplifters_site_builder_blocks_icon['name'] ) ? sanitize_text_field( $uplifters_site_builder_blocks_icon['name'] ) : 'FaGoogle';

		if ( ! isset( $uplifters_site_builder_blocks_icon_paths[ $uplifters_site_builder_blocks_icon_name ] ) ) {
			$uplifters_site_builder_blocks_icon_name = 'FaGoogle';
		}

		$uplifters_site_builder_blocks_icon_url = isset( $uplifters_site_builder_blocks_icon['url'] ) && ! empty( $uplifters_site_builder_blocks_icon['url'] ) ? esc_url( $uplifters_site_builder_blocks_icon['url'] ) : '#';
		?>

		<a
			href="<?php echo esc_url( $uplifters_site_builder_blocks_icon_url ); ?>"
			class="uplifters-site-builder-blocks-social-icon uplifters-site-builder-blocks-social-icon-<?php echo esc_attr( absint( $uplifters_site_builder_blocks_index ) ); ?>"
			aria-label="<?php echo esc_attr( $uplifters_site_builder_blocks_icon_name ); ?>"
			<?php echo '#' !== $uplifters_site_builder_blocks_icon_url ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="<?php echo esc_attr( $uplifters_site_builder_blocks_icon_paths[ $uplifters_site_builder_blocks_icon_name ]['viewBox'] ); ?>"
				aria-hidden="true"
				focusable="false"
			>
				<path d="<?php echo esc_attr( $uplifters_site_builder_blocks_icon_paths[ $uplifters_site_builder_blocks_icon_name ]['path'] ); ?>"></path>
			</svg>
		</a>
	<?php endforeach; ?>
</div>
