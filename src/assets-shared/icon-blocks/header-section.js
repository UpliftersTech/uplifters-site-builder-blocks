export default function HeaderSection( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 17 17" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path d="M12 2h-12v14h17v-14h-5zM16 3v2h-4v-2h4zM11 3v2h-5v-2h5zM1 3h4v2h-4v-2zM16 15h-15v-9h15v9z" />
		</svg>
	);
}
