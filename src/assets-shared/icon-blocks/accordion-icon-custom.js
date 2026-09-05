export default function AccordionIconCustom( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 17 17" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path d="M0 0v3h17v-3h-17zM16 2h-15v-1h15v1zM0 13h17v-9h-17v9zM1 5h15v7h-15v-7zM0 17h17v-3h-17v3zM1 15h15v1h-15v-1z" />
		</svg>
	);
}
