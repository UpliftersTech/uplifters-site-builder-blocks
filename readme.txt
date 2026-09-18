=== Uplifters Website Builder – Advanced Blocks, Page Builder & Full Site Editor ===
Contributors: uplifters, mwz1
Tags: gutenberg blocks, header footer builder, theme builder, responsive, block editor
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Design responsive websites with visual breakpoint controls, templates, fonts, and advanced tools for headers, footers, posts, login pages, and more.

== Description ==

Uplifters Website Builder is a native WordPress full site editing page builder. It adds 42 responsive Gutenberg blocks and a set of site-building tools to the block editor you already use, instead of replacing it with a separate canvas.

Every block is a real block. Your layouts stay as standard block markup, so your content stays readable if you change themes or deactivate the plugin.

Build headers, footers, row and column layouts, single-post designs, navigation, galleries, carousels, and the rest of your pages from inside the block editor and the Site Editor. Desktop, tablet, and mobile controls sit next to the settings you are already adjusting, so you can tune each screen size without writing a media query.

Blocks load their styles and scripts only when they appear on a page, the bundled fonts are served from your own site, and the plugin adds no telemetry of its own.

= Highlights =

* A global responsive design system that keeps device-specific editing consistent across the Uplifters Website Builder collection.
* See every breakpoint before you publish: switch between desktop, tablet, and mobile previews, then customize each screen size independently.
* Build custom site-wide headers and footers with responsive layouts and sticky-header support.
* Use dynamic, server-rendered blocks that keep posts, pages, navigation, search results, comments, and other site content connected to WordPress.
* Choose from several visual showcase experiences: Image Marquee, Testimonial Carousel, Cover Image Interval, and Image Gallery.
* Create custom single-post designs with dedicated controls for post titles, featured images, metadata, post lists, related posts, and previous/next navigation.
* Assemble flexible page structures with header, footer, column, row, spacer, and shape-divider layouts in the native block editor and Site Editor.
* Wrap any section in Block On Background: a container with a background image, color, or gradient, a darkening overlay, and adjustable width, height, and padding.
* Customize typography with responsive font controls and locally hosted Gravitas One and Oswald fonts, without making a Google Fonts request to display them.
* Find blocks quickly in five dedicated inserter categories: Uplifters Wrapper, Uplifters Text, Uplifters Essentials, Uplifters Media, and Uplifters Post.
* Add buttons, headings, text, images, video embeds, uploaded videos, a live map, icon lists, a countdown, animated counters, an accordion, a scroll popup, an animated loading screen, page menus, live search, social tools, team members, and more.
* Personalize the WordPress login screen with a custom background and logo.
* Manage Uplifters Website Builder from its dedicated dashboard.
* Build without added Uplifters Website Builder telemetry or tracking.
* Comes with a few sensible security touches active out of the box: standard hardening headers (clickjacking and MIME-sniffing protection) and light rate-limiting on the plugin's own endpoints, no setup required.

= Block library =

The plugin includes 42 blocks, grouped in the block inserter into five categories. Header, Footer, Column, Row, and Posts Layout hold their columns and rows directly, so there are no separate section blocks to insert.

* Uplifters Wrapper: Header Layout, Footer Layout, Column Layout, Row Layout, and Block On Background.
* Uplifters Text: Advance Heading, Advance Text, Accordion, and Text List Icon.
* Uplifters Essentials: Button, Site Logo, Page Menu, Selected Pages Grid, Live Search, Social Icons, Copyright Notice, Live Google Map, Countdown, Countup Auto Animate, Popup Scroll Modal, Loading Screen Animated, Scroll To Top, Spacer, Shape Divider, Team Members, and Testimonial Carousel.
* Uplifters Media: Image, Image Gallery, Image Marquee, Cover Image Interval, Video Embed, and Upload Video.
* Uplifters Post: Posts Layout, Post Title, Post Featured Image, Post Metadata, Post List, Related Posts, Post Navigation, Social Share Buttons, Comment Form, and Comments List.

== Installation ==

1. Upload the `uplifters-site-builder-blocks` folder to `/wp-content/plugins/`, or install Uplifters Website Builder through the WordPress Plugins screen.
2. Activate Uplifters Website Builder from the Plugins screen.
3. Open the Uplifters Website Builder dashboard or the WordPress editor/Site Editor.
4. Add blocks from the Uplifters Website Builder inserter categories and adjust their responsive settings as needed.

== Frequently Asked Questions ==

= Does Uplifters Website Builder require a block theme? =

The blocks work in the WordPress block editor. A block theme is recommended when using Uplifters Website Builder for full-site editing, including headers and footers.

= Does Uplifters Website Builder load its fonts from Google? =

No. Gravitas One and Oswald are bundled with the plugin and served locally.

= Does Uplifters Website Builder collect analytics or telemetry? =

No. Uplifters Website Builder does not include its own analytics, telemetry, or tracking service.

= Can I customize the WordPress login page? =

Yes. Administrators can optionally enable a custom login background and logo from the Uplifters Website Builder settings. The feature is disabled by default.

= Does Uplifters Website Builder add any security hardening? =

Yes, a couple of small, widely-recommended touches are on by default: standard response headers (like clickjacking and MIME-sniffing protection) are sent site-wide, and requests to the plugin's own REST and admin-ajax endpoints are lightly rate-limited. Both are always-on, need no configuration, and are scoped so they don't interfere with other plugins.

== Screenshots ==

1. Design visually with a live responsive canvas — switch between desktop, tablet, and mobile and customize each screen size independently.

== External services ==

Most Uplifters Website Builder features operate entirely on your WordPress site. The following blocks contact third-party services only when you configure or use the related feature:

* Live Google Map embeds content from Google Maps and sends the requested location plus normal browser request data (such as IP address and user agent) to Google when the map loads. Google Privacy Policy: https://policies.google.com/privacy
* Video Embed may load videos and thumbnails from providers supplied by the editor, including YouTube and Vimeo. Provider requests can include the video identifier and normal browser request data. Google/YouTube Privacy Policy: https://policies.google.com/privacy — Vimeo Privacy Policy: https://vimeo.com/privacy
* Social Share Buttons open the selected sharing service after a visitor clicks a button. The current page URL and, where supported, its title are sent to that service. Supported destinations include Facebook, X, WhatsApp, Reddit, and the visitor's email handler. Their respective terms and privacy policies apply.

Site owners are responsible for informing visitors about configured embeds and services and for obtaining consent where required.

== Third-party software and assets ==

Uplifters Website Builder uses Motion, React Icons, WordPress Icons, WordPress Dashicons, Gravitas One, and Oswald. React Icons supplies icons from several upstream icon projects. Copyright notices, icon-family details, source links, and license information are in `third-party-licenses.txt`.

== Source code ==

The compiled JavaScript and CSS in this plugin's `build/` directory are generated from source with `@wordpress/scripts` (webpack + Babel). Source: https://github.com/UpliftersTech/uplifters-site-builder-blocks — build command: `npm install && npm run build` (`wp-scripts build --blocks-manifest`).

== Support ==

Uplifters Website Builder is owned and published on WordPress.org by the Uplifters brand account, `uplifters`.

Official WordPress.org support-forum participation is handled by `mwz1`, the maintainer's individual account. The `uplifters` brand account is not used to interact with forum users.

You may also contact Uplifters LLC at upliftersllc.us@gmail.com.

== Changelog ==

= 1.0.3 =
* New: Header, Footer, Column, Row, and Posts Layout can order their items differently on tablet and mobile.
* New: Header and Footer Layout offer 1 to 6 resizable columns with gap, height, and alignment controls. Footer Layout adds Stack on Mobile, and Posts Layout adds a row gap.
* Changed: Layout blocks no longer use section blocks or starter templates. Add, remove, and fill columns and rows directly.
* Changed: Row Layout rebuilt. Each block is its own row, with an Add More button and a delete button on every row.
* Improved: The dashboard filters blocks by inserter category, with a refreshed header and a better fit on small screens.
* Fixed: Garbled text in the dashboard search and the Post Metadata description, and clipped letters in the editor toolbar title.

= 1.0.2 =
* New: Advance Text block for responsive paragraphs, with typography, color, spacing, and inline formatting controls.
* New: Blocks are grouped into five inserter categories: Uplifters Wrapper, Uplifters Text, Uplifters Essentials, Uplifters Media, and Uplifters Post.
* New: Refreshed Uplifters logo, with a subtle animation on the dashboard, the editor toolbar, and the block inserter. It follows the reduced-motion setting.
* Changed: Block On Background now sits with the layout blocks in Uplifters Wrapper, ready to wrap any section in a background image, color, or gradient.
* Changed: "Heading & Text" is now "Advance Heading" and covers H1 to H6. Paragraph text moved to the new Advance Text block.
* Changed: Video Embed and Upload Video each show a single full-width video, with padding, margin, and border radius controls.
* Changed: Row Layout rebuilt around stacked rows you can add and remove, with responsive divider gap, spacing, border radius, and background color.
* Changed: Column Layout gains responsive padding, margin, and background color controls.
* Changed: Header, Footer, Column, Row, and Posts Layout now manage their own sections, so every section setting lives on the parent layout block.
* Improved: Lighter, faster block editor.
* Fixed: Row Layout keeps even spacing between rows, in the editor and on the front end.
* Fixed: Live Search results stay on screen at every window size.
* Fixed: Testimonial Carousel loops smoothly with any number of testimonials on screen.
* Fixed: Per-device background colors show correctly in tablet and mobile previews.
* Fixed: Column width labels no longer cover the column inserter button.
* Fixed: The dashboard overview is no longer hidden under the tab bar on small screens.

= 1.0.1 =
* Added custom SVG icons for every block, replacing the default block-editor icons in the inserter, list view, and block toolbar.

= 1.0.0 =
* Initial release of the responsive Uplifters Website Builder block library and dashboard.
