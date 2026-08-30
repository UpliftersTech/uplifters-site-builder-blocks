import { motion } from 'motion/react';

import { frame, title, muted, EASE } from './inserter-shared';

export default function PopupScrollModalPreview() {
	return (
		<motion.div
			animate={ { background: [ '#17203300', '#17203399', '#17203399', '#17203300' ] } }
			transition={ {
				duration: 2.8,
				repeat: Infinity,
				times: [ 0, 0.2, 0.85, 1 ],
				ease: EASE,
			} }
			style={ {
				...frame,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			<motion.div
				animate={ {
					opacity: [ 0, 1, 1, 0 ],
					y: [ '1.5em', '0em', '0em', '1.5em' ],
					scale: [ 0.92, 1, 1, 0.92 ],
				} }
				transition={ {
					duration: 2.8,
					repeat: Infinity,
					times: [ 0, 0.25, 0.85, 1 ],
					ease: EASE,
				} }
				style={ {
					width: '82%',
					padding: '1em',
					borderRadius: '0.7em',
					background: '#fff',
					boxShadow: '0 0.8em 2em #0f172a55',
				} }
			>
				<h3 style={ { ...title, fontSize: '1.15em' } }>Stay in the loop</h3>
				<p style={ { ...muted, fontSize: '0.85em' } }>
					A scroll-triggered popup with customizable content.
				</p>
			</motion.div>
		</motion.div>
	);
}
