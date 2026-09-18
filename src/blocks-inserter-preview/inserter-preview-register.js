/**
 * The component each block's `edit.js` renders for its inserter preview.
 *
 * This is a thin stand-in for the real registry, which lives in its own
 * bundle (see `inserter-preview-entry.js`) so that 42 block bundles do not
 * each carry a private copy of it. Importing this file costs a block bundle
 * a few hundred bytes instead of ~140 KB.
 *
 * The global is read during render rather than at module scope, so this file
 * does not care whether the shared bundle happened to execute first. In
 * practice `InserterPreviewRegister` makes the shared script a formal
 * dependency of every block editor script, so it always has.
 */

/**
 * Render the preview registered for a block slug.
 *
 * Renders nothing when the shared bundle is unavailable, which matches the
 * registry's own behaviour for an unknown slug: the inserter falls back to
 * Gutenberg's default preview rather than showing an error.
 *
 * @param {Object} props      Props forwarded to the real registry.
 * @param {string} props.type Block slug, e.g. 'accordion-icon-custom'.
 * @return {*} The preview element, or null when unavailable.
 */
export default function InserterPreview( props ) {
	const Registry = window.UpliftersSiteBuilderBlocksInserterPreview;

	return Registry ? <Registry { ...props } /> : null;
}
