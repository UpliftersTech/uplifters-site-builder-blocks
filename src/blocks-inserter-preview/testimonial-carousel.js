import { AnimatePresence, motion } from 'motion/react';

import { frame, stage, row, Avatar, Dots, EASE, useLoopIndex } from './inserter-shared';

const TESTIMONIALS = [
	{
		quote: '“This team delivered beyond expectations — highly recommended!”',
		name: 'Morgan Blake',
		role: 'Product Manager',
	},
	{
		quote: '“Our new site converts visitors better than ever before.”',
		name: 'Priya Nair',
		role: 'Founder',
	},
	{
		quote: '“Fast, polished, and easy for our team to keep updating.”',
		name: 'Chris Doyle',
		role: 'Marketing Lead',
	},
];

export default function TestimonialCarouselPreview() {
	const active = useLoopIndex( TESTIMONIALS.length, 1800 );
	const current = TESTIMONIALS[ active ];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { ...row, alignItems: 'flex-start', gap: '0.8em', width: '100%' } }>
					<Avatar size="3em" />
					<div style={ { flex: 1, minHeight: '4.6em' } }>
						<AnimatePresence mode="wait">
							<motion.div
								key={ active }
								initial={ { opacity: 0, x: '0.8em' } }
								animate={ { opacity: 1, x: '0em' } }
								exit={ { opacity: 0, x: '-0.8em' } }
								transition={ { duration: 0.35, ease: EASE } }
							>
								<p style={ { margin: 0, fontSize: '0.95em', color: '#334155', lineHeight: 1.5 } }>
									{ current.quote }
								</p>
								<div style={ { marginTop: '0.5em', fontSize: '0.85em', fontWeight: 700 } }>
									{ current.name }
								</div>
								<div style={ { fontSize: '0.75em', color: '#64748b' } }>
									{ current.role }
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
				<Dots count={ TESTIMONIALS.length } active={ active } />
			</div>
		</div>
	);
}
