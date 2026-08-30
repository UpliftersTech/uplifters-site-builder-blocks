import { motion } from 'motion/react';

import { frame, stage, title, chip, EASE } from './inserter-shared';

const CYCLE = 3;

export default function PostsCommentFormPreview() {
	return (
		<div style={ frame }>
			<p style={ { ...title, fontSize: '0.95em', marginBottom: '0.5em' } }>
				Leave a comment
			</p>
			<div style={ { ...stage, gap: '0.7em' } }>
				<div
					style={ {
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '0.6em',
						width: '100%',
					} }
				>
					<motion.div
						animate={ { borderColor: [ '#cbd5e1', '#2563eb', '#cbd5e1' ] } }
						transition={ {
							duration: 0.6,
							repeat: Infinity,
							repeatDelay: CYCLE - 0.6,
							delay: 0,
							ease: EASE,
						} }
						style={ {
							height: '2.2em',
							borderRadius: '0.5em',
							border: '1px solid #cbd5e1',
							background: '#fff',
						} }
					/>
					<motion.div
						animate={ { borderColor: [ '#cbd5e1', '#2563eb', '#cbd5e1' ] } }
						transition={ {
							duration: 0.6,
							repeat: Infinity,
							repeatDelay: CYCLE - 0.6,
							delay: 0.4,
							ease: EASE,
						} }
						style={ {
							height: '2.2em',
							borderRadius: '0.5em',
							border: '1px solid #cbd5e1',
							background: '#fff',
						} }
					/>
				</div>
				<motion.div
					animate={ { borderColor: [ '#cbd5e1', '#2563eb', '#cbd5e1' ] } }
					transition={ {
						duration: 0.7,
						repeat: Infinity,
						repeatDelay: CYCLE - 0.7,
						delay: 0.9,
						ease: EASE,
					} }
					style={ {
						width: '100%',
						flex: 1,
						minHeight: '2.6em',
						borderRadius: '0.5em',
						border: '1px solid #cbd5e1',
						background: '#fff',
					} }
				/>
				<motion.span
					animate={ {
						scale: [ 1, 1, 1.06, 1 ],
						background: [ '#111827', '#111827', '#16a34a', '#111827' ],
					} }
					transition={ {
						duration: 0.6,
						repeat: Infinity,
						repeatDelay: CYCLE - 0.6,
						delay: 1.9,
						ease: EASE,
					} }
					style={ { ...chip, color: '#fff', alignSelf: 'flex-start' } }
				>
					Send Comment
				</motion.span>
			</div>
		</div>
	);
}
