import { motion } from 'motion/react';

import { frame, stage, muted, EASE } from '../inserter-shared';

export default function ParagraphAdvancePreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				{ [ 0, 0.2, 0.4 ].map( ( delay, index ) => (
					<motion.p
						key={ index }
						animate={ {
							opacity: [ 0, 1, 1, 0 ],
							y: [ '0.6em', '0em', '0em', '0.6em' ],
						} }
						transition={ {
							duration: 3,
							repeat: Infinity,
							delay,
							times: [ 0, 0.15, 0.85, 1 ],
							ease: EASE,
						} }
						style={ {
							...muted,
							margin: 0,
							fontSize: '0.95em',
							textAlign: 'left',
							width: '100%',
						} }
					>
						{ index === 2
							? 'Body copy with responsive typography controls.'
							: 'A representative paragraph showing body text styled with font, colour and spacing options.' }
					</motion.p>
				) ) }
			</div>
		</div>
	);
}
