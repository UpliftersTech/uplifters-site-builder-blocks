import { useEffect, useState } from '@wordpress/element';
import { motion } from 'motion/react';

import { frame, stage, title, EASE } from './inserter-shared';

function useCountUp( target, { tickMs = 45, ticks = 24, holdTicks = 20 } = {} ) {
	const [ value, setValue ] = useState( 0 );

	useEffect( () => {
		let tick = 0;
		const totalTicks = ticks + holdTicks;
		const id = window.setInterval( () => {
			tick = ( tick + 1 ) % totalTicks;
			const progress = Math.min( tick / ticks, 1 );
			setValue( Math.round( progress * target ) );
		}, tickMs );
		return () => window.clearInterval( id );
	}, [ target, tickMs, ticks, holdTicks ] );

	return value;
}

export default function CountupAutoAnimatePreview() {
	const clients = useCountUp( 100 );
	const projects = useCountUp( 200 );
	const coffees = useCountUp( 300 );
	const stats = [
		[ clients, 100, 'Happy Clients' ],
		[ projects, 200, 'Projects Done' ],
		[ coffees, 300, 'Cups of Coffee' ],
	];

	return (
		<div style={ frame }>
			<p
				style={ {
					...title,
					fontSize: '0.95em',
					marginBottom: '0.4em',
					textAlign: 'center',
				} }
			>
				Counters
			</p>
			<div style={ { ...stage, flexDirection: 'row', gap: '0.6em' } }>
				{ stats.map( ( [ n, target, l ] ) => (
					<div key={ l } style={ { flex: 1, textAlign: 'center' } }>
						<motion.div
							key={ n }
							initial={ { scale: 1.18, opacity: 0.6 } }
							animate={ { scale: 1, opacity: 1 } }
							transition={ { duration: 0.25, ease: EASE } }
							style={ {
								fontSize: '1.7em',
								fontWeight: 800,
								color: '#2563eb',
							} }
						>
							{ n }{ n === target ? '+' : '' }
						</motion.div>
						<div
							style={ {
								fontSize: '0.68em',
								color: '#475569',
								marginTop: '0.2em',
							} }
						>
							{ l }
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
}
