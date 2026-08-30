<?php
/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS Autoloader.
 *
 * Loads plugin classes from lowercase/kebab-case plugin paths.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\CoreInit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class PluginAutoloader {

	/**
	 * Register the plugin autoloader.
	 */
	public static function register(): void {
		spl_autoload_register( array( __CLASS__, 'autoload' ) );
	}

	/**
	 * Autoload UPLIFTERS_SITE_BUILDER_BLOCKS plugin classes.
	 *
	 * @param string $class Fully-qualified class name.
	 */
	private static function autoload( string $class ): void {
		$prefix = 'UpliftersSiteBuilderBlocks\\';

		if ( 0 !== strpos( $class, $prefix ) ) {
			return;
		}

		$relative_class = substr( $class, strlen( $prefix ) );
		$parts          = explode( '\\', $relative_class );
		$namespace      = array_shift( $parts );
		$directories    = array(
			'DashboardSidebar' => 'dashboard-sidebar',
			'AssetsEnqueue'    => 'assets-enqueue',
			'BlocksRoute'      => 'blocks-route',
			'CoreInit'         => 'core-init',
			'EditorInject'     => 'editor-inject',
			'PostsEnhance'     => 'posts-enhance',
			'ResponsiveGlobal' => 'responsive-global',
			'SecurityLayer' => 'security-layer',
		);

		if ( ! isset( $directories[ $namespace ] ) || empty( $parts ) ) {
			return;
		}

		$file = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'includes' . DIRECTORY_SEPARATOR
			. $directories[ $namespace ] . DIRECTORY_SEPARATOR
			. self::parts_to_path( $parts );

		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}

	private static function parts_to_path( array $parts ): string {
		$last = array_pop( $parts );
		$directories = array_map( array( __CLASS__, 'class_part_to_slug' ), $parts );

		$directories[] = self::class_part_to_file( $last );

		return implode( DIRECTORY_SEPARATOR, $directories );
	}

	private static function class_part_to_file( string $part ): string {
		return self::class_part_to_slug( $part ) . '.php';
	}

	private static function class_part_to_slug( string $part ): string {
		$part = preg_replace( '/(?<!^)[A-Z]/', '-$0', $part );

		return strtolower( $part );
	}
}
