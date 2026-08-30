import { useEffect, useState } from '@wordpress/element';
import { AnimatePresence, motion } from 'motion/react';

import { frame, stage, muted, EASE } from './inserter-shared';

export default function CountdownWithMsgPreview() {
	const [ seconds, setSeconds ] = useState( 45 );

	useEffect( () => {
		const id = window.setInterval( () => {
			setSeconds( ( s ) => ( s <= 0 ? 59 : s - 1 ) );
		}, 700 );
		return () => window.clearInterval( id );
	}, [] );

	const boxes = [
		[ '24', 'Days' ],
		[ '09', 'Hours' ],
		[ '45', 'Minutes' ],
		[ String( seconds ).padStart( 2, '0' ), 'Seconds' ],
	];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div
					style={ {
						display: 'flex',
						width: '100%',
						justifyContent: 'center',
						gap: '0.5em',
					} }
				>
					{ boxes.map( ( [ n, l ] ) => (
						<div
							key={ l }
							style={ {
								flex: '1 1 22%',
								padding: '0.7em 0.3em',
								borderRadius: '0.55em',
								background: '#f1f5f9',
								textAlign: 'center',
							} }
						>
							<div
								style={ {
									fontSize: '1.6em',
									fontWeight: 800,
									color: '#0f172a',
									height: '1.2em',
									position: 'relative',
									overflow: 'hidden',
								} }
							>
								<AnimatePresence mode="popLayout" initial={ false }>
									<motion.span
										key={ n }
										initial={ { y: '-1em', opacity: 0 } }
										animate={ { y: '0em', opacity: 1 } }
										exit={ { y: '1em', opacity: 0 } }
										transition={ { duration: 0.3, ease: EASE } }
										style={ {
											position: 'absolute',
											inset: 0,
											display: 'flex',
											justifyContent: 'center',
										} }
									>
										{ n }
									</motion.span>
								</AnimatePresence>
							</div>
							<div
								style={ {
									fontSize: '0.62em',
									color: '#64748b',
									marginTop: '0.2em',
								} }
							>
								{ l }
							</div>
						</div>
					) ) }
				</div>
				<p style={ { ...muted, textAlign: 'center' } }>
					Offer ends soon — don&apos;t miss out!
				</p>
			</div>
		</div>
	);
}
