import { AnimatePresence, motion } from 'motion/react';

import { frame, Dots, EASE, useLoopIndex } from './inserter-shared';

const SLIDES = [
	{ glyph: '▧', tone: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)', label: 'Interval 1' },
	{ glyph: '◧', tone: 'linear-gradient(135deg, #34d399 0%, #0ea5e9 100%)', label: 'Interval 2' },
	{ glyph: '▨', tone: 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)', label: 'Interval 3' },
];

export default function ImageIntervalCoverPreview() {
	const active = useLoopIndex( SLIDES.length, 1600 );
	const current = SLIDES[ active ];

	return (
		<div style={ { ...frame, padding: 0, overflow: 'hidden', position: 'relative' } }>
			<AnimatePresence mode="wait">
				<motion.div
					key={ active }
					initial={ { opacity: 0, scale: 1.08 } }
					animate={ { opacity: 1, scale: 1 } }
					exit={ { opacity: 0, scale: 0.96 } }
					transition={ { duration: 0.5, ease: EASE } }
					style={ {
						position: 'absolute',
						inset: 0,
						background: current.tone,
						display: 'grid',
						placeItems: 'center',
						fontSize: '3em',
						color: '#ffffffcc',
					} }
				>
					{ current.glyph }
				</motion.div>
			</AnimatePresence>
			<div
				style={ {
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					padding: '10% 8% 8%',
					background: 'linear-gradient(to top, #0f172ac2, transparent)',
					display: 'flex',
					flexDirection: 'column',
					gap: '0.5em',
				} }
			>
				<AnimatePresence mode="wait">
					<motion.p
						key={ active }
						initial={ { opacity: 0, y: '0.4em' } }
						animate={ { opacity: 1, y: '0em' } }
						exit={ { opacity: 0, y: '-0.4em' } }
						transition={ { duration: 0.35, ease: EASE } }
						style={ { margin: 0, color: '#fff', fontWeight: 700, fontSize: '0.95em' } }
					>
						{ current.label } — image cover
					</motion.p>
				</AnimatePresence>
				<Dots count={ SLIDES.length } active={ active } />
			</div>
		</div>
	);
}
