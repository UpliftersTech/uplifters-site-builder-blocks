import { motion } from 'motion/react';

import { frame, muted, EASE } from './inserter-shared';

export default function ScrollToTopPreview() {
	return (
		<div
			style={ {
				...frame,
				position: 'relative',
				background: '#f8fafc',
				overflow: 'visible',
			} }
		>
			<p style={ { ...muted, maxWidth: '65%' } }>
				Floating button scrolls the page back to the top after the
				visitor scrolls down.
			</p>
			<motion.div
				animate={ { y: [ '1em', '0em', '0em', '-0.15em', '0em' ], opacity: [ 0, 1, 1, 1, 1 ] } }
				transition={ {
					duration: 2.4,
					repeat: Infinity,
					times: [ 0, 0.25, 0.55, 0.78, 1 ],
					ease: EASE,
				} }
				style={ {
					position: 'absolute',
					right: '8%',
					bottom: '12%',
					width: '3em',
					height: '3em',
					borderRadius: '50%',
					background: '#2563eb',
					color: '#fff',
					display: 'grid',
					placeItems: 'center',
					fontSize: '1.3em',
					boxShadow: '0 0.4em 1em #2563eb55',
				} }
			>
				↑
			</motion.div>
		</div>
	);
}
