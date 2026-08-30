<?php
/**
 * Server-side rendering for the UPLIFTERS_SITE_BUILDER_BLOCKS Image Gallery block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return a responsive attribute branch.
 *
 * Fallback order:
 * requested device -> desktop -> tablet -> mobile -> fallback.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute key.
 * @param string $device     Responsive device.
 * @param mixed  $fallback   Fallback value.
 * @return mixed
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_gallery_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if (
			empty( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$responsive_value = $attributes[ $key ];

		$branch_order = array(
			$device,
			'desktop',
			'tablet',
			'mobile',
		);

		foreach ( $branch_order as $branch ) {
			if (
				array_key_exists(
					$branch,
					$responsive_value
				) &&
				null !== $responsive_value[ $branch ]
			) {
				return $responsive_value[ $branch ];
			}
		}

		return $fallback;
	}
}

/**
 * Sanitize a CSS measurement.
 *
 * Supports:
 * - px, em, rem, %, vw, vh and other common units
 * - CSS variables
 * - simple calc() expressions
 *
 * @param mixed $value CSS measurement.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_sanitize_measurement' ) ) {
	function uplifters_site_builder_blocks_image_gallery_sanitize_measurement( $value ): string {
		if (
			! is_string( $value ) &&
			! is_numeric( $value )
		) {
			return '';
		}

		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		if (
			preg_match(
				'/^-?(?:\d+|\d*\.\d+)(?:px|em|rem|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?$/i',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^var\(--[a-zA-Z0-9_-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			0 === strpos( $value, 'calc(' ) &&
			preg_match(
				'/^calc\([0-9a-zA-Z\s.%+\-*\/(),_-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		return '';
	}
}

/**
 * Sanitize a CSS color.
 *
 * WordPress color palettes may provide hexadecimal, rgb, rgba,
 * hsl, hsla or CSS variable values.
 *
 * @param mixed $value Color value.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_image_gallery_sanitize_color( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$value = trim( $value );

		if ( '' === $value ) {
			return '';
		}

		if (
			preg_match(
				'/^#[a-fA-F0-9]{3,8}$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^(?:rgb|rgba|hsl|hsla)\([0-9a-zA-Z.,\s%\/+-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^var\(--[a-zA-Z0-9_-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		return '';
	}
}

/**
 * Sanitize object-fit.
 *
 * @param mixed $value Object-fit value.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_sanitize_object_fit' ) ) {
	function uplifters_site_builder_blocks_image_gallery_sanitize_object_fit( $value ): string {
		$allowed = array(
			'cover',
			'contain',
			'fill',
			'none',
			'scale-down',
		);

		$value = is_string( $value )
			? sanitize_key( $value )
			: 'cover';

		return in_array( $value, $allowed, true )
			? $value
			: 'cover';
	}
}

/**
 * Sanitize a gallery column count.
 *
 * @param mixed $value Column count.
 * @return int
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_sanitize_columns' ) ) {
	function uplifters_site_builder_blocks_image_gallery_sanitize_columns( $value ): int {
		return max(
			1,
			min(
				8,
				absint( $value )
			)
		);
	}
}

/**
 * Sanitize one responsive spacing branch.
 *
 * @param mixed $value Spacing branch.
 * @return array
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_sanitize_spacing' ) ) {
	function uplifters_site_builder_blocks_image_gallery_sanitize_spacing( $value ): array {
		$spacing = array(
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
		);

		if ( ! is_array( $value ) ) {
			return $spacing;
		}

		foreach (
			array(
				'top',
				'right',
				'bottom',
				'left',
			) as $side
		) {
			if (
				! array_key_exists(
					$side,
					$value
				)
			) {
				continue;
			}

			$spacing[ $side ] =
				uplifters_site_builder_blocks_image_gallery_sanitize_measurement(
					$value[ $side ]
				);
		}

		return $spacing;
	}
}

/**
 * Add spacing declarations to CSS.
 *
 * @param string $selector CSS selector.
 * @param string $property Padding or margin.
 * @param array  $values   Spacing values.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_image_gallery_spacing_css' ) ) {
	function uplifters_site_builder_blocks_image_gallery_spacing_css(
		string $selector,
		string $property,
		array $values
	): string {
		$css = '';

		foreach (
			array(
				'top',
				'right',
				'bottom',
				'left',
			) as $side
		) {
			if ( empty( $values[ $side ] ) ) {
				continue;
			}

			$css .= sprintf(
				'%1$s-%2$s:%3$s;',
				$property,
				$side,
				$values[ $side ]
			);
		}

		if ( '' === $css ) {
			return '';
		}

		return $selector . '{' . $css . '}';
	}
}

/**
 * Normalize regular non-responsive attributes.
 */
$uplifters_site_builder_blocks_images = (
	isset( $attributes['images'] ) &&
	is_array( $attributes['images'] )
)
	? $attributes['images']
	: array();

$uplifters_site_builder_blocks_link_to = isset( $attributes['linkTo'] )
	? sanitize_key( $attributes['linkTo'] )
	: 'none';

if (
	! in_array(
		$uplifters_site_builder_blocks_link_to,
		array(
			'none',
			'media',
		),
		true
	)
) {
	$uplifters_site_builder_blocks_link_to = 'none';
}

$uplifters_site_builder_blocks_open_in_new_tab =
	! empty( $attributes['openInNewTab'] );

/**
 * Desktop responsive values.
 */
$uplifters_site_builder_blocks_desktop_object_fit =
	uplifters_site_builder_blocks_image_gallery_sanitize_object_fit(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'objectFit',
			'desktop',
			'cover'
		)
	);

$uplifters_site_builder_blocks_desktop_columns =
	uplifters_site_builder_blocks_image_gallery_sanitize_columns(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imagesPerRow',
			'desktop',
			3
		)
	);

$uplifters_site_builder_blocks_desktop_height =
	uplifters_site_builder_blocks_image_gallery_sanitize_measurement(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imageHeight',
			'desktop',
			'320px'
		)
	);

if ( '' === $uplifters_site_builder_blocks_desktop_height ) {
	$uplifters_site_builder_blocks_desktop_height = '320px';
}

$uplifters_site_builder_blocks_desktop_shadow = (bool)
	uplifters_site_builder_blocks_image_gallery_responsive_value(
		$attributes,
		'imageShadow',
		'desktop',
		true
	);

$uplifters_site_builder_blocks_desktop_background =
	uplifters_site_builder_blocks_image_gallery_sanitize_color(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'backgroundColor',
			'desktop',
			''
		)
	);

$uplifters_site_builder_blocks_desktop_padding =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'padding',
			'desktop',
			array()
		)
	);

$uplifters_site_builder_blocks_desktop_margin =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'margin',
			'desktop',
			array()
		)
	);

/**
 * Tablet responsive values.
 */
$uplifters_site_builder_blocks_tablet_object_fit =
	uplifters_site_builder_blocks_image_gallery_sanitize_object_fit(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'objectFit',
			'tablet',
			$uplifters_site_builder_blocks_desktop_object_fit
		)
	);

$uplifters_site_builder_blocks_tablet_columns =
	uplifters_site_builder_blocks_image_gallery_sanitize_columns(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imagesPerRow',
			'tablet',
			2
		)
	);

$uplifters_site_builder_blocks_tablet_height =
	uplifters_site_builder_blocks_image_gallery_sanitize_measurement(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imageHeight',
			'tablet',
			$uplifters_site_builder_blocks_desktop_height
		)
	);

if ( '' === $uplifters_site_builder_blocks_tablet_height ) {
	$uplifters_site_builder_blocks_tablet_height = $uplifters_site_builder_blocks_desktop_height;
}

$uplifters_site_builder_blocks_tablet_shadow = (bool)
	uplifters_site_builder_blocks_image_gallery_responsive_value(
		$attributes,
		'imageShadow',
		'tablet',
		$uplifters_site_builder_blocks_desktop_shadow
	);

$uplifters_site_builder_blocks_tablet_background =
	uplifters_site_builder_blocks_image_gallery_sanitize_color(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'backgroundColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_background
		)
	);

$uplifters_site_builder_blocks_tablet_padding =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'padding',
			'tablet',
			$uplifters_site_builder_blocks_desktop_padding
		)
	);

$uplifters_site_builder_blocks_tablet_margin =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'margin',
			'tablet',
			$uplifters_site_builder_blocks_desktop_margin
		)
	);

/**
 * Mobile responsive values.
 */
$uplifters_site_builder_blocks_mobile_object_fit =
	uplifters_site_builder_blocks_image_gallery_sanitize_object_fit(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'objectFit',
			'mobile',
			$uplifters_site_builder_blocks_desktop_object_fit
		)
	);

$uplifters_site_builder_blocks_mobile_columns =
	uplifters_site_builder_blocks_image_gallery_sanitize_columns(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imagesPerRow',
			'mobile',
			1
		)
	);

$uplifters_site_builder_blocks_mobile_height =
	uplifters_site_builder_blocks_image_gallery_sanitize_measurement(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'imageHeight',
			'mobile',
			$uplifters_site_builder_blocks_desktop_height
		)
	);

if ( '' === $uplifters_site_builder_blocks_mobile_height ) {
	$uplifters_site_builder_blocks_mobile_height = $uplifters_site_builder_blocks_desktop_height;
}

$uplifters_site_builder_blocks_mobile_shadow = (bool)
	uplifters_site_builder_blocks_image_gallery_responsive_value(
		$attributes,
		'imageShadow',
		'mobile',
		$uplifters_site_builder_blocks_desktop_shadow
	);

$uplifters_site_builder_blocks_mobile_background =
	uplifters_site_builder_blocks_image_gallery_sanitize_color(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'backgroundColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_background
		)
	);

$uplifters_site_builder_blocks_mobile_padding =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'padding',
			'mobile',
			$uplifters_site_builder_blocks_desktop_padding
		)
	);

$uplifters_site_builder_blocks_mobile_margin =
	uplifters_site_builder_blocks_image_gallery_sanitize_spacing(
		uplifters_site_builder_blocks_image_gallery_responsive_value(
			$attributes,
			'margin',
			'mobile',
			$uplifters_site_builder_blocks_desktop_margin
		)
	);

/**
 * Unique ID prevents one Image Gallery block from styling another.
 */
$uplifters_site_builder_blocks_block_unique_id =
	wp_unique_id( 'uplifters-site-builder-blocks-image-gallery-' );

$uplifters_site_builder_blocks_selector =
	'#' . $uplifters_site_builder_blocks_block_unique_id;

$uplifters_site_builder_blocks_grid_selector =
	$uplifters_site_builder_blocks_selector .
	' .wp-block-uplifters-site-builder-blocks-image-gallery__grid';

$uplifters_site_builder_blocks_image_selector =
	$uplifters_site_builder_blocks_selector .
	' .wp-block-uplifters-site-builder-blocks-image-gallery__img';

/**
 * Static block CSS.
 */
$uplifters_site_builder_blocks_static_css = '
.wp-block-uplifters-site-builder-blocks-image-gallery{
	box-sizing:border-box;
}

.wp-block-uplifters-site-builder-blocks-image-gallery *,
.wp-block-uplifters-site-builder-blocks-image-gallery *::before,
.wp-block-uplifters-site-builder-blocks-image-gallery *::after{
	box-sizing:border-box;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__grid{
	display:grid;
	grid-template-columns:repeat(
		var(--uplifters-site-builder-blocks-image-gallery-columns,3),
		minmax(0,1fr)
	);
	gap:16px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__item{
	min-width:0;
	margin:0;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__media{
	position:relative;
	display:block;
	width:100%;
	height:var(
		--uplifters-site-builder-blocks-image-gallery-image-height,
		320px
	);
	overflow:hidden;
	border-radius:12px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__link{
	display:block;
	width:100%;
	height:100%;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__img{
	display:block;
	width:100%;
	height:100%;
	object-fit:var(
		--uplifters-site-builder-blocks-image-gallery-object-fit,
		cover
	);
	border-radius:12px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__img--shadow{
	box-shadow:
		0 4px 6px -1px rgba(0,0,0,0.1),
		0 2px 4px -2px rgba(0,0,0,0.1);
}

.wp-block-uplifters-site-builder-blocks-image-gallery__preview{
	position:absolute;
	top:12px;
	right:12px;
	z-index:2;
	display:flex;
	align-items:center;
	justify-content:center;
	width:40px;
	height:40px;
	padding:0;
	border:0;
	border-radius:9999px;
	background:rgba(0,0,0,0.65);
	color:#ffffff;
	text-decoration:none;
	cursor:zoom-in;
	transition:
		background-color 160ms ease,
		transform 160ms ease;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__preview:hover,
.wp-block-uplifters-site-builder-blocks-image-gallery__preview:focus-visible{
	background:rgba(0,0,0,0.88);
	color:#ffffff;
	transform:scale(1.06);
}

.wp-block-uplifters-site-builder-blocks-image-gallery__preview:focus-visible{
	outline:2px solid #ffffff;
	outline-offset:2px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__caption{
	margin-top:8px;
	font-size:14px;
	line-height:1.5;
	opacity:0.85;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox{
	position:fixed;
	inset:0;
	z-index:999999;
	display:flex;
	align-items:center;
	justify-content:center;
	width:100vw;
	height:100vh;
	height:100dvh;
	margin:0;
	padding:0;
	background:rgba(0,0,0,0.96);
	opacity:0;
	visibility:hidden;
	pointer-events:none;
	transition:
		opacity 180ms ease,
		visibility 180ms ease;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox:target{
	opacity:1;
	visibility:visible;
	pointer-events:auto;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-backdrop{
	position:fixed;
	inset:0;
	z-index:0;
	display:block;
	width:100%;
	height:100%;
	background:transparent;
	cursor:zoom-out;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle{
	position:absolute;
	width:1px;
	height:1px;
	margin:-1px;
	padding:0;
	overflow:hidden;
	clip:rect(0,0,0,0);
	white-space:nowrap;
	border:0;
	opacity:0;
	pointer-events:none;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage{
	position:absolute;
	inset:0;
	z-index:1;
	display:flex;
	align-items:center;
	justify-content:center;
	width:100%;
	height:100%;
	overflow:auto;
	overscroll-behavior:contain;
	scrollbar-width:thin;
	scrollbar-color:
		rgba(255,255,255,0.45)
		rgba(255,255,255,0.08);
	pointer-events:none;
	-webkit-overflow-scrolling:touch;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage::-webkit-scrollbar{
	width:10px;
	height:10px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage::-webkit-scrollbar-track{
	background:rgba(255,255,255,0.08);
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage::-webkit-scrollbar-thumb{
	border:2px solid transparent;
	border-radius:9999px;
	background:rgba(255,255,255,0.45);
	background-clip:padding-box;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image-wrap{
	display:flex;
	flex:0 0 auto;
	align-items:center;
	justify-content:center;
	width:100%;
	height:100%;
	min-width:100%;
	min-height:100%;
	padding:12px;
	pointer-events:none;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image{
	display:block;
	width:100%;
	height:100%;
	max-width:100vw;
	max-height:100vh;
	max-height:100dvh;
	object-fit:contain;
	border:0;
	border-radius:0;
	box-shadow:none;
	transform:scale(1);
	transform-origin:center center;
	transition:transform 220ms ease;
	pointer-events:auto;
	user-select:none;
	-webkit-user-drag:none;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage{
	align-items:flex-start;
	justify-content:flex-start;
	pointer-events:auto;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image-wrap{
	width:200vw;
	height:200vh;
	height:200dvh;
	min-width:200vw;
	min-height:200vh;
	min-height:200dvh;
	padding:48px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image{
	width:100vw;
	height:100vh;
	height:100dvh;
	max-width:none;
	max-height:none;
	object-fit:contain;
	transform:scale(2);
	cursor:zoom-out;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-controls{
	position:fixed;
	top:18px;
	left:18px;
	z-index:1000002;
	display:flex;
	align-items:center;
	gap:10px;
	pointer-events:auto;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button,
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close{
	display:flex;
	align-items:center;
	justify-content:center;
	height:48px;
	border:1px solid rgba(255,255,255,0.35);
	border-radius:9999px;
	background:rgba(0,0,0,0.78);
	color:#ffffff;
	text-decoration:none;
	cursor:pointer;
	backdrop-filter:blur(8px);
	-webkit-backdrop-filter:blur(8px);
	box-shadow:0 4px 20px rgba(0,0,0,0.35);
	transition:
		background-color 160ms ease,
		border-color 160ms ease,
		transform 160ms ease;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button{
	min-width:48px;
	padding:0 16px;
	font-family:Arial,sans-serif;
	font-size:15px;
	font-weight:600;
	line-height:1;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close{
	position:fixed;
	top:18px;
	right:18px;
	z-index:1000003;
	width:52px;
	height:52px;
	padding:0;
	font-family:Arial,sans-serif;
	font-size:36px;
	font-weight:300;
	line-height:1;
	pointer-events:auto;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button:hover,
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button:focus-visible{
	border-color:rgba(255,255,255,0.85);
	background:rgba(34,113,177,0.96);
	color:#ffffff;
	transform:scale(1.05);
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close:hover,
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close:focus-visible{
	border-color:rgba(255,255,255,0.85);
	background:rgba(190,24,24,0.96);
	color:#ffffff;
	transform:scale(1.08);
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button:focus-visible,
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close:focus-visible{
	outline:3px solid #ffffff;
	outline-offset:3px;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-out-text{
	display:none;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-controls
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-in-text{
	display:none;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-controls
.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-out-text{
	display:inline;
}

.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-caption{
	position:fixed;
	right:80px;
	bottom:18px;
	left:80px;
	z-index:1000002;
	max-width:900px;
	margin:0 auto;
	padding:12px 18px;
	border-radius:12px;
	background:rgba(0,0,0,0.72);
	color:#ffffff;
	font-size:14px;
	line-height:1.5;
	text-align:center;
	pointer-events:none;
	backdrop-filter:blur(8px);
	-webkit-backdrop-filter:blur(8px);
	box-shadow:0 4px 20px rgba(0,0,0,0.35);
}

@media (max-width:767px){
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-controls{
		top:12px;
		left:12px;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close{
		top:12px;
		right:12px;
		width:46px;
		height:46px;
		font-size:32px;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button{
		height:46px;
		min-width:46px;
		padding:0 13px;
		font-size:14px;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image-wrap{
		padding:6px;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle:checked
	~ .wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image-wrap{
		width:200vw;
		height:200vh;
		height:200dvh;
		min-width:200vw;
		min-height:200vh;
		min-height:200dvh;
		padding:24px;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-caption{
		right:12px;
		bottom:12px;
		left:12px;
		padding:10px 14px;
		font-size:13px;
	}
}

@media (prefers-reduced-motion:reduce){
	.wp-block-uplifters-site-builder-blocks-image-gallery__preview,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close{
		transition:none;
	}

	.wp-block-uplifters-site-builder-blocks-image-gallery__preview:hover,
	.wp-block-uplifters-site-builder-blocks-image-gallery__preview:focus-visible,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button:hover,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button:focus-visible,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close:hover,
	.wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close:focus-visible{
		transform:none;
	}
}
';

/**
 * Device-specific dynamic CSS.
 */
$uplifters_site_builder_blocks_dynamic_css = '';

/**
 * Desktop.
 */
$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-object-fit:' .
	$uplifters_site_builder_blocks_desktop_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-columns:' .
	$uplifters_site_builder_blocks_desktop_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-image-height:' .
	$uplifters_site_builder_blocks_desktop_height . ';';

if ( '' !== $uplifters_site_builder_blocks_desktop_background ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
		$uplifters_site_builder_blocks_desktop_background . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:transparent;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_image_gallery_spacing_css(
	$uplifters_site_builder_blocks_selector,
	'padding',
	$uplifters_site_builder_blocks_desktop_padding
);

$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_image_gallery_spacing_css(
	$uplifters_site_builder_blocks_selector,
	'margin',
	$uplifters_site_builder_blocks_desktop_margin
);

if ( $uplifters_site_builder_blocks_desktop_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_image_selector . '{';
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:';
	$uplifters_site_builder_blocks_dynamic_css .= '0 4px 6px -1px rgba(0,0,0,0.1),';
	$uplifters_site_builder_blocks_dynamic_css .= '0 2px 4px -2px rgba(0,0,0,0.1);';
	$uplifters_site_builder_blocks_dynamic_css .= '}';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_image_selector . '{';
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:none;';
	$uplifters_site_builder_blocks_dynamic_css .= '}';
}

/**
 * Tablet.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-object-fit:' .
	$uplifters_site_builder_blocks_tablet_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-columns:' .
	$uplifters_site_builder_blocks_tablet_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-image-height:' .
	$uplifters_site_builder_blocks_tablet_height . ';';

if ( '' !== $uplifters_site_builder_blocks_tablet_background ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
		$uplifters_site_builder_blocks_tablet_background . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:transparent;';
}

foreach (
	array(
		'padding' => $uplifters_site_builder_blocks_tablet_padding,
		'margin'  => $uplifters_site_builder_blocks_tablet_margin,
	) as $uplifters_site_builder_blocks_property => $uplifters_site_builder_blocks_values
) {
	foreach (
		array(
			'top',
			'right',
			'bottom',
			'left',
		) as $uplifters_site_builder_blocks_side
	) {
		$uplifters_site_builder_blocks_dynamic_css .= sprintf(
			'%1$s-%2$s:%3$s;',
			$uplifters_site_builder_blocks_property,
			$uplifters_site_builder_blocks_side,
			'' !== $uplifters_site_builder_blocks_values[ $uplifters_site_builder_blocks_side ]
				? $uplifters_site_builder_blocks_values[ $uplifters_site_builder_blocks_side ]
				: '0'
		);
	}
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_image_selector . '{';

if ( $uplifters_site_builder_blocks_tablet_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:';
	$uplifters_site_builder_blocks_dynamic_css .= '0 4px 6px -1px rgba(0,0,0,0.1),';
	$uplifters_site_builder_blocks_dynamic_css .= '0 2px 4px -2px rgba(0,0,0,0.1);';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:none;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

/**
 * Mobile.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-object-fit:' .
	$uplifters_site_builder_blocks_mobile_object_fit . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-columns:' .
	$uplifters_site_builder_blocks_mobile_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-gallery-image-height:' .
	$uplifters_site_builder_blocks_mobile_height . ';';

if ( '' !== $uplifters_site_builder_blocks_mobile_background ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
		$uplifters_site_builder_blocks_mobile_background . ';';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:transparent;';
}

foreach (
	array(
		'padding' => $uplifters_site_builder_blocks_mobile_padding,
		'margin'  => $uplifters_site_builder_blocks_mobile_margin,
	) as $uplifters_site_builder_blocks_property => $uplifters_site_builder_blocks_values
) {
	foreach (
		array(
			'top',
			'right',
			'bottom',
			'left',
		) as $uplifters_site_builder_blocks_side
	) {
		$uplifters_site_builder_blocks_dynamic_css .= sprintf(
			'%1$s-%2$s:%3$s;',
			$uplifters_site_builder_blocks_property,
			$uplifters_site_builder_blocks_side,
			'' !== $uplifters_site_builder_blocks_values[ $uplifters_site_builder_blocks_side ]
				? $uplifters_site_builder_blocks_values[ $uplifters_site_builder_blocks_side ]
				: '0'
		);
	}
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_image_selector . '{';

if ( $uplifters_site_builder_blocks_mobile_shadow ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:';
	$uplifters_site_builder_blocks_dynamic_css .= '0 4px 6px -1px rgba(0,0,0,0.1),';
	$uplifters_site_builder_blocks_dynamic_css .= '0 2px 4px -2px rgba(0,0,0,0.1);';
} else {
	$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:none;';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'    => $uplifters_site_builder_blocks_block_unique_id,
			'class' => 'wp-block-uplifters-site-builder-blocks-image-gallery',
		)
	);

?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

<div
	<?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
	?>
>
	<?php if ( ! empty( $uplifters_site_builder_blocks_images ) ) : ?>
		<div class="wp-block-uplifters-site-builder-blocks-image-gallery__grid">
			<?php foreach ( $uplifters_site_builder_blocks_images as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_image ) : ?>
				<?php
				if ( ! is_array( $uplifters_site_builder_blocks_image ) ) {
					continue;
				}

				$uplifters_site_builder_blocks_image_id = isset( $uplifters_site_builder_blocks_image['id'] )
					? absint( $uplifters_site_builder_blocks_image['id'] )
					: 0;

				$uplifters_site_builder_blocks_image_url = isset( $uplifters_site_builder_blocks_image['url'] )
					? esc_url( $uplifters_site_builder_blocks_image['url'] )
					: '';

				$uplifters_site_builder_blocks_full_url = isset( $uplifters_site_builder_blocks_image['fullUrl'] )
					? esc_url( $uplifters_site_builder_blocks_image['fullUrl'] )
					: '';

				$uplifters_site_builder_blocks_alt_text = isset( $uplifters_site_builder_blocks_image['alt'] )
					? sanitize_text_field(
						$uplifters_site_builder_blocks_image['alt']
					)
					: '';

				$uplifters_site_builder_blocks_caption = isset( $uplifters_site_builder_blocks_image['caption'] )
					? wp_kses_post(
						$uplifters_site_builder_blocks_image['caption']
					)
					: '';

				/**
				 * Resolve current WordPress attachment URLs.
				 */
				if ( $uplifters_site_builder_blocks_image_id ) {
					$uplifters_site_builder_blocks_selected_size =
						isset( $uplifters_site_builder_blocks_image['sizeSlug'] )
							? sanitize_key(
								$uplifters_site_builder_blocks_image['sizeSlug']
							)
							: 'full';

					$uplifters_site_builder_blocks_attachment_url =
						wp_get_attachment_image_url(
							$uplifters_site_builder_blocks_image_id,
							$uplifters_site_builder_blocks_selected_size
						);

					$uplifters_site_builder_blocks_attachment_full_url =
						wp_get_attachment_image_url(
							$uplifters_site_builder_blocks_image_id,
							'full'
						);

					if ( $uplifters_site_builder_blocks_attachment_url ) {
						$uplifters_site_builder_blocks_image_url = esc_url(
							$uplifters_site_builder_blocks_attachment_url
						);
					}

					if ( $uplifters_site_builder_blocks_attachment_full_url ) {
						$uplifters_site_builder_blocks_full_url = esc_url(
							$uplifters_site_builder_blocks_attachment_full_url
						);
					}

					if ( '' === $uplifters_site_builder_blocks_alt_text ) {
						$uplifters_site_builder_blocks_attachment_alt =
							get_post_meta(
								$uplifters_site_builder_blocks_image_id,
								'_wp_attachment_image_alt',
								true
							);

						$uplifters_site_builder_blocks_alt_text =
							sanitize_text_field(
								$uplifters_site_builder_blocks_attachment_alt
							);
					}
				}

				if ( '' === $uplifters_site_builder_blocks_full_url ) {
					$uplifters_site_builder_blocks_full_url = $uplifters_site_builder_blocks_image_url;
				}

				if ( '' === $uplifters_site_builder_blocks_image_url ) {
					continue;
				}

				$uplifters_site_builder_blocks_image_link_url =
					'media' === $uplifters_site_builder_blocks_link_to
						? $uplifters_site_builder_blocks_full_url
						: '';

				$uplifters_site_builder_blocks_lightbox_id = sprintf(
					'%1$s-lightbox-%2$s',
					$uplifters_site_builder_blocks_block_unique_id,
					absint( $uplifters_site_builder_blocks_index )
				);

				$uplifters_site_builder_blocks_zoom_toggle_id = sprintf(
					'%1$s-zoom-toggle-%2$s',
					$uplifters_site_builder_blocks_block_unique_id,
					absint( $uplifters_site_builder_blocks_index )
				);
				?>

				<figure class="wp-block-uplifters-site-builder-blocks-image-gallery__item">
					<div class="wp-block-uplifters-site-builder-blocks-image-gallery__media">
						<a
							class="wp-block-uplifters-site-builder-blocks-image-gallery__preview"
							href="#<?php echo esc_attr( $uplifters_site_builder_blocks_lightbox_id ); ?>"
							aria-label="<?php esc_attr_e( 'Open image preview', 'uplifters-site-builder-blocks' ); ?>"
							title="<?php esc_attr_e( 'Open image preview', 'uplifters-site-builder-blocks' ); ?>"
						>
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								aria-hidden="true"
								focusable="false"
							>
								<path
									d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z"
									stroke="currentColor"
									stroke-width="2"
								/>
								<path
									d="m20 20-3.5-3.5"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<path
									d="M11 8v6M8 11h6"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
							</svg>
						</a>

						<?php if ( '' !== $uplifters_site_builder_blocks_image_link_url ) : ?>
							<a
								class="wp-block-uplifters-site-builder-blocks-image-gallery__link"
								href="<?php echo esc_url( $uplifters_site_builder_blocks_image_link_url ); ?>"
								<?php
								if ( $uplifters_site_builder_blocks_open_in_new_tab ) {
									echo 'target="_blank" rel="noopener noreferrer"';
								}
								?>
							>
								<img
									class="wp-block-uplifters-site-builder-blocks-image-gallery__img"
									src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>"
									alt="<?php echo esc_attr( $uplifters_site_builder_blocks_alt_text ); ?>"
									loading="lazy"
									decoding="async"
								/>
							</a>
						<?php else : ?>
							<img
								class="wp-block-uplifters-site-builder-blocks-image-gallery__img"
								src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>"
								alt="<?php echo esc_attr( $uplifters_site_builder_blocks_alt_text ); ?>"
								loading="lazy"
								decoding="async"
							/>
						<?php endif; ?>
					</div>

					<?php if ( '' !== trim( wp_strip_all_tags( $uplifters_site_builder_blocks_caption ) ) ) : ?>
						<figcaption class="wp-block-uplifters-site-builder-blocks-image-gallery__caption">
							<?php
							echo wp_kses_post( $uplifters_site_builder_blocks_caption );
							?>
						</figcaption>
					<?php endif; ?>
				</figure>

				<div
					id="<?php echo esc_attr( $uplifters_site_builder_blocks_lightbox_id ); ?>"
					class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="<?php esc_attr_e( 'Image preview', 'uplifters-site-builder-blocks' ); ?>"
				>
					<a
						class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-backdrop"
						href="#<?php echo esc_attr( $uplifters_site_builder_blocks_block_unique_id ); ?>"
						aria-label="<?php esc_attr_e( 'Close image preview', 'uplifters-site-builder-blocks' ); ?>"
						title="<?php esc_attr_e( 'Close image preview', 'uplifters-site-builder-blocks' ); ?>"
					></a>

					<input
						id="<?php echo esc_attr( $uplifters_site_builder_blocks_zoom_toggle_id ); ?>"
						class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-toggle"
						type="checkbox"
						aria-label="<?php esc_attr_e( 'Toggle image zoom', 'uplifters-site-builder-blocks' ); ?>"
					/>

					<div class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-stage">
						<div class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image-wrap">
							<img
								class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-image"
								src="<?php echo esc_url( $uplifters_site_builder_blocks_full_url ); ?>"
								alt="<?php echo esc_attr( $uplifters_site_builder_blocks_alt_text ); ?>"
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
						</div>
					</div>

					<div class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-controls">
						<label
							class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-button"
							for="<?php echo esc_attr( $uplifters_site_builder_blocks_zoom_toggle_id ); ?>"
							role="button"
							tabindex="0"
							aria-label="<?php esc_attr_e( 'Toggle image zoom', 'uplifters-site-builder-blocks' ); ?>"
							title="<?php esc_attr_e( 'Toggle image zoom', 'uplifters-site-builder-blocks' ); ?>"
						>
							<span class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-in-text">
								<?php esc_html_e( 'Zoom In', 'uplifters-site-builder-blocks' ); ?>
							</span>

							<span class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-zoom-out-text">
								<?php esc_html_e( 'Reset Zoom', 'uplifters-site-builder-blocks' ); ?>
							</span>
						</label>
					</div>

					<a
						class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-close"
						href="#<?php echo esc_attr( $uplifters_site_builder_blocks_block_unique_id ); ?>"
						aria-label="<?php esc_attr_e( 'Close image preview', 'uplifters-site-builder-blocks' ); ?>"
						title="<?php esc_attr_e( 'Close', 'uplifters-site-builder-blocks' ); ?>"
					>
						<span aria-hidden="true">&times;</span>
					</a>

					<?php if ( '' !== trim( wp_strip_all_tags( $uplifters_site_builder_blocks_caption ) ) ) : ?>
						<div class="wp-block-uplifters-site-builder-blocks-image-gallery__lightbox-caption">
							<?php
							echo wp_kses_post( $uplifters_site_builder_blocks_caption );
							?>
						</div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</div>
