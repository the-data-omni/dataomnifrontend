import  * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DotsThree as DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { Lightbulb as LightbulbIcon } from "@phosphor-icons/react/dist/ssr/Lightbulb";

// Import your SchemaContext so we can check `selectedSchemaName`
import { SchemaContext } from "@/components/dashboard/layout/SchemaContext";
import CircularProgress from "@mui/material/CircularProgress";

export interface InsightProps {
  insights: { id: string; title: string; description: string }[];
}

export function Insight({ insights }: InsightProps): React.JSX.Element {
  // We'll just show the first insight for demo
  const insight = insights[0];
  
  // Grab the selected schema name
  const { selectedSchemaName } = React.useContext(SchemaContext);

  // A piece of state to hold the "typed" text for the final description
  const [typedDescription, setTypedDescription] = React.useState("");

  // Steps to display while loading
  const steps = [
    "Evaluating field names…",
    "Checking field descriptions…",
    "Computing field name similarity…",
    "Evaluating field types…",
    "Checking for Primary/Foreign keys…",
  ];
  // Which step index we’re currently showing
  const [stepIndex, setStepIndex] = React.useState(0);

  // A convenience check: if the title is "0.00%", we assume the score is not loaded yet.
  const isLoadingScore = insight.title === "0.00%";

  // If no schema is selected, we skip the loading animation
  const canShowLoadingAnimation = isLoadingScore && !!selectedSchemaName;

  // ------------------------------------
  // 1) Step-by-Step Transitioning Text while "loading"
  // ------------------------------------
  React.useEffect(() => {
    // If we can't show loading, reset stepIndex and return
    if (!canShowLoadingAnimation) {
      setStepIndex(0);
      return;
    }

    // Cycle through steps every 2 seconds
    let i = 0;
    setStepIndex(i);

    const intervalId = setInterval(() => {
      i = (i + 1) % steps.length;
      setStepIndex(i);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [canShowLoadingAnimation, steps.length]);

  // ------------------------------------
  // 2) Typing effect for final description
  // ------------------------------------
  React.useEffect(() => {
    if (isLoadingScore) {
      // Reset typed text if we go back to loading
      setTypedDescription("");
      return;
    }
    // Animate the typed text once we have a real score
    let i = 0;
    const text = insight.description;
    setTypedDescription("");

    const timer = setInterval(() => {
      i++;
      setTypedDescription(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, 40); // Type speed: 40ms per char

    return () => clearInterval(timer);
  }, [isLoadingScore, insight.description]);

  // If we’re "loading" AND have a schema selected => show step animation
  if (canShowLoadingAnimation) {
    return (
      <Card
        sx={{
          bgcolor: "var(--mui-palette-primary-main)",
          color: "var(--mui-palette-primary-contrastText)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src="/assets/pulse.svg"
          sx={{
            height: "450px",
            left: 0,
            position: "absolute",
            top: 0,
            width: "450px",
            zIndex: 0,
          }}
        />
        <CardHeader
          action={
            <IconButton color="inherit">
              <DotsThreeIcon weight="bold" />
            </IconButton>
          }
          avatar={
            <Avatar>
              <LightbulbIcon fontSize="var(--Icon-fontSize)" />
            </Avatar>
          }
          sx={{ zIndex: 1 }}
          title="Gen-AI Readiness Score"
        />
        <CardContent sx={{ zIndex: 1, textAlign: "center" }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress color="inherit" />
            {/* Show the rotating step text */}
            <Typography variant="h6" sx={{ fontStyle: "italic" }}>
              {steps[stepIndex]}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // ------------------------------------
  // 3) Normal final card (non-zero score)
  // ------------------------------------
  return (
    <Card
      sx={{
        bgcolor: "var(--mui-palette-primary-main)",
        color: "var(--mui-palette-primary-contrastText)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <Box
        component="img"
        src="/assets/pulse.svg"
        sx={{
          height: "450px",
          left: 0,
          position: "absolute",
          top: 0,
          width: "450px",
          zIndex: 0,
        }}
      />
      <CardHeader
        action={
          <IconButton color="inherit">
            <DotsThreeIcon weight="bold" />
          </IconButton>
        }
        avatar={
          <Avatar>
            <LightbulbIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        sx={{ zIndex: 1 }}
        title="Gen-AI Readiness Score"
      />
      <CardContent sx={{ zIndex: 1 }}>
        <Stack key={insight.id} spacing={3}>
          {/* Show the final, real score */}
          <Typography color="inherit" variant="h1">
            {insight.title}
          </Typography>
          {/* The typed text for the final description */}
          <Typography color="inherit">{typedDescription}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
