<?php
/**
 * Server-side rendering for the Location block.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$uplifters_site_builder_blocks_location_name   = isset( $attributes['locationName'] )
	? sanitize_text_field( $attributes['locationName'] )
	: '';

$uplifters_site_builder_blocks_background_color = isset( $attributes['backgroundColor'] )
	? trim( (string) $attributes['backgroundColor'] )
	: '';
$uplifters_site_builder_blocks_background_color_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $uplifters_site_builder_blocks_background_color )
	|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $uplifters_site_builder_blocks_background_color )
	|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $uplifters_site_builder_blocks_background_color );
$uplifters_site_builder_blocks_background_color = $uplifters_site_builder_blocks_background_color_valid ? $uplifters_site_builder_blocks_background_color : '';

$uplifters_site_builder_blocks_trimmed_location = trim( $uplifters_site_builder_blocks_location_name );

$uplifters_site_builder_blocks_google_maps_url = 'https://www.google.com/maps';

$uplifters_site_builder_blocks_google_maps_embed_url = '';

if ( '' !== $uplifters_site_builder_blocks_trimmed_location ) {
	$uplifters_site_builder_blocks_encoded_location = rawurlencode( $uplifters_site_builder_blocks_trimmed_location );

	$uplifters_site_builder_blocks_google_maps_url =
		'https://www.google.com/maps/search/?api=1&query=' .
		$uplifters_site_builder_blocks_encoded_location;

	$uplifters_site_builder_blocks_google_maps_embed_url =
		'https://www.google.com/maps?output=embed&q=' .
		$uplifters_site_builder_blocks_encoded_location;
}

$uplifters_site_builder_blocks_title_text = '' !== $uplifters_site_builder_blocks_trimmed_location
	? $uplifters_site_builder_blocks_trimmed_location
	: __( 'Location', 'uplifters-site-builder-blocks' );

$uplifters_site_builder_blocks_block_style = implode(
	'',
	array_filter(
		array(
			'width:100%;',
			'max-width:100%;',
			'position:relative;',
			'overflow:hidden;',
			'box-sizing:border-box;',
			'' !== $uplifters_site_builder_blocks_background_color
				? 'background-color:' . $uplifters_site_builder_blocks_background_color . ';'
				: '',
		)
	)
);

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'uplifters-site-builder-blocks-location-map alignfull',
		'style' => $uplifters_site_builder_blocks_block_style,
	)
);
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<div
		class="uplifters-site-builder-blocks-location-map__inner"
		style="
			width:100%;
			max-width:100%;
			margin-left:0;
			margin-right:0;
			padding-left:0;
			padding-right:0;
			box-sizing:border-box;
		"
	>
		<div
			class="uplifters-site-builder-blocks-location-map__map-card"
			style="
				width:100%;
				max-width:100%;
				overflow:hidden;
				border-top:1px solid #e2e8f0;
				border-bottom:1px solid #e2e8f0;
				background-color:#ffffff;
				box-shadow:0 1px 2px rgba(15, 23, 42, 0.08);
				box-sizing:border-box;
			"
		>
			<?php if ( '' !== $uplifters_site_builder_blocks_trimmed_location ) : ?>
				<div
					class="uplifters-site-builder-blocks-location-map__map-wrapper"
					style="
						position:relative;
						width:100%;
						max-width:100%;
						overflow:hidden;
						box-sizing:border-box;
					"
				>
					<iframe
						class="uplifters-site-builder-blocks-location-map__iframe"
						title="<?php
						echo esc_attr(
							sprintf(
								/* translators: %s: Location name. */
								__( 'Map preview: %s', 'uplifters-site-builder-blocks' ),
								$uplifters_site_builder_blocks_trimmed_location
							)
						);
						?>"
						src="<?php echo esc_url( $uplifters_site_builder_blocks_google_maps_embed_url ); ?>"
						style="
							display:block;
							width:100%;
							max-width:100%;
							height:clamp(28rem, 60vw, 36rem);
							min-height:28rem;
							border:0;
						"
						loading="lazy"
						allowfullscreen
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>

					<a
						class="uplifters-site-builder-blocks-location-map__open-maps"
						href="<?php echo esc_url( $uplifters_site_builder_blocks_google_maps_url ); ?>"
						target="_blank"
						rel="noopener noreferrer"
						title="<?php echo esc_attr__( 'Open in Google Maps', 'uplifters-site-builder-blocks' ); ?>"
						style="
							position:absolute;
							top:0.75rem;
							right:0.75rem;
							display:inline-flex;
							align-items:center;
							justify-content:center;
							border-radius:0.75rem;
							border:1px solid #cbd5e1;
							background-color:#ffffff;
							padding:0.5rem 0.75rem;
							font-size:0.75rem;
							font-weight:600;
							line-height:1;
							color:#0f172a;
							text-decoration:none;
							box-shadow:0 1px 2px rgba(15, 23, 42, 0.08);
							box-sizing:border-box;
						"
					>
						<?php esc_html_e( 'Open Maps', 'uplifters-site-builder-blocks' ); ?>
					</a>
				</div>
			<?php else : ?>
				<div
					class="uplifters-site-builder-blocks-location-map__empty-preview"
					style="
						min-height:20rem;
						width:100%;
						display:flex;
						align-items:center;
						justify-content:center;
						background:linear-gradient(to bottom, #f8fafc, #ffffff);
						padding:2rem;
						box-sizing:border-box;
					"
				>
					<div
						class="uplifters-site-builder-blocks-location-map__empty-card"
						style="
							width:100%;
							max-width:28rem;
							border-radius:1rem;
							border:1px solid #e2e8f0;
							background-color:#ffffff;
							padding:1.5rem;
							text-align:center;
							box-shadow:0 1px 2px rgba(15, 23, 42, 0.08);
							box-sizing:border-box;
						"
					>
						<div
							class="uplifters-site-builder-blocks-location-map__empty-icon"
							style="
								width:3rem;
								height:3rem;
								margin:0 auto 0.75rem;
								display:flex;
								align-items:center;
								justify-content:center;
								border-radius:1rem;
								background-color:#f1f5f9;
							"
						>
							<span
								class="uplifters-site-builder-blocks-location-map__empty-icon-symbol"
								style="font-size:1.25rem;"
								aria-hidden="true"
							>
								🗺️
							</span>
						</div>

						<div
							class="uplifters-site-builder-blocks-location-map__empty-title"
							style="
								font-size:1rem;
								font-weight:600;
								color:#0f172a;
							"
						>
							<?php esc_html_e( 'Map preview', 'uplifters-site-builder-blocks' ); ?>
						</div>

						<div
							class="uplifters-site-builder-blocks-location-map__empty-description"
							style="
								margin-top:0.25rem;
								font-size:0.875rem;
								color:#475569;
							"
						>
							<?php
							esc_html_e(
								'Add a location in the editor settings.',
								'uplifters-site-builder-blocks'
							);
							?>
						</div>
					</div>
				</div>
			<?php endif; ?>

			<div
				class="uplifters-site-builder-blocks-location-map__map-information"
				style="padding:0.75rem;"
			>
				<div
					class="uplifters-site-builder-blocks-location-map__map-location-name"
					style="
						overflow:hidden;
						text-overflow:ellipsis;
						white-space:nowrap;
						font-size:0.875rem;
						font-weight:600;
						color:#0f172a;
					"
				>
					<?php echo esc_html( $uplifters_site_builder_blocks_title_text ); ?>
				</div>

				<div
					class="uplifters-site-builder-blocks-location-map__map-url"
					style="
						margin-top:0.25rem;
						overflow:hidden;
						text-overflow:ellipsis;
						white-space:nowrap;
						font-size:0.75rem;
						color:#475569;
					"
				>
					<?php echo esc_html( $uplifters_site_builder_blocks_google_maps_url ); ?>
				</div>
			</div>
		</div>
	</div>
</div>
