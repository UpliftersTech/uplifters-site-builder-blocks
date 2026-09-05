import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AnimatePresence, motion } from 'motion/react';
import { AccordionIconCustom, BlockOnBackground, ButtonSingle, ColumnLayout, CopyrightComponentRearrange, CountdownWithMsg, CountupAutoAnimate, FooterLayout, HeaderLayout, HeadingAdvance, ImageGallery, ImageIntervalCover, ImageMarquee, ImageSingle, LoadingScreenAnimate, LocationMap, PageGrid, PageNav, PopupScrollModal, PostsCommentForm, PostsCommentList, PostsFeaturedImage, PostsLayout, PostsList, PostsMetadata, PostsPreviousNext, PostsRelated, PostsSocialShare, PostsTitle, RowLayout, ScrollToTop, SearchLive, ShapeDivider, SiteLogo, SocialIcon, SpaceAround, TeamMember, TestimonialCarousel, TextListIcon, VideoEmbed, VideoUpload } from '../assets-shared/icon-blocks';

import { Dashicon, EASE, panelEnterProps } from './dashboard-header';

const createBlock = ({ slug, name, description, icon, parent = false }) => {
	const category = parent ? 'parent' : 'individual';
	const categoryLabel = parent ? 'Parent Block' : 'Stand-alone Block';

	return {
		slug,
		name,
		description,
		icon,
		category,
		categoryLabel,
		search: `${slug.replaceAll('-', ' ')} ${name} ${description} ${categoryLabel}`,
	};
};

export const defaultBlocks = [
	createBlock({ slug: 'location-map', name: 'Live Google Location', description: 'Show a named location on an embedded Google Map with a link to Maps.', icon: <LocationMap /> }),
	createBlock({ slug: 'header-layout', name: 'Header Layout', description: 'Build a responsive site header using logo, search, navigation, and button sections.', icon: <HeaderLayout />, parent: true }),
	createBlock({ slug: 'posts-comment-form', name: 'Comment Form', description: 'Let visitors submit comments through a customizable post or page comment form.', icon: <PostsCommentForm /> }),
	createBlock({ slug: 'posts-comment-list', name: 'Comments List', description: 'Display existing comments with avatars, dates, replies, and threaded discussions.', icon: <PostsCommentList /> }),
	createBlock({ slug: 'posts-metadata', name: 'Post Metadata', description: 'Display the current post\'s author, category, and publication date.', icon: <PostsMetadata /> }),
	createBlock({ slug: 'accordion-icon-custom', name: 'Accordion', description: 'Organize expandable headings and content into customizable accordion panels.', icon: <AccordionIconCustom /> }),
	createBlock({ slug: 'block-on-background', name: 'Block On Background', description: 'Wrap inner blocks in a container with a background image, color, or gradient, plus adjustable dimensions, padding, and a darkening overlay.', icon: <BlockOnBackground /> }),
	createBlock({ slug: 'button-single', name: 'Button', description: 'Add a responsive button with custom text, link, alignment, colors, and spacing.', icon: <ButtonSingle /> }),
	createBlock({ slug: 'column-layout', name: 'Column Layout', description: 'Create a responsive multi-column layout with selectable and resizable columns.', icon: <ColumnLayout />, parent: true }),
	createBlock({ slug: 'copyright-component-rearrange', name: 'Copyright Notice', description: 'Display a customizable copyright line with automatic or fixed year options.', icon: <CopyrightComponentRearrange /> }),
	createBlock({ slug: 'countdown-with-msg', name: 'Countdown with Message', description: 'Responsive countdown timer block with global responsive editing support.', icon: <CountdownWithMsg /> }),
	createBlock({ slug: 'countup-auto-animate', name: 'Countup Animation', description: 'Present multiple statistics with numbers that animate automatically into view.', icon: <CountupAutoAnimate /> }),
	createBlock({ slug: 'image-interval-cover', name: 'Cover Slideshow', description: 'Display a responsive animated image grid with captions and slide indicators.', icon: <ImageIntervalCover /> }),
	createBlock({ slug: 'footer-layout', name: 'Footer Layout', description: 'Build a responsive site footer using logo, page links, social icons, and copyright content.', icon: <FooterLayout />, parent: true }),
	createBlock({ slug: 'heading-advance', name: 'Heading & Text', description: 'Add a heading and body text with responsive typography and styling controls.', icon: <HeadingAdvance /> }),
	createBlock({ slug: 'image-single', name: 'Custom Image', description: 'Display a responsive image with caption, link, sizing, and styling options.', icon: <ImageSingle /> }),
	createBlock({ slug: 'image-gallery', name: 'Image Gallery', description: 'Create a responsive gallery with clickable images and preview links.', icon: <ImageGallery /> }),
	createBlock({ slug: 'image-marquee', name: 'Image Ticker', description: 'Display images in a continuously scrolling, responsive marquee.', icon: <ImageMarquee /> }),
	createBlock({ slug: 'loading-screen-animate', name: 'Animated Loading Screen', description: 'Show a customizable loading overlay while the page is being prepared.', icon: <LoadingScreenAnimate /> }),
	createBlock({ slug: 'page-grid', name: 'Selected Pages Grid', description: 'Display selected site pages as a responsive grid of linked page titles.', icon: <PageGrid /> }),
	createBlock({ slug: 'page-nav', name: 'Page Menu', description: 'Create a responsive navigation menu from selected WordPress pages.', icon: <PageNav /> }),
	createBlock({ slug: 'popup-scroll-modal', name: 'Scroll Popup Modal', description: 'Display customizable block content in a popup after the visitor scrolls a set distance.', icon: <PopupScrollModal /> }),
	createBlock({ slug: 'posts-featured-image', name: 'Post Featured Image', description: 'Style the featured image of the post this block is placed in.', icon: <PostsFeaturedImage /> }),
	createBlock({ slug: 'posts-list', name: 'Post List', description: 'Display WordPress posts in customizable list, grid, or compact layouts.', icon: <PostsList /> }),
	createBlock({ slug: 'posts-previous-next', name: 'Post Navigation', description: 'Add previous and next post links to a single-post template.', icon: <PostsPreviousNext /> }),
	createBlock({ slug: 'posts-related', name: 'Related Posts', description: 'Automatically display related posts based on shared categories or tags.', icon: <PostsRelated /> }),
	createBlock({ slug: 'posts-title', name: 'Post Title', description: 'Style the title of the post this block is placed in.', icon: <PostsTitle /> }),
	createBlock({ slug: 'row-layout', name: 'Row Layout', description: 'Create a responsive vertical layout with selectable and resizable content rows.', icon: <RowLayout />, parent: true }),
	createBlock({ slug: 'scroll-to-top', name: 'Scroll To Top', description: 'A floating button that scrolls the page back to the top.', icon: <ScrollToTop /> }),
	createBlock({ slug: 'search-live', name: 'Live Search', description: 'Search site content instantly and display results as the visitor types.', icon: <SearchLive /> }),
	createBlock({ slug: 'shape-divider', name: 'Shape Divider', description: 'Responsive SVG section divider with a customizable separator line for Gutenberg FSE.', icon: <ShapeDivider /> }),
	createBlock({ slug: 'site-logo', name: 'Site Logo', description: 'Display a responsive site logo with optional homepage linking and custom styling.', icon: <SiteLogo /> }),
	createBlock({ slug: 'social-icon', name: 'Social Icons', description: 'Add linked social media icons with customizable styles, spacing, and alignment.', icon: <SocialIcon /> }),
	createBlock({ slug: 'posts-social-share', name: 'Social Share Buttons', description: 'Let visitors share the current post through social networks, email, or a copied link.', icon: <PostsSocialShare /> }),
	createBlock({ slug: 'space-around', name: 'Spacer All-Around', description: 'Adds responsive vertical and horizontal space with optional background color.', icon: <SpaceAround /> }),
	createBlock({ slug: 'team-member', name: 'Team Members', description: 'Present team member photos, names, and roles in customizable profile cards.', icon: <TeamMember /> }),
	createBlock({ slug: 'testimonial-carousel', name: 'Testimonial Carousel', description: 'Display customer testimonials in a responsive carousel with autoplay and navigation.', icon: <TestimonialCarousel /> }),
	createBlock({ slug: 'text-list-icon', name: 'Text List Icon', description: 'Create a responsive text list with customizable icons, symbols, or markers.', icon: <TextListIcon /> }),
	createBlock({ slug: 'video-embed', name: 'Video Embed', description: 'Display multiple embedded videos (YouTube, Vimeo, etc.) in a responsive grid.', icon: <VideoEmbed /> }),
	createBlock({ slug: 'video-upload', name: 'Upload Video', description: 'Multiple videos grid with per-item sizing and spacing.', icon: <VideoUpload /> }),
	createBlock({ slug: 'posts-layout', name: 'Posts Layout', description: 'A dynamic parent layout block for building post templates with responsive inner blocks.', icon: <PostsLayout />, parent: true }),
	];

export const defaultCategories = [
	{ id: 'individual', label: 'Stand-alone Blocks' },
	{ id: 'parent', label: 'Parent Blocks' },
];


export function BlocksPanel({ blocks, categories, reduceMotion }) {
	const [activeFilter, setActiveFilter] = useState('all');
	const [query, setQuery] = useState('');

	const visibleBlocks = useMemo(() => {
		const search = query.trim().toLowerCase();
		return blocks.filter((block) => {
			const categoryMatches = activeFilter === 'all' || block.category === activeFilter;
			const haystack = String(block.search || `${block.name} ${block.category} ${block.description}`).toLowerCase();
			const searchMatches = !search || haystack.includes(search);
			return categoryMatches && searchMatches;
		});
	}, [activeFilter, blocks, query]);

	return (
		<section id="uplifters-site-builder-blocks-blocks" className="uplifters-site-builder-blocks-panel" role="tabpanel" aria-labelledby="uplifters-site-builder-blocks-tab-blocks">
			<motion.div {...panelEnterProps(reduceMotion)}>
				<div className="uplifters-site-builder-blocks-section-heading uplifters-site-builder-blocks-library-heading">
					<div><span>{__('The complete toolkit', 'uplifters-site-builder-blocks')}</span><h2>{__('Find the right block instantly.', 'uplifters-site-builder-blocks')}</h2></div>
					<label className="uplifters-site-builder-blocks-search">
						<Dashicon icon="search" />
						<input id="uplifters-site-builder-blocks-block-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={__('Search blocksâ€¦', 'uplifters-site-builder-blocks')} />
					</label>
				</div>
				<div className="uplifters-site-builder-blocks-library-bar">
					<div className="uplifters-site-builder-blocks-filters" role="group" aria-label={__('Filter blocks', 'uplifters-site-builder-blocks')}>
						<FilterButton id="all" label={__('All', 'uplifters-site-builder-blocks')} activeFilter={activeFilter} setActiveFilter={setActiveFilter} reduceMotion={reduceMotion} />
						{categories.map((category) => (
							<FilterButton key={category.id} id={category.id} label={category.label} activeFilter={activeFilter} setActiveFilter={setActiveFilter} reduceMotion={reduceMotion} />
						))}
					</div>
					<span className="uplifters-site-builder-blocks-result-count"><strong id="uplifters-site-builder-blocks-visible-count">{visibleBlocks.length}</strong> {__('blocks', 'uplifters-site-builder-blocks')}</span>
				</div>

				<div className="uplifters-site-builder-blocks-block-grid" id="uplifters-site-builder-blocks-block-grid">
					<AnimatePresence initial={false}>
						{visibleBlocks.map((block, index) => (
							<motion.article
								key={block.name}
								className="uplifters-site-builder-blocks-block-card is-visible"
								data-category={block.category}
								initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
								animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
								exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
								transition={{ duration: 0.38, delay: Math.min(index, 10) * 0.025, ease: EASE }}
								whileHover={reduceMotion ? undefined : { y: -4 }}
							>
								<div className="uplifters-site-builder-blocks-block-icon" aria-hidden="true">{block.icon}</div>
								<div><h3>{block.name}</h3><p>{block.description}</p></div>
								<span className="uplifters-site-builder-blocks-card-arrow dashicons dashicons-arrow-up-alt2" aria-hidden="true" />
							</motion.article>
						))}
					</AnimatePresence>
				</div>

				<AnimatePresence>
					{visibleBlocks.length === 0 ? (
						<motion.div id="uplifters-site-builder-blocks-empty-state" className="uplifters-site-builder-blocks-empty" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: 8 }} transition={{ duration: 0.34, ease: EASE }}>
							<Dashicon icon="search" /><h3>{__('No blocks found', 'uplifters-site-builder-blocks')}</h3><p>{__('Try another search or category.', 'uplifters-site-builder-blocks')}</p>
						</motion.div>
					) : null}
				</AnimatePresence>
			</motion.div>
		</section>
	);
}

function FilterButton({ id, label, activeFilter, setActiveFilter, reduceMotion }) {
	const isActive = activeFilter === id;

	return (
		<motion.button type="button" className={isActive ? 'is-active' : undefined} data-filter={id} aria-pressed={isActive} onClick={() => setActiveFilter(id)} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
			{label}
		</motion.button>
	);
}
