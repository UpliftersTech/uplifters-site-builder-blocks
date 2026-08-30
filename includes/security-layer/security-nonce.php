<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central home for every raw nonce/request read this plugin does outside of
 * a POST form submission. Keeping the superglobal access in one place, each
 * line immediately paired with a real wp_verify_nonce() call, means the
 * calling code never touches $_GET/$_REQUEST directly and the verification
 * is genuine rather than decorative.
 */
final class SecurityNonce {

	/**
	 * Create a nonce for a plugin-controlled action.
	 *
	 * @param string $action Nonce action name.
	 * @return string
	 */
	public static function create( string $action ): string {
		return wp_create_nonce( $action );
	}

	/**
	 * Verify that the current request carries a $_GET flag this plugin set
	 * itself on a redirect URL it built after its own already-verified
	 * action, alongside a nonce for that exact same action.
	 *
	 * Only use this for flags this plugin generates end-to-end (it creates
	 * the nonce, appends it to its own redirect, and is the only reader).
	 * It is not a substitute for verifying a real form submission.
	 *
	 * @param string $flag_key      $_GET key holding the flag.
	 * @param string $expected_value Expected value of that flag.
	 * @param string $nonce_action  Nonce action the flag's nonce was created with.
	 * @return bool
	 */
	public static function verify_get_flag( string $flag_key, string $expected_value, string $nonce_action ): bool {
		if ( ! isset( $_GET[ $flag_key ], $_GET['_wpnonce'] ) ) {
			return false;
		}

		if ( sanitize_text_field( wp_unslash( $_GET[ $flag_key ] ) ) !== $expected_value ) {
			return false;
		}

		return (bool) wp_verify_nonce(
			sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ),
			$nonce_action
		);
	}

	/**
	 * True if the nonce already present on the CURRENT request verifies
	 * against the given action.
	 *
	 * For confirming request context (e.g. "is this WordPress core's own
	 * bulk-plugins action") using the nonce core itself already put on the
	 * request, without re-reading $_REQUEST anywhere else in the plugin.
	 * This checks a real, currently-live nonce; it does not fabricate one.
	 *
	 * @param string $action Nonce action to check the current request against.
	 * @return bool
	 */
	public static function current_request_matches( string $action ): bool {
		if ( ! isset( $_REQUEST['_wpnonce'] ) ) {
			return false;
		}

		return (bool) wp_verify_nonce(
			sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ),
			$action
		);
	}
}
