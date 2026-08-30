import { motion } from 'motion/react';

import { frame, stage, chip, EASE } from './inserter-shared';

export default function PostsPreviousNextPreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', width: '100%', justifyContent: 'space-between' } }>
					<motion.span
						animate={ { x: [ '-0.6em', '0em', '-0.6em' ], opacity: [ 0.5, 1, 0.5 ] } }
						transition={ { duration: 2.2, repeat: Infinity, ease: EASE } }
						style={ {
							...chip,
							border: '1px solid #d1d5db',
							color: '#111827',
						} }
					>
						← Previous Post
					</motion.span>
					<motion.span
						animate={ { x: [ '0.6em', '0em', '0.6em' ], opacity: [ 0.5, 1, 0.5 ] } }
						transition={ { duration: 2.2, repeat: Infinity, ease: EASE } }
						style={ {
							...chip,
							border: '1px solid #d1d5db',
							color: '#111827',
						} }
					>
						Next Post →
					</motion.span>
				</div>
			</div>
		</div>
	);
}
