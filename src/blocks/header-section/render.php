<?php
/**
 * Server-side render for the Header Section block.
 *
 * @package uplifters-site-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$uplifters_site_builder_blocks_default_column_count = 4;

$uplifters_site_builder_blocks_get_default_widths_for_count = static function ( $count ) {
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

$uplifters_site_builder_blocks_is_list_array = static function ( $value ) {
	if ( ! is_array( $value ) ) {
		return false;
	}

	if ( array() === $value ) {
		return true;
	}

	return array_keys( $value ) === range( 0, count( $value ) - 1 );
};

$uplifters_site_builder_blocks_normalize_widths = static function ( $widths, $count ) use ( $uplifters_site_builder_blocks_get_default_widths_for_count ) {
	if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
		return $uplifters_site_builder_blocks_get_default_widths_for_count( $count );
	}

	$numeric_widths = array_map(
		static function ( $width ) {
			return is_numeric( $width ) ? (float) $width : 0;
		},
		$widths
	);

	$total = array_sum( $numeric_widths );

	if ( $total <= 0 ) {
		return $uplifters_site_builder_blocks_get_default_widths_for_count( $count );
	}

	return array_map(
		static function ( $width ) use ( $total ) {
			return round( ( $width / $total ) * 100, 4 );
		},
		$numeric_widths
	);
};

$uplifters_site_builder_blocks_normalize_vertical_alignment = static function ( $alignment ) {
	$allowed_alignments = array( 'start', 'center', 'end' );

	if ( in_array( $alignment, $allowed_alignments, true ) ) {
		return $alignment;
	}

	return 'center';
};

/*
 * Order entries are "block-name#occurrence" composite keys, not raw block
 * names — mirrors header-section/edit.js exactly. A legacy entry (no "#")
 * is migrated in place as occurrence 0, since every pre-existing saved
 * array had at most one entry per name by construction. The migration is
 * naturally idempotent: an already-migrated entry already contains "#"
 * and passes through unchanged.
 */
$uplifters_site_builder_blocks_migrate_order_entry = static function ( $entry ) {
	if ( ! is_string( $entry ) || '' === $entry ) {
		return '';
	}

	return ( false !== strpos( $entry, '#' ) ) ? $entry : $entry . '#0';
};

$uplifters_site_builder_blocks_get_composite_block_keys = static function ( $inner_blocks ) {
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

$uplifters_site_builder_blocks_normalize_block_order = static function ( $order ) use ( $uplifters_site_builder_blocks_migrate_order_entry ) {
	if ( ! is_array( $order ) ) {
		return array();
	}

	$normalized_order = array();
	$used_keys        = array();

	foreach ( $order as $raw_entry ) {
		$key = $uplifters_site_builder_blocks_migrate_order_entry( $raw_entry );

		if ( '' !== $key && ! isset( $used_keys[ $key ] ) ) {
			$normalized_order[] = $key;
			$used_keys[ $key ]  = true;
		}
	}

	return $normalized_order;
};

$uplifters_site_builder_blocks_get_responsive_widths = static function ( $column_widths, $device, $count ) use ( $uplifters_site_builder_blocks_normalize_widths, $uplifters_site_builder_blocks_is_list_array ) {
	if ( $uplifters_site_builder_blocks_is_list_array( $column_widths ) ) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths, $count );
	}

	if (
		is_array( $column_widths ) &&
		isset( $column_widths[ $device ] ) &&
		is_array( $column_widths[ $device ] )
	) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths[ $device ], $count );
	}

	if (
		is_array( $column_widths ) &&
		isset( $column_widths['desktop'] ) &&
		is_array( $column_widths['desktop'] )
	) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths['desktop'], $count );
	}

	return $uplifters_site_builder_blocks_normalize_widths( array(), $count );
};

$uplifters_site_builder_blocks_get_responsive_vertical_alignment = static function ( $vertical_alignment, $device ) use ( $uplifters_site_builder_blocks_normalize_vertical_alignment ) {
	if ( is_string( $vertical_alignment ) ) {
		return $uplifters_site_builder_blocks_normalize_vertical_alignment( $vertical_alignment );
	}

	if (
		is_array( $vertical_alignment ) &&
		isset( $vertical_alignment[ $device ] ) &&
		is_string( $vertical_alignment[ $device ] )
	) {
		return $uplifters_site_builder_blocks_normalize_vertical_alignment( $vertical_alignment[ $device ] );
	}

	if (
		is_array( $vertical_alignment ) &&
		isset( $vertical_alignment['desktop'] ) &&
		is_string( $vertical_alignment['desktop'] )
	) {
		return $uplifters_site_builder_blocks_normalize_vertical_alignment( $vertical_alignment['desktop'] );
	}

	return 'center';
};

$uplifters_site_builder_blocks_normalize_css_size_value = static function ( $value ) {
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

$uplifters_site_builder_blocks_normalize_color_value = static function ( $value ) {
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

$uplifters_site_builder_blocks_get_responsive_style_value = static function ( $values, $device, $normalize_value ) {
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

$uplifters_site_builder_blocks_get_responsive_block_order = static function ( $responsive_block_order, $device ) use ( $uplifters_site_builder_blocks_normalize_block_order ) {
	if (
		is_array( $responsive_block_order ) &&
		isset( $responsive_block_order[ $device ] ) &&
		is_array( $responsive_block_order[ $device ] )
	) {
		return $uplifters_site_builder_blocks_normalize_block_order( $responsive_block_order[ $device ] );
	}

	return array();
};

$uplifters_site_builder_blocks_get_grid_template_columns = static function ( $widths, $count ) use ( $uplifters_site_builder_blocks_normalize_widths ) {
	$normalized_widths = $uplifters_site_builder_blocks_normalize_widths( $widths, $count );

	$columns = array_map(
		static function ( $width ) {
			return 'minmax(0, ' . esc_attr( $width ) . 'fr)';
		},
		$normalized_widths
	);

	return implode( ' ', $columns );
};

$uplifters_site_builder_blocks_get_inner_blocks = static function ( $block_instance ) {
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

$uplifters_site_builder_blocks_sort_inner_blocks_by_saved_order = static function ( $inner_blocks, $saved_order ) use ( $uplifters_site_builder_blocks_get_composite_block_keys ) {
	if ( empty( $saved_order ) ) {
		return $inner_blocks;
	}

	$composite_keys = $uplifters_site_builder_blocks_get_composite_block_keys( $inner_blocks );

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

$uplifters_site_builder_blocks_render_inner_blocks = static function ( $inner_blocks ) {
	$output = '';

	foreach ( $inner_blocks as $inner_block ) {
		$output .= render_block( $inner_block );
	}

	return $output;
};

$uplifters_site_builder_blocks_column_widths          = isset( $attributes['columnWidths'] ) ? $attributes['columnWidths'] : array();
$uplifters_site_builder_blocks_vertical_alignment     = isset( $attributes['verticalAlignment'] ) ? $attributes['verticalAlignment'] : array();
$uplifters_site_builder_blocks_responsive_block_order = isset( $attributes['responsiveBlockOrder'] ) ? $attributes['responsiveBlockOrder'] : array();
$uplifters_site_builder_blocks_border_radius          = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : array();
$uplifters_site_builder_blocks_background_color       = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : array();
$uplifters_site_builder_blocks_height                 = isset( $attributes['height'] ) ? $attributes['height'] : array();

$uplifters_site_builder_blocks_inner_blocks = $uplifters_site_builder_blocks_get_inner_blocks( isset( $block ) ? $block : null );

$uplifters_site_builder_blocks_active_column_count = ! empty( $uplifters_site_builder_blocks_inner_blocks ) ? count( $uplifters_site_builder_blocks_inner_blocks ) : $uplifters_site_builder_blocks_default_column_count;

$uplifters_site_builder_blocks_desktop_widths = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'desktop', $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_tablet_widths  = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'tablet', $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_mobile_widths  = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'mobile', $uplifters_site_builder_blocks_active_column_count );

$uplifters_site_builder_blocks_desktop_vertical_alignment = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'desktop' );
$uplifters_site_builder_blocks_tablet_vertical_alignment  = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'tablet' );
$uplifters_site_builder_blocks_mobile_vertical_alignment  = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'mobile' );

$uplifters_site_builder_blocks_desktop_border_radius    = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'desktop', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_tablet_border_radius     = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'tablet', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_mobile_border_radius     = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'mobile', $uplifters_site_builder_blocks_normalize_css_size_value );
/*
 * Background color follows the active-device pattern used in the editor:
 * an explicitly empty device value stays empty instead of inheriting Desktop.
 * Legacy attributes that do not contain the device key may still fall back to Desktop.
 */
$uplifters_site_builder_blocks_get_responsive_background_color = static function ( $values, $device ) use ( $uplifters_site_builder_blocks_normalize_color_value ) {
	if ( is_string( $values ) ) {
		return $uplifters_site_builder_blocks_normalize_color_value( $values );
	}

	if ( ! is_array( $values ) ) {
		return '';
	}

	if ( array_key_exists( $device, $values ) ) {
		return $uplifters_site_builder_blocks_normalize_color_value( $values[ $device ] );
	}

	if ( 'desktop' !== $device && array_key_exists( 'desktop', $values ) ) {
		return $uplifters_site_builder_blocks_normalize_color_value( $values['desktop'] );
	}

	return '';
};

$uplifters_site_builder_blocks_desktop_background_color = $uplifters_site_builder_blocks_get_responsive_background_color( $uplifters_site_builder_blocks_background_color, 'desktop' );
$uplifters_site_builder_blocks_tablet_background_color  = $uplifters_site_builder_blocks_get_responsive_background_color( $uplifters_site_builder_blocks_background_color, 'tablet' );
$uplifters_site_builder_blocks_mobile_background_color  = $uplifters_site_builder_blocks_get_responsive_background_color( $uplifters_site_builder_blocks_background_color, 'mobile' );
$uplifters_site_builder_blocks_desktop_height           = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'desktop', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_tablet_height            = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'tablet', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_mobile_height            = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'mobile', $uplifters_site_builder_blocks_normalize_css_size_value );

$uplifters_site_builder_blocks_desktop_block_order = $uplifters_site_builder_blocks_get_responsive_block_order( $uplifters_site_builder_blocks_responsive_block_order, 'desktop' );
$uplifters_site_builder_blocks_tablet_block_order  = $uplifters_site_builder_blocks_get_responsive_block_order( $uplifters_site_builder_blocks_responsive_block_order, 'tablet' );
$uplifters_site_builder_blocks_mobile_block_order  = $uplifters_site_builder_blocks_get_responsive_block_order( $uplifters_site_builder_blocks_responsive_block_order, 'mobile' );

$uplifters_site_builder_blocks_desktop_inner_blocks = $uplifters_site_builder_blocks_sort_inner_blocks_by_saved_order( $uplifters_site_builder_blocks_inner_blocks, $uplifters_site_builder_blocks_desktop_block_order );
$uplifters_site_builder_blocks_tablet_inner_blocks  = $uplifters_site_builder_blocks_sort_inner_blocks_by_saved_order( $uplifters_site_builder_blocks_inner_blocks, $uplifters_site_builder_blocks_tablet_block_order );
$uplifters_site_builder_blocks_mobile_inner_blocks  = $uplifters_site_builder_blocks_sort_inner_blocks_by_saved_order( $uplifters_site_builder_blocks_inner_blocks, $uplifters_site_builder_blocks_mobile_block_order );

$uplifters_site_builder_blocks_block_id = 'uplifters-site-builder-blocks-header-section-' . wp_unique_id();

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_block_id,
		'class' => 'uplifters-site-builder-blocks-header-section',
		'style' => 'box-sizing:border-box;position:relative;width:100%;',
	)
);

$uplifters_site_builder_blocks_desktop_columns = $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_desktop_widths, $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_tablet_columns  = $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_tablet_widths, $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_mobile_columns  = $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_mobile_widths, $uplifters_site_builder_blocks_active_column_count );
?>

<?php ob_start(); ?>
	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
		background-color: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_desktop_background_color ? $uplifters_site_builder_blocks_desktop_background_color : 'transparent' ); ?>;
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_border_radius ) : ?>
		border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_border_radius ); ?>;
		<?php endif; ?>
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner {
		box-sizing: border-box;
		display: grid;
		min-width: 0;
		width: 100%;
		--wp--style--block-gap: 0px;
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner > * {
		box-sizing: border-box;
		min-width: 0;
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--desktop {
		align-items: <?php echo esc_html( $uplifters_site_builder_blocks_desktop_vertical_alignment ); ?>;
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_height ) : ?>
		height: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_height ); ?>;
		<?php endif; ?>
		grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_desktop_columns ); ?>;
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--tablet,
	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--mobile {
		display: none;
	}

	@media (max-width: 1024px) {
		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
			background-color: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_tablet_background_color ? $uplifters_site_builder_blocks_tablet_background_color : 'transparent' ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_border_radius ); ?>;
			<?php endif; ?>
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--desktop {
			display: none;
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--tablet {
			align-items: <?php echo esc_html( $uplifters_site_builder_blocks_tablet_vertical_alignment ); ?>;
			display: grid;
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_height ) : ?>
			height: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_height ); ?>;
			<?php endif; ?>
			grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_tablet_columns ); ?>;
		}
	}

	@media (max-width: 767px) {
		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
			background-color: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_mobile_background_color ? $uplifters_site_builder_blocks_mobile_background_color : 'transparent' ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_border_radius ); ?>;
			<?php endif; ?>
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--tablet {
			display: none;
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-header-section__inner--mobile {
			align-items: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_vertical_alignment ); ?>;
			display: grid;
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_height ) : ?>
			height: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_height ); ?>;
			<?php endif; ?>
			grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_columns ); ?>;
		}
	}
<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php if ( ! empty( $uplifters_site_builder_blocks_inner_blocks ) ) : ?>
		<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--desktop">
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_desktop_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>

		<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--tablet">
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_tablet_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>

		<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--mobile">
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_mobile_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php else : ?>
		<div class="uplifters-site-builder-blocks-header-section__inner uplifters-site-builder-blocks-header-section__inner--desktop">
			<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php endif; ?>
</div>