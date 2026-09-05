export default function FooterSection( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 17 17" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path d="M1 13h15v1h-15v-1zM4 15.993h9v-1h-9v1zM17 1v11h-17v-11h17zM16 2h-15v9h15v-9z" />
		</svg>
	);
}
