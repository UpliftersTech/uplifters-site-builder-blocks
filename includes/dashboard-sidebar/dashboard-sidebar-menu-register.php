<?php
namespace UpliftersSiteBuilderBlocks\DashboardSidebar;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/login-page-customization.php';

final class DashboardSidebarMenuRegister {
	private const MENU_SLUG = 'uplifters-site-builder-blocks';

	/* ---------------------------------------------------------------- */
	/* Naming                                                            */
	/* ---------------------------------------------------------------- */

	/*
	 * Three separate names, on purpose.
	 *
	 * MENU_LABEL   Text beside the sidebar icon. Change freely; nothing else
	 *              reads it.
	 * PAGE_TITLE   Browser title and screen heading for the dashboard.
	 * PRODUCT_NAME Name the React dashboard prints inside its own UI.
	 *
	 * menu_label() is never a source for the other two, so renaming the
	 * sidebar entry leaves the dashboard page untouched.
	 */

	private static function menu_label(): string {
		return __('Uplifters Builder', 'uplifters-site-builder-blocks');
	}

	private static function page_title(): string {
		return __('Uplifters Website Builder', 'uplifters-site-builder-blocks');
	}

	private static function product_name(): string {
		return __('Uplifters Website Builder', 'uplifters-site-builder-blocks');
	}

	/* ---------------------------------------------------------------- */
	/* Brand mark                                                        */
	/* ---------------------------------------------------------------- */

	/*
	 * The arrow cutout is baked into the outline.
	 *
	 * Earlier revisions cut the arrow at paint time with an SVG <mask>. That
	 * relies on a document-scoped id lookup and on the renderer compositing
	 * the mask before the fill, which is exactly the sort of thing that can
	 * resolve late. The geometry below is the boolean result of U minus
	 * arrow, computed once: two closed rings, nothing overlapping, no mask,
	 * no clipPath, no id references at all. The arrow region is simply not
	 * part of any ring, so it can never be painted, at any moment of the
	 * page lifecycle.
	 *
	 * Ring 1 is the left arm. Ring 2 is the right arm plus the bowl. The
	 * arrow sweeps clean through between them.
	 *
	 * Deviation from the original curves is under 0.15 units on a 460 unit
	 * canvas, roughly one hundredth of a pixel at the size this renders.
	 */
	private const MARK_PATH = 'M82 76.1L82 330.3L82.3 342.8L83.1 352.6L84.3 362.1L86 371.4L88 380.4L90.6 389.1L93.5 397.5L96.9 405.6L100.7 413.5L120.1 411.6L139.2 408.9L157.9 405.1L176.3 400.4L194.1 394.8L211.5 388.3L228.4 380.8L244.7 372.5L252.4 368.1L250.1 359.1L248.2 348.9L247 337.2L246.2 324.3L246 311.4L246 74.1L245.6 69.1L244.8 64.4L243.4 59.9L241.5 55.8L239.5 52.7L237.2 49.9L234.6 47.4L231.7 45.2L228.5 43.4L225.2 42L221.6 40.9L217.8 40.3L213.2 40L118 40L112.4 40.3L105.9 41.7L99.9 44.2L97.1 45.7L94.6 47.6L90.2 51.8L88.3 54.3L86.7 56.9L85.2 59.8L84.1 62.8L82.5 69.1Z'
		. 'M172.3 478.6L181 482.2L190 485.5L199.4 488.5L209.1 491.1L219.2 493.4L229.6 495.3L240.4 496.9L251.5 498.2L263.5 499.2L275.7 499.8L288.4 500L301.5 499.9L314.1 499.4L326.2 498.5L337.9 497.4L349.3 495.8L359.3 494.1L369 492.1L378.3 489.8L387.3 487.2L395.9 484.3L404.2 481.1L412.1 477.7L419.6 473.9L426.7 469.9L433.5 465.5L439.9 460.9L446 456L451.7 450.8L457 445.3L462 439.5L466.6 433.4L472.4 424.5L477.5 415L481.8 405L485.4 394.5L488.4 383.4L490.6 371.7L492.1 359.5L492.9 346.8L492.9 73.7L492.6 69.5L491.8 65.3L490.6 61.4L489 57.7L487.1 54.4L484.8 51.3L482.2 48.6L479.3 46.2L475.2 43.8L470.8 42L465.9 40.7L460.8 40.1L375.3 40.1L371.2 40.5L367.1 41.4L363.3 42.6L359.6 44.2L356.4 46.2L353.3 48.6L350.6 51.2L348.2 54.1L345.6 58.5L343.7 63.2L342.5 68.4L342 73.9L342 288.9L347.3 281.6L352.2 274.1L356.9 266.5L361.3 258.7L365.5 250.8L369.4 242.6L373 234.4L376.4 225.9L380.5 215L384 204.6L387 194.6L389.6 185L391.7 175.8L393.3 167.1L394.4 158.7L395 151L350 166L425 63L492 162L448 148L446.8 163.9L444.7 180L441.9 196.2L438.1 212.6L433.6 229.1L428.2 245.8L422 262.6L415.1 279L408.3 293.3L400.9 307.1L392.9 320.6L384.2 333.8L374.9 346.5L364.9 358.9L354.4 370.9L343.2 382.5L334.2 391.1L324.9 399.4L315.2 407.5L305.2 415.4L294.7 423L284 430.3L273.7 436.9L263.2 443L252.6 448.8L241.8 454.1L230.7 459.1L219.5 463.8L208.2 467.9L196.7 471.8L185.4 475.1Z';

	/**
	 * Bounding box of the artwork in path coordinates.
	 */
	private const ART_BOUNDS = ['x1' => 82, 'y1' => 40, 'x2' => 493, 'y2' => 500];

	/**
	 * Fraction of the icon box the mark fills.
	 *
	 * Lower value draws a smaller mark with more breathing room. This is the
	 * only number to touch when resizing; the viewBox is derived from it.
	 */
	private const MARK_SCALE = 0.68;

	/**
	 * Fill colour of the mark. Solid, no gradient.
	 */
	private const MARK_COLOR = '#ffffff';

	public static function register_menu(): void {
		add_menu_page(
			self::page_title(),
			self::menu_label(),
			'manage_options',
			self::MENU_SLUG,
			[self::class, 'render_page'],
			self::menu_icon_data_uri(),
			26
		);

		/*
		 * add_menu_page() auto-creates a first submenu item labelled with the
		 * menu title. Registering it explicitly keeps that label ours instead
		 * of inheriting whatever menu_label() becomes.
		 */
		add_submenu_page(
			self::MENU_SLUG,
			self::page_title(),
			__('Dashboard', 'uplifters-site-builder-blocks'),
			'manage_options',
			self::MENU_SLUG,
			[self::class, 'render_page']
		);
	}

	/**
	 * Square viewBox centred on the artwork.
	 *
	 * @return string viewBox attribute value.
	 */
	private static function icon_view_box(): string {
		$bounds = self::ART_BOUNDS;
		$width  = $bounds['x2'] - $bounds['x1'];
		$height = $bounds['y2'] - $bounds['y1'];

		$size = max($width, $height) / self::MARK_SCALE;
		$x    = (($bounds['x1'] + $bounds['x2']) / 2) - ($size / 2);
		$y    = (($bounds['y1'] + $bounds['y2']) / 2) - ($size / 2);

		return sprintf('%s %s %s %s', round($x, 1), round($y, 1), round($size, 1), round($size, 1));
	}

	/**
	 * Build the admin menu icon as a self-contained SVG data URI.
	 *
	 * Two elements total: the svg wrapper and one path. No defs, no ids,
	 * nothing to resolve. The sidebar colour shows through the arrow.
	 */
	private static function menu_icon_data_uri(): string {
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' . self::icon_view_box() . '">'
			. '<path d="' . self::MARK_PATH . '" fill="' . self::MARK_COLOR . '"/>'
			. '</svg>';

		return 'data:image/svg+xml;base64,' . base64_encode($svg);
	}

	/* ---------------------------------------------------------------- */
	/* Assets                                                            */
	/* ---------------------------------------------------------------- */

	/**
	 * Load the block category logo in the block editor only.
	 *
	 * The script talks to wp.blocks, wp.element and wp.domReady, so those
	 * handles are declared as dependencies rather than assumed present.
	 *
	 * Hook: add_action( 'enqueue_block_editor_assets', [ DashboardSidebarMenuRegister::class, 'enqueue_block_editor_assets' ] );
	 */
	public static function enqueue_block_editor_assets(): void {
		$relative_path = 'src/assets-shared/brand-icon/sidebar-menu-icon.js';
		$absolute_path = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . $relative_path;

		if (! file_exists($absolute_path)) {
			return;
		}

		wp_enqueue_script(
			'uplifters-site-builder-blocks-brand-icon',
			UPLIFTERS_SITE_BUILDER_BLOCKS_URL . $relative_path,
			['wp-blocks', 'wp-dom-ready', 'wp-element'],
			(string) filemtime($absolute_path),
			true
		);
	}

	public static function enqueue_assets(string $hook_suffix): void {
		wp_add_inline_style('admin-menu', self::menu_icon_css());

		if ('toplevel_page_uplifters-site-builder-blocks' !== $hook_suffix) {
			return;
		}

		wp_enqueue_media();

		$dashboard_styles = [
			'uplifters-site-builder-blocks-overview-tab-style' => 'overview-tab.css',
			'uplifters-site-builder-blocks-blocks-tab-style'   => 'blocks-tab.css',
			'uplifters-site-builder-blocks-settings-tab-style' => 'settings-tab.css',
		];

		foreach ($dashboard_styles as $handle => $filename) {
			$style_path = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'src/dashboard-interface/' . $filename;
			$style_ver  = file_exists($style_path) ? (string) filemtime($style_path) : UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION;

			wp_enqueue_style(
				$handle,
				UPLIFTERS_SITE_BUILDER_BLOCKS_URL . 'src/dashboard-interface/' . $filename,
				[],
				$style_ver
			);
		}

		$built_script_path = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'build/dashboard-interface/dashboard-controller.js';
		$built_asset_path  = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'build/dashboard-interface/dashboard-controller.asset.php';

		if (! file_exists($built_script_path)) {
			return;
		}

		$asset = file_exists($built_asset_path) ? require $built_asset_path : [
			'dependencies' => ['wp-dom-ready', 'wp-element', 'wp-i18n'],
			'version'      => (string) filemtime($built_script_path),
		];

		$dependencies = isset($asset['dependencies']) && is_array($asset['dependencies']) ? $asset['dependencies'] : [];
		$version      = isset($asset['version']) ? (string) $asset['version'] : (string) filemtime($built_script_path);

		wp_enqueue_script(
			'uplifters-site-builder-blocks-dashboard-controller-script',
			UPLIFTERS_SITE_BUILDER_BLOCKS_URL . 'build/dashboard-interface/dashboard-controller.js',
			$dependencies,
			$version,
			true
		);

		wp_add_inline_script(
			'uplifters-site-builder-blocks-dashboard-controller-script',
			'window.upliftersSiteBuilderBlocksDashboardData = ' . wp_json_encode(self::dashboard_data()) . '; window.upliftersSiteBuilderBlocksDashboardControllerData = window.upliftersSiteBuilderBlocksDashboardData; window.upliftersSiteBuilderBlocksPageData = window.upliftersSiteBuilderBlocksDashboardData;',
			'before'
		);

		wp_set_script_translations('uplifters-site-builder-blocks-dashboard-controller-script', 'uplifters-site-builder-blocks');
	}

	/**
	 * Styles for this plugin's menu item only.
	 *
	 * The data URI icon is the single intended mark. The suppression rules
	 * below exist because anything else painted in the same 20px box lines up
	 * behind the arrow gap and fills it in: the dashicon glyph that
	 * add_menu_page() leaves behind, or an element injected by a stale copy of
	 * the brand script. Hiding them keeps the gap genuinely empty from the
	 * first paint onward, with no flash and no late repaint.
	 *
	 * @return string CSS.
	 */
	private static function menu_icon_css(): string {
		$item = '#adminmenu #toplevel_page_uplifters-site-builder-blocks';

		/*
		 * Core dims menu icons to roughly 0.6 opacity at rest and lifts them
		 * to full on hover, which is what made the white mark read grey. The
		 * rules below hold it at full opacity in every state, hover and
		 * current included, so the fill stays the pure white it is drawn in.
		 */
		return $item . ' .wp-menu-image,' .
			$item . ':hover .wp-menu-image,' .
			$item . '.opensub .wp-menu-image,' .
			$item . '.current .wp-menu-image,' .
			$item . '.wp-has-current-submenu .wp-menu-image {' .
			'background-size:20px auto;' .
			'background-position:center center;' .
			'background-repeat:no-repeat;' .
			'opacity:1;' .
			'filter:none;' .
			'}' .

			// Dashicon placeholder glyph.
			$item . ' .wp-menu-image::before,' .
			$item . ' .wp-menu-image::after {' .
			'content:none;' .
			'}' .

			// Anything injected into the icon box at runtime.
			$item . ' .wp-menu-image > * {' .
			'display:none;' .
			'}';
	}

	/* ---------------------------------------------------------------- */
	/* Dashboard                                                         */
	/* ---------------------------------------------------------------- */

	private static function dashboard_data(): array {
		$login_settings = LoginPageCustomization::dashboard_settings();

		// The flag and its nonce are both set by save_settings() below, only
		// after that method's own nonce check has already passed.
		$settings_updated = \UpliftersSiteBuilderBlocks\SecurityLayer\SecurityNonce::verify_get_flag(
			'settings-updated',
			'true',
			'uplifters_site_builder_blocks_settings_updated'
		);

		return [
			'version'         => UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION,
			'siteEditorUrl'   => admin_url('site-editor.php'),
			'formAction'      => admin_url('admin.php?page=' . self::MENU_SLUG),
			// Deliberately not menu_label(): the dashboard keeps its own name.
			'productName'     => self::product_name(),
			'pageTitle'       => self::page_title(),
			'settingsUpdated' => $settings_updated,
			'settings'        => array_merge(
				$login_settings,
				[
					'nonceName' => 'uplifters_site_builder_blocks_settings_nonce',
					'nonce'     => wp_create_nonce('uplifters_site_builder_blocks_save_settings_action'),
				]
			),
		];
	}

	public static function save_settings(): void {
		if (! isset($_POST['uplifters_site_builder_blocks_settings_nonce'])) {
			return;
		}

		// Capability first, then intent.
		if (! current_user_can('manage_options')) {
			wp_die(
				esc_html__('You are not allowed to change these settings.', 'uplifters-site-builder-blocks'),
				esc_html__('Permission denied', 'uplifters-site-builder-blocks'),
				['response' => 403]
			);
		}

		if (! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['uplifters_site_builder_blocks_settings_nonce'])), 'uplifters_site_builder_blocks_save_settings_action')) {
			wp_die(
				esc_html__('The security check failed. Reload the page and try again.', 'uplifters-site-builder-blocks'),
				esc_html__('Security check failed', 'uplifters-site-builder-blocks'),
				['response' => 403]
			);
		}

		$enable_custom_login = isset($_POST['uplifters_site_builder_blocks_login_custom_enable']) ? '1' : '0';
		update_option('uplifters_site_builder_blocks_login_custom_enable', $enable_custom_login);

		if (isset($_POST['uplifters_site_builder_blocks_login_bg_id'])) {
			update_option('uplifters_site_builder_blocks_login_bg_id', absint($_POST['uplifters_site_builder_blocks_login_bg_id']));
		}

		if (isset($_POST['uplifters_site_builder_blocks_login_logo_id'])) {
			update_option('uplifters_site_builder_blocks_login_logo_id', absint($_POST['uplifters_site_builder_blocks_login_logo_id']));
		}

		$settings_updated_nonce = \UpliftersSiteBuilderBlocks\SecurityLayer\SecurityNonce::create('uplifters_site_builder_blocks_settings_updated');

		wp_safe_redirect(admin_url('admin.php?page=' . self::MENU_SLUG . '&settings-updated=true&_wpnonce=' . $settings_updated_nonce . '#settings'));
		exit;
	}

	private static function dashboard_build_exists(): bool {
		return file_exists(UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . 'build/dashboard-interface/dashboard-controller.js');
	}

	public static function render_page(): void {
		if (! current_user_can('manage_options')) {
			wp_die(
				esc_html__('You are not allowed to view this page.', 'uplifters-site-builder-blocks'),
				esc_html__('Permission denied', 'uplifters-site-builder-blocks'),
				['response' => 403]
			);
		}
		?>
		<div class="wrap uplifters-site-builder-blocks-dashboard-wrap" id="uplifters-site-builder-blocks-dashboard">
			<h1 class="screen-reader-text"><?php echo esc_html(self::page_title()); ?></h1>

			<?php if (self::dashboard_build_exists()) : ?>
				<div class="uplifters-site-builder-blocks-dashboard-loading">
					<span class="spinner is-active"></span>
					<span>
						<?php
						printf(
							/* translators: %s: product name. */
							esc_html__('Loading %s…', 'uplifters-site-builder-blocks'),
							esc_html(self::product_name())
						);
						?>
					</span>
				</div>
			<?php else : ?>
				<div class="notice notice-error uplifters-site-builder-blocks-build-missing">
					<p><strong><?php esc_html_e('Dashboard build file is missing.', 'uplifters-site-builder-blocks'); ?></strong></p>
					<p><?php esc_html_e('Run npm run build and make sure build/dashboard-interface/dashboard-controller.js and build/dashboard-interface/dashboard-controller.asset.php are included in the plugin package.', 'uplifters-site-builder-blocks'); ?></p>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}
}