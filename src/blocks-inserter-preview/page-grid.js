import { motion } from 'motion/react';

import { frame, stage, EASE, useLoopIndex } from './inserter-shared';

export default function PageGridPreview() {
	const labels = [ 'Home', 'About', 'Services', 'Contact' ];
	const active = useLoopIndex( labels.length, 700 );

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
					{ labels.map( ( label, index ) => {
						const isActive = index === active;
						return (
							<div
								key={ label }
								style={ {
									position: 'relative',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: '0.5em',
									fontSize: '0.9em',
									fontWeight: 650,
									background: isActive ? 'transparent' : '#f1f5f9',
								} }
							>
								{ isActive && (
									<motion.div
										layoutId="page-grid-pill"
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
