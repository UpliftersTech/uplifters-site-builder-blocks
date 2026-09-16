/**
 * Uplifters Website Builder admin sidebar menu icon.
 *
 * This file is the only definition of the mark WordPress draws beside the
 * plugin's admin menu entry. PHP reads this file from disk and pulls
 * MENU_ICON_SVG straight out of it, then hands it to add_menu_page() as a
 * base64 data URI
 * (includes/dashboard-sidebar/dashboard-sidebar-menu-register.php). There is
 * no .svg beside this file and no PHP copy of the artwork: one literal, read
 * from one place.
 *
 * THE PHP CONTRACT. dashboard-sidebar-menu-register.php looks for the
 * "var MENU_ICON_SVG =" assignment below and takes the single-quoted literal
 * that follows it. Keep that literal on one line, opening with an svg start
 * tag, closing with its end tag, and holding no single quote of its own.
 * Break that shape and the menu quietly falls back to a core dashicon.
 *
 * WHY THE ARTWORK IS FLAT. Core recolours menu icons with
 * wp-admin/js/svg-painter.js, which rewrites every fill attribute, every
 * style attribute and every fill property inside a <style> block to one
 * colour from the user's admin colour scheme. Nothing layered survives that:
 * a gradient flattens to a solid block, and a luminance mask's white
 * rectangle becomes the icon colour and dims the whole mark. So this mark is
 * a single even-odd path - the U outline with the rising arrow punched out of
 * it, clipped to the U so the arrow's tail cannot spill past the edge - with
 * no gradient, no gloss, no drop shadow and no animation.
 *
 * The three animated colour logos live elsewhere and are untouched by this:
 * blocks-category-icon.js, editor-topbar-icon.js and dashboard-brand-icon.js
 * each own one editor surface.
 *
 * SIZE. Core gives menu icons a 20px slot (background-size:20px auto). The
 * mark is 85% of a square viewBox, so it draws about 17px tall, level with
 * the core dashicons above and below it. Resize by changing that ratio here,
 * never with CSS on the menu item.
 *
 * COLOUR. fill is the default scheme's base icon colour, so the icon is
 * already right on first paint, before svg-painter runs.
 *
 * Nothing enqueues this file today; PHP reads it rather than the browser
 * loading it. The export below is here so an admin surface that wants the
 * same mark can use this one instead of pasting a second copy.
 *
 * @package UPLIFTERS_SITE_BUILDER_BLOCKS
 */
(function (window) {
	'use strict';

	if (!window) {
		return;
	}

	var MENU_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-101 -66 888 888"><defs><clipPath id="b"><use href="#a"/></clipPath><path id="a" d="M343 505q30 0 51-15l3-2q8-6 15-17 15-23 18-56V242l2-184q2-31 21-44c12-9 24-13 45-14h120c23 1 36 6 47 16 13 11 18 23 20 47l-1 368q-1 35-18 80l-15 38-3 6-2 4-7 14-3 7-1 1-12 19-3 5-4 6-3 5-2 1-2 4-6 7-3 4-2 2-2 3-31 31-2 1-4 4-1 1-2 2-6 5-4 3-14 10-3 2a423 423 0 0 1-59 32c-89 35-166 35-255 0a335 335 0 0 1-58-32l-4-2-21-16-3-2-1-2-1-1-5-4-2-1-30-31-2-3-2-2-4-4-3-4-5-7-1-1-3-5-4-6-4-5-11-19-1-1-4-7-9-18-2-6-2-5-13-33Q4 466 1 431V63c1-24 6-36 19-47C31 6 44 1 67 0h120c22 1 34 5 45 14q19 13 22 44l1 184v173q3 33 18 56 8 11 16 17l2 2c13 10 33 15 52 15"/></defs><g clip-path="url(#b)"><path fill="#a7aaad" fill-rule="evenodd" d="M343 505q30 0 51-15l3-2q8-6 15-17 15-23 18-56V242l2-184q2-31 21-44c12-9 24-13 45-14h120c23 1 36 6 47 16 13 11 18 23 20 47l-1 368q-1 35-18 80l-15 38-3 6-2 4-7 14-3 7-1 1-12 19-3 5-4 6-3 5-2 1-2 4-6 7-3 4-2 2-2 3-31 31-2 1-4 4-1 1-2 2-6 5-4 3-14 10-3 2a423 423 0 0 1-59 32c-89 35-166 35-255 0a335 335 0 0 1-58-32l-4-2-21-16-3-2-1-2-1-1-5-4-2-1-30-31-2-3-2-2-4-4-3-4-5-7-1-1-3-5-4-6-4-5-11-19-1-1-4-7-9-18-2-6-2-5-13-33Q4 466 1 431V63c1-24 6-36 19-47C31 6 44 1 67 0h120c22 1 34 5 45 14q19 13 22 44l1 184v173q3 33 18 56 8 11 16 17l2 2c13 10 33 15 52 15m-41 259-8-2q-1-2 21-5l23-4a234 234 0 0 0 102-42l16-14 2-2 5-4 28-29 4-4 2-2 2-2 1-2 1-1 2-2 1-1 3-4 3-3 35-53 1-2 4-9c15-27 30-66 40-100l6-20 3-13a433 433 0 0 0 18-113l1-19v-11l1-8 2 1 1 2 3 2 11 6 13 6 10 5 11 5q3 2 8 1 4-4 2-9l-3-10-6-13-21-43-6-12-13-26-7-13-13-25-6-12-7-13-28-49-3-4h-5l-2 1-1 2-3 3-1 2-2 3-3 3-9 15-1 2-2 3-1 3-2 2-4 9-9 16-2 4-2 2-1 3-2 3-1 2-2 3-1 3-2 3-1 3-8 14-2 3-1 2-2 3-6 12-6 12-2 3-3 5-3 7-3 4-2 4-3 5-1 3-2 3-2 3-1 2-1 3a216 216 0 0 0-19 42v1l1 2v1c-1 1 4 3 6 3l6-3 5-2 11-5 6-2 6-3 16-9 2-1h1l1-1 1-1v19l-3 23c-2 9-3 15-11 37-7 22-9 28-16 41l-6 14-1 4-4 8a257 257 0 0 1-51 77l-8 9-3 3-24 23-6 5-1 1-2 2-4 2-1 1-3 3-7 4-28 16-5 3-16 7-13 5-11 3c-35 11-54 14-88 12a227 227 0 0 1-103-23l-4-2-3-1-2-2h-1l-20-13c-12-8-25-21-30-29l-2 1 2 6 2 5 3 5 7 15 3 6 1 2 12 19 3 5 4 7 4 4 1 2 3 3 2 4 3 3 4 5 2 2 2 2 6 7 25 26 2 1 5 4 1 1 1 1 3 3 4 3 3 3 15 10 3 3 22 13 1 1 2 1 2 1 33 16 17 7 15 6 15 5 13 5 13 3 12 4 10 2z"/></g></svg>';

	window.UpliftersSiteBuilderBlocksSidebarMenuIcon = {
		svg: MENU_ICON_SVG,
	};

})(window);
