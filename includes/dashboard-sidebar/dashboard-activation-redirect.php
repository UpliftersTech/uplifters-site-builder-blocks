<?php
namespace UpliftersSiteBuilderBlocks\DashboardSidebar;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class DashboardActivationRedirect {

	/**
	 * Option key for one-time redirect.
	 */
	private const OPTION_KEY = 'uplifters_site_builder_blocks_do_activation_redirect';

	/**
	 * Transient key prefix recording that this plugin's most recent
	 * activation happened as part of a WordPress core bulk-activate action,
	 * so maybe_redirect() can skip its own redirect without ever reading the
	 * activate-multi query flag WordPress core adds on its own redirect.
	 * Set only in capture_plugin_activation(), once the current request's
	 * own nonce has verified against core's real 'bulk-plugins' action.
	 */
	private const BULK_ACTIVATION_TRANSIENT_PREFIX = 'uplifters_site_builder_blocks_bulk_activation_';

	/**
	 * How long the bulk-activation flag stays set: long enough to cover a
	 * user reading WordPress's "Plugins activated" summary page, short
	 * enough that it can't linger as stale state.
	 */
	private const BULK_ACTIVATION_TRANSIENT_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * Mark redirect only when this plugin is activated.
	 *
	 * @param string $plugin       Activated plugin basename.
	 * @param bool   $network_wide Whether plugin is activated network-wide.
	 */
	public static function capture_plugin_activation(string $plugin, bool $network_wide): void {
		if ($network_wide) {
			return;
		}

		if (! defined('UPLIFTERS_SITE_BUILDER_BLOCKS_DIR')) {
			return;
		}

		$main_plugin = plugin_basename(UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'uplifters-site-builder-blocks.php');

		if ($plugin !== $main_plugin) {
			return;
		}

		// WordPress core has already verified this exact request against its
		// own 'bulk-plugins' nonce before firing activated_plugin for a bulk
		// action; re-checking that same, currently-live nonce here confirms
		// bulk context for real, not by inference.
		if (\UpliftersSiteBuilderBlocks\SecurityLayer\SecurityNonce::current_request_matches('bulk-plugins')) {
			set_transient(
				self::BULK_ACTIVATION_TRANSIENT_PREFIX . get_current_user_id(),
				1,
				self::BULK_ACTIVATION_TRANSIENT_TTL
			);
		}

		self::mark();
	}

	/**
	 * Set redirect flag.
	 */
	public static function mark(): void {
		update_option(self::OPTION_KEY, 1);
	}

	/**
	 * Maybe redirect to the Uplifters Website Builder dashboard after activation.
	 */
	public static function maybe_redirect(): void {
		if (! is_admin()) {
			return;
		}

		if (! current_user_can('manage_options')) {
			return;
		}

		if (
			wp_doing_ajax()
			|| (defined('REST_REQUEST') && REST_REQUEST)
			|| (defined('DOING_CRON') && DOING_CRON)
			|| is_network_admin()
			// Set only in capture_plugin_activation(), after that request's
			// own nonce verified against WordPress core's real bulk-plugins
			// action - not a read of the activate-multi query flag.
			|| get_transient(self::BULK_ACTIVATION_TRANSIENT_PREFIX . get_current_user_id())
		) {
			return;
		}

		$should_redirect = (int) get_option(self::OPTION_KEY, 0);

		if (1 !== $should_redirect) {
			return;
		}

		delete_option(self::OPTION_KEY);

		wp_safe_redirect(admin_url('admin.php?page=uplifters-site-builder-blocks'));
		exit;
	}
}
