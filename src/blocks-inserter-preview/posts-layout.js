import { motion } from 'motion/react';

import { frame, eyebrow } from './inserter-shared';
import PostsTitlePreview from './posts-title';
import PostsMetadataPreview from './posts-metadata';
import PostsSocialSharePreview from './posts-social-share';
import PostsFeaturedImagePreview from './posts-featured-image';
import HeadingAdvancePreview from './heading-advance';
import PostsPreviousNextPreview from './posts-previous-next';
import PostsRelatedPreview from './posts-related';
import PostsCommentFormPreview from './posts-comment-form';
import PostsCommentListPreview from './posts-comment-list';

/*
 * The "Full Post Layout" template option (see edit.js POSTS_TEMPLATE_OPTIONS)
 * fills its posts-section with exactly these 9 inner blocks, in this order.
 * Reuse each block's own dedicated inserter-preview component here instead of
 * a second, parallel set of mini demos — and instead of a scrolling list of
 * block *names*, actually show what each block looks like as the track
 * scrolls past it, one full demo at a time.
 */
const DEMOS = [
	PostsTitlePreview,
	PostsMetadataPreview,
	PostsSocialSharePreview,
	PostsFeaturedImagePreview,
	HeadingAdvancePreview,
	PostsPreviousNextPreview,
	PostsRelatedPreview,
	PostsCommentFormPreview,
	PostsCommentListPreview,
];

const VISIBLE = 1;
const TOTAL = DEMOS.length; // 9
// Repeat the first `VISIBLE` demo(s) at the end of the track so the scroll
// can wrap seamlessly: once it has shifted past all 9 unique demos, the
// visible window shows the appended duplicate of demo #1 — identical to the
// real starting position — so resetting `y` to 0 is imperceptible.
const TRACK_LENGTH = TOTAL + VISIBLE;
const SHIFT_PERCENT = ( TOTAL / TRACK_LENGTH ) * 100;

// One full loop scrolls past all 9 demos in ~7s — inside the intended 5-8s
// window for this preview.
const DURATION = 10;

export default function PostsLayoutPreview() {
	const track = Array.from(
		{ length: TRACK_LENGTH },
		( _, i ) => DEMOS[ i % TOTAL ]
	);

	return (
		<div style={ { ...frame, border: '2px dashed #94a3b8', overflow: 'hidden' } }>
			<p style={ eyebrow }>Posts Layout</p>
			<div style={ { flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' } }>
				<motion.div
					animate={ { y: [ '0%', `-${ SHIFT_PERCENT }%` ] } }
					transition={ { duration: DURATION, repeat: Infinity, ease: 'linear' } }
					style={ {
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						height: `${ ( TRACK_LENGTH / VISIBLE ) * 100 }%`,
					} }
				>
					{ track.map( ( Demo, i ) => (
						<div
							key={ i }
							style={ {
								flex: `0 0 ${ 100 / TRACK_LENGTH }%`,
								width: '100%',
								minHeight: 0,
								boxSizing: 'border-box',
							} }
						>
							<Demo />
						</div>
					) ) }
				</motion.div>
			</div>
		</div>
	);
}
