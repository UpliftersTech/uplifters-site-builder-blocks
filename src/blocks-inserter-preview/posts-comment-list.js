import { motion } from 'motion/react';

import { frame, stage, row, muted, Avatar, EASE } from './inserter-shared';

export default function PostsCommentListPreview() {
	const items = [
		{ name: 'Alex Morgan', text: 'Great write-up, thanks for sharing!' },
		{ name: 'Jamie Lee', text: 'Really helped me understand this.' },
	];
	return (
		<div style={ frame }>
			<div style={ { ...stage, gap: '0.9em' } }>
				{ items.map( ( c, i ) => (
					<motion.div
						key={ c.name }
						animate={ {
							opacity: [ 0, 1, 1, 0 ],
							x: [ '-1em', '0em', '0em', '-1em' ],
						} }
						transition={ {
							duration: 2.6,
							repeat: Infinity,
							delay: i * 0.4,
							times: [ 0, 0.2, 0.8, 1 ],
							ease: EASE,
						} }
						style={ { ...row, width: '100%', alignItems: 'flex-start' } }
					>
						<Avatar size="2.8em" />
						<div>
							<strong style={ { fontSize: '0.95em' } }>{ c.name }</strong>
							<p style={ muted }>{ c.text }</p>
						</div>
					</motion.div>
				) ) }
			</div>
		</div>
	);
}
