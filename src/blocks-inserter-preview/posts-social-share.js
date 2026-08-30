import { motion } from 'motion/react';

import { frame, stage, row, eyebrow, EASE } from './inserter-shared';

export default function PostsSocialSharePreview() {
	const icons = [ 'f', '𝕏', '◎', '✉' ];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<p style={ { ...eyebrow, textAlign: 'center' } }>Share this post</p>
				<div style={ { ...row, gap: '0.5em' } }>
					{ icons.map( ( c, i ) => (
						<motion.div
							key={ i }
							animate={ { y: [ '0em', '-0.4em', '0em' ] } }
							transition={ {
								duration: 0.6,
								repeat: Infinity,
								repeatDelay: icons.length * 0.12 + 1,
								delay: i * 0.12,
								ease: EASE,
							} }
							style={ {
								width: '2.3em',
								height: '2.3em',
								borderRadius: '50%',
								background: '#111827',
								color: '#fff',
								display: 'grid',
								placeItems: 'center',
								fontSize: '1em',
								fontWeight: 700,
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
