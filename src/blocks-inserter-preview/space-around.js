import { motion } from 'motion/react';

import { frame, stage, EASE } from './inserter-shared';

export default function SpaceAroundPreview() {
	return (
		<div style={ frame }>
			<div style={ { ...stage, gap: '0.3em' } }>
				<div
					style={ {
						height: '1.8em',
						borderRadius: '0.4em',
						background: '#f1f5f9',
						color: '#64748b',
						display: 'grid',
						placeItems: 'center',
						fontSize: '0.75em',
						width: '100%',
					} }
				>
					Adjustable spacing
				</div>
				<motion.div
					animate={ { height: [ '0.5em', '3em', '0.5em' ] } }
					transition={ { duration: 2.4, repeat: Infinity, ease: EASE } }
					style={ {
						width: '0.25em',
						borderRadius: '0.2em',
						background: '#2563eb',
					} }
				/>
				<div
					style={ {
						color: '#64748b',
						fontSize: '0.75em',
						textAlign: 'center',
					} }
				>
					Height &amp; width spacer
				</div>
			</div>
		</div>
	);
}
