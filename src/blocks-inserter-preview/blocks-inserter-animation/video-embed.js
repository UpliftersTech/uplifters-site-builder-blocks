import { motion } from 'motion/react';

import { frame, stage, imageTile, muted, EASE } from '../inserter-shared';

export default function VideoEmbedPreview() {
	return (
		<div style={ frame }>
			<div style={ stage }>
				<div style={ { display: 'flex', width: '100%', flex: 1, minHeight: 0 } }>
					<div style={ { ...imageTile, position: 'relative' } }>
						<motion.span
							animate={ { scale: [ 1, 1.25, 1 ] } }
							transition={ {
								duration: 1.4,
								repeat: Infinity,
								ease: EASE,
							} }
							style={ { fontSize: '1.12em' } }
						>
							▶
						</motion.span>
					</div>
				</div>
				<p style={ { ...muted, textAlign: 'center' } }>
					A single responsive video embed (YouTube, Vimeo…)
				</p>
			</div>
		</div>
	);
}
