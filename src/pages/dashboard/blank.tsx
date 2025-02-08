// pages/blank.tsx

import * as React from "react";
import Box from "@mui/material/Box";
import { Helmet } from "react-helmet-async";
import Visualizer from "@/components/dashboard/Visualizer/index"; // Adjust import as needed
import type { Metadata } from "@/types/metadata";
import { appConfig } from "@/config/app";

const metadata = { title: `Blank | Dashboard | ${appConfig.name}` } satisfies Metadata;

export function Page(): React.JSX.Element {
  return (
    <React.Fragment>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      {/* Remove extra containers/margins and make this Box fill the viewport */}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          margin: 0,
          padding: 0
        }}
      >
        <Visualizer database="bindle" />
      </Box>
    </React.Fragment>
  );
}
