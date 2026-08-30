import { motion } from 'motion/react';

import { frame, stage, imageTile, muted, EASE, useLoopIndex } from './inserter-shared';

export default function ImageGalleryPreview() {
	const active = useLoopIndex( 4, 500 );

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div
					style={ {
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gridTemplateRows: 'repeat(2, 1fr)',
						gap: '0.5em',
						width: '100%',
						flex: 1,
						minHeight: 0,
					} }
				>
					{ Array.from( { length: 4 } ).map( ( _, i ) => (
						<motion.div
							key={ i }
							animate={ {
								scale: i === active ? 1.1 : 1,
								boxShadow:
									i === active
										? '0 0.5em 1em #6366f166'
										: '0 0 0 rgba(0,0,0,0)',
							} }
							transition={ { duration: 0.35, ease: EASE } }
							style={ {
								...imageTile,
								position: 'relative',
								zIndex: i === active ? 2 : 1,
							} }
						>
							▧
						</motion.div>
					) ) }
				</div>
				<p style={ { ...muted, textAlign: 'center' } }>
					Clickable image gallery with lightbox preview
				</p>
			</div>
		</div>
	);
}
