import { motion } from 'motion/react';

import { frame, stage, row, EASE } from './inserter-shared';

export default function PostsMetadataPreview() {
	const parts = [ 'Alex Morgan', '•', 'News', '•', 'July 22, 2026' ];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { ...row, fontSize: '1.05em', fontWeight: 600, gap: '0.5em', flexWrap: 'wrap', justifyContent: 'center' } }>
					{ parts.map( ( part, i ) => (
						<motion.span
							key={ `${ part }-${ i }` }
							animate={ { opacity: [ 0, 1 ], y: [ '0.3em', '0em' ] } }
							transition={ {
								duration: 0.4,
								repeat: Infinity,
								repeatDelay: 2.2,
								delay: i * 0.15,
								ease: EASE,
							} }
						>
							{ part }
						</motion.span>
					) ) }
				</div>
			</div>
		</div>
	);
}
