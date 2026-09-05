=== Uplifters Website Builder – Advanced Blocks, Page Builder & Full Site Editor ===
Contributors: uplifters, mwz1
Tags: gutenberg blocks, header footer builder, theme builder, responsive, block editor
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build responsive pages and full-site layouts with Gutenberg blocks, live breakpoint controls, templates, and advanced design tools.

== Description ==

Uplifters Website Builder is a native WordPress full-site editing page builder from Uplifters. It adds responsive Gutenberg blocks and site-building tools without replacing the WordPress block editor.

Create headers, footers, columns, row layouts, content sections, post templates, navigation, galleries, carousels, forms, and other page elements. Desktop, tablet, and mobile controls help you tune layouts for each screen size.

= Highlights =

* A global responsive design system that keeps device-specific editing consistent across the Uplifters Website Builder collection.
* See every breakpoint before you publish: switch between desktop, tablet, and mobile previews, then customize each screen size independently.
* Build custom site-wide headers and footers with responsive layouts and sticky-header support.
* Use dynamic, server-rendered blocks that keep posts, pages, navigation, search results, comments, and other site content connected to WordPress.
* Choose from several visual showcase experiences: Image Marquee, Testimonial Carousel, Cover Image Interval, and Image Gallery.
* Create custom single-post designs with dedicated controls for post titles, featured images, metadata, post lists, related posts, and previous/next navigation.
* Assemble flexible page structures with header, footer, column, row, spacer, and shape-divider layouts in the native block editor and Site Editor.
* Customize typography with responsive font controls and locally hosted Gravitas One and Oswald fonts, without making a Google Fonts request to display them.
* Add buttons, headings, text, images, video embeds, uploaded video grids, a live map, icon lists, a countdown, animated counters, an accordion, a scroll popup, an animated loading screen, page menus, live search, social tools, team members, and more.
* Personalize the WordPress login screen with a custom background and logo.
* Manage Uplifters Website Builder from its dedicated dashboard.
* Build without added Uplifters Website Builder telemetry or tracking.
* Comes with a few sensible security touches active out of the box: standard hardening headers (clickjacking and MIME-sniffing protection) and light rate-limiting on the plugin's own endpoints, no setup required.

= Block library =

The plugin includes 46 block manifests. Five of them (Header Section, Footer Section, Columns Section, Row Section, and Posts Section) are internal section/child blocks used by their parent layout block rather than inserted directly. User-facing blocks include:

* Layout: Header Layout, Footer Layout, Column Layout, Row Layout, Posts Layout, Spacer, Shape Divider, and Block On Background.
* Content: Button, Heading & Text, Image, Image Gallery, Image Marquee, Cover Image Interval, Video Embed Grid, Video Grid Uploaded, Live Google Map, Text List Icon, Countdown, Countup Auto Animate, Accordion, Popup Scroll Modal, Loading Screen Animated, and Scroll To Top.
* Site and navigation: Site Logo, Page Menu, Selected Pages Grid, Live Search, Social Icons, Social Share Buttons, and Copyright Notice.
* Posts and discussion: Post Title, Post Featured Image, Post Metadata, Post List, Related Posts, Post Navigation, Comment Form, and Comments List.
* People and proof: Team Members and Testimonial Carousel.

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

== External services ==

Most Uplifters Website Builder features operate entirely on your WordPress site. The following blocks contact third-party services only when you configure or use the related feature:

* Live Google Map embeds content from Google Maps and sends the requested location plus normal browser request data (such as IP address and user agent) to Google when the map loads. Google Privacy Policy: https://policies.google.com/privacy
* Video Embed Grid may load videos and thumbnails from providers supplied by the editor, including YouTube and Vimeo. Provider requests can include the video identifier and normal browser request data. Google/YouTube Privacy Policy: https://policies.google.com/privacy — Vimeo Privacy Policy: https://vimeo.com/privacy
* Social Share Buttons open the selected sharing service after a visitor clicks a button. The current page URL and, where supported, its title are sent to that service. Supported destinations include Facebook, X, WhatsApp, Reddit, and the visitor's email handler. Their respective terms and privacy policies apply.

Site owners are responsible for informing visitors about configured embeds and services and for obtaining consent where required.

== Third-party software and assets ==

Uplifters Website Builder uses Motion, React Icons, WordPress Dashicons, Gravitas One, and Oswald. React Icons supplies icons from several upstream icon projects. Copyright notices, icon-family details, source links, and license information are in `third-party-licenses.txt`.

== Source code ==

The compiled JavaScript and CSS in this plugin's `build/` directory are generated from source with `@wordpress/scripts` (webpack + Babel). Source: https://github.com/UpliftersTech/uplifters-site-builder-blocks — build command: `npm install && npm run build` (`wp-scripts build --blocks-manifest`).

== Support ==

Uplifters Website Builder is owned and published on WordPress.org by the Uplifters brand account, `uplifters`.

Official WordPress.org support-forum participation is handled by `mwz1`, the maintainer's individual account. The `uplifters` brand account is not used to interact with forum users.

You may also contact Uplifters LLC at upliftersllc.us@gmail.com.

== Changelog ==

= 1.0.1 =
* Added custom SVG icons for every block, replacing the default block-editor icons in the inserter, list view, and block toolbar.

= 1.0.0 =
* Initial release of the responsive Uplifters Website Builder block library and dashboard.
