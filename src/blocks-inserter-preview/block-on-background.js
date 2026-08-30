import { motion } from 'motion/react';

import { frame, EASE } from './inserter-shared';

export default function BlockOnBackgroundPreview() {
	return (
		<div
			style={ {
				...frame,
				padding: 0,
				overflow: 'hidden',
				position: 'relative',
			} }
		>
			<motion.div
				animate={ { scale: [ 1, 1.08, 1 ] } }
				transition={ { duration: 6, repeat: Infinity, ease: 'easeInOut' } }
				style={ {
					position: 'absolute',
					inset: 0,
					background:
						'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%)',
				} }
			/>
			<div
				style={ {
					position: 'absolute',
					inset: 0,
					background: '#0f172a55',
				} }
			/>
			<div
				style={ {
					position: 'relative',
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '8%',
					boxSizing: 'border-box',
				} }
			>
				<motion.div
					animate={ { opacity: [ 0.55, 1, 0.55 ], y: [ '0.3em', '0em', '0.3em' ] } }
					transition={ { duration: 2.6, repeat: Infinity, ease: EASE } }
					style={ {
						padding: '0.9em 1.2em',
						border: '1px dashed #ffffff66',
						borderRadius: '0.6em',
						color: '#fff',
						fontSize: '1.05em',
						textAlign: 'center',
					} }
				>
					Background image, color, or gradient
					<br />
					with inner content on top
				</motion.div>
			</div>
		</div>
	);
}
