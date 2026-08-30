<?php
/**
 * Uninstall handler for Uplifters Website Builder.
 *
 * Removes every option and post meta key this plugin writes. Runs only when
 * WordPress deletes the plugin (not on mere deactivation).
 *
 * @package UpliftersSiteBuilderBlocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_uninstall_cleanup' ) ) {
	function uplifters_site_builder_blocks_uninstall_cleanup() {
		$options = array(
			'uplifters_site_builder_blocks_login_custom_enable',
			'uplifters_site_builder_blocks_login_bg_id',
			'uplifters_site_builder_blocks_login_logo_id',
			'uplifters_site_builder_blocks_do_activation_redirect',
		);

		foreach ( $options as $option ) {
			delete_option( $option );
		}

		$post_meta_keys = array(
			'uplifters_site_builder_blocks_post_title_style',
			'uplifters_site_builder_blocks_post_featured_image_style',
		);

		foreach ( $post_meta_keys as $meta_key ) {
			delete_post_meta_by_key( $meta_key );
		}
	}
}

if ( is_multisite() ) {
	$uplifters_site_builder_blocks_site_ids = get_sites( array( 'fields' => 'ids' ) );

	foreach ( $uplifters_site_builder_blocks_site_ids as $uplifters_site_builder_blocks_site_id ) {
		switch_to_blog( $uplifters_site_builder_blocks_site_id );
		uplifters_site_builder_blocks_uninstall_cleanup();
		restore_current_blog();
	}
} else {
	uplifters_site_builder_blocks_uninstall_cleanup();
}
