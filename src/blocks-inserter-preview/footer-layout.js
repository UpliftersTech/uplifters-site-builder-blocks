import { motion } from 'motion/react';

import { frame, stage, row, eyebrow, muted, EASE } from './inserter-shared';

export default function FooterLayoutPreview() {
	return (
		<div
			style={ {
				...frame,
				background: '#172033',
				color: '#fff',
				border: '2px dashed #47536655',
			} }
		>
			<div style={ { ...stage, justifyContent: 'center' } }>
				<motion.p
					style={ { ...eyebrow, color: '#94a3b8', alignSelf: 'flex-start' } }
					animate={ { opacity: [ 0.4, 1, 0.4 ] } }
					transition={ { duration: 2.6, repeat: Infinity, ease: EASE } }
				>
					Footer Layout
				</motion.p>
				<div
					style={ {
						...row,
						width: '100%',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
					} }
				>
					<div>
						<strong style={ { fontSize: '1.05em' } }>Your Site</strong>
						<p style={ { ...muted, color: '#cbd5e1' } }>
							Footer section content goes here.
						</p>
					</div>
					<div style={ { fontSize: '0.85em', lineHeight: 1.9 } }>
						About
						<br />
						Services
						<br />
						Contact
					</div>
				</div>
			</div>
		</div>
	);
}
