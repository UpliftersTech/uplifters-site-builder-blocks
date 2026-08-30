import { motion } from 'motion/react';

import { frame, stage, imageTile, EASE } from './inserter-shared';

export default function PostsFeaturedImagePreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<motion.div
					animate={ {
						opacity: [ 0, 1 ],
						scale: [ 0.94, 1 ],
						boxShadow: [
							'0 0em 0em #0f172a00',
							'0 0.6em 1.6em #0f172a26',
						],
					} }
					transition={ {
						duration: 1.2,
						repeat: Infinity,
						repeatType: 'reverse',
						repeatDelay: 0.8,
						ease: EASE,
					} }
					style={ { ...imageTile, width: '100%', minHeight: '7.2em', fontSize: '1.1em' } }
				>
					Featured image
				</motion.div>
			</div>
		</div>
	);
}
