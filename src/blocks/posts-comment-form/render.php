<?php
/**
 * Server-side renderer for PostsCommentForm.
 *
 * Renders only on single post/page views (see the is_singular() guard
 * below) — a comment form doesn't make sense on an archive or search page.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Current block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Read a responsive attribute.
 *
 * Older scalar values are also supported.
 *
 * @param array  $attributes Block attributes.
 * @param string $key        Attribute name.
 * @param string $device     Device branch.
 * @param mixed  $fallback   Fallback value.
 *
 * @return mixed
 */
$uplifters_site_builder_blocks_comments_responsive_value = static function (
	array $attributes,
	string $key,
	string $device,
	$fallback = ''
) {
	if ( ! array_key_exists( $key, $attributes ) ) {
		return $fallback;
	}

	$value = $attributes[ $key ];

	if ( ! is_array( $value ) ) {
		return $value;
	}

	if ( array_key_exists( $device, $value ) ) {
		return $value[ $device ];
	}

	if ( array_key_exists( 'desktop', $value ) ) {
		return $value['desktop'];
	}

	if ( array_key_exists( 'tablet', $value ) ) {
		return $value['tablet'];
	}

	if ( array_key_exists( 'mobile', $value ) ) {
		return $value['mobile'];
	}

	return $fallback;
};

/**
 * Sanitize a color.
 *
 * @param mixed  $value    Color.
 * @param string $fallback Fallback color.
 *
 * @return string
 */
$uplifters_site_builder_blocks_comments_color = static function (
	$value,
	string $fallback
): string {
	if ( ! is_string( $value ) ) {
		return $fallback;
	}

	$color = trim( $value );
	$is_valid = preg_match( '/^#[a-fA-F0-9]{3,8}$/', $color )
		|| preg_match( '/^rgb[a]?\([0-9.,\s%]+\)$/', $color )
		|| preg_match( '/^hsla?\([0-9.,\s%deg]+\)$/', $color );

	return $is_valid ? $color : $fallback;
};

/**
 * Clamp a number.
 *
 * @param mixed $value    Input value.
 * @param int   $minimum  Minimum.
 * @param int   $maximum  Maximum.
 * @param int   $fallback Fallback.
 *
 * @return int
 */
$uplifters_site_builder_blocks_comments_clamp = static function (
	$value,
	int $minimum,
	int $maximum,
	int $fallback
): int {
	if ( ! is_numeric( $value ) ) {
		return $fallback;
	}

	return min(
		$maximum,
		max( $minimum, (int) $value )
	);
};

/**
 * Build responsive button CSS.
 *
 * @param string $selector Unique selector.
 * @param array  $settings Device settings.
 *
 * @return string
 */
$uplifters_site_builder_blocks_comments_device_css = static function (
	string $selector,
	array $settings
): string {
	$css  = '';

	$css .= $selector . '{';
	$css .= 'font-family:' .
		$settings['font_family'] .
		';';
	$css .= '}';

	$css .= $selector . ' .up2-name-email-fields{';
	$css .= 'display:' .
		(
			$settings['show_name_email']
				? 'grid'
				: 'none'
		) .
		';';
	$css .= '}';

	$css .= $selector . ' .up2-submit{';
	$css .= 'background:' .
		$settings['button_bg_color'] .
		';';

	$css .= 'color:' .
		$settings['button_text_color'] .
		';';

	$css .= 'border-radius:' .
		$settings['button_radius'] .
		'px;';

	$css .= 'padding:' .
		$settings['button_padding_y'] .
		'px ' .
		$settings['button_padding_x'] .
		'px;';

	$css .= 'margin-top:' .
		$settings['button_margin_top'] .
		'px;';

	$css .= '}';

	$css .= $selector . ' .up2-submit:hover{';
	$css .= 'background:' .
		$settings['button_hover_bg_color'] .
		';';
	$css .= '}';

	return $css;
};

/*
 * Text and form settings.
 */
$uplifters_site_builder_blocks_title_text = isset( $attributes['titleText'] )
	? sanitize_text_field(
		$attributes['titleText']
	)
	: __(
		'Leave a comment',
		'uplifters-site-builder-blocks'
	);

$uplifters_site_builder_blocks_button_text = isset( $attributes['buttonText'] )
	? sanitize_text_field(
		$attributes['buttonText']
	)
	: __(
		'Send Comment',
		'uplifters-site-builder-blocks'
	);

$uplifters_site_builder_blocks_placeholder = isset( $attributes['placeholder'] )
	? sanitize_text_field(
		$attributes['placeholder']
	)
	: __(
		'Write your comment…',
		'uplifters-site-builder-blocks'
	);

$uplifters_site_builder_blocks_name_label = isset( $attributes['nameLabel'] )
	? sanitize_text_field(
		$attributes['nameLabel']
	)
	: __( 'Name', 'uplifters-site-builder-blocks' );

$uplifters_site_builder_blocks_email_label = isset( $attributes['emailLabel'] )
	? sanitize_text_field(
		$attributes['emailLabel']
	)
	: __( 'Email', 'uplifters-site-builder-blocks' );

$uplifters_site_builder_blocks_comment_label = isset( $attributes['commentLabel'] )
	? sanitize_text_field(
		$attributes['commentLabel']
	)
	: __( 'Comment', 'uplifters-site-builder-blocks' );

$uplifters_site_builder_blocks_success_text = isset( $attributes['successText'] )
	? sanitize_text_field(
		$attributes['successText']
	)
	: __(
		'Thanks! Your comment has been submitted.',
		'uplifters-site-builder-blocks'
	);

$uplifters_site_builder_blocks_error_text = isset( $attributes['errorText'] )
	? sanitize_text_field(
		$attributes['errorText']
	)
	: __(
		'Could not submit comment. Please try again.',
		'uplifters-site-builder-blocks'
	);

$uplifters_site_builder_blocks_require_name_email =
	! array_key_exists(
		'requireNameEmail',
		$attributes
	) ||
	(bool) $attributes['requireNameEmail'];

/*
 * Responsive defaults.
 */
$uplifters_site_builder_blocks_device_defaults = array(
	'desktop' => array(
		'show_name_email'       => true,
		'button_bg_color'       => '#111827',
		'button_hover_bg_color' => '#0b1220',
		'button_text_color'     => '#ffffff',
		'button_radius'         => 12,
		'button_padding_x'      => 16,
		'button_padding_y'      => 10,
		'button_margin_top'     => 0,
		'font_family'           => 'inherit',
	),
	'tablet' => array(
		'show_name_email'       => true,
		'button_bg_color'       => '#111827',
		'button_hover_bg_color' => '#0b1220',
		'button_text_color'     => '#ffffff',
		'button_radius'         => 12,
		'button_padding_x'      => 15,
		'button_padding_y'      => 10,
		'button_margin_top'     => 0,
		'font_family'           => 'inherit',
	),
	'mobile' => array(
		'show_name_email'       => true,
		'button_bg_color'       => '#111827',
		'button_hover_bg_color' => '#0b1220',
		'button_text_color'     => '#ffffff',
		'button_radius'         => 12,
		'button_padding_x'      => 14,
		'button_padding_y'      => 9,
		'button_margin_top'     => 0,
		'font_family'           => 'inherit',
	),
);

$uplifters_site_builder_blocks_devices = array();

foreach (
	$uplifters_site_builder_blocks_device_defaults as
	$uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_defaults
) {
	$uplifters_site_builder_blocks_devices[ $uplifters_site_builder_blocks_device ] = array(
		'show_name_email' => (bool)
			$uplifters_site_builder_blocks_comments_responsive_value(
				$attributes,
				'showNameEmail',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_name_email']
			),

		'button_bg_color' =>
			$uplifters_site_builder_blocks_comments_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonBgColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_bg_color'
					]
				),
				$uplifters_site_builder_blocks_defaults['button_bg_color']
			),

		'button_hover_bg_color' =>
			$uplifters_site_builder_blocks_comments_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonHoverBgColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_hover_bg_color'
					]
				),
				$uplifters_site_builder_blocks_defaults[
					'button_hover_bg_color'
				]
			),

		'button_text_color' =>
			$uplifters_site_builder_blocks_comments_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonTextColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_text_color'
					]
				),
				$uplifters_site_builder_blocks_defaults['button_text_color']
			),

		'button_radius' =>
			$uplifters_site_builder_blocks_comments_clamp(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonRadius',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['button_radius']
				),
				0,
				40,
				$uplifters_site_builder_blocks_defaults['button_radius']
			),

		'button_padding_x' =>
			$uplifters_site_builder_blocks_comments_clamp(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonPaddingX',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_padding_x'
					]
				),
				0,
				40,
				$uplifters_site_builder_blocks_defaults['button_padding_x']
			),

		'button_padding_y' =>
			$uplifters_site_builder_blocks_comments_clamp(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonPaddingY',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_padding_y'
					]
				),
				0,
				30,
				$uplifters_site_builder_blocks_defaults['button_padding_y']
			),

		'button_margin_top' =>
			$uplifters_site_builder_blocks_comments_clamp(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'buttonMarginTop',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults[
						'button_margin_top'
					]
				),
				0,
				40,
				$uplifters_site_builder_blocks_defaults['button_margin_top']
			),

		'font_family' =>
			\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'fontFamily',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['font_family']
				)
			) ?: 'inherit',
	);
}

/*
 * Detect current post or page.
 */
$uplifters_site_builder_blocks_post_id = 0;

if (
	isset( $block ) &&
	$block instanceof WP_Block &&
	! empty( $block->context['postId'] )
) {
	$uplifters_site_builder_blocks_post_id = absint(
		$block->context['postId']
	);
}

if ( ! $uplifters_site_builder_blocks_post_id ) {
	$uplifters_site_builder_blocks_post_id = absint(
		get_the_ID()
	);
}

if ( ! $uplifters_site_builder_blocks_post_id ) {
	$uplifters_site_builder_blocks_post_id = absint(
		get_queried_object_id()
	);
}

/*
 * Auto placement guard. The block may be hooked into templates,
 * but the frontend output should exist only on single post views.
 */
if ( ! is_singular() ) {
	return '';
}

if ( ! $uplifters_site_builder_blocks_post_id || ! in_array( get_post_type( $uplifters_site_builder_blocks_post_id ), array( 'post', 'page' ), true ) ) {
	return '';
}

$uplifters_site_builder_blocks_comments_available =
	$uplifters_site_builder_blocks_post_id &&
	comments_open( $uplifters_site_builder_blocks_post_id );

/*
 * Unique IDs.
 */
$uplifters_site_builder_blocks_instance_id =
	wp_unique_id(
		'uplifters-site-builder-blocks-posts-comment-form-'
	);

$uplifters_site_builder_blocks_form_id =
	$uplifters_site_builder_blocks_instance_id . '-form';

$uplifters_site_builder_blocks_message_id =
	$uplifters_site_builder_blocks_instance_id . '-message';

$uplifters_site_builder_blocks_preview_id =
	$uplifters_site_builder_blocks_instance_id . '-preview';

$uplifters_site_builder_blocks_preview_item_id =
	$uplifters_site_builder_blocks_instance_id . '-preview-item';

$uplifters_site_builder_blocks_preview_note_id =
	$uplifters_site_builder_blocks_instance_id . '-preview-note';

$uplifters_site_builder_blocks_button_id =
	$uplifters_site_builder_blocks_instance_id . '-submit';

$uplifters_site_builder_blocks_hint_id =
	$uplifters_site_builder_blocks_instance_id . '-hint';

$uplifters_site_builder_blocks_name_email_id =
	$uplifters_site_builder_blocks_instance_id . '-name-email';

/*
 * Scoped responsive CSS.
 */
$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_instance_id;

$uplifters_site_builder_blocks_responsive_css =
	$uplifters_site_builder_blocks_comments_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['desktop']
	);

$uplifters_site_builder_blocks_responsive_css .=
	'@media(max-width:1024px){' .
	$uplifters_site_builder_blocks_comments_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['tablet']
	) .
	'}';

$uplifters_site_builder_blocks_responsive_css .=
	'@media(max-width:767px){' .
	$uplifters_site_builder_blocks_comments_device_css(
		$uplifters_site_builder_blocks_selector,
		$uplifters_site_builder_blocks_devices['mobile']
	) .
	'}';

/*
 * Frontend REST configuration.
 */
$uplifters_site_builder_blocks_frontend_config = array(
	'instanceId'       => $uplifters_site_builder_blocks_instance_id,
	'formId'           => $uplifters_site_builder_blocks_form_id,
	'messageId'        => $uplifters_site_builder_blocks_message_id,
	'previewId'        => $uplifters_site_builder_blocks_preview_id,
	'previewItemId'    => $uplifters_site_builder_blocks_preview_item_id,
	'previewNoteId'    => $uplifters_site_builder_blocks_preview_note_id,
	'buttonId'         => $uplifters_site_builder_blocks_button_id,
	'hintId'           => $uplifters_site_builder_blocks_hint_id,
	'nameEmailId'      => $uplifters_site_builder_blocks_name_email_id,
	'postId'           => $uplifters_site_builder_blocks_post_id,
	'restUrl'          => esc_url_raw(
		rest_url( 'wp/v2/comments' )
	),
	'nonce'            => is_user_logged_in()
		? wp_create_nonce( 'wp_rest' )
		: '',
	'requireNameEmail' => $uplifters_site_builder_blocks_require_name_email,
	'successText'      => $uplifters_site_builder_blocks_success_text,
	'errorText'        => $uplifters_site_builder_blocks_error_text,
	'strings'          => array(
		'writeComment' =>
			__(
				'Please write a comment.',
				'uplifters-site-builder-blocks'
			),
		'enterName' =>
			__(
				'Please enter your name.',
				'uplifters-site-builder-blocks'
			),
		'enterEmail' =>
			__(
				'Please enter a valid email.',
				'uplifters-site-builder-blocks'
			),
		'sending' =>
			__( 'Sending…', 'uplifters-site-builder-blocks' ),
		'approved' =>
			__(
				'Saved and approved. It should appear publicly.',
				'uplifters-site-builder-blocks'
			),
		'pending' =>
			__(
				'Saved but pending moderation.',
				'uplifters-site-builder-blocks'
			),
		'saved' =>
			__(
				'Saved. Visibility depends on moderation settings.',
				'uplifters-site-builder-blocks'
			),
	),
);

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'                                              => $uplifters_site_builder_blocks_instance_id,
			'class'                                           => 'up2-posts-comment-form-block',
			'data-uplifters-site-builder-blocks-comments-config' => wp_json_encode(
				$uplifters_site_builder_blocks_frontend_config,
				JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
			),
		)
	);
?>

<div
	<?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
	?>
>
	<?php ob_start(); ?>
		<?php
		echo wp_kses( wp_strip_all_tags( $uplifters_site_builder_blocks_responsive_css ), array() );
		?>

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?>,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> * {
			box-sizing: border-box;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-card {
			border: 1px solid #e5e7eb;
			background: #ffffff;
			border-radius: 16px;
			padding: 20px;
			box-shadow:
				0 1px 2px rgba(0, 0, 0, 0.04);
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-title {
			margin: 0 0 14px;
			color: #111827;
			font-size: 18px;
			font-weight: 700;
			line-height: 1.2;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-grid {
			display: grid;
			gap: 16px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-row-two {
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-label {
			display: grid;
			gap: 8px;
			color: #374151;
			font-size: 14px;
			line-height: 1.4;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-label span {
			color: #111827;
			font-weight: 600;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-input,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-textarea {
			width: 100%;
			border: 1px solid #e5e7eb;
			border-radius: 12px;
			background: #ffffff;
			color: #111827;
			font-size: 14px;
			outline: none;
			transition:
				border-color 0.12s ease,
				box-shadow 0.12s ease;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-input:focus,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-textarea:focus {
			border-color: #9ca3af;
			box-shadow:
				0 0 0 3px rgba(156, 163, 175, 0.18);
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-input {
			height: 44px;
			padding: 0 12px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-textarea {
			min-height: 140px;
			padding: 12px;
			resize: vertical;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-comment-wrap {
			display: grid;
			gap: 16px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-comment-wrap.has-top-space {
			padding-top: 6px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-actions {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-submit {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border: none;
			cursor: pointer;
			font-size: 14px;
			font-weight: 700;
			line-height: 1.2;
			text-decoration: none;
			transition:
				background-color 0.12s ease,
				filter 0.12s ease,
				transform 0.06s ease;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-submit:active {
			transform: translateY(1px);
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-submit:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-message {
			display: none;
			margin-bottom: 14px;
			border: 1px solid #e5e7eb;
			border-radius: 12px;
			padding: 10px 12px;
			font-size: 14px;
			line-height: 1.5;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-message.is-visible {
			display: block;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-message.is-success {
			border-color: #a7f3d0;
			background: #ecfdf5;
			color: #065f46;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-message.is-error {
			border-color: #fecaca;
			background: #fef2f2;
			color: #991b1b;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-hint {
			color: #6b7280;
			font-size: 12px;
			line-height: 1.5;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-preview {
			display: none;
			margin-top: 16px;
			border: 1px solid #e5e7eb;
			background: #f9fafb;
			border-radius: 16px;
			padding: 12px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-preview.is-visible {
			display: block;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-preview-title {
			margin-bottom: 8px;
			color: #374151;
			font-size: 12px;
			font-weight: 700;
			line-height: 1.4;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-preview-item {
			color: #111827;
			font-size: 14px;
			line-height: 1.5;
			white-space: pre-wrap;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-preview-note {
			margin-top: 8px;
			color: #6b7280;
			font-size: 12px;
			line-height: 1.5;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-meta {
			margin-top: 12px;
			color: #9ca3af;
			font-size: 12px;
			line-height: 1.5;
		}

		@media (max-width: 767px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-row-two {
				grid-template-columns: 1fr;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-actions {
				flex-direction: column;
				align-items: flex-start;
				justify-content: flex-start;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-input,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-textarea,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-submit {
				transition: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .up2-submit:active {
				transform: none;
			}
		}
	<?php
	$uplifters_site_builder_blocks_css = ob_get_clean();
	\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
	?>

	<div class="up2-card">
		<h3 class="up2-title">
			<?php echo esc_html( $uplifters_site_builder_blocks_title_text ); ?>
		</h3>

		<div
			id="<?php echo esc_attr( $uplifters_site_builder_blocks_message_id ); ?>"
			class="up2-message"
			role="status"
			aria-live="polite"
		></div>

		<?php if ( $uplifters_site_builder_blocks_comments_available ) : ?>
			<form
				id="<?php echo esc_attr( $uplifters_site_builder_blocks_form_id ); ?>"
				class="up2-grid"
				method="post"
			>
				<div
					id="<?php echo esc_attr( $uplifters_site_builder_blocks_name_email_id ); ?>"
					class="up2-row-two up2-name-email-fields"
				>
					<label class="up2-label">
						<span>
							<?php echo esc_html( $uplifters_site_builder_blocks_name_label ); ?>
						</span>

						<input
							name="author_name"
							class="up2-input"
							type="text"
							autocomplete="name"
						/>
					</label>

					<label class="up2-label">
						<span>
							<?php echo esc_html( $uplifters_site_builder_blocks_email_label ); ?>
						</span>

						<input
							name="author_email"
							class="up2-input"
							type="email"
							autocomplete="email"
						/>
					</label>
				</div>

				<div class="up2-comment-wrap has-top-space">
					<label class="up2-label">
						<span>
							<?php echo esc_html( $uplifters_site_builder_blocks_comment_label ); ?>
						</span>

						<textarea
							name="content"
							class="up2-textarea"
							placeholder="<?php echo esc_attr( $uplifters_site_builder_blocks_placeholder ); ?>"
							required
						></textarea>
					</label>

					<div class="up2-actions">
						<button
							id="<?php echo esc_attr( $uplifters_site_builder_blocks_button_id ); ?>"
							type="submit"
							class="up2-submit"
						>
							<?php echo esc_html( $uplifters_site_builder_blocks_button_text ); ?>
						</button>

						<span
							id="<?php echo esc_attr( $uplifters_site_builder_blocks_hint_id ); ?>"
							class="up2-hint"
						></span>
					</div>

					<div
						id="<?php echo esc_attr( $uplifters_site_builder_blocks_preview_id ); ?>"
						class="up2-preview"
					>
						<div class="up2-preview-title">
							<?php
							echo esc_html__(
								'Just posted (local preview)',
								'uplifters-site-builder-blocks'
							);
							?>
						</div>

						<div
							id="<?php echo esc_attr( $uplifters_site_builder_blocks_preview_item_id ); ?>"
							class="up2-preview-item"
						></div>

						<div
							id="<?php echo esc_attr( $uplifters_site_builder_blocks_preview_note_id ); ?>"
							class="up2-preview-note"
						></div>
					</div>

					<div class="up2-meta">
						<?php
						echo esc_html__(
							'Post ID',
							'uplifters-site-builder-blocks'
						);
						?>:
						<?php echo esc_html( $uplifters_site_builder_blocks_post_id ); ?>
					</div>
				</div>
			</form>
		<?php else : ?>
			<div class="up2-message is-visible is-error">
				<?php
				if ( ! $uplifters_site_builder_blocks_post_id ) {
					echo esc_html__(
						'Could not detect the post or page ID. Use this block on a single post or page view.',
						'uplifters-site-builder-blocks'
					);
				} else {
					echo esc_html__(
						'Comments are closed for this post.',
						'uplifters-site-builder-blocks'
					);
				}
				?>
			</div>
		<?php endif; ?>
	</div>

</div>
