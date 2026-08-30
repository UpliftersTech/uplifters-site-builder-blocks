import { motion } from 'motion/react';

import { frame, stage, row, EASE } from './inserter-shared';

export default function SearchLivePreview() {
	return (
		<div style={ frame }>
			<div style={ { ...stage, gap: '0.5em' } }>
				<div
					style={ {
						...row,
						width: '100%',
						padding: '0.7em 0.8em',
						border: '1px solid #cbd5e1',
						borderRadius: '0.6em',
						fontSize: '1em',
					} }
				>
					<span aria-hidden="true">⌕</span>
					<span style={ { color: '#64748b', position: 'relative' } }>
						<motion.span
							animate={ { clipPath: [ 'inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 100% 0 0)' ] } }
							transition={ {
								duration: 2.6,
								repeat: Infinity,
								times: [ 0, 0.4, 0.85, 1 ],
								ease: EASE,
							} }
							style={ { display: 'inline-block', whiteSpace: 'nowrap' } }
						>
							Search pages and posts…
						</motion.span>
						<motion.span
							animate={ { opacity: [ 1, 0, 1 ] } }
							transition={ { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
							style={ { marginLeft: '0.1em' } }
						>
							|
						</motion.span>
					</span>
				</div>
				<motion.div
					animate={ { opacity: [ 0, 0, 1, 1, 0 ], y: [ '0.3em', '0.3em', '0em', '0em', '0.3em' ] } }
					transition={ {
						duration: 2.6,
						repeat: Infinity,
						times: [ 0, 0.45, 0.6, 0.85, 1 ],
						ease: EASE,
					} }
					style={ {
						width: '100%',
						padding: '0.6em 0.8em',
						borderRadius: '0.5em',
						background: '#f8fafc',
						fontSize: '0.9em',
					} }
				>
					<strong>Search result title</strong>
					<span style={ { color: '#64748b' } }>
						{ ' ' }
						— matching content preview
					</span>
				</motion.div>
			</div>
		</div>
	);
}
