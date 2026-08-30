import { motion } from 'motion/react';

import { frame, stage, row, EASE } from './inserter-shared';

export default function TextListIconPreview() {
	const items = [ 'First list item', 'Second list item', 'Third list item' ];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', flexDirection: 'column', gap: '0.7em', width: '100%' } }>
					{ items.map( ( it, i ) => (
						<div key={ it } style={ { ...row, gap: '0.6em' } }>
							<motion.span
								animate={ { scale: [ 0, 1.3, 1 ], opacity: [ 0, 1, 1 ] } }
								transition={ {
									duration: 0.4,
									repeat: Infinity,
									repeatDelay: items.length * 0.25 + 1,
									delay: i * 0.25,
									ease: EASE,
								} }
								style={ { color: '#2563eb', fontWeight: 800, fontSize: '1.2em' } }
							>
								✓
							</motion.span>
							<motion.span
								animate={ { opacity: [ 0, 1 ], x: [ '-0.4em', '0em' ] } }
								transition={ {
									duration: 0.4,
									repeat: Infinity,
									repeatDelay: items.length * 0.25 + 1,
									delay: i * 0.25,
									ease: EASE,
								} }
								style={ { fontSize: '1em', color: '#0f172a' } }
							>
								{ it }
							</motion.span>
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
}
