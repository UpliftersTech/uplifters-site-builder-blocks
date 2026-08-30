<?php
/**
 * Server-side render for the Footer Section block.
 *
 * @package uplifters-site-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$uplifters_site_builder_blocks_max_column_count = 4;

$uplifters_site_builder_blocks_get_equal_widths = static function ( $count ) {
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

$uplifters_site_builder_blocks_normalize_widths = static function ( $widths, $count ) use ( $uplifters_site_builder_blocks_get_equal_widths ) {
	if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
		return $uplifters_site_builder_blocks_get_equal_widths( $count );
	}

	$numeric_widths = array_map(
		static function ( $width ) {
			return is_numeric( $width ) ? (float) $width : 0;
		},
		$widths
	);

	$total = array_sum( $numeric_widths );

	if ( $total <= 0 ) {
		return $uplifters_site_builder_blocks_get_equal_widths( $count );
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

$uplifters_site_builder_blocks_get_responsive_widths = static function ( $column_widths, $device, $column_count ) use ( $uplifters_site_builder_blocks_normalize_widths, $uplifters_site_builder_blocks_is_list_array ) {
	if ( $uplifters_site_builder_blocks_is_list_array( $column_widths ) ) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths, $column_count );
	}

	if (
		is_array( $column_widths ) &&
		isset( $column_widths[ $device ] ) &&
		is_array( $column_widths[ $device ] )
	) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths[ $device ], $column_count );
	}

	if (
		is_array( $column_widths ) &&
		isset( $column_widths['desktop'] ) &&
		is_array( $column_widths['desktop'] )
	) {
		return $uplifters_site_builder_blocks_normalize_widths( $column_widths['desktop'], $column_count );
	}

	return $uplifters_site_builder_blocks_normalize_widths( array(), $column_count );
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

$uplifters_site_builder_blocks_normalize_height_value = static function ( $value ) {
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

$uplifters_site_builder_blocks_get_grid_template_columns = static function ( $widths, $column_count ) use ( $uplifters_site_builder_blocks_normalize_widths ) {
	$normalized_widths = $uplifters_site_builder_blocks_normalize_widths( $widths, $column_count );

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

$uplifters_site_builder_blocks_get_active_column_count = static function ( $inner_blocks ) use ( $uplifters_site_builder_blocks_max_column_count ) {
	$count = is_array( $inner_blocks ) ? count( $inner_blocks ) : 0;

	if ( $count > 0 ) {
		return $count;
	}

	return $uplifters_site_builder_blocks_max_column_count;
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
$uplifters_site_builder_blocks_height                 = isset( $attributes['height'] ) ? $attributes['height'] : array();
$uplifters_site_builder_blocks_mobile_stack           = isset( $attributes['mobileStack'] ) ? (bool) $attributes['mobileStack'] : false;
$uplifters_site_builder_blocks_border_radius          = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : array();
$uplifters_site_builder_blocks_gap                    = isset( $attributes['gap'] ) ? $attributes['gap'] : array();
$uplifters_site_builder_blocks_background_color       = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : array();

$uplifters_site_builder_blocks_inner_blocks = $uplifters_site_builder_blocks_get_inner_blocks( isset( $block ) ? $block : null );

$uplifters_site_builder_blocks_active_column_count = $uplifters_site_builder_blocks_get_active_column_count( $uplifters_site_builder_blocks_inner_blocks );

$uplifters_site_builder_blocks_desktop_widths = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'desktop', $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_tablet_widths  = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'tablet', $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_mobile_widths  = $uplifters_site_builder_blocks_get_responsive_widths( $uplifters_site_builder_blocks_column_widths, 'mobile', $uplifters_site_builder_blocks_active_column_count );

$uplifters_site_builder_blocks_desktop_vertical_alignment = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'desktop' );
$uplifters_site_builder_blocks_tablet_vertical_alignment  = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'tablet' );
$uplifters_site_builder_blocks_mobile_vertical_alignment  = $uplifters_site_builder_blocks_get_responsive_vertical_alignment( $uplifters_site_builder_blocks_vertical_alignment, 'mobile' );

$uplifters_site_builder_blocks_desktop_height = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'desktop', $uplifters_site_builder_blocks_normalize_height_value );
$uplifters_site_builder_blocks_tablet_height  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'tablet', $uplifters_site_builder_blocks_normalize_height_value );
$uplifters_site_builder_blocks_mobile_height  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_height, 'mobile', $uplifters_site_builder_blocks_normalize_height_value );

$uplifters_site_builder_blocks_desktop_gap = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_gap, 'desktop', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_tablet_gap  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_gap, 'tablet', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_mobile_gap  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_gap, 'mobile', $uplifters_site_builder_blocks_normalize_css_size_value );

$uplifters_site_builder_blocks_desktop_border_radius    = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'desktop', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_tablet_border_radius     = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'tablet', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_mobile_border_radius     = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_border_radius, 'mobile', $uplifters_site_builder_blocks_normalize_css_size_value );
$uplifters_site_builder_blocks_desktop_background_color = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_background_color, 'desktop', $uplifters_site_builder_blocks_normalize_color_value );
$uplifters_site_builder_blocks_tablet_background_color  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_background_color, 'tablet', $uplifters_site_builder_blocks_normalize_color_value );
$uplifters_site_builder_blocks_mobile_background_color  = $uplifters_site_builder_blocks_get_responsive_style_value( $uplifters_site_builder_blocks_background_color, 'mobile', $uplifters_site_builder_blocks_normalize_color_value );

/*
 * Footer blocks render in the same natural innerBlocks order on every
 * device — footer-section has no per-device reorder feature. Each device
 * still gets its own <div> below because column widths and visibility
 * remain per-device via the resizer; only the order is shared.
 */
$uplifters_site_builder_blocks_desktop_inner_blocks = $uplifters_site_builder_blocks_inner_blocks;
$uplifters_site_builder_blocks_tablet_inner_blocks  = $uplifters_site_builder_blocks_inner_blocks;
$uplifters_site_builder_blocks_mobile_inner_blocks  = $uplifters_site_builder_blocks_inner_blocks;

$uplifters_site_builder_blocks_block_id = 'uplifters-site-builder-blocks-footer-section-' . wp_unique_id();

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'                       => $uplifters_site_builder_blocks_block_id,
		'class'                    => 'uplifters-site-builder-blocks-footer-section',
		'data-uplifters-site-builder-blocks-footer-section' => 'true',
		'data-uplifters-site-builder-blocks-column-count'   => (string) $uplifters_site_builder_blocks_active_column_count,
		'data-uplifters-site-builder-blocks-mobile-stack'   => $uplifters_site_builder_blocks_mobile_stack ? 'true' : 'false',
		'style'                    => 'box-sizing:border-box;position:relative;width:100%;',
	)
);

$uplifters_site_builder_blocks_desktop_columns = $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_desktop_widths, $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_tablet_columns  = $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_tablet_widths, $uplifters_site_builder_blocks_active_column_count );
$uplifters_site_builder_blocks_mobile_columns  = $uplifters_site_builder_blocks_mobile_stack ? 'minmax(0, 1fr)' : $uplifters_site_builder_blocks_get_grid_template_columns( $uplifters_site_builder_blocks_mobile_widths, $uplifters_site_builder_blocks_active_column_count );
?>

<?php ob_start(); ?>
	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_background_color ) : ?>
		background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_background_color ); ?>;
		<?php endif; ?>
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_border_radius ) : ?>
		border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_border_radius ); ?>;
		<?php endif; ?>
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner {
		box-sizing: border-box;
		display: grid;
		grid-auto-flow: column;
		min-width: 0;
		width: 100%;
		gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_desktop_gap ? $uplifters_site_builder_blocks_desktop_gap : '0px' ); ?>;
		--wp--style--block-gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_desktop_gap ? $uplifters_site_builder_blocks_desktop_gap : '0px' ); ?>;
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner > * {
		box-sizing: border-box;
		min-width: 0;
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--desktop {
		align-content: <?php echo esc_html( $uplifters_site_builder_blocks_desktop_vertical_alignment ); ?>;
		align-items: <?php echo esc_html( $uplifters_site_builder_blocks_desktop_vertical_alignment ); ?>;
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_height ) : ?>
		height: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_height ); ?>;
		<?php endif; ?>
		grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_desktop_columns ); ?>;
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_background_color ) : ?>
		background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_background_color ); ?>;
		<?php endif; ?>
		<?php if ( '' !== $uplifters_site_builder_blocks_desktop_border_radius ) : ?>
		border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_desktop_border_radius ); ?>;
		overflow: hidden;
		<?php endif; ?>
	}

	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--tablet,
	#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--mobile {
		display: none;
	}

	@media (max-width: 1024px) {
		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_background_color ) : ?>
			background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_background_color ); ?>;
			<?php endif; ?>
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_border_radius ); ?>;
			<?php endif; ?>
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--desktop {
			display: none;
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--tablet {
			align-content: <?php echo esc_html( $uplifters_site_builder_blocks_tablet_vertical_alignment ); ?>;
			align-items: <?php echo esc_html( $uplifters_site_builder_blocks_tablet_vertical_alignment ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_height ) : ?>
			height: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_height ); ?>;
			<?php endif; ?>
			display: grid;
			grid-auto-flow: column;
			grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_tablet_columns ); ?>;
			gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_tablet_gap ? $uplifters_site_builder_blocks_tablet_gap : '0px' ); ?>;
			--wp--style--block-gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_tablet_gap ? $uplifters_site_builder_blocks_tablet_gap : '0px' ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_background_color ) : ?>
			background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_background_color ); ?>;
			<?php endif; ?>
			<?php if ( '' !== $uplifters_site_builder_blocks_tablet_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_tablet_border_radius ); ?>;
			overflow: hidden;
			<?php endif; ?>
		}
	}

	@media (max-width: 767px) {
		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> {
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_background_color ) : ?>
			background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_background_color ); ?>;
			<?php endif; ?>
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_border_radius ); ?>;
			<?php endif; ?>
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--tablet {
			display: none;
		}

		#<?php echo esc_attr( $uplifters_site_builder_blocks_block_id ); ?> .uplifters-site-builder-blocks-footer-section__inner--mobile {
			align-content: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_vertical_alignment ); ?>;
			align-items: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_vertical_alignment ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_height ) : ?>
			height: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_height ); ?>;
			<?php endif; ?>
			display: grid;
			grid-auto-flow: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_stack ? 'row' : 'column' ); ?>;
			grid-template-columns: <?php echo esc_html( $uplifters_site_builder_blocks_mobile_columns ); ?>;
			gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_mobile_gap ? $uplifters_site_builder_blocks_mobile_gap : '0px' ); ?>;
			--wp--style--block-gap: <?php echo esc_attr( '' !== $uplifters_site_builder_blocks_mobile_gap ? $uplifters_site_builder_blocks_mobile_gap : '0px' ); ?>;
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_background_color ) : ?>
			background-color: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_background_color ); ?>;
			<?php endif; ?>
			<?php if ( '' !== $uplifters_site_builder_blocks_mobile_border_radius ) : ?>
			border-radius: <?php echo esc_attr( $uplifters_site_builder_blocks_mobile_border_radius ); ?>;
			overflow: hidden;
			<?php endif; ?>
		}
	}
<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php if ( ! empty( $uplifters_site_builder_blocks_desktop_inner_blocks ) ) : ?>
		<div
			class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--desktop"
			data-uplifters-site-builder-blocks-footer-section-inner="desktop"
		>
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_desktop_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $uplifters_site_builder_blocks_tablet_inner_blocks ) ) : ?>
		<div
			class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--tablet"
			data-uplifters-site-builder-blocks-footer-section-inner="tablet"
		>
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_tablet_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $uplifters_site_builder_blocks_mobile_inner_blocks ) ) : ?>
		<div
			class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--mobile"
			data-uplifters-site-builder-blocks-footer-section-inner="mobile"
		>
			<?php echo wp_kses( $uplifters_site_builder_blocks_render_inner_blocks( $uplifters_site_builder_blocks_mobile_inner_blocks ), \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php endif; ?>

	<?php if ( empty( $uplifters_site_builder_blocks_inner_blocks ) ) : ?>
		<div
			class="uplifters-site-builder-blocks-footer-section__inner uplifters-site-builder-blocks-footer-section__inner--desktop"
			data-uplifters-site-builder-blocks-footer-section-inner="desktop"
		>
			<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
		</div>
	<?php endif; ?>
</div>