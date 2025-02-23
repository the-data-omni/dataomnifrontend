import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Helmet } from "react-helmet-async";

import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";
// import { ChannelSessionsVsBounce } from "@/components/dashboard/analytics/channel-sessions-vs-bounce-rate";
// import { CountrySessionsVsBounce } from "@/components/dashboard/analytics/country-sessions-vs-bounce-rate";
// import { Devices } from "@/components/dashboard/analytics/devices";
import { InboundOutbound } from "@/components/dashboard/analytics/inbound-outbound";
import { Insight } from "@/components/dashboard/analytics/insight";
import { Summary } from "@/components/dashboard/analytics/summary";
import { useScore } from "@/hooks/utils/score_context";
import { Table5 } from "@/components/widgets/tables/table-5";
import { paths } from "@/paths";

const metadata = { title: `Analytics | Dashboard | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {

	const { score, loading, error } = useScore();

	const insights = [
		{
		  id: "INSIGHT-1",
		  title: loading ? "0.00%" : `${score.toFixed(2)}%`,
		  description: loading
			? "We are analyzing your schema, please wait while we evaluate field names, descriptions, types, keys, and more..."
			: `Based on our analysis, using Gen-AI models on your current data schema has an estimated accuracy of ${score.toFixed(
				2
			  )}% for retrieving the correct fields. In other words, when team members or automated systems attempt to generate queries, they have roughly a ${score.toFixed(
				2
			  )}% chance of correctly identifying and using the right fields.`
		},
		{
		  id: "INSIGHT-2",
		  title: "2.5%",
		  description: "Forecasted increase in your conversion rate by the end of the current month."
		},
		{
		  id: "INSIGHT-3",
		  title: "3.5%",
		  description: "Forecasted increase in your revenue by the end of the current month."
		}
	  ];
	  
	return (
		<React.Fragment>
			<Helmet>
				<title>{metadata.title}</title>
			</Helmet>
			<Box
				sx={{
					maxWidth: "var(--Content-maxWidth)",
					m: "var(--Content-margin)",
					p: "var(--Content-padding)",
					width: "var(--Content-width)",
				}}
			>
				<Stack spacing={4}>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
						<Box sx={{ flex: "1 1 auto" }}>
							<Typography variant="h4">Analytics</Typography>
						</Box>
						<div>
						<Button
							component="a"
							href={paths.dashboard.fileStorage}
							sx={{ display: { xs: "none", md: "flex" } }}
							// target="_blank"
							variant="contained"
							startIcon={<PlusIcon />}
						>
							Upload Schema
						</Button>
						</div>
					</Stack>
					<Grid container spacing={4}>
						<Grid size={12}>
							<Summary />
						</Grid>


						<Grid
							size={{
								lg: 6,
								xs: 12,
							}}
						>
							<InboundOutbound />
						</Grid>
						<Grid size={{ lg: 6, xs: 12 }}>
            {/* Pass in the dynamic insights */}
            <Insight insights={insights} />
          </Grid>
		  {/* <Grid size={12}>
							<Table5 />
						</Grid> */}
					</Grid>
				</Stack>
			</Box>
		</React.Fragment>
	);
}
