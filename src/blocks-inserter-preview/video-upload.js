import { motion } from 'motion/react';

import { frame, stage, imageTile, muted, EASE } from './inserter-shared';

export default function VideoUploadPreview() {
	const clips = [ 'clip-1.mp4', 'clip-2.mp4' ];

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', width: '100%', flex: 1, minHeight: 0, gap: '0.5em' } }>
					{ clips.map( ( name, i ) => (
						<div
							key={ name }
							style={ {
								...imageTile,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '0.3em',
							} }
						>
							<motion.span
								animate={ { y: [ '0.4em', '-0.3em', '0.4em' ], opacity: [ 0.6, 1, 0.6 ] } }
								transition={ {
									duration: 1.6,
									repeat: Infinity,
									delay: i * 0.3,
									ease: EASE,
								} }
								style={ { fontSize: '1.4em' } }
							>
								⬆
							</motion.span>
							<span style={ { fontSize: '0.55em', color: '#475569' } }>
								{ name }
							</span>
						</div>
					) ) }
				</div>
				<p style={ { ...muted, textAlign: 'center' } }>
					Your uploaded video files, arranged in a grid
				</p>
			</div>
		</div>
	);
}
