import { motion } from 'motion/react';

import { frame } from './inserter-shared';

export default function LocationMapPreview() {
	return (
		<div style={ { ...frame, padding: 0, overflow: 'hidden', position: 'relative' } }>
			<div
				style={ {
					position: 'absolute',
					inset: 0,
					background:
						'repeating-linear-gradient(35deg, #e2e8f0, #e2e8f0 6%, #f8fafc 6%, #f8fafc 12%)',
				} }
			/>
			<div
				style={ {
					position: 'relative',
					width: '100%',
					height: '100%',
					display: 'grid',
					placeItems: 'center',
				} }
			>
				<motion.span
					animate={ { scale: [ 1, 2.4 ], opacity: [ 0.5, 0 ] } }
					transition={ {
						duration: 1.8,
						repeat: Infinity,
						ease: 'easeOut',
					} }
					style={ {
						position: 'absolute',
						width: '2.6em',
						height: '2.6em',
						borderRadius: '50%',
						background: '#2563eb',
					} }
				/>
				<motion.div
					animate={ { y: [ '0em', '-0.3em', '0em' ] } }
					transition={ {
						duration: 1.8,
						repeat: Infinity,
						ease: 'easeInOut',
					} }
					style={ {
						position: 'relative',
						padding: '0.6em 0.9em',
						borderRadius: '1em',
						background: '#fff',
						boxShadow: '0 0.2em 0.8em #94a3b866',
						fontSize: '1em',
						fontWeight: 700,
						whiteSpace: 'nowrap',
					} }
				>
					● Business location
				</motion.div>
			</div>
		</div>
	);
}
