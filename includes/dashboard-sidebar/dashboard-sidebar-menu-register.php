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
	 * The sidebar mark, drawn the way WordPress draws menu icons.
	 *
	 * add_menu_page() is handed a base64 SVG data URI, so core tags the item
	 * with class "svg" and wp-admin/js/svg-painter.js recolours the artwork to
	 * the user's admin colour scheme on its own: base at rest, focus on hover,
	 * current on the open item. Nothing here paints the icon by hand, and
	 * there is no per-item CSS to keep in step with core.
	 *
	 * That recolouring is why the file is a single flat path with no gradient,
	 * mask, drop shadow or animation. svg-painter rewrites every fill
	 * attribute, every style attribute and every fill property inside a
	 * <style> block, so nothing else survives it: gradients flatten to one
	 * solid block, and a luminance mask's white rectangle becomes the icon
	 * colour, dimming the whole mark.
	 *
	 * The artwork is sized for the 20px slot core gives menu icons
	 * (background-size:20px auto). The mark is 85% of a square viewBox, so it
	 * draws about 17px tall, level with the core dashicons above and below it.
	 * Resize by changing that ratio in the artwork, not with CSS here.
	 *
	 * The artwork lives in sidebar-menu-icon.js and is read out of it, so the
	 * mark has exactly one definition. See that file's header for the shape
	 * this class depends on.
	 */
	private const ICON_FILE = 'src/assets-shared/brand-icon/sidebar-menu-icon.js';

	/**
	 * Pulls the artwork out of ICON_FILE.
	 *
	 * Anchored on the "var MENU_ICON_SVG =" assignment rather than the
	 * constant name alone, so prose in that file's header cannot match ahead
	 * of the real literal. [^'] holds the match to one single-quoted literal.
	 */
	private const ICON_PATTERN = '/var\s+MENU_ICON_SVG\s*=\s*\'(<svg\b[^\']*<\/svg>)\'\s*;/';

	public static function register_menu(): void {
		$icon = self::menu_icon_data_uri();

		add_menu_page(
			self::page_title(),
			self::menu_label(),
			'manage_options',
			self::MENU_SLUG,
			[self::class, 'render_page'],
			// Fall back to a core dashicon if the artwork cannot be read.
			'' !== $icon ? $icon : 'dashicons-layout',
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
	 * Build the admin menu icon as a base64 SVG data URI.
	 *
	 * The 'data:image/svg+xml;base64,' prefix is the part core matches on: it
	 * is what makes menu-header.php mark the item as an SVG icon and what
	 * makes svg-painter.js recolour it. A URL-encoded data URI renders, but
	 * core ignores it, so the icon would keep one fixed colour in every state.
	 *
	 * svg-painter decodes with window.atob(), which is Latin-1 only. The
	 * artwork is ASCII, so it round-trips unchanged.
	 *
	 * @return string Data URI, or '' when the artwork cannot be read.
	 */
	private static function menu_icon_data_uri(): string {
		static $uri = null;

		if (null !== $uri) {
			return $uri;
		}

		$path   = UPLIFTERS_SITE_BUILDER_BLOCKS_DIR . self::ICON_FILE;
		$source = is_readable($path) ? (string) file_get_contents($path) : '';

		// No artwork means no icon: register_menu() falls back to a dashicon.
		if (1 !== preg_match(self::ICON_PATTERN, $source, $matches)) {
			$uri = '';

			return $uri;
		}

		$uri = 'data:image/svg+xml;base64,' . base64_encode($matches[1]);

		return $uri;
	}

	/* ---------------------------------------------------------------- */
	/* Assets                                                            */
	/* ---------------------------------------------------------------- */

	/*
	 * There is no menu-icon CSS and no menu-icon script. The icon reaches the
	 * page through add_menu_page() above, and core styles and recolours it.
	 *
	 * Editor surfaces that want the animated colour logo load their own
	 * brand-icon module: blocks-category-icon.js, editor-topbar-icon.js and
	 * dashboard-brand-icon.js each own one surface.
	 */

	public static function enqueue_assets(string $hook_suffix): void {
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