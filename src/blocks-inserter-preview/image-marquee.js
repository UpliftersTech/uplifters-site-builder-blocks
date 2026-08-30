import { motion } from 'motion/react';

import { frame, muted } from './inserter-shared';

const TILES = [ 0, 1, 2, 3, 4, 5 ];

export default function ImageMarqueePreview() {
	return (
		<div style={ { ...frame, padding: 0 } }>
			<div
				style={ {
					flex: 1,
					minHeight: '5.5em',
					width: '100%',
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
				} }
			>
				<motion.div
					animate={ { x: [ '0%', '-50%' ] } }
					transition={ { duration: 6, repeat: Infinity, ease: 'linear' } }
					style={ { display: 'flex', gap: '4%', height: '100%', width: 'max-content' } }
				>
					{ TILES.map( ( i ) => (
						<div
							key={ i }
							style={ {
								height: '100%',
								aspectRatio: '1',
								flexShrink: 0,
								borderRadius: '0.5em',
								background:
									'linear-gradient(135deg, #dbeafe 0%, #c7d2fe 48%, #e9d5ff 100%)',
								display: 'grid',
								placeItems: 'center',
								color: '#475569',
								fontSize: '2.4em',
							} }
						>
							▧
						</div>
					) ) }
				</motion.div>
			</div>
			<p style={ { ...muted, textAlign: 'center', padding: '0.4em 0 0', flex: '0 0 auto' } }>
				◀ Continuously scrolling image ticker ▶
			</p>
		</div>
	);
}
