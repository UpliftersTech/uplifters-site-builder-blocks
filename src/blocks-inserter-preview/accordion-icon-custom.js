import { AnimatePresence, motion } from 'motion/react';

import { frame, stage, row, EASE, useLoopIndex } from './inserter-shared';

export default function AccordionIconCustomPreview() {
	const items = [
		{ q: 'Accordion #1', a: "This is the first item's accordion body." },
		{ q: 'Accordion #2', a: 'Only one panel stays open at a time.' },
	];
	const openIndex = useLoopIndex( items.length, 1500 );

	return (
		<div style={ frame }>
			<div style={ stage }>
				<div
					style={ {
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: '0.6em',
					} }
				>
					{ items.map( ( it, i ) => {
						const isOpen = i === openIndex;
						return (
							<div
								key={ it.q }
								style={ {
									border: '1px solid #e2e8f0',
									borderRadius: '0.6em',
									overflow: 'hidden',
								} }
							>
								<motion.div
									animate={ {
										background: isOpen ? '#f1f5f9' : '#ffffff',
									} }
									transition={ { duration: 0.3, ease: EASE } }
									style={ {
										...row,
										justifyContent: 'space-between',
										padding: '0.7em 0.9em',
										fontSize: '1em',
										fontWeight: 650,
									} }
								>
									<span>{ it.q }</span>
									<motion.span
										animate={ { rotate: isOpen ? 45 : 0 } }
										transition={ { duration: 0.3, ease: EASE } }
										style={ {
											color: '#94a3b8',
											display: 'inline-block',
											fontSize: '1.2em',
										} }
									>
										+
									</motion.span>
								</motion.div>
								<AnimatePresence initial={ false }>
									{ isOpen && (
										<motion.div
											key="body"
											initial={ { height: 0, opacity: 0 } }
											animate={ { height: 'auto', opacity: 1 } }
											exit={ { height: 0, opacity: 0 } }
											transition={ { duration: 0.32, ease: EASE } }
											style={ { overflow: 'hidden' } }
										>
											<div
												style={ {
													padding: '0 0.9em 0.8em',
													fontSize: '0.85em',
													color: '#64748b',
												} }
											>
												{ it.a }
											</div>
										</motion.div>
									) }
								</AnimatePresence>
							</div>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
