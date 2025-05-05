import type * as React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SchemaVisualizer } from "@/components/dashboard/DynamicSchemaVisualizer/SchemaVisualizer";

export function Inputs1(): React.JSX.Element {
	return (
		<Box sx={{ p: 3 }}>
<SchemaVisualizer />
		</Box>
		
		
	  
	);
}
