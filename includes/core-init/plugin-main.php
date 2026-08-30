<?php

namespace UpliftersSiteBuilderBlocks\CoreInit;


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class PluginMain {

	public function boot(): void {
		PluginHooks::register();

	}

	public function register_template_parts(): void {
	}
}
