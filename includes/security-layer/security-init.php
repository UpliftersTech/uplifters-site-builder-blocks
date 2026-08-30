<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class SecurityInit {
  public static function init(): void {
    SecurityHeaders::init();
    SecurityFirewall::init();
  }
}
