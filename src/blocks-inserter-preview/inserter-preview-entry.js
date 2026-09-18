/**
 * Webpack entry point for the shared inserter-preview bundle.
 *
 * Why this exists: `@wordpress/scripts` creates one webpack entry per block,
 * and webpack cannot share a module across separate entries. Because every
 * block's `edit.js` imported `inserter-preview.js` — which statically imports
 * all 42 preview components, and through them `motion/react` — each of the 42
 * block bundles carried its own private copy of the entire preview set plus
 * the whole animation library.
 *
 * Building the preview registry as its own entry and publishing it on a global
 * means the browser downloads and parses it exactly once for the whole editor,
 * while each block bundle keeps only its own code. Blocks reach it through
 * `inserter-preview-register.js`, never by importing this file.
 *
 * The matching PHP handle is registered by
 * `\UpliftersSiteBuilderBlocks\AssetsEnqueue\InserterPreviewRegister`, which
 * also patches this script in as a dependency of every block's editor script
 * so the global is guaranteed to exist before any block renders.
 */

import InserterPreview from './inserter-preview';

window.UpliftersSiteBuilderBlocksInserterPreview = InserterPreview;
