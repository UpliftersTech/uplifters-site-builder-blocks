/**
 * Stable, data-free representations used only by Gutenberg's inserter preview.
 *
 * Live editor canvases keep using each block's real edit component. The block
 * examples opt into this component with the private `preview` attribute so the
 * inserter never depends on REST responses, selected media, or editor state.
 *
 * Every block gets its own dedicated preview file in blocks-inserter-animation/,
 * keyed by the block's folder/slug name, so the inserter panel shows something
 * specific to that block instead of Gutenberg's generic (often blank) default
 * preview.
 *
 * The layout blocks no longer have section children — every inner block is a
 * row or column of the layout itself — so there is nothing here for the
 * legacy *-section block names, which only exist server-side to keep already
 * saved pages rendering.
 */

import AccordionIconCustomPreview from './blocks-inserter-animation/accordion-icon-custom';
import BlockOnBackgroundPreview from './blocks-inserter-animation/block-on-background';
import ButtonSinglePreview from './blocks-inserter-animation/button-single';
import ColumnLayoutPreview from './blocks-inserter-animation/column-layout';
import CopyrightComponentRearrangePreview from './blocks-inserter-animation/copyright-component-rearrange';
import CountdownWithMsgPreview from './blocks-inserter-animation/countdown-with-msg';
import CountupAutoAnimatePreview from './blocks-inserter-animation/countup-auto-animate';
import FooterLayoutPreview from './blocks-inserter-animation/footer-layout';
import HeaderLayoutPreview from './blocks-inserter-animation/header-layout';
import HeadingAdvancePreview from './blocks-inserter-animation/heading-advance';
import ImageGalleryPreview from './blocks-inserter-animation/image-gallery';
import ImageIntervalCoverPreview from './blocks-inserter-animation/image-interval-cover';
import ImageMarqueePreview from './blocks-inserter-animation/image-marquee';
import ImageSinglePreview from './blocks-inserter-animation/image-single';
import LoadingScreenAnimatePreview from './blocks-inserter-animation/loading-screen-animate';
import LocationMapPreview from './blocks-inserter-animation/location-map';
import PageGridPreview from './blocks-inserter-animation/page-grid';
import PageNavPreview from './blocks-inserter-animation/page-nav';
import ParagraphAdvancePreview from './blocks-inserter-animation/paragraph-advance';
import PopupScrollModalPreview from './blocks-inserter-animation/popup-scroll-modal';
import PostsCommentFormPreview from './blocks-inserter-animation/posts-comment-form';
import PostsCommentListPreview from './blocks-inserter-animation/posts-comment-list';
import PostsFeaturedImagePreview from './blocks-inserter-animation/posts-featured-image';
import PostsLayoutPreview from './blocks-inserter-animation/posts-layout';
import PostsListPreview from './blocks-inserter-animation/posts-list';
import PostsMetadataPreview from './blocks-inserter-animation/posts-metadata';
import PostsPreviousNextPreview from './blocks-inserter-animation/posts-previous-next';
import PostsRelatedPreview from './blocks-inserter-animation/posts-related';
import PostsSocialSharePreview from './blocks-inserter-animation/posts-social-share';
import PostsTitlePreview from './blocks-inserter-animation/posts-title';
import RowLayoutPreview from './blocks-inserter-animation/row-layout';
import ScrollToTopPreview from './blocks-inserter-animation/scroll-to-top';
import SearchLivePreview from './blocks-inserter-animation/search-live';
import ShapeDividerPreview from './blocks-inserter-animation/shape-divider';
import SiteLogoPreview from './blocks-inserter-animation/site-logo';
import SocialIconPreview from './blocks-inserter-animation/social-icon';
import SpaceAroundPreview from './blocks-inserter-animation/space-around';
import TeamMemberPreview from './blocks-inserter-animation/team-member';
import TestimonialCarouselPreview from './blocks-inserter-animation/testimonial-carousel';
import TextListIconPreview from './blocks-inserter-animation/text-list-icon';
import VideoEmbedPreview from './blocks-inserter-animation/video-embed';
import VideoUploadPreview from './blocks-inserter-animation/video-upload';

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
	'paragraph-advance': ParagraphAdvancePreview,
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
