import { motion } from 'motion/react';

import { frame, stage, EASE } from './inserter-shared';

export default function ButtonSinglePreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { position: 'relative', display: 'grid', placeItems: 'center' } }>
					<motion.span
						animate={ { scale: [ 1, 1.7 ], opacity: [ 0.5, 0 ] } }
						transition={ {
							duration: 1.4,
							repeat: Infinity,
							repeatDelay: 0.6,
							ease: 'easeOut',
						} }
						style={ {
							position: 'absolute',
							inset: 0,
							borderRadius: '0.6em',
							background: '#111827',
						} }
					/>
					<motion.span
						animate={ { scale: [ 1, 0.94, 1 ] } }
						transition={ {
							duration: 1.4,
							repeat: Infinity,
							repeatDelay: 0.6,
							ease: EASE,
						} }
						style={ {
							position: 'relative',
							padding: '0.9em 1.8em',
							borderRadius: '0.6em',
							background: '#111827',
							color: '#fff',
							fontSize: '1.2em',
							fontWeight: 650,
							whiteSpace: 'nowrap',
						} }
					>
						Click Me
					</motion.span>
				</div>
			</div>
		</div>
	);
}
