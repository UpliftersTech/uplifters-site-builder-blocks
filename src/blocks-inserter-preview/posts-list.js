import { motion } from 'motion/react';

import { frame, stage, imageTile, muted, EASE } from './inserter-shared';

export default function PostsListPreview() {
	const posts = [ 'Getting Started', 'Designing Better Pages' ];

	return (
		<div style={ frame }>
			<div style={ { ...stage, flexDirection: 'row', alignItems: 'stretch', gap: '0.6em' } }>
				{ posts.map( ( label, i ) => (
					<motion.article
						key={ label }
						animate={ {
							opacity: [ 0.3, 1, 1, 0.3 ],
							y: [ '0.6em', '0em', '0em', '0.6em' ],
						} }
						transition={ {
							duration: 2.6,
							repeat: Infinity,
							delay: i * 0.2,
							times: [ 0, 0.25, 0.8, 1 ],
							ease: EASE,
						} }
						style={ {
							flex: 1,
							minHeight: 0,
							display: 'flex',
							flexDirection: 'column',
							border: '1px solid #e2e8f0',
							borderRadius: '0.6em',
							overflow: 'hidden',
						} }
					>
						<div style={ { ...imageTile, fontSize: '1.4em', borderRadius: 0 } }>
							▧
						</div>
						<div style={ { padding: '0.5em' } }>
							<strong style={ { fontSize: '0.78em' } }>{ label }</strong>
							<p style={ { ...muted, fontSize: '0.68em' } }>
								Short post summary…
							</p>
						</div>
					</motion.article>
				) ) }
			</div>
		</div>
	);
}
