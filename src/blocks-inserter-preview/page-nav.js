import { motion } from 'motion/react';

import { frame, stage, EASE, useLoopIndex } from './inserter-shared';

export default function PageNavPreview() {
	const labels = [ 'Home', 'About', 'Services', 'Contact' ];
	const active = useLoopIndex( labels.length, 900 );

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', width: '100%', gap: '0.4em' } }>
					{ labels.map( ( label, index ) => {
						const isActive = index === active;
						return (
							<div
								key={ label }
								style={ {
									flex: 1,
									position: 'relative',
									padding: '0.65em 0.3em',
									borderRadius: '0.5em',
									fontSize: '0.85em',
									fontWeight: 650,
									textAlign: 'center',
									background: isActive ? 'transparent' : '#f1f5f9',
								} }
							>
								{ isActive && (
									<motion.div
										layoutId="page-nav-pill"
										transition={ { duration: 0.4, ease: EASE } }
										style={ {
											position: 'absolute',
											inset: 0,
											borderRadius: '0.5em',
											background: '#2563eb',
										} }
									/>
								) }
								<span
									style={ {
										position: 'relative',
										color: isActive ? '#fff' : '#172033',
									} }
								>
									{ label }
								</span>
							</div>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
