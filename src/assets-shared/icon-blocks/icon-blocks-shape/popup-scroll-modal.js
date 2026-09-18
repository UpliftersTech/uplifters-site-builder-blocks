export default function PopupScrollModal( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path fill="none" d="M0 0h24v24H0z" />
			<path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
		</svg>
	);
}
