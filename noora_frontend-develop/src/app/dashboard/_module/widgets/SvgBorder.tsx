const SvgBorder = ({
	url,
	strokeColor,
	strokeWidth,
}: {
	url: string;
	strokeColor: string;
	strokeWidth: string;
}) => {
	return (
		<svg
			viewBox="0 0 52 52"
			width="100%"
			height="100%"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<clipPath id="firstClip" clipPathUnits="userSpaceOnUse">
					<path d="M6 11.444L22.4375 2H29.1261L39.6954 8.04663L45.5321 11.444V33.9474L29.7887 43.0173L29.0315 43.329H22.5006L6.34705 34.1344L6.15775 33.9785L6 33.7915V11.444Z" />
				</clipPath>
			</defs>
			<rect width="52" height="52" fill="white" clipPath="url(#firstClip)" />
			<image
				href={`${url}?fallback=true`}
				width="52"
				height="52"
				preserveAspectRatio="xMidYMid meet"
				clipPath={`url(#firstClip)`}
			/>

			<path
				d="M6 11.444L22.4375 2H29.1261L39.6954 8.04663L45.5321 11.444V33.9474L29.7887 43.0173L29.0315 43.329H22.5006L6.34705 34.1344L6.15775 33.9785L6 33.7915V11.444Z"
				fill="none"
				stroke={strokeColor}
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};

export { SvgBorder };
