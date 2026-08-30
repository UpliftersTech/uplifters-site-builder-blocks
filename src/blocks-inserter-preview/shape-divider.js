import { motion } from 'motion/react';

import { frame, muted } from './inserter-shared';

export default function ShapeDividerPreview() {
	return (
		<div style={ { ...frame, padding: 0, overflow: 'hidden' } }>
			<div style={ { flex: 1, minHeight: 0, width: '100%' } }>
				<svg
					viewBox="0 0 200 40"
					preserveAspectRatio="none"
					style={ { width: '100%', height: '100%', display: 'block' } }
				>
					<motion.path
						animate={ {
							d: [
								'M0,20 C50,45 150,-5 200,20 L200,40 L0,40 Z',
								'M0,20 C50,0 150,40 200,20 L200,40 L0,40 Z',
								'M0,20 C50,45 150,-5 200,20 L200,40 L0,40 Z',
							],
						} }
						transition={ { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }
						fill="#0284c7"
					/>
				</svg>
			</div>
			<p style={ { ...muted, textAlign: 'center', padding: '0.3em 0 0' } }>
				Responsive SVG section divider
			</p>
		</div>
	);
}
