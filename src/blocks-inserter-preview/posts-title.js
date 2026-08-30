import { motion } from 'motion/react';

import { frame, stage, title, EASE } from './inserter-shared';

export default function PostsTitlePreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<motion.h2
					animate={ { opacity: [ 0, 1, 1, 0 ], y: [ '0.7em', '0em', '0em', '0.7em' ] } }
					transition={ {
						duration: 2.6,
						repeat: Infinity,
						times: [ 0, 0.2, 0.85, 1 ],
						ease: EASE,
					} }
					style={ { ...title, fontSize: '2em', textAlign: 'center' } }
				>
					A Representative Post Title
				</motion.h2>
			</div>
		</div>
	);
}
