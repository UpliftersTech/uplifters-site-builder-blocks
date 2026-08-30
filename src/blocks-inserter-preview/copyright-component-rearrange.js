import { motion } from 'motion/react';

import { frame, stage, EASE } from './inserter-shared';

export default function CopyrightComponentRearrangePreview() {
	return (
		<div style={ { ...frame, overflow: 'hidden' } }>
			<div style={ stage }>
				<motion.p
					animate={ { x: [ '-1.4em', '0em', '1.4em', '0em', '-1.4em' ] } }
					transition={ {
						duration: 4.8,
						repeat: Infinity,
						times: [ 0, 0.25, 0.5, 0.75, 1 ],
						ease: EASE,
					} }
					style={ {
						margin: 0,
						fontSize: '1.05em',
						color: '#475569',
						whiteSpace: 'nowrap',
					} }
				>
					© 2026 Your Site. All rights reserved.
				</motion.p>
			</div>
		</div>
	);
}
