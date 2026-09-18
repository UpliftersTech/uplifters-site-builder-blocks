export default function PostsTitle( { size = 20, color = '#5BC3F5', ...props } ) {
	return (
		<svg strokeWidth="0" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ stroke: color, fill: color }} { ...props }>
			<path fill="none" d="M0 0h24v24H0z" />
			<path d="M5 4v3h5.5v12h3V7H19V4z" />
		</svg>
	);
}
