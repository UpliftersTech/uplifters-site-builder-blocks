import { motion } from 'motion/react';

import { frame, stage, title, muted, EASE } from './inserter-shared';

export default function HeadingAdvancePreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<motion.h2
					animate={ { opacity: [ 0, 1, 1, 0 ], y: [ '0.6em', '0em', '0em', '0.6em' ] } }
					transition={ {
						duration: 3,
						repeat: Infinity,
						times: [ 0, 0.15, 0.85, 1 ],
						ease: EASE,
					} }
					style={ { ...title, fontSize: '1.8em', textAlign: 'center', margin: 0 } }
				>
					Heading &amp; Text
				</motion.h2>
				<motion.p
					animate={ { opacity: [ 0, 1, 1, 0 ], y: [ '0.6em', '0em', '0em', '0.6em' ] } }
					transition={ {
						duration: 3,
						repeat: Infinity,
						delay: 0.35,
						times: [ 0, 0.15, 0.85, 1 ],
						ease: EASE,
					} }
					style={ { ...muted, fontSize: '0.95em', textAlign: 'center' } }
				>
					A representative paragraph showing a heading and body copy
					paired together.
				</motion.p>
			</div>
		</div>
	);
}
