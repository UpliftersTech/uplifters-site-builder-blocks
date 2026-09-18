export default function ColumnLayout( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 16 16" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5-1v12H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 0H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h5.5z" />
		</svg>
	);
}
