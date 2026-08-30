import { motion } from 'motion/react';

import { frame, stage, imageTile, muted, EASE } from './inserter-shared';

export default function ImageSinglePreview() {
	return (
		<div style={ frame }>
			<div style={ { ...stage, gap: '0.5em' } }>
				<motion.div
					animate={ { opacity: [ 0, 1, 1, 0 ], scale: [ 0.92, 1, 1, 0.92 ] } }
					transition={ {
						duration: 2.6,
						repeat: Infinity,
						times: [ 0, 0.2, 0.85, 1 ],
						ease: EASE,
					} }
					style={ { ...imageTile, width: '100%' } }
				>
					▧
				</motion.div>
				<motion.p
					animate={ { opacity: [ 0, 0, 1, 0 ] } }
					transition={ {
						duration: 2.6,
						repeat: Infinity,
						times: [ 0, 0.3, 0.5, 1 ],
						ease: EASE,
					} }
					style={ { ...muted, textAlign: 'center', flex: '0 0 auto' } }
				>
					Responsive image with optional caption
				</motion.p>
			</div>
		</div>
	);
}
