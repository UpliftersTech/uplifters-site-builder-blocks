<?php
/**
 * Server-side rendering for the PostsCommentList block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved content.
 * @var WP_Block $block      Current block instance.
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clamp an integer.
 *
 * @param mixed $value    Value.
 * @param int   $minimum  Minimum.
 * @param int   $maximum  Maximum.
 * @param int   $fallback Fallback.
 *
 * @return int
 */
$uplifters_site_builder_blocks_comments_clamp_integer = static function (
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
 * Read a responsive attribute.
 *
 * Older scalar attribute values remain supported.
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
 * Return a safe CSS color.
 *
 * @param mixed  $value    Color value.
 * @param string $fallback Fallback.
 *
 * @return string
 */
$uplifters_site_builder_blocks_comments_sanitize_color = static function (
	$value,
	string $fallback
): string {
	if (
		! is_string( $value ) ||
		'' === trim( $value )
	) {
		return $fallback;
	}

	$value = wp_strip_all_tags( $value );

	$value = str_replace(
		array(
			'"',
			"'",
			'<',
			'>',
			';',
			'{',
			'}',
		),
		'',
		$value
	);

	return '' !== trim( $value )
		? trim( $value )
		: $fallback;
};

/*
 * Global settings.
 */
$uplifters_site_builder_blocks_per_page = $uplifters_site_builder_blocks_comments_clamp_integer(
	$attributes['perPage'] ?? 10,
	1,
	100,
	10
);

$uplifters_site_builder_blocks_order = (
	isset( $attributes['order'] ) &&
	'desc' === strtolower(
		(string) $attributes['order']
	)
)
	? 'DESC'
	: 'ASC';

$uplifters_site_builder_blocks_reply_text = isset( $attributes['replyText'] )
	? sanitize_text_field(
		(string) $attributes['replyText']
	)
	: __( 'Reply', 'uplifters-site-builder-blocks' );

if ( '' === $uplifters_site_builder_blocks_reply_text ) {
	$uplifters_site_builder_blocks_reply_text = __( 'Reply', 'uplifters-site-builder-blocks' );
}

$uplifters_site_builder_blocks_empty_text = isset( $attributes['emptyText'] )
	? sanitize_text_field(
		(string) $attributes['emptyText']
	)
	: __( 'No comments yet.', 'uplifters-site-builder-blocks' );

/*
 * Responsive defaults.
 */
$uplifters_site_builder_blocks_device_defaults = array(
	'desktop' => array(
		'show_avatars'    => true,
		'avatar_size'     => 44,
		'show_date'       => true,
		'date_font_size'  => 12,
		'author_color'    => '#111827',
		'meta_color'      => '#6b7280',
		'content_color'   => '#374151',
		'bubble_bg'       => '#ffffff',
		'bubble_border'   => '#e5e7eb',
		'threaded'        => true,
		'max_depth'       => 3,
		'show_reply_link' => true,
		'indent_size'     => 20,
		'font_family'     => 'inherit',
	),
	'tablet' => array(
		'show_avatars'    => true,
		'avatar_size'     => 40,
		'show_date'       => true,
		'date_font_size'  => 12,
		'author_color'    => '#111827',
		'meta_color'      => '#6b7280',
		'content_color'   => '#374151',
		'bubble_bg'       => '#ffffff',
		'bubble_border'   => '#e5e7eb',
		'threaded'        => true,
		'max_depth'       => 2,
		'show_reply_link' => true,
		'indent_size'     => 16,
		'font_family'     => 'inherit',
	),
	'mobile' => array(
		'show_avatars'    => true,
		'avatar_size'     => 36,
		'show_date'       => true,
		'date_font_size'  => 11,
		'author_color'    => '#111827',
		'meta_color'      => '#6b7280',
		'content_color'   => '#374151',
		'bubble_bg'       => '#ffffff',
		'bubble_border'   => '#e5e7eb',
		'threaded'        => true,
		'max_depth'       => 1,
		'show_reply_link' => true,
		'indent_size'     => 12,
		'font_family'     => 'inherit',
	),
);

$uplifters_site_builder_blocks_devices = array();

foreach (
	$uplifters_site_builder_blocks_device_defaults as
	$uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_defaults
) {
	$uplifters_site_builder_blocks_devices[ $uplifters_site_builder_blocks_device ] = array(
		'show_avatars' => (bool)
			$uplifters_site_builder_blocks_comments_responsive_value(
				$attributes,
				'showAvatars',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_avatars']
			),

		'avatar_size' =>
			$uplifters_site_builder_blocks_comments_clamp_integer(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'avatarSize',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['avatar_size']
				),
				24,
				96,
				$uplifters_site_builder_blocks_defaults['avatar_size']
			),

		'show_date' => (bool)
			$uplifters_site_builder_blocks_comments_responsive_value(
				$attributes,
				'showDate',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_date']
			),

		'date_font_size' =>
			$uplifters_site_builder_blocks_comments_clamp_integer(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'dateFontSize',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['date_font_size']
				),
				10,
				18,
				$uplifters_site_builder_blocks_defaults['date_font_size']
			),

		'author_color' =>
			$uplifters_site_builder_blocks_comments_sanitize_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'authorColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['author_color']
				),
				$uplifters_site_builder_blocks_defaults['author_color']
			),

		'meta_color' =>
			$uplifters_site_builder_blocks_comments_sanitize_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'metaColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['meta_color']
				),
				$uplifters_site_builder_blocks_defaults['meta_color']
			),

		'content_color' =>
			$uplifters_site_builder_blocks_comments_sanitize_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'contentColor',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['content_color']
				),
				$uplifters_site_builder_blocks_defaults['content_color']
			),

		'bubble_bg' =>
			$uplifters_site_builder_blocks_comments_sanitize_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'bubbleBg',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['bubble_bg']
				),
				$uplifters_site_builder_blocks_defaults['bubble_bg']
			),

		'bubble_border' =>
			$uplifters_site_builder_blocks_comments_sanitize_color(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'bubbleBorder',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['bubble_border']
				),
				$uplifters_site_builder_blocks_defaults['bubble_border']
			),

		'threaded' => (bool)
			$uplifters_site_builder_blocks_comments_responsive_value(
				$attributes,
				'threaded',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['threaded']
			),

		'max_depth' =>
			$uplifters_site_builder_blocks_comments_clamp_integer(
				$uplifters_site_builder_blocks_comments_responsive_value(
					$attributes,
					'maxDepth',
					$uplifters_site_builder_blocks_device,
					$uplifters_site_builder_blocks_defaults['max_depth']
				),
				1,
				10,
				$uplifters_site_builder_blocks_defaults['max_depth']
			),

		'show_reply_link' => (bool)
			$uplifters_site_builder_blocks_comments_responsive_value(
				$attributes,
				'showReplyLink',
				$uplifters_site_builder_blocks_device,
				$uplifters_site_builder_blocks_defaults['show_reply_link']
			),

		'indent_size' =>
			$uplifters_site_builder_blocks_defaults['indent_size'],

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
 * Detect current post.
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
 * A comment list only makes sense on a real single post or page view.
 */
if (
	! is_singular() ||
	! in_array( get_post_type( $uplifters_site_builder_blocks_post_id ), array( 'post', 'page' ), true )
) {
	return;
}

/*
 * Query comments.
 */
$uplifters_site_builder_blocks_comments = array();

if ( $uplifters_site_builder_blocks_post_id ) {
	$uplifters_site_builder_blocks_comments = get_comments(
		array(
			'post_id' => $uplifters_site_builder_blocks_post_id,
			'status'  => 'approve',
			'type'    => 'comment',
			'number'  => $uplifters_site_builder_blocks_per_page,
			'orderby' => 'comment_date_gmt',
			'order'   => $uplifters_site_builder_blocks_order,
		)
	);
}

if ( ! is_array( $uplifters_site_builder_blocks_comments ) ) {
	$uplifters_site_builder_blocks_comments = array();
}

/*
 * Build comment tree.
 */
$uplifters_site_builder_blocks_comment_nodes = array();

foreach ( $uplifters_site_builder_blocks_comments as $uplifters_site_builder_blocks_comment ) {
	if ( ! $uplifters_site_builder_blocks_comment instanceof WP_Comment ) {
		continue;
	}

	$uplifters_site_builder_blocks_comment_nodes[
		(int) $uplifters_site_builder_blocks_comment->comment_ID
	] = array(
		'comment'  => $uplifters_site_builder_blocks_comment,
		'children' => array(),
	);
}

$uplifters_site_builder_blocks_root_nodes = array();

foreach (
	array_keys( $uplifters_site_builder_blocks_comment_nodes ) as
	$uplifters_site_builder_blocks_comment_id
) {
	$uplifters_site_builder_blocks_parent_id = (int)
		$uplifters_site_builder_blocks_comment_nodes[
			$uplifters_site_builder_blocks_comment_id
		]['comment']->comment_parent;

	if (
		$uplifters_site_builder_blocks_parent_id > 0 &&
		isset(
			$uplifters_site_builder_blocks_comment_nodes[ $uplifters_site_builder_blocks_parent_id ]
		)
	) {
		$uplifters_site_builder_blocks_comment_nodes[
			$uplifters_site_builder_blocks_parent_id
		]['children'][] =
			&$uplifters_site_builder_blocks_comment_nodes[
				$uplifters_site_builder_blocks_comment_id
			];
	} else {
		$uplifters_site_builder_blocks_root_nodes[] =
			&$uplifters_site_builder_blocks_comment_nodes[
				$uplifters_site_builder_blocks_comment_id
			];
	}
}

/**
 * Flatten comments when threading is disabled.
 *
 * @param array $nodes Comment nodes.
 *
 * @return array
 */
$uplifters_site_builder_blocks_comments_flatten_nodes = static function (
	array $nodes
): array {
	$result = array();

	$walk = static function (
		array $items
	) use ( &$walk, &$result ) {
		foreach ( $items as $node ) {
			$result[] = array(
				'comment'  =>
					$node['comment'],
				'children' =>
					array(),
			);

			if (
				! empty(
					$node['children']
				) &&
				is_array(
					$node['children']
				)
			) {
				$walk(
					$node['children']
				);
			}
		}
	};

	$walk( $nodes );

	return $result;
};

/**
 * Render one comment and its children.
 *
 * @param array  $node       Comment node.
 * @param int    $depth      Current depth.
 * @param array  $settings   Device settings.
 * @param string $reply_text Reply label.
 *
 * @return string
 */
$uplifters_site_builder_blocks_comments_render_comment = null;

$uplifters_site_builder_blocks_comments_render_comment = static function (
	array $node,
	int $depth,
	array $settings,
	string $reply_text
) use (
	&$uplifters_site_builder_blocks_comments_render_comment
): string {
	$comment = $node['comment'] ?? null;

	if ( ! $comment instanceof WP_Comment ) {
		return '';
	}

	$depth = max(
		0,
		min( 10, $depth )
	);

	$indent_depth = min(
		$depth,
		$settings['max_depth']
	);

	$indent_pixels =
		$indent_depth *
		$settings['indent_size'];

	$author_name =
		get_comment_author( $comment );

	if ( '' === trim( $author_name ) ) {
		$author_name = __(
			'Anonymous',
			'uplifters-site-builder-blocks'
		);
	}

	// comment_text() is WordPress core's own template function for exactly
	// this: it fetches the comment text and runs it through core's
	// comment_text filter chain (formatting/embeds/shortcodes, including
	// whatever other plugins have hooked into it) before echoing it. Using
	// core's function here - instead of calling apply_filters( 'comment_text', ... )
	// ourselves - means this file never invokes that hook directly at all.
	ob_start();
	comment_text( $comment, array() );
	$comment_content = ob_get_clean();

	$comment_content =
		wp_kses_post(
			$comment_content
		);

	$comment_date = get_comment_date(
		get_option( 'date_format' ),
		$comment
	);

	$children =
		isset( $node['children'] ) &&
		is_array( $node['children'] )
			? $node['children']
			: array();

	$can_render_children =
		$settings['threaded'] &&
		$depth < $settings['max_depth'] &&
		! empty( $children );

	ob_start();
	?>
	<div
		class="uplifters-site-builder-blocks-posts-comment-list-comment-wrapper"
		style="<?php
		echo esc_attr(
			implode(
				'',
				array(
					'width:',
					$depth > 0
						? 'calc(100% - ' .
							$indent_pixels .
							'px);'
						: '100%;',
					'box-sizing:border-box;',
					$depth > 0
						? 'margin-left:' .
							$indent_pixels .
							'px;'
						: '',
				)
			)
		);
		?>"
	>
		<div class="uplifters-site-builder-blocks-posts-comment-list-comment-row">
			<?php if ( $settings['show_avatars'] ) : ?>
				<div
					class="uplifters-site-builder-blocks-posts-comment-list-comment-avatar"
					style="<?php
					echo esc_attr(
						implode(
							'',
							array(
								'width:' .
									$settings['avatar_size'] .
									'px;',
								'height:' .
									$settings['avatar_size'] .
									'px;',
								'border-color:' .
									$settings['bubble_border'] .
									';',
							)
						)
					);
					?>"
				>
					<?php
					echo get_avatar(
						$comment,
						$settings['avatar_size'],
						'',
						sprintf(
							/* translators: %s is the author name. */
							__(
								'Avatar of %s',
								'uplifters-site-builder-blocks'
							),
							$author_name
						),
						array(
							'class' =>
								'uplifters-site-builder-blocks-posts-comment-list-comment-avatar-image',
							'force_display' =>
								true,
						)
					);
					?>
				</div>
			<?php endif; ?>

			<div
				class="uplifters-site-builder-blocks-posts-comment-list-comment-bubble"
				style="<?php
				echo esc_attr(
					implode(
						'',
						array(
							'background:' .
								$settings['bubble_bg'] .
								';',
							'border-color:' .
								$settings['bubble_border'] .
								';',
						)
					)
				);
				?>"
			>
				<div class="uplifters-site-builder-blocks-posts-comment-list-comment-meta-row">
					<div
						class="uplifters-site-builder-blocks-posts-comment-list-comment-author"
						style="<?php
						echo esc_attr(
							'color:' .
							$settings['author_color'] .
							';'
						);
						?>"
					>
						<?php
						echo esc_html(
							$author_name
						);
						?>
					</div>

					<?php if ( $settings['show_date'] ) : ?>
						<div
							class="uplifters-site-builder-blocks-posts-comment-list-comment-date"
							style="<?php
							echo esc_attr(
								'color:' .
								$settings['meta_color'] .
								';font-size:' .
								$settings['date_font_size'] .
								'px;'
							);
							?>"
						>
							<?php
							echo esc_html(
								$comment_date
							);
							?>
						</div>
					<?php endif; ?>
				</div>

				<div
					class="uplifters-site-builder-blocks-posts-comment-list-comment-content"
					style="<?php
					echo esc_attr(
						'color:' .
						$settings['content_color'] .
						';'
					);
					?>"
				>
					<?php
					echo wp_kses_post( $comment_content );
					?>
				</div>

				<?php if ( $settings['show_reply_link'] ) : ?>
					<div class="uplifters-site-builder-blocks-posts-comment-list-comment-actions">
						<a
							class="uplifters-site-builder-blocks-posts-comment-list-comment-reply-link"
							href="<?php
							echo esc_url(
								get_comment_link(
									$comment
								)
							);
							?>"
						>
							<?php
							echo esc_html(
								$reply_text
							);
							?>
						</a>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<?php if ( $can_render_children ) : ?>
			<div class="uplifters-site-builder-blocks-posts-comment-list-comment-children">
				<?php
				foreach (
					$children as
					$child_node
				) {
					echo wp_kses_post(
						$uplifters_site_builder_blocks_comments_render_comment(
							$child_node,
							$depth + 1,
							$settings,
							$reply_text
						)
					);
				}
				?>
			</div>
		<?php endif; ?>
	</div>
	<?php

	return (string) ob_get_clean();
};

/*
 * Unique block instance.
 */
$uplifters_site_builder_blocks_instance_id = wp_unique_id(
	'uplifters-site-builder-blocks-posts-comment-list-view-'
);

$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_instance_id;

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'    => $uplifters_site_builder_blocks_instance_id,
			'class' =>
				'uplifters-site-builder-blocks-post-comments-block',
			'style' =>
				'width:100%;box-sizing:border-box;',
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
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?>,
		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> * {
			box-sizing: border-box;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device {
			display: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-desktop {
			display: block;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-list {
			display: flex;
			flex-direction: column;
			gap: 14px;
			width: 100%;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-row {
			display: flex;
			gap: 12px;
			align-items: flex-start;
			width: 100%;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-avatar {
			overflow: hidden;
			flex-shrink: 0;
			border: 1px solid;
			border-radius: 999px;
			background: #f3f4f6;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-avatar-image {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-bubble {
			flex: 1;
			min-width: 0;
			border: 1px solid;
			border-radius: 14px;
			padding: 12px;
			box-shadow:
				0 1px 2px rgba(0, 0, 0, 0.04);
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-meta-row {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			align-items: baseline;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-author {
			font-size: 14px;
			font-weight: 700;
			line-height: 1.2;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-date {
			line-height: 1.2;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-content {
			margin-top: 8px;
			font-size: 14px;
			line-height: 1.65;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-content > :first-child {
			margin-top: 0;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-content > :last-child {
			margin-bottom: 0;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-actions {
			display: flex;
			gap: 10px;
			margin-top: 10px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-reply-link {
			color: #2563eb;
			font-size: 13px;
			font-weight: 600;
			line-height: 1.3;
			text-decoration: none;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-children {
			display: flex;
			flex-direction: column;
			gap: 12px;
			width: 100%;
			margin-top: 12px;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-empty {
			margin: 0;
			padding: 18px 0;
			font-size: 14px;
			line-height: 1.5;
			text-align: center;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-desktop .uplifters-site-builder-blocks-posts-comment-list-empty {
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['meta_color'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-tablet .uplifters-site-builder-blocks-posts-comment-list-empty {
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['meta_color'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-mobile .uplifters-site-builder-blocks-posts-comment-list-empty {
			color: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['meta_color'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-desktop {
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['desktop']['font_family'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-tablet {
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['tablet']['font_family'] ); ?>;
		}

		<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-mobile {
			font-family: <?php echo esc_html( $uplifters_site_builder_blocks_devices['mobile']['font_family'] ); ?>;
		}

		@media (max-width: 1024px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-mobile {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-tablet {
				display: block;
			}
		}

		@media (max-width: 767px) {
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-desktop,
			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-tablet {
				display: none;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-device-mobile {
				display: block;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-row {
				gap: 9px;
			}

			<?php echo esc_html( $uplifters_site_builder_blocks_selector ); ?> .uplifters-site-builder-blocks-posts-comment-list-comment-bubble {
				padding: 10px;
			}
		}
	<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

	<?php foreach ( $uplifters_site_builder_blocks_devices as $uplifters_site_builder_blocks_device => $uplifters_site_builder_blocks_settings ) : ?>
		<div
			class="<?php
			echo esc_attr(
				'uplifters-site-builder-blocks-posts-comment-list-device uplifters-site-builder-blocks-posts-comment-list-device-' .
				$uplifters_site_builder_blocks_device
			);
			?>"
		>
			<?php
			$uplifters_site_builder_blocks_device_root_nodes =
				$uplifters_site_builder_blocks_settings['threaded']
					? $uplifters_site_builder_blocks_root_nodes
					: $uplifters_site_builder_blocks_comments_flatten_nodes(
						$uplifters_site_builder_blocks_root_nodes
					);
			?>

			<?php if ( empty( $uplifters_site_builder_blocks_device_root_nodes ) ) : ?>
				<p class="uplifters-site-builder-blocks-posts-comment-list-empty">
					<?php
					echo esc_html(
						$uplifters_site_builder_blocks_empty_text
					);
					?>
				</p>
			<?php else : ?>
				<div class="uplifters-site-builder-blocks-posts-comment-list-list">
					<?php
					foreach (
						$uplifters_site_builder_blocks_device_root_nodes as
						$uplifters_site_builder_blocks_root_node
					) {
						echo wp_kses_post(
							$uplifters_site_builder_blocks_comments_render_comment(
								$uplifters_site_builder_blocks_root_node,
								0,
								$uplifters_site_builder_blocks_settings,
								$uplifters_site_builder_blocks_reply_text
							)
						);
					}
					?>
				</div>
			<?php endif; ?>
		</div>
	<?php endforeach; ?>
</div>
