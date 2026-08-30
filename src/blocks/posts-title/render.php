<?php
/**
 * Server-side render callback for UPLIFTERS_SITE_BUILDER_BLOCKS PostsTitle block.
 *
 * This block is only used as a style controller.
 * It saves selected title style into the selected post meta from edit.js.
 *
 * Important:
 * - Do not render selected post title here.
 * - Do not render loading UI here.
 * - Do not render wrapper markup here.
 * - Keep frontend completely blank wherever this block is inserted.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return '';