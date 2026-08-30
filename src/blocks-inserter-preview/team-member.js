import { motion } from 'motion/react';

import { frame, stage, Avatar, EASE } from './inserter-shared';

export default function TeamMemberPreview() {
	const members = [
		[ 'John Doe', 'Designer' ],
		[ 'Jane Roe', 'Developer' ],
	];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', gap: '1.2em' } }>
					{ members.map( ( [ n, r ], i ) => (
						<motion.div
							key={ n }
							animate={ { opacity: [ 0, 1 ], scale: [ 0.7, 1 ] } }
							transition={ {
								duration: 0.5,
								repeat: Infinity,
								repeatType: 'reverse',
								repeatDelay: 1.4,
								delay: i * 0.18,
								ease: EASE,
							} }
							style={ { textAlign: 'center' } }
						>
							<Avatar size="3.6em" style={ { margin: '0 auto' } } />
							<div style={ { fontSize: '0.85em', fontWeight: 700, marginTop: '0.4em' } }>
								{ n }
							</div>
							<div style={ { fontSize: '0.75em', color: '#64748b' } }>
								{ r }
							</div>
						</motion.div>
					) ) }
				</div>
			</div>
		</div>
	);
}
