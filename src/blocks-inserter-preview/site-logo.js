import { motion } from 'motion/react';

import { frame, stage, row, EASE } from './inserter-shared';

export default function SiteLogoPreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<motion.div
					animate={ { scale: [ 1, 1.08, 1 ] } }
					transition={ { duration: 2.2, repeat: Infinity, ease: EASE } }
					style={ { ...row, gap: '0.5em' } }
				>
					<motion.div
						animate={ {
							boxShadow: [
								'0 0 0 0 #2563eb00',
								'0 0 0 0.5em #2563eb22',
								'0 0 0 0 #2563eb00',
							],
						} }
						transition={ { duration: 2.2, repeat: Infinity, ease: EASE } }
						style={ {
							width: '2.6em',
							height: '2.6em',
							borderRadius: '0.5em',
							background: '#2563eb',
							color: '#fff',
							display: 'grid',
							placeItems: 'center',
							fontWeight: 800,
							fontSize: '1.2em',
						} }
					>
						u
					</motion.div>
					<strong style={ { fontSize: '1.4em' } }>Your Site</strong>
				</motion.div>
			</div>
		</div>
	);
}
