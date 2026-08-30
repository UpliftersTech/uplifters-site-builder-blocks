/**
 * Shared font-family editor control.
 *
 * Every block's font-family dropdown must read from this module instead of
 * hardcoding its own option list. The option list itself lives entirely in
 * PHP (see includes/assets-enqueue/fonts-register.php::get_editor_options())
 * and is exposed here as window.UpliftersSiteBuilderBlocksFontOptions — adding a
 * font there is the only edit needed for it to appear in every block that
 * imports this file.
 *
 * The fallback list below covers only the values PHP always has to fall
 * back to as well (theme default, system stacks) — it deliberately excludes
 * bundled fonts, since offering those without a confirmed registered
 * stylesheet behind them would be misleading. Bundled font names are never
 * hardcoded here; they only ever come from the PHP option list.
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

const FALLBACK_OPTIONS = [
	{ label: __( 'Default (Theme)', 'uplifters-site-builder-blocks' ), value: 'inherit', css: '' },
	{
		label: __( 'System Sans', 'uplifters-site-builder-blocks' ),
		value: 'system-sans',
		css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
	},
	{
		label: __( 'Editorial Serif', 'uplifters-site-builder-blocks' ),
		value: 'editorial-serif',
		css: 'Georgia, "Times New Roman", Times, serif',
	},
	{
		label: __( 'Monospace', 'uplifters-site-builder-blocks' ),
		value: 'monospace',
		css: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
	},
];

/**
 * The font-family option list, sourced from PHP. Falls back to a minimal
 * safe list (matching the same values PHP would resolve on its own) if the
 * global hasn't been injected for some reason.
 *
 * @return {Array<{label: string, value: string, css: string}>}
 */
export function getFontFamilyOptions() {
	if (
		typeof window !== 'undefined' &&
		Array.isArray( window.UpliftersSiteBuilderBlocksFontOptions ) &&
		window.UpliftersSiteBuilderBlocksFontOptions.length > 0
	) {
		return window.UpliftersSiteBuilderBlocksFontOptions;
	}

	return FALLBACK_OPTIONS;
}

/**
 * Resolve a stored font-family value to the CSS font-family stack it should
 * render as in the editor canvas — the JS-side counterpart to
 * FontsRegister::get_css_stack() in PHP. Returns undefined for 'inherit' (or
 * anything unrecognised) so callers can spread it straight into a style
 * object and let the theme's own CSS apply.
 *
 * @param {string} value Stored font-family attribute value.
 * @return {string|undefined}
 */
export function getFontFamilyCss( value ) {
	if ( ! value ) {
		return undefined;
	}

	const match = getFontFamilyOptions().find( ( option ) => option.value === value );

	return match && match.css ? match.css : undefined;
}

/**
 * A SelectControl bound to the shared font-family option list. Works for any
 * flat (non-responsive) font-family attribute — pass the current value and
 * an onChange that writes it back.
 *
 * @param {Object}   props
 * @param {string}   [props.label]
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {string}   [props.help]
 */
export function FontFamilyControl( { label, value, onChange, help } ) {
	return (
		<SelectControl
			label={ label || __( 'Font Family', 'uplifters-site-builder-blocks' ) }
			value={ value || 'inherit' }
			options={ getFontFamilyOptions() }
			onChange={ onChange }
			help={ help }
		/>
	);
}

/**
 * Convenience wrapper for blocks with responsive ({desktop,tablet,mobile})
 * font-family attributes. Callers pass their own existing
 * getResponsiveValue/setResponsiveValue helpers (every block already has
 * these for its other responsive attributes) so this stays a drop-in
 * replacement for a block's previous hardcoded dropdown, without requiring
 * a rewrite of its device-switching logic.
 *
 * @param {Object}   props
 * @param {string}   [props.label]
 * @param {string}   props.device          Current responsive device.
 * @param {Object}   props.attributes      Block attributes.
 * @param {Function} props.setAttributes   Block setAttributes.
 * @param {string}   props.attributeName   Name of the responsive font-family attribute.
 * @param {string}   [props.help]
 * @param {Function} props.getResponsiveValue Block's existing (attributes, key, device) => value helper.
 * @param {Function} props.setResponsiveValue Block's existing (attributes, setAttributes, key, device, value) => void helper.
 */
export function ResponsiveFontFamilyControl( {
	label,
	device,
	attributes,
	setAttributes,
	attributeName,
	help,
	getResponsiveValue,
	setResponsiveValue,
} ) {
	const value = getResponsiveValue( attributes, attributeName, device );

	return (
		<FontFamilyControl
			label={ label }
			value={ value }
			help={ help }
			onChange={ ( next ) => {
				setResponsiveValue( attributes, setAttributes, attributeName, device, next );
			} }
		/>
	);
}

export default FontFamilyControl;
