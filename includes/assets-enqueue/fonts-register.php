<?php
/**
 * Font registration for the Uplifters Website Builder plugin.
 *
 * Registration is centralised here, but frontend enqueueing is deliberately
 * driven by each block's own selected attributes (see enqueue_from_attributes()
 * and the render_block_data filter below) so that only the fonts a page
 * actually uses are loaded. The editor loads every bundled font, since the
 * user needs to preview them all from the font family dropdown.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */

namespace UpliftersSiteBuilderBlocks\AssetsEnqueue;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class FontsRegister {

	/**
	 * Handle slug => stylesheet filename.
	 *
	 * @var array<string, string>
	 */
	private const FONTS = array(
		'oswald'       => 'oswald.css',
		'gravitas-one' => 'gravitas-one.css',
	);

	/**
	 * CSS font-family attribute value => handle slug.
	 *
	 * Keys must match the values used in the block editor's font dropdown and
	 * in each render.php font-family allowlist. Generic system stacks are not
	 * listed here because they load no external stylesheet.
	 *
	 * Kept for backwards compatibility with code that already calls
	 * get_registered_families(). New code should prefer OPTIONS below, which
	 * covers bundled fonts *and* the non-loading system stacks in one place.
	 *
	 * @var array<string, string>
	 */
	private const FAMILY_MAP = array(
		'Oswald'       => 'oswald',
		'Gravitas One' => 'gravitas-one',
	);

	/**
	 * The complete font-family option list: every value the editor dropdown
	 * can offer and every value render.php can be asked to resolve to CSS.
	 *
	 * This is the single source of truth described in R1/R2 of the fonts
	 * centralisation task — adding a font here is the only edit required for
	 * it to appear in every block's dropdown and load correctly on the
	 * frontend. Order here is display order in the editor dropdown.
	 *
	 * 'handle' is the FONTS slug to enqueue, or null for values that load no
	 * stylesheet (system stacks, and the "inherit from theme" option).
	 *
	 * @var array<string, array{label: string, css: string, handle: ?string}>
	 */
	private const OPTIONS = array(
		'inherit'         => array(
			'label'  => 'Default (Theme)',
			'css'    => '',
			'handle' => null,
		),
		'oswald'          => array(
			'label'  => 'Oswald',
			'css'    => '"Oswald", sans-serif',
			'handle' => 'oswald',
		),
		'gravitas-one'    => array(
			'label'  => 'Gravitas One',
			'css'    => '"Gravitas One", serif',
			'handle' => 'gravitas-one',
		),
		'system-sans'     => array(
			'label'  => 'System Sans',
			'css'    => '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
			'handle' => null,
		),
		'editorial-serif' => array(
			'label'  => 'Editorial Serif',
			'css'    => 'Georgia, "Times New Roman", Times, serif',
			'handle' => null,
		),
		'monospace'       => array(
			'label'  => 'Monospace',
			'css'    => 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
			'handle' => null,
		),
	);

	/**
	 * Legacy slugs used by individual blocks before this registry existed.
	 * Normalisation falls back to these so already-published content saved
	 * with the old per-block dropdowns keeps rendering the same CSS stack.
	 *
	 * @var array<string, string>
	 */
	private const LEGACY_ALIASES = array(
		'serif'      => 'editorial-serif',
		'sans'       => 'system-sans',
		'sans-serif' => 'system-sans',
		'mono'       => 'monospace',
	);

	/**
	 * Style handle prefix.
	 */
	private const HANDLE_PREFIX = 'uplifters-site-builder-blocks-font-';

	/**
	 * Script handle used to expose the option list to the block editor.
	 */
	private const OPTIONS_SCRIPT_HANDLE = 'uplifters-site-builder-blocks-font-options';

	/**
	 * Hook registration.
	 */
	public static function register(): void {
		add_action( 'init', array( __CLASS__, 'register_fonts' ) );

		// enqueue_block_assets fires on the frontend *and* inside the editor
		// iframe canvas. We only want the load-everything behaviour in the
		// editor; the frontend loads per block, via the render_block_data
		// filter below.
		add_action( 'enqueue_block_assets', array( __CLASS__, 'enqueue_editor_fonts' ) );

		// Expose the option list to the editor before block scripts run.
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_font_options' ), 1 );

		// Make every plugin block's editor script formally depend on the
		// option list script, so load order is guaranteed rather than
		// coincidental. Runs after WP's own priority-10 auto-enqueue of
		// registered block scripts, so every handle already exists to patch.
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'inject_editor_script_dependency' ), 20 );

		// The single frontend loading path: whichever font(s) a block
		// instance actually has selected get enqueued when that block
		// renders, and nothing else does. No render.php needs to call
		// enqueue() itself for this to work.
		add_filter( 'render_block_data', array( __CLASS__, 'auto_enqueue_block_fonts' ) );
	}

	/**
	 * Register every font stylesheet. Registration is cheap; nothing is output
	 * until something calls enqueue().
	 */
	public static function register_fonts(): void {
		$version = self::plugin_version();

		foreach ( self::FONTS as $slug => $filename ) {
			wp_register_style(
				self::HANDLE_PREFIX . $slug,
				UPLIFTERS_SITE_BUILDER_BLOCKS_URL . 'src/assets-shared/fonts-family/' . $filename,
				array(),
				$version
			);
		}
	}

	/**
	 * Load every font in the editor so the font family dropdown previews
	 * correctly. Does nothing on the frontend.
	 */
	public static function enqueue_editor_fonts(): void {
		if ( ! is_admin() ) {
			return;
		}

		foreach ( array_keys( self::FONTS ) as $slug ) {
			self::enqueue( $slug );
		}
	}

	/**
	 * Enqueue a single registered font by its slug.
	 *
	 * @param string $slug Font slug, e.g. 'oswald'.
	 */
	public static function enqueue( string $slug ): void {
		if ( ! isset( self::FONTS[ $slug ] ) ) {
			return;
		}

		wp_enqueue_style( self::HANDLE_PREFIX . $slug );
	}

	/**
	 * Enqueue whichever font a block attribute value refers to.
	 *
	 * Accepts anything a block might have stored historically: a bundled
	 * font's slug ('oswald'), its display label ('Oswald'), or even a raw
	 * CSS font-family stack — as well as 'inherit', an empty string, or a
	 * system font stack, all of which simply resolve to no stylesheet. Also
	 * safe to call repeatedly; wp_enqueue_style() de-duplicates by handle.
	 *
	 * @param mixed $family Raw font-family value from a block attribute.
	 */
	public static function enqueue_for_family( $family ): void {
		$slug = self::normalize_value( $family );

		if ( ! empty( self::OPTIONS[ $slug ]['handle'] ) ) {
			self::enqueue( self::OPTIONS[ $slug ]['handle'] );
		}
	}

	/**
	 * Convenience wrapper for blocks with responsive font settings.
	 *
	 * @param array<int, mixed> $families List of font-family values.
	 */
	public static function enqueue_for_families( array $families ): void {
		foreach ( $families as $family ) {
			self::enqueue_for_family( $family );
		}
	}

	/**
	 * Font family values that map to a bundled stylesheet.
	 *
	 * Useful when a block needs to build its own allowlist without hardcoding
	 * the font names a second time. Kept for backwards compatibility; prefer
	 * get_editor_options() in new code, which also includes the system stacks.
	 *
	 * @return array<int, string>
	 */
	public static function get_registered_families(): array {
		return array_keys( self::FAMILY_MAP );
	}

	/**
	 * The full font-family dropdown, in display order, shaped for a
	 * SelectControl (label/value pairs). Drives every block's editor control
	 * and is also what gets exposed to the editor as window global JSON —
	 * this is the one place a new font needs to be added for it to show up
	 * everywhere.
	 *
	 * Also carries 'css' alongside label/value — SelectControl ignores the
	 * extra property, but it lets block editor canvases resolve a selected
	 * slug to its real CSS font-family stack for live preview, instead of
	 * hardcoding that mapping a second time in JS.
	 *
	 * @return array<int, array{label: string, value: string, css: string}>
	 */
	public static function get_editor_options(): array {
		$translated_labels = array(
			'inherit'         => __( 'Default (Theme)', 'uplifters-site-builder-blocks' ),
			'oswald'          => __( 'Oswald', 'uplifters-site-builder-blocks' ),
			'gravitas-one'    => __( 'Gravitas One', 'uplifters-site-builder-blocks' ),
			'system-sans'     => __( 'System Sans', 'uplifters-site-builder-blocks' ),
			'editorial-serif' => __( 'Editorial Serif', 'uplifters-site-builder-blocks' ),
			'monospace'       => __( 'Monospace', 'uplifters-site-builder-blocks' ),
		);

		$options = array();

		foreach ( self::OPTIONS as $slug => $option ) {
			$options[] = array(
				'label' => $translated_labels[ $slug ] ?? $option['label'],
				'value' => $slug,
				'css'   => $option['css'],
			);
		}

		return $options;
	}

	/**
	 * Resolve a stored attribute value to the full CSS font-family stack
	 * render.php should emit. 'Default (Theme)' (and anything unrecognised)
	 * resolves to an empty string, meaning: emit no font-family declaration
	 * at all and let the theme's own CSS cascade apply.
	 *
	 * @param mixed $value Raw font-family attribute value.
	 * @return string
	 */
	public static function get_css_stack( $value ): string {
		$slug = self::normalize_value( $value );

		return self::OPTIONS[ $slug ]['css'] ?? '';
	}

	/**
	 * Recursively walk a block's attributes array and enqueue every font it
	 * references. This is what makes R1 and R2 true simultaneously: a
	 * block's selected fonts load without render.php doing anything, and
	 * fonts nobody selected never load.
	 *
	 * A value is treated as a font candidate when its array key contains
	 * "fontFamily" or "font_family" (case-insensitive) — covering flat,
	 * responsive ({desktop,tablet,mobile}), and nested-repeater attributes
	 * (e.g. countup-auto-animate's per-counter titleFontFamily) — or, as a fallback,
	 * when the value itself exactly matches a registered option's slug,
	 * label, or CSS stack.
	 *
	 * @param array<string, mixed> $attributes Block attributes array.
	 */
	public static function enqueue_from_attributes( array $attributes ): void {
		self::walk_attributes_for_fonts( $attributes );
	}

	/**
	 * Enqueue every bundled font referenced by an inline `font-family:`
	 * declaration inside a chunk of block HTML.
	 *
	 * Attribute-driven detection (enqueue_from_attributes()) only sees values
	 * stored under a font-family-ish key. Formats applied to a *selection*
	 * inside a RichText field are different: they live as a style attribute on
	 * a <span> buried in the block's saved content string, so nothing about
	 * the attribute key or the value as a whole identifies them as a font.
	 * This scans that HTML instead, so selected-text fonts load on the
	 * frontend the same way block-level ones do.
	 *
	 * Matching is done on the family *name* rather than the whole stack,
	 * because an inline declaration is written unquoted (see the editor
	 * control) while OPTIONS stores the canonical quoted form.
	 *
	 * @param mixed $html Block HTML, or any attribute string that may contain CSS.
	 */
	public static function enqueue_from_html( $html ): void {
		if ( ! is_string( $html ) || false === stripos( $html, 'font-family' ) ) {
			return;
		}

		// Decode before matching: content saved before the quote fix still
		// carries &quot;-escaped stacks, whose semicolons would otherwise cut
		// the match short. This copy is only ever used for name detection.
		// Quotes are dropped rather than used as delimiters so that the
		// canonical quoted stacks ('"Gravitas One", serif') and the unquoted
		// inline form both reduce to the same comparable text.
		$decoded = str_replace( array( '"', "'" ), '', html_entity_decode( $html, ENT_QUOTES, 'UTF-8' ) );

		if ( ! preg_match_all( '/font-family\s*:\s*([^;}>]+)/i', $decoded, $matches ) ) {
			return;
		}

		$declarations = strtolower( implode( ' | ', $matches[1] ) );

		foreach ( self::OPTIONS as $option ) {
			if ( empty( $option['handle'] ) ) {
				continue;
			}

			if ( false !== strpos( $declarations, strtolower( $option['label'] ) ) ) {
				self::enqueue( $option['handle'] );
			}
		}
	}

	/**
	 * @param array<int|string, mixed> $attributes
	 */
	private static function walk_attributes_for_fonts( array $attributes ): void {
		foreach ( $attributes as $key => $value ) {
			if ( is_array( $value ) ) {
				self::walk_attributes_for_fonts( $value );
				continue;
			}

			if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
				continue;
			}

			// Rich-text content strings can carry inline font-family styles
			// applied to a selection; those never match on key or value.
			self::enqueue_from_html( $value );

			$key_looks_like_font = is_string( $key )
				&& false !== stripos( str_replace( '_', '', $key ), 'fontfamily' );

			if ( $key_looks_like_font || self::value_matches_registered_option( $value ) ) {
				self::enqueue_for_family( $value );
			}
		}
	}

	/**
	 * @param mixed $value
	 */
	private static function value_matches_registered_option( $value ): bool {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return false;
		}

		$lower = strtolower( trim( $value ) );

		if ( isset( self::OPTIONS[ $lower ] ) ) {
			return true;
		}

		foreach ( self::OPTIONS as $option ) {
			if ( strtolower( $option['label'] ) === $lower || strtolower( $option['css'] ) === $lower ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Map any historically-stored value to a canonical OPTIONS key.
	 *
	 * @param mixed $raw
	 */
	private static function normalize_value( $raw ): string {
		$value = trim( (string) $raw );

		if ( '' === $value ) {
			return 'inherit';
		}

		$lower = strtolower( $value );

		if ( 'default' === $lower ) {
			return 'inherit';
		}

		if ( isset( self::OPTIONS[ $lower ] ) ) {
			return $lower;
		}

		if ( isset( self::LEGACY_ALIASES[ $lower ] ) ) {
			return self::LEGACY_ALIASES[ $lower ];
		}

		foreach ( self::OPTIONS as $slug => $option ) {
			if ( strtolower( $option['label'] ) === $lower || strtolower( $option['css'] ) === $lower ) {
				return $slug;
			}
		}

		return 'inherit';
	}

	/**
	 * Fires for every block on the page, including inside the editor's
	 * iframe canvas. Enqueues only the fonts this plugin's own blocks
	 * actually reference; everything else is a cheap early return.
	 *
	 * @param array<string, mixed> $parsed_block
	 * @return array<string, mixed>
	 */
	public static function auto_enqueue_block_fonts( array $parsed_block ): array {
		$name = $parsed_block['blockName'] ?? '';

		if ( ! $name || 0 !== strpos( $name, 'uplifters-site-builder-blocks/' ) ) {
			return $parsed_block;
		}

		self::enqueue_from_attributes( $parsed_block['attrs'] ?? array() );

		// Static (non-dynamic) blocks keep their rich-text markup here rather
		// than in an attribute, so inline font styles would otherwise be missed.
		self::enqueue_from_html( $parsed_block['innerHTML'] ?? '' );

		return $parsed_block;
	}

	/**
	 * Expose the option list to the block editor as a single JSON global,
	 * so every block's font-family control reads from one place instead of
	 * hardcoding the list. Runs at priority 1 so the global exists before
	 * WordPress's own priority-10 auto-enqueue of registered block scripts.
	 */
	public static function enqueue_editor_font_options(): void {
		if ( ! is_admin() ) {
			return;
		}

		wp_register_script( self::OPTIONS_SCRIPT_HANDLE, false, array(), self::plugin_version(), false );
		wp_enqueue_script( self::OPTIONS_SCRIPT_HANDLE );

		wp_add_inline_script(
			self::OPTIONS_SCRIPT_HANDLE,
			'window.UpliftersSiteBuilderBlocksFontOptions = ' . wp_json_encode( self::get_editor_options() ) . ';',
			'before'
		);
	}

	/**
	 * Patches the option-list script in as an explicit dependency of every
	 * registered plugin block's editor script, so
	 * window.UpliftersSiteBuilderBlocksFontOptions is guaranteed to exist by the
	 * time a block's edit.js runs — without needing a build step to add it to
	 * each block's generated *.asset.php dependency list.
	 */
	public static function inject_editor_script_dependency(): void {
		if ( ! wp_script_is( self::OPTIONS_SCRIPT_HANDLE, 'registered' ) ) {
			return;
		}

		$scripts = wp_scripts();

		foreach ( \WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $block_type ) {
			if ( 0 !== strpos( $name, 'uplifters-site-builder-blocks/' ) ) {
				continue;
			}

			$handles = ! empty( $block_type->editor_script_handles )
				? $block_type->editor_script_handles
				: array_filter( array( $block_type->editor_script ?? null ) );

			foreach ( $handles as $handle ) {
				if ( ! isset( $scripts->registered[ $handle ] ) ) {
					continue;
				}

				if ( ! in_array( self::OPTIONS_SCRIPT_HANDLE, $scripts->registered[ $handle ]->deps, true ) ) {
					$scripts->registered[ $handle ]->deps[] = self::OPTIONS_SCRIPT_HANDLE;
				}
			}
		}
	}

	/**
	 * @return string
	 */
	private static function plugin_version(): string {
		return defined( 'UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION' ) ? UPLIFTERS_SITE_BUILDER_BLOCKS_VERSION : '1.0.0';
	}
}