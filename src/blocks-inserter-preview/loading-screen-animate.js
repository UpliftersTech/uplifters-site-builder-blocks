import { motion } from 'motion/react';

import { frame, stage, EASE } from './inserter-shared';

export default function LoadingScreenAnimatePreview() {
	return (
		<div style={ { ...frame, background: '#f8fafc' } }>
			<div style={ { ...stage, gap: '0.8em' } }>
				<motion.div
					animate={ { opacity: [ 0.6, 1, 0.6 ] } }
					transition={ { duration: 1.6, repeat: Infinity, ease: EASE } }
					style={ { fontSize: '1.15em', fontWeight: 700, color: '#334155' } }
				>
					Loading page...
				</motion.div>
				<div
					style={ {
						width: '82%',
						height: '0.55em',
						borderRadius: '0.3em',
						background: '#e2e8f0',
						overflow: 'hidden',
					} }
				>
					<motion.div
						animate={ { width: [ '0%', '100%' ] } }
						transition={ {
							duration: 1.8,
							repeat: Infinity,
							ease: 'easeInOut',
						} }
						style={ {
							height: '100%',
							background:
								'linear-gradient(90deg, #94a3b8, #2563eb, #94a3b8)',
						} }
					/>
				</div>
			</div>
		</div>
	);
}
