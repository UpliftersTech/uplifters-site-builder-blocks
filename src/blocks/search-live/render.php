<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS Search Live block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_is_responsive_object' ) ) {
	function uplifters_site_builder_blocks_search_live_is_responsive_object( $value ): bool {
		return is_array( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_responsive_array' ) ) {
	function uplifters_site_builder_blocks_search_live_responsive_array( array $attributes, string $key, $default ): array {
		$value = $attributes[ $key ] ?? null;

		if ( uplifters_site_builder_blocks_search_live_is_responsive_object( $value ) ) {
			$result = array();

			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
				if ( array_key_exists( $device, $value ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
					$result[ $device ] = $value[ $device ];
				}
			}

			if ( empty( $result ) ) {
				$result['desktop'] = $default;
			}

			return $result;
		}

		if ( null !== $value && '' !== $value ) {
			return array(
				'desktop' => $value,
			);
		}

		return array(
			'desktop' => $default,
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_sanitize_color_value' ) ) {
	function uplifters_site_builder_blocks_search_live_sanitize_color_value( $value, string $fallback = '' ): string {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return $fallback;
		}

		if ( preg_match( '/^#[a-fA-F0-9]{3,8}$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^rgba?\([0-9.,\s%]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^[a-zA-Z]+$/', $value ) ) {
			return $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_sanitize_responsive_number' ) ) {
	function uplifters_site_builder_blocks_search_live_sanitize_responsive_number( array $values, int $fallback ): array {
		$result = array();

		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			if ( array_key_exists( $device, $values ) ) {
				$number = absint( $values[ $device ] );
				$result[ $device ] = $number > 0 ? $number : $fallback;
			}
		}

		if ( empty( $result ) ) {
			$result['desktop'] = $fallback;
		}

		return $result;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_sanitize_responsive_color' ) ) {
	function uplifters_site_builder_blocks_search_live_sanitize_responsive_color( array $values, string $fallback ): array {
		$result = array();

		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			if ( array_key_exists( $device, $values ) ) {
				$result[ $device ] = uplifters_site_builder_blocks_search_live_sanitize_color_value( $values[ $device ], $fallback );
			}
		}

		if ( empty( $result ) ) {
			$result['desktop'] = $fallback;
		}

		return $result;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_search_live_sanitize_responsive_bool' ) ) {
	function uplifters_site_builder_blocks_search_live_sanitize_responsive_bool( array $values, bool $fallback ): array {
		$result = array();

		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			if ( array_key_exists( $device, $values ) ) {
				$result[ $device ] = (bool) $values[ $device ];
			}
		}

		if ( empty( $result ) ) {
			$result['desktop'] = $fallback;
		}

		return $result;
	}
}

$uplifters_site_builder_blocks_placeholder = isset( $attributes['placeholder'] ) ? sanitize_text_field( $attributes['placeholder'] ) : 'Search…';
$uplifters_site_builder_blocks_per_page    = isset( $attributes['perPage'] ) ? absint( $attributes['perPage'] ) : 8;
$uplifters_site_builder_blocks_min_chars   = isset( $attributes['minChars'] ) ? absint( $attributes['minChars'] ) : 2;

$uplifters_site_builder_blocks_per_page  = $uplifters_site_builder_blocks_per_page > 0 ? $uplifters_site_builder_blocks_per_page : 8;
$uplifters_site_builder_blocks_min_chars = $uplifters_site_builder_blocks_min_chars > 0 ? $uplifters_site_builder_blocks_min_chars : 2;

$uplifters_site_builder_blocks_responsive_settings = array(
	'inputHeight'          => uplifters_site_builder_blocks_search_live_sanitize_responsive_number(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'inputHeight', 44 ),
		44
	),
	'inputBorderRadius'    => uplifters_site_builder_blocks_search_live_sanitize_responsive_number(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'inputBorderRadius', 12 ),
		12
	),
	'inputBackgroundColor' => uplifters_site_builder_blocks_search_live_sanitize_responsive_color(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'inputBackgroundColor', '#ffffff' ),
		'#ffffff'
	),
	'placeholderColor'     => uplifters_site_builder_blocks_search_live_sanitize_responsive_color(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'placeholderColor', 'rgb(100 116 139)' ),
		'rgb(100 116 139)'
	),
	'searchIconColor'      => uplifters_site_builder_blocks_search_live_sanitize_responsive_color(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'searchIconColor', 'rgb(100 116 139)' ),
		'rgb(100 116 139)'
	),
	'iconOnlySearch'       => uplifters_site_builder_blocks_search_live_sanitize_responsive_bool(
		uplifters_site_builder_blocks_search_live_responsive_array( $attributes, 'iconOnlySearch', false ),
		false
	),
);

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                    => 'uplifters-site-builder-blocks-m-search',
		'data-placeholder'         => $uplifters_site_builder_blocks_placeholder,
		'data-per-page'            => (string) $uplifters_site_builder_blocks_per_page,
		'data-min-chars'           => (string) $uplifters_site_builder_blocks_min_chars,
		'data-responsive-settings' => wp_json_encode( $uplifters_site_builder_blocks_responsive_settings ),
	)
);
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>></div>