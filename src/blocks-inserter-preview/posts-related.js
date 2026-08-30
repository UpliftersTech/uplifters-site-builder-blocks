import { motion } from 'motion/react';

import { frame, stage, title, imageTile, EASE } from './inserter-shared';

export default function PostsRelatedPreview() {
	const posts = [ 'More Tips', 'Case Study' ];

	return (
		<div style={ frame }>
			<p style={ { ...title, fontSize: '0.9em', marginBottom: '0.5em' } }>
				Related Posts
			</p>
			<div style={ { ...stage, flexDirection: 'row', alignItems: 'stretch', gap: '0.6em' } }>
				{ posts.map( ( label, i ) => (
					<motion.article
						key={ label }
						animate={ {
							opacity: [ 0.3, 1, 1, 0.3 ],
							scale: [ 0.92, 1, 1, 0.92 ],
						} }
						transition={ {
							duration: 2.2,
							repeat: Infinity,
							delay: i * 0.18,
							times: [ 0, 0.25, 0.8, 1 ],
							ease: EASE,
						} }
						style={ {
							flex: 1,
							minHeight: '9.1em',
							display: 'flex',
							flexDirection: 'column',
							border: '1px solid #e2e8f0',
							borderRadius: '0.6em',
							overflow: 'hidden',
						} }
					>
						<div style={ { ...imageTile, fontSize: '1.3em', borderRadius: 0 } }>
							▧
						</div>
						<div style={ { padding: '0.5em' } }>
							<strong style={ { fontSize: '0.75em' } }>{ label }</strong>
						</div>
					</motion.article>
				) ) }
			</div>
		</div>
	);
}
