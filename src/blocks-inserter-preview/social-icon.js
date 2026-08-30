import { motion } from 'motion/react';

import { frame, stage, row, EASE } from './inserter-shared';

export default function SocialIconPreview() {
	const icons = [
		[ 'f', '#1877f2' ],
		[ '𝕏', '#0f172a' ],
		[ 'in', '#0a66c2' ],
		[ '▶', '#ff0000' ],
	];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { ...row, gap: '0.6em' } }>
					{ icons.map( ( [ c, bg ], i ) => (
						<motion.div
							key={ i }
							animate={ { scale: [ 0, 1.2, 1 ], opacity: [ 0, 1, 1 ] } }
							transition={ {
								duration: 0.5,
								repeat: Infinity,
								repeatDelay: icons.length * 0.15 + 1.2,
								delay: i * 0.15,
								ease: EASE,
							} }
							style={ {
								width: '2.4em',
								height: '2.4em',
								borderRadius: '50%',
								background: bg,
								color: '#fff',
								display: 'grid',
								placeItems: 'center',
								fontWeight: 700,
								fontSize: '1em',
							} }
						>
							{ c }
						</motion.div>
					) ) }
				</div>
			</div>
		</div>
	);
}
