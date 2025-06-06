import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet-async";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
import { paths } from "@/paths";
import { RouterLink } from "@/components/core/link";

const metadata = { title: `Not found | Errors | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
	return (
		<React.Fragment>
			<Helmet>
				<title>{metadata.title}</title>
			</Helmet>
			<Box
				component="main"
				sx={{
					alignItems: "center",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					minHeight: "100%",
					py: "64px",
				}}
			>
				<Container maxWidth="lg">
					<Stack spacing={6}>
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Box
								alt="Not found"
								component="img"
								src="/assets/not-found.svg"
								sx={{ height: "auto", maxWidth: "100%", width: "200px" }}
							/>
						</Box>
						<Stack spacing={1} sx={{ textAlign: "center" }}>
							<Typography variant="h4">404: The page you are looking for isn&apos;t here</Typography>
							<Typography color="text.secondary">
								You either tried some shady route or you came here by mistake. Whichever it is, try using the
								navigation.
							</Typography>
						</Stack>
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Button component={RouterLink} href={paths.home} variant="contained">
								Back to home
							</Button>
						</Box>
					</Stack>
				</Container>
			</Box>
		</React.Fragment>
	);
}
