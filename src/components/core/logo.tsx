"use client";

import type * as React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";

import { NoSsr } from "@/components/core/no-ssr";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
	color?: Color;
	emblem?: boolean;
	height?: number;
	width?: number;
}

export function Logo({ color = "dark", emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
	const textColor = color === 'dark' ? '#000000' : '#ffffff';
	let url: string = '/assets/favicon.ico';
	if (emblem) {
	  url = '/assets/favicon.ico';
	}

	return     <Box display="flex" alignItems="center">
	<Box
	  component="img"
	  src="/favicon.ico"
	  alt="TheDataOmni icon"
	  sx={{
		height: height,
		width: 'auto',
		objectFit: 'contain',
		marginRight: 2,
	  }}
	/>
	<span
	  // Adjusted text classes for larger size, and we control color via inline style
	  className="font-medium text-4xl line-height-3 mr-8"
	  style={{ 
		textDecoration: 'none',
		color: textColor,
	  }}
	>
	  TheDataOmni
	</span>
  </Box>;
}

export interface DynamicLogoProps {
	colorDark?: Color;
	colorLight?: Color;
	emblem?: boolean;
	height?: number;
	width?: number;
}

export function DynamicLogo({
	colorDark = "light",
	colorLight = "dark",
	height = HEIGHT,
	width = WIDTH,
	...props
}: DynamicLogoProps): React.JSX.Element {
	const { colorScheme } = useColorScheme();
	const color = colorScheme === "dark" ? colorDark : colorLight;

	return (
		<NoSsr fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}>
			<Logo color={color} height={height} width={width} {...props} />
		</NoSsr>
	);
}
