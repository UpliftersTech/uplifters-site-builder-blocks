<?php
namespace UpliftersSiteBuilderBlocks\DashboardSidebar;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class LoginPageCustomization {

	public static function register_hooks(): void {
		if (! self::is_enabled()) {
			return;
		}

		add_action('login_enqueue_scripts', [self::class, 'customize_login_page']);
		add_filter('login_headerurl', [self::class, 'customize_login_logo_url']);
		add_filter('login_headertext', [self::class, 'customize_login_logo_title']);
	}

	public static function is_enabled(): bool {
		return get_option('uplifters_site_builder_blocks_login_custom_enable', '0') === '1';
	}

	public static function dashboard_settings(): array {
		$bg_id        = absint(get_option('uplifters_site_builder_blocks_login_bg_id', 0));
		$logo_id      = absint(get_option('uplifters_site_builder_blocks_login_logo_id', 0));
		$bg_img_url   = $bg_id ? wp_get_attachment_url($bg_id) : '';
		$logo_img_url = $logo_id ? wp_get_attachment_url($logo_id) : '';

		return [
			'loginEnabled' => self::is_enabled(),
			'bgId'         => $bg_id,
			'logoId'       => $logo_id,
			'bgUrl'        => $bg_img_url ? esc_url_raw($bg_img_url) : '',
			'logoUrl'      => $logo_img_url ? esc_url_raw($logo_img_url) : '',
		];
	}

	public static function customize_login_page(): void {
		if (! self::is_enabled()) {
			return;
		}

		$settings = self::dashboard_settings();
		$bg_url   = $settings['bgUrl'];
		$logo_url = $settings['logoUrl'];

		if (! $bg_url && ! $logo_url) {
			return;
		}

		$css = '';

		if ($bg_url) {
			$css .= 'body.login{background-image:url(' . esc_url($bg_url) . ')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}';
		}

		if ($logo_url) {
			$css .= 'body.login h1 a{background-image:url(' . esc_url($logo_url) . ')!important;background-size:contain!important;width:100%!important;max-width:320px!important;height:80px!important;}';
		}

		$version = defined('UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION') ? UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION : '1.0.0';

		wp_register_style('uplifters-site-builder-blocks-login-customization', false, [], $version);
		wp_enqueue_style('uplifters-site-builder-blocks-login-customization');
		wp_add_inline_style('uplifters-site-builder-blocks-login-customization', wp_strip_all_tags($css));
	}

	public static function customize_login_logo_url(): string {
		return home_url();
	}

	public static function customize_login_logo_title(): string {
		return get_bloginfo('name');
	}
}
