<?php

/**
 * UPLIFTERS_SITE_BUILDER_BLOCKS hooks registry.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\CoreInit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class PluginHooks {

	public static function register(): void {

		// Security layer: request firewall + response headers. Runs first.
		if ( class_exists( \UpliftersSiteBuilderBlocks\SecurityLayer\SecurityInit::class ) ) {
			\UpliftersSiteBuilderBlocks\SecurityLayer\SecurityInit::init();
		}

		if ( class_exists( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardSidebarMenuRegister::class ) ) {
			add_action( 'admin_menu', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardSidebarMenuRegister::class, 'register_menu' ) );
			add_action( 'admin_enqueue_scripts', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardSidebarMenuRegister::class, 'enqueue_assets' ) );
			add_action( 'admin_init', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardSidebarMenuRegister::class, 'save_settings' ) );
		}

		if ( class_exists( \UpliftersSiteBuilderBlocks\DashboardSidebar\LoginPageCustomization::class ) ) {
			\UpliftersSiteBuilderBlocks\DashboardSidebar\LoginPageCustomization::register_hooks();
		}

		// Admin notices.
		if ( class_exists( \UpliftersSiteBuilderBlocks\DashboardSidebar\PluginToolbarAdminNotices::class ) ) {
			add_action( 'admin_notices', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\PluginToolbarAdminNotices::class, 'render' ) );
		}

		// Activation redirect.
		if ( class_exists( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardActivationRedirect::class ) ) {
			add_action( 'admin_init', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardActivationRedirect::class, 'maybe_redirect' ) );
			add_action( 'activated_plugin', array( \UpliftersSiteBuilderBlocks\DashboardSidebar\DashboardActivationRedirect::class, 'capture_plugin_activation' ), 10, 2 );
		}

		if ( class_exists( \UpliftersSiteBuilderBlocks\ResponsiveGlobal\ResponsiveAttributeRegister::class ) ) {
			\UpliftersSiteBuilderBlocks\ResponsiveGlobal\ResponsiveAttributeRegister::register();
		}

		// Editor topbar logo.
		if ( class_exists( \UpliftersSiteBuilderBlocks\EditorInject\EditorTopbarIconRegister::class ) ) {
			\UpliftersSiteBuilderBlocks\EditorInject\EditorTopbarIconRegister::register();
		}

		// Blocks category.
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksCategoryRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksCategoryRegister::class, 'register' ) );
		}

		// Blocks register.
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksRegister::class, 'register_all' ) );
		}

		// Posts Section block (registered manually, no block.json — lives inside Posts Layout).
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\PostsSectionBlockRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\PostsSectionBlockRegister::class, 'register' ) );
		}

		// Header Section block (registered manually, no block.json — lives inside Header Layout).
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\HeaderSectionBlockRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\HeaderSectionBlockRegister::class, 'register' ) );
		}

		// Footer Section block (registered manually, no block.json — lives inside Footer Layout).
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\FooterSectionBlockRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\FooterSectionBlockRegister::class, 'register' ) );
		}

		// Columns Section block (registered manually, no block.json — lives inside Column Layout).
		if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\ColumnSectionBlockRegister::class ) ) {
			add_action( 'init', array( \UpliftersSiteBuilderBlocks\BlocksHelper\SectionWrapper\ColumnSectionBlockRegister::class, 'register' ) );
		}

		// Fonts.
		if ( class_exists( \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::class ) ) {
			\UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::register();
		}

		// Shared inserter previews (one bundle for all blocks).
		if ( class_exists( \UpliftersSiteBuilderBlocks\AssetsEnqueue\InserterPreviewRegister::class ) ) {
			\UpliftersSiteBuilderBlocks\AssetsEnqueue\InserterPreviewRegister::register();
		}

	    // Post title style Posts.
         if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\PostsEnhance\PostTitleStyle::class ) ) {
	       \UpliftersSiteBuilderBlocks\BlocksHelper\PostsEnhance\PostTitleStyle::register();
          }

		// Post Featured Image style Posts.
         if ( class_exists( \UpliftersSiteBuilderBlocks\BlocksHelper\PostsEnhance\PostFeaturedImageStyle::class ) ) {
	       \UpliftersSiteBuilderBlocks\BlocksHelper\PostsEnhance\PostFeaturedImageStyle::register();
          }

	}
}
