import { motion } from 'motion/react';

import { frame, stage, title, EASE } from './inserter-shared';

export default function ColumnLayoutPreview() {
	const columns = [ 'Column 1', 'Column 2', 'Column 3' ];
	return (
		<div style={ frame }>
			<p style={ { ...title, fontSize: '0.9em', marginBottom: '0.5em' } }>
				Column Layout
			</p>
			<div
				style={ {
					...stage,
					flexDirection: 'row',
					alignItems: 'stretch',
					gap: '0.6em',
					minHeight: '6.5em',
				} }
			>
				{ columns.map( ( l, i ) => (
					<motion.div
						key={ l }
						animate={ {
							opacity: [ 0.4, 1, 1, 0.4 ],
							y: [ '0.4em', '0em', '0em', '0.4em' ],
						} }
						transition={ {
							duration: 2.4,
							repeat: Infinity,
							delay: i * 0.25,
							times: [ 0, 0.25, 0.75, 1 ],
							ease: EASE,
						} }
						style={ {
							flex: 1,
							minHeight: 0,
							borderRadius: '0.5em',
							border: '1px dashed #94a3b8',
							background: '#f8fafc',
							display: 'grid',
							placeItems: 'center',
							color: '#475569',
							fontSize: '0.85em',
						} }
					>
						{ l }
					</motion.div>
				) ) }
			</div>
		</div>
	);
}
