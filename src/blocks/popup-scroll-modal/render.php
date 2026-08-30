<?php
/**
 * Server-side rendering for the responsive UPLIFTERS_SITE_BUILDER_BLOCKS Popup Scroll Modal block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Read a responsive attribute branch.
 *
 * Fallback order:
 * requested device -> desktop -> tablet -> mobile -> fallback.
 *
 * Numeric zero and boolean false are valid values.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute key.
 * @param string $device     Requested device.
 * @param mixed  $fallback   Fallback value.
 *
 * @return mixed
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_popup_scroll_modal_responsive_value' ) ) {
	function uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if (
			! isset( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$responsive_attribute =
			$attributes[ $key ];

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
					$responsive_attribute
				) &&
				null !== $responsive_attribute[ $branch ]
			) {
				return $responsive_attribute[ $branch ];
			}
		}

		return $fallback;
	}
}

/**
 * Normalize a scroll offset.
 *
 * @param mixed $value Scroll offset.
 * @return int
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_popup_scroll_modal_sanitize_scroll_offset' ) ) {
	function uplifters_site_builder_blocks_popup_scroll_modal_sanitize_scroll_offset(
		$value
	): int {
		return max(
			0,
			min(
				3000,
				absint( $value )
			)
		);
	}
}

/**
 * Normalize overlay opacity.
 *
 * @param mixed $value Opacity percentage.
 * @return int
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity' ) ) {
	function uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity(
		$value
	): int {
		return max(
			0,
			min(
				100,
				absint( $value )
			)
		);
	}
}

/**
 * Normalize a hexadecimal color.
 *
 * @param mixed  $value    Color value.
 * @param string $fallback Fallback color.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color' ) ) {
	function uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color(
		$value,
		string $fallback = '#000000'
	): string {
		$color = is_string( $value ) ? trim( $value ) : '';
		$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
			|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color );

		return $is_valid
			? $color
			: $fallback;
	}
}

/**
 * Convert a hexadecimal color and percentage opacity to rgba().
 *
 * @param string $hex             Hexadecimal color.
 * @param int    $opacity_percent Opacity from 0 to 100.
 * @return string
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_popup_scroll_modal_hex_to_rgba' ) ) {
	function uplifters_site_builder_blocks_popup_scroll_modal_hex_to_rgba(
		$hex,
		$opacity_percent
	): string {
		$hex = uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color(
			$hex,
			'#000000'
		);

		$source_alpha = 1.0;
		if (
			preg_match(
				'/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/',
				$hex,
				$rgb
			)
		) {
			$red   = (int) $rgb[1];
			$green = (int) $rgb[2];
			$blue  = (int) $rgb[3];
			$source_alpha = isset( $rgb[4] ) ? (float) $rgb[4] : 1.0;
		} else {
			$hex = ltrim( $hex, '#' );

			if ( 3 === strlen( $hex ) || 4 === strlen( $hex ) ) {
				$expanded = '';
				foreach ( str_split( $hex ) as $character ) {
					$expanded .= $character . $character;
				}
				$hex = $expanded;
			}

			if ( 8 === strlen( $hex ) ) {
				$source_alpha = hexdec( substr( $hex, 6, 2 ) ) / 255;
				$hex = substr( $hex, 0, 6 );
			}

			if ( 6 !== strlen( $hex ) ) {
				$hex = '000000';
			}

			$red   = hexdec( substr( $hex, 0, 2 ) );
			$green = hexdec( substr( $hex, 2, 2 ) );
			$blue  = hexdec( substr( $hex, 4, 2 ) );
		}

		$opacity_percent =
			uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity(
				$opacity_percent
			);

		$alpha = $source_alpha * ( $opacity_percent / 100 );

		return sprintf(
			'rgba(%1$d,%2$d,%3$d,%4$s)',
			$red,
			$green,
			$blue,
			(string) $alpha
		);
	}
}

/**
 * Responsive scroll offsets.
 */
$uplifters_site_builder_blocks_desktop_scroll_offset =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_scroll_offset(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'scrollOffset',
			'desktop',
			300
		)
	);

$uplifters_site_builder_blocks_tablet_scroll_offset =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_scroll_offset(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'scrollOffset',
			'tablet',
			250
		)
	);

$uplifters_site_builder_blocks_mobile_scroll_offset =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_scroll_offset(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'scrollOffset',
			'mobile',
			200
		)
	);

/**
 * Responsive overlay colors.
 */
$uplifters_site_builder_blocks_desktop_overlay_color =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayColor',
			'desktop',
			'#000000'
		)
	);

$uplifters_site_builder_blocks_tablet_overlay_color =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_overlay_color
		),
		$uplifters_site_builder_blocks_desktop_overlay_color
	);

$uplifters_site_builder_blocks_mobile_overlay_color =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_hex_color(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_overlay_color
		),
		$uplifters_site_builder_blocks_desktop_overlay_color
	);

/**
 * Responsive overlay opacity.
 */
$uplifters_site_builder_blocks_desktop_overlay_opacity =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayOpacity',
			'desktop',
			60
		)
	);

$uplifters_site_builder_blocks_tablet_overlay_opacity =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayOpacity',
			'tablet',
			$uplifters_site_builder_blocks_desktop_overlay_opacity
		)
	);

$uplifters_site_builder_blocks_mobile_overlay_opacity =
	uplifters_site_builder_blocks_popup_scroll_modal_sanitize_opacity(
		uplifters_site_builder_blocks_popup_scroll_modal_responsive_value(
			$attributes,
			'overlayOpacity',
			'mobile',
			$uplifters_site_builder_blocks_desktop_overlay_opacity
		)
	);

/**
 * Build device-specific overlay rgba values.
 */
$uplifters_site_builder_blocks_desktop_overlay_rgba =
	uplifters_site_builder_blocks_popup_scroll_modal_hex_to_rgba(
		$uplifters_site_builder_blocks_desktop_overlay_color,
		$uplifters_site_builder_blocks_desktop_overlay_opacity
	);

$uplifters_site_builder_blocks_tablet_overlay_rgba =
	uplifters_site_builder_blocks_popup_scroll_modal_hex_to_rgba(
		$uplifters_site_builder_blocks_tablet_overlay_color,
		$uplifters_site_builder_blocks_tablet_overlay_opacity
	);

$uplifters_site_builder_blocks_mobile_overlay_rgba =
	uplifters_site_builder_blocks_popup_scroll_modal_hex_to_rgba(
		$uplifters_site_builder_blocks_mobile_overlay_color,
		$uplifters_site_builder_blocks_mobile_overlay_opacity
	);

/**
 * Global popup behavior.
 */
$uplifters_site_builder_blocks_once_per_page =
	isset( $attributes['oncePerPage'] )
		? (bool) $attributes['oncePerPage']
		: true;

/**
 * Unique IDs prevent multiple Popup Scroll Modal blocks from conflicting.
 */
$uplifters_site_builder_blocks_popup_scroll_modal_id =
	wp_unique_id( 'uplifters-site-builder-blocks-popup-scroll-modal-' );

$uplifters_site_builder_blocks_dialog_id =
	$uplifters_site_builder_blocks_popup_scroll_modal_id . '-dialog';

$uplifters_site_builder_blocks_popup_scroll_modal_selector =
	'#' . $uplifters_site_builder_blocks_popup_scroll_modal_id;

/**
 * Wrapper attributes include all responsive values for JavaScript.
 */
$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id' =>
				$uplifters_site_builder_blocks_popup_scroll_modal_id,

			'class' =>
				'uplifters-site-builder-blocks-popup-scroll-modal',

			'data-scroll-offset-desktop' =>
				(string) $uplifters_site_builder_blocks_desktop_scroll_offset,

			'data-scroll-offset-tablet' =>
				(string) $uplifters_site_builder_blocks_tablet_scroll_offset,

			'data-scroll-offset-mobile' =>
				(string) $uplifters_site_builder_blocks_mobile_scroll_offset,

			'data-once-per-page' =>
				$uplifters_site_builder_blocks_once_per_page
					? 'true'
					: 'false',

			'data-overlay-color-desktop' =>
				$uplifters_site_builder_blocks_desktop_overlay_color,

			'data-overlay-color-tablet' =>
				$uplifters_site_builder_blocks_tablet_overlay_color,

			'data-overlay-color-mobile' =>
				$uplifters_site_builder_blocks_mobile_overlay_color,

			'data-overlay-opacity-desktop' =>
				(string) $uplifters_site_builder_blocks_desktop_overlay_opacity,

			'data-overlay-opacity-tablet' =>
				(string) $uplifters_site_builder_blocks_tablet_overlay_opacity,

			'data-overlay-opacity-mobile' =>
				(string) $uplifters_site_builder_blocks_mobile_overlay_opacity,

			'data-uplifters-site-builder-blocks-popup-scroll-modal-initialized' =>
				'false',

			'aria-hidden' =>
				'true',

			'aria-labelledby' =>
				$uplifters_site_builder_blocks_dialog_id,
		)
	);

/**
 * Popup Scroll Modal CSS.
 */
$uplifters_site_builder_blocks_popup_scroll_modal_css = '
.uplifters-site-builder-blocks-popup-scroll-modal{
	display:none;
	position:fixed;
	inset:0;
	z-index:9999;
	align-items:center;
	justify-content:center;
	padding:16px;
	box-sizing:border-box;
}

.uplifters-site-builder-blocks-popup-scroll-modal *,
.uplifters-site-builder-blocks-popup-scroll-modal *::before,
.uplifters-site-builder-blocks-popup-scroll-modal *::after{
	box-sizing:border-box;
}

.uplifters-site-builder-blocks-popup-scroll-modal__backdrop{
	position:absolute;
	inset:0;
	opacity:0;
	transition:opacity 0.3s ease;
}

.uplifters-site-builder-blocks-popup-scroll-modal__dialog{
	position:relative;
	z-index:2;
	width:100%;
	max-width:720px;
	max-height:calc(100vh - 32px);
	max-height:calc(100dvh - 32px);
	overflow-y:auto;
	background:#ffffff;
	border-radius:16px;
	padding:24px;
	box-shadow:
		0 25px 50px -12px
		rgba(0,0,0,0.25);
	opacity:0;
	transform:
		translateY(24px)
		scale(0.96);
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}

.uplifters-site-builder-blocks-popup-scroll-modal__close{
	position:absolute;
	top:12px;
	right:12px;
	display:flex;
	align-items:center;
	justify-content:center;
	width:40px;
	height:40px;
	padding:0;
	border:0;
	border-radius:9999px;
	background:#f3f4f6;
	color:#111827;
	font-size:20px;
	line-height:1;
	cursor:pointer;
}

.uplifters-site-builder-blocks-popup-scroll-modal__close:hover,
.uplifters-site-builder-blocks-popup-scroll-modal__close:focus-visible{
	background:#e5e7eb;
	color:#000000;
}

.uplifters-site-builder-blocks-popup-scroll-modal__close:focus-visible{
	outline:2px solid #2271b1;
	outline-offset:2px;
}

.uplifters-site-builder-blocks-popup-scroll-modal__content{
	padding-right:48px;
}

@media (max-width:1024px){
	.uplifters-site-builder-blocks-popup-scroll-modal{
		padding:14px;
	}

	.uplifters-site-builder-blocks-popup-scroll-modal__dialog{
		max-width:620px;
	}
}

@media (max-width:767px){
	.uplifters-site-builder-blocks-popup-scroll-modal{
		padding:10px;
	}

	.uplifters-site-builder-blocks-popup-scroll-modal__dialog{
		max-width:100%;
		max-height:calc(100vh - 20px);
		max-height:calc(100dvh - 20px);
		padding:18px;
		border-radius:12px;
	}

	.uplifters-site-builder-blocks-popup-scroll-modal__close{
		top:8px;
		right:8px;
		width:36px;
		height:36px;
	}

	.uplifters-site-builder-blocks-popup-scroll-modal__content{
		padding-right:40px;
	}
}

@media (prefers-reduced-motion:reduce){
	.uplifters-site-builder-blocks-popup-scroll-modal__backdrop,
	.uplifters-site-builder-blocks-popup-scroll-modal__dialog{
		transition:none;
	}
}
';

/**
 * Unique block-specific responsive overlay CSS.
 */
$uplifters_site_builder_blocks_popup_scroll_modal_css .= $uplifters_site_builder_blocks_popup_scroll_modal_selector .
	' .uplifters-site-builder-blocks-popup-scroll-modal__backdrop{';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= 'background-color:' .
	$uplifters_site_builder_blocks_desktop_overlay_rgba . ';';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '}';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= $uplifters_site_builder_blocks_popup_scroll_modal_selector .
	' .uplifters-site-builder-blocks-popup-scroll-modal__backdrop{';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= 'background-color:' .
	$uplifters_site_builder_blocks_tablet_overlay_rgba . ';';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '}';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '}';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= $uplifters_site_builder_blocks_popup_scroll_modal_selector .
	' .uplifters-site-builder-blocks-popup-scroll-modal__backdrop{';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= 'background-color:' .
	$uplifters_site_builder_blocks_mobile_overlay_rgba . ';';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '}';

$uplifters_site_builder_blocks_popup_scroll_modal_css .= '}';
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_popup_scroll_modal_css );
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
	<div
		class="uplifters-site-builder-blocks-popup-scroll-modal__backdrop"
		data-uplifters-site-builder-blocks-popup-scroll-modal-close="true"
		aria-hidden="true"
	></div>

	<div
		id="<?php echo esc_attr( $uplifters_site_builder_blocks_dialog_id ); ?>"
		class="uplifters-site-builder-blocks-popup-scroll-modal__dialog"
		role="dialog"
		aria-modal="true"
		aria-label="<?php echo esc_attr_x( 'Popup', 'popup dialog label', 'uplifters-site-builder-blocks' ); ?>"
		tabindex="-1"
	>
		<button
			type="button"
			class="uplifters-site-builder-blocks-popup-scroll-modal__close"
			data-uplifters-site-builder-blocks-popup-scroll-modal-close="true"
			aria-label="<?php echo esc_attr__( 'Close popup', 'uplifters-site-builder-blocks' ); ?>"
		>
			<span aria-hidden="true">×</span>
		</button>

		<div class="uplifters-site-builder-blocks-popup-scroll-modal__content">
			<?php
			echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() );
			?>
		</div>
	</div>
</div>

