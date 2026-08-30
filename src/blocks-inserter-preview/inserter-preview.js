/**
 * Stable, data-free representations used only by Gutenberg's inserter preview.
 *
 * Live editor canvases keep using each block's real edit component. The block
 * examples opt into this component with the private `preview` attribute so the
 * inserter never depends on REST responses, selected media, or editor state.
 *
 * Every block gets its own dedicated preview file in this directory, keyed by
 * the block's folder/slug name, so the inserter panel shows something specific
 * to that block instead of Gutenberg's generic (often blank) default preview.
 *
 * Section blocks that simply wrap their parent layout block (header-section,
 * footer-section, column-section, row-section, posts-section) intentionally
 * have no dedicated preview here and fall through to Gutenberg's default.
 */

import AccordionIconCustomPreview from './accordion-icon-custom';
import BlockOnBackgroundPreview from './block-on-background';
import ButtonSinglePreview from './button-single';
import ColumnLayoutPreview from './column-layout';
import CopyrightComponentRearrangePreview from './copyright-component-rearrange';
import CountdownWithMsgPreview from './countdown-with-msg';
import CountupAutoAnimatePreview from './countup-auto-animate';
import FooterLayoutPreview from './footer-layout';
import HeaderLayoutPreview from './header-layout';
import HeadingAdvancePreview from './heading-advance';
import ImageGalleryPreview from './image-gallery';
import ImageIntervalCoverPreview from './image-interval-cover';
import ImageMarqueePreview from './image-marquee';
import ImageSinglePreview from './image-single';
import LoadingScreenAnimatePreview from './loading-screen-animate';
import LocationMapPreview from './location-map';
import PageGridPreview from './page-grid';
import PageNavPreview from './page-nav';
import PopupScrollModalPreview from './popup-scroll-modal';
import PostsCommentFormPreview from './posts-comment-form';
import PostsCommentListPreview from './posts-comment-list';
import PostsFeaturedImagePreview from './posts-featured-image';
import PostsLayoutPreview from './posts-layout';
import PostsListPreview from './posts-list';
import PostsMetadataPreview from './posts-metadata';
import PostsPreviousNextPreview from './posts-previous-next';
import PostsRelatedPreview from './posts-related';
import PostsSocialSharePreview from './posts-social-share';
import PostsTitlePreview from './posts-title';
import RowLayoutPreview from './row-layout';
import ScrollToTopPreview from './scroll-to-top';
import SearchLivePreview from './search-live';
import ShapeDividerPreview from './shape-divider';
import SiteLogoPreview from './site-logo';
import SocialIconPreview from './social-icon';
import SpaceAroundPreview from './space-around';
import TeamMemberPreview from './team-member';
import TestimonialCarouselPreview from './testimonial-carousel';
import TextListIconPreview from './text-list-icon';
import VideoEmbedPreview from './video-embed';
import VideoUploadPreview from './video-upload';

const PREVIEWS = {
	'accordion-icon-custom': AccordionIconCustomPreview,
	'block-on-background': BlockOnBackgroundPreview,
	'button-single': ButtonSinglePreview,
	'column-layout': ColumnLayoutPreview,
	'copyright-component-rearrange': CopyrightComponentRearrangePreview,
	'countdown-with-msg': CountdownWithMsgPreview,
	'countup-auto-animate': CountupAutoAnimatePreview,
	'footer-layout': FooterLayoutPreview,
	'header-layout': HeaderLayoutPreview,
	'heading-advance': HeadingAdvancePreview,
	'image-gallery': ImageGalleryPreview,
	'image-interval-cover': ImageIntervalCoverPreview,
	'image-marquee': ImageMarqueePreview,
	'image-single': ImageSinglePreview,
	'loading-screen-animate': LoadingScreenAnimatePreview,
	'location-map': LocationMapPreview,
	'page-grid': PageGridPreview,
	'page-nav': PageNavPreview,
	'popup-scroll-modal': PopupScrollModalPreview,
	'posts-comment-form': PostsCommentFormPreview,
	'posts-comment-list': PostsCommentListPreview,
	'posts-featured-image': PostsFeaturedImagePreview,
	'posts-layout': PostsLayoutPreview,
	'posts-list': PostsListPreview,
	'posts-metadata': PostsMetadataPreview,
	'posts-previous-next': PostsPreviousNextPreview,
	'posts-related': PostsRelatedPreview,
	'posts-social-share': PostsSocialSharePreview,
	'posts-title': PostsTitlePreview,
	'row-layout': RowLayoutPreview,
	'scroll-to-top': ScrollToTopPreview,
	'search-live': SearchLivePreview,
	'shape-divider': ShapeDividerPreview,
	'site-logo': SiteLogoPreview,
	'social-icon': SocialIconPreview,
	'space-around': SpaceAroundPreview,
	'team-member': TeamMemberPreview,
	'testimonial-carousel': TestimonialCarouselPreview,
	'text-list-icon': TextListIconPreview,
	'video-embed': VideoEmbedPreview,
	'video-upload': VideoUploadPreview,
};

export default function InserterPreview( { type } ) {
	const Preview = PREVIEWS[ type ];
	return Preview ? <Preview /> : null;
}
