import { motion } from 'motion/react';

import { frame, stage, row, eyebrow, Brand, EASE } from './inserter-shared';

export default function HeaderLayoutPreview() {
	const links = [ 'Home', 'About' ];
	return (
		<div style={ { ...frame, border: '2px dashed #94a3b8' } }>
			<div style={ { ...stage, justifyContent: 'center' } }>
				<p style={ { ...eyebrow, alignSelf: 'flex-start' } }>Header Layout</p>
				<div style={ { ...row, justifyContent: 'space-between', width: '100%' } }>
					<motion.div
						animate={ { opacity: [ 0.5, 1, 1, 0.5 ] } }
						transition={ {
							duration: 2.4,
							repeat: Infinity,
							times: [ 0, 0.2, 0.8, 1 ],
							ease: EASE,
						} }
					>
						<Brand />
					</motion.div>
					<div style={ { ...row, fontSize: '0.9em', fontWeight: 600 } }>
						{ links.map( ( label, i ) => (
							<motion.span
								key={ label }
								animate={ { opacity: [ 0, 1, 1, 0 ], y: [ '0.3em', '0em', '0em', '0.3em' ] } }
								transition={ {
									duration: 2.4,
									repeat: Infinity,
									delay: 0.2 + i * 0.15,
									times: [ 0, 0.25, 0.8, 1 ],
									ease: EASE,
								} }
							>
								{ label }
							</motion.span>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
}
