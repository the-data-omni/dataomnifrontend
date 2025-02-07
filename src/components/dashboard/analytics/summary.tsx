import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TrendDown as TrendDownIcon } from "@phosphor-icons/react/dist/ssr/TrendDown";
import { TrendUp as TrendUpIcon } from "@phosphor-icons/react/dist/ssr/TrendUp";
// Import SchemaContext to access selectedSchemaName
import { SchemaContext } from '@/components/dashboard/layout/SchemaContext'; 
import { useFlattenedFields } from '@/hooks/utils/useFlattenedFields';

export function Summary(): React.JSX.Element {
	const { selectedSchemaName } = React.useContext(SchemaContext);

	const { data: flattenedFields = [], isLoading, error } = useFlattenedFields(selectedSchemaName);

	  // Compute metrics
	  const totalFields = flattenedFields.length;
	  const numberOfTables = new Set(flattenedFields.map((f) => f.table_name)).size;
	  const fieldsWithDescription = flattenedFields.filter(
		(f) => f.description && f.description.trim() !== ''
	  ).length;
	  const percentageFieldsWithDescription = totalFields > 0 ? (fieldsWithDescription / totalFields) * 100 : 0;
	return (
		<Card>
		<Box
		  sx={{
			display: 'grid',
			gap: 2,
			gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
			p: 3,
		  }}
		>
		  <Stack
			spacing={1}
			sx={{
			  borderRight: { xs: 'none', md: '1px solid var(--mui-palette-divider)' },
			  borderBottom: { xs: '1px solid var(--mui-palette-divider)', md: 'none' },
			  pb: { xs: 2, md: 0 },
			}}
		  >
			<Typography color="text.secondary">Number of Tables</Typography>
			<Typography variant="h3">{numberOfTables}</Typography>
		  </Stack>
		  <Stack
			spacing={1}
			sx={{
			  borderRight: { xs: 'none', lg: '1px solid var(--mui-palette-divider)' },
			  borderBottom: { xs: '1px solid var(--mui-palette-divider)', md: 'none' },
			  pb: { xs: 2, md: 0 },
			}}
		  >
			<Typography color="text.secondary">Total Fields</Typography>
			<Typography variant="h3">{totalFields}</Typography>
		  </Stack>
		  <Stack
			spacing={1}
			sx={{
			  borderRight: { xs: 'none', md: '1px solid var(--mui-palette-divider)' },
			  borderBottom: { xs: '1px solid var(--mui-palette-divider)', md: 'none' },
			  pb: { xs: 2, md: 0 },
			}}
		  >
			<Typography color="text.secondary">Fields with Description</Typography>
			<Typography variant="h3">{fieldsWithDescription}</Typography>
		  </Stack>
		  <Stack spacing={1}>
			<Typography color="text.secondary">Percentage of Fields with Description</Typography>
			<Typography variant="h3">{percentageFieldsWithDescription.toFixed(2)}%</Typography>
		  </Stack>
		</Box>
	  </Card>
	);
}
