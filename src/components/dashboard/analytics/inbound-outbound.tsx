"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DotsThree as DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { ArrowsDownUp as ArrowsDownUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowsDownUp";

import { useScore } from "@/hooks/utils/score_context";
import { SchemaContext } from "@/components/dashboard/layout/SchemaContext";

// --------------
// Card-Flip Styles
// --------------
const cardFlipContainerStyle: React.CSSProperties = {
  perspective: "1000px",
  position: "relative",
  overflow: "visible",
  width: "100%",
  minHeight: "550px",
};
type NumericScoreKeys =
  | "field_name_score"
  | "field_sim_score"
  | "field_type_score"
  | "field_key_score"
  | "field_desc_score";
const cardInnerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  transition: "transform 0.8s",
  transformStyle: "preserve-3d",
  position: "relative",
};

const cardFaceStyle: React.CSSProperties = {
  position: "absolute" as const,
  width: "100%",
  height: "100%",
  minHeight: "550px",
  top: 0,
  left: 0,
  backfaceVisibility: "hidden" as const,
  overflow: "auto",
};

const cardBackStyle: React.CSSProperties = {
  ...cardFaceStyle,
  transform: "rotateY(180deg)",
};

// --------------
// Default Values
// --------------
const defaultSimilarityThreshold = 0.85;
const defaultDocSimilarityMeaningfulMin = 0.1;
const defaultDocSimilarityPlaceholderMax = 0.9;
const defaultWeights = {
  field_names: 30,
  field_descriptions: 25,
  field_name_similarity: 25,
  field_types: 10,
  keys_presence: 10,
};

const WEIGHT_KEYS = Object.keys(defaultWeights) as (keyof typeof defaultWeights)[];

// --------------
// Metric Details for the card back
// --------------
const metricDetails: Record<string, { title: string; paragraphs: string[] }> = {
  field_names: {
    title: "Field Names Metric",
    paragraphs: [
      "Evaluates clarity, consistency, and meaningfulness of field names.",
      "Clear field names improve readability and maintainability.",
      "If this score is low, consider renaming fields to be more descriptive.",
      "Checks for placeholder-type names; penalizes these."
    ],
  },
  field_descriptions: {
    title: "Field Descriptions Metric",
    paragraphs: [
      "Checks whether each field has a clear and accurate description.",
      "Proper field descriptions reduce ambiguity.",
      "If this score is low, ensure that every field includes a concise yet thorough description."
    ],
  },
  field_name_similarity: {
    title: "Field Name Similarity Metric",
    paragraphs: [
      "Identifies whether different fields have overly similar or confusing names.",
      "Too-similar names can lead to confusion during development and troubleshooting.",
      "If this score is low, rename or group fields to avoid ambiguity."
    ],
  },
  field_types: {
    title: "Field Types Metric",
    paragraphs: [
      "Assesses whether the data types assigned to each field are appropriate and consistent.",
      "Correct data types help maintain data integrity and optimize storage/performance.",
      "If this score is low, review field data types to ensure they match the stored data."
    ],
  },
  keys_presence: {
    title: "Keys Presence Metric",
    paragraphs: [
      "Checks whether primary/foreign keys are defined and used properly.",
      "Proper key usage promotes data integrity, supports efficient queries, and enforces relationships.",
      "If this score is low, define primary and foreign keys to maintain referential integrity."
    ],
  },
};

// --------------
// Map your "front-end" metric keys to the corresponding context fields
// --------------
const metricScoreMap: Record<keyof typeof defaultWeights, NumericScoreKeys> = {
  field_names: "field_name_score",
  field_descriptions: "field_desc_score",
  field_name_similarity: "field_sim_score",
  field_types: "field_type_score",
  keys_presence: "field_key_score",
};

export function InboundOutbound(): React.JSX.Element {
  // -------------------
  // Grab scores + context
  // -------------------
  const {
    field_name_score,
    field_sim_score,
    field_type_score,
    field_key_score,
    field_desc_score,
    score,
    error,
    scoreParams,
    updateScoreParams,
    loading
  } = useScore();

  // Also check if a schema is selected
  const { selectedSchemaName } = React.useContext(SchemaContext);

  // Flip state
  const [flipped, setFlipped] = React.useState(false);

  // Track which metric was clicked
  const [selectedMetric, setSelectedMetric] = React.useState<keyof typeof defaultWeights>("field_names");

  // Show/hide advanced threshold parameters
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Local thresholds
  const [similarityThreshold, setSimilarityThreshold] = React.useState(defaultSimilarityThreshold);
  const [docMeaningfulMin, setDocMeaningfulMin] = React.useState(defaultDocSimilarityMeaningfulMin);
  const [docPlaceholderMax, setDocPlaceholderMax] = React.useState(defaultDocSimilarityPlaceholderMax);

  // Weights + changed-fields tracking
  const [weights, setWeights] = React.useState({ ...defaultWeights });
  const [changedFields, setChangedFields] = React.useState<Set<keyof typeof defaultWeights>>(new Set());

  // Last committed params
  const [lastCommittedParams, setLastCommittedParams] = React.useState(() => ({
    similarity_threshold: similarityThreshold,
    doc_similarity_meaningful_min: docMeaningfulMin,
    doc_similarity_placeholder_max: docPlaceholderMax,
    weights_override: { ...weights },
  }));

  // Current params
  const currentParams = React.useMemo(
    () => ({
      similarity_threshold: similarityThreshold,
      doc_similarity_meaningful_min: docMeaningfulMin,
      doc_similarity_placeholder_max: docPlaceholderMax,
      weights_override: { ...weights },
    }),
    [similarityThreshold, docMeaningfulMin, docPlaceholderMax, weights]
  );

  // Unsaved changes?
  const hasUnsavedChanges = React.useMemo(() => {
    return JSON.stringify(currentParams) !== JSON.stringify(lastCommittedParams);
  }, [currentParams, lastCommittedParams]);

  // -------------------
  // Redistribute logic (Apply)
  // -------------------
  const partialRedistribute = React.useCallback(() => {
    setWeights((prev) => {
      const changed = Array.from(changedFields);
      const unchanged = WEIGHT_KEYS.filter((k) => !changed.includes(k));
      const sumChanged = changed.reduce((acc, k) => acc + prev[k], 0);
      const newWeights = { ...prev };

      if (sumChanged > 100) {
        changed.forEach((fieldKey) => {
          const fraction = prev[fieldKey] / sumChanged;
          newWeights[fieldKey] = parseFloat((fraction * 100).toFixed(2));
        });
        unchanged.forEach((unchKey) => {
          newWeights[unchKey] = 0;
        });
      } else if (sumChanged === 100) {
        unchanged.forEach((unchKey) => {
          newWeights[unchKey] = 0;
        });
      } else {
        const leftover = 100 - sumChanged;
        const sumUnchanged = unchanged.reduce((acc, k) => acc + prev[k], 0);
        if (sumUnchanged <= 0) {
          unchanged.forEach((unchKey) => {
            newWeights[unchKey] = 0;
          });
        } else {
          unchanged.forEach((unchKey) => {
            const fraction = prev[unchKey] / sumUnchanged;
            newWeights[unchKey] = parseFloat((fraction * leftover).toFixed(2));
          });
        }
      }
      return newWeights;
    });
  }, [changedFields]);

  const handleApply = React.useCallback(() => {
    partialRedistribute();
    setTimeout(() => {
      setLastCommittedParams({
        similarity_threshold: similarityThreshold,
        doc_similarity_meaningful_min: docMeaningfulMin,
        doc_similarity_placeholder_max: docPlaceholderMax,
        weights_override: { ...weights },
      });
      setChangedFields(new Set());
    }, 0);
  }, [partialRedistribute, similarityThreshold, docMeaningfulMin, docPlaceholderMax, weights]);

  // -------------------
  // Recalculate => run spinner until .then returns
  // -------------------
  const [recalculating, setRecalculating] = React.useState(false);

  const handleRecalculate = React.useCallback(() => {
    setRecalculating(true);

    updateScoreParams({ ...currentParams })
      .then(() => {
        // once the new score is returned
        setRecalculating(false);
      })
      .catch((err) => {
        console.error("Error recalculating:", err);
        setRecalculating(false);
      });
  }, [updateScoreParams, currentParams]);

  // -------------------
  // Input handlers
  // -------------------
  const handleChangeSimilarityThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimilarityThreshold(parseFloat(e.target.value));
  };
  const handleChangeDocMeaningfulMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocMeaningfulMin(parseFloat(e.target.value));
  };
  const handleChangeDocPlaceholderMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocPlaceholderMax(parseFloat(e.target.value));
  };

  const handleWeightChange = (key: keyof typeof defaultWeights) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    setWeights((prev) => ({ ...prev, [key]: val }));
    setChangedFields((prevSet) => new Set([...prevSet, key]));
  };

  const handleSlider = (key: keyof typeof defaultWeights) => (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      const evt = { target: { value: String(newValue) } } as React.ChangeEvent<HTMLInputElement>;
      handleWeightChange(key)(evt);
    }
  };

  // -------------------
  // Card flip logic
  // -------------------
  function handleMetricClick(metric: keyof typeof defaultWeights) {
    setSelectedMetric(metric);
    setFlipped(true);
  }

  function handleUnflip() {
    setFlipped(false);
  }

  const innerStyle: React.CSSProperties = {
    ...cardInnerStyle,
    transform: flipped ? "rotateY(180deg)" : "none",
  };

  // Grab details for whichever metric was clicked
  const details = metricDetails[selectedMetric] ?? {
    title: "Unknown Metric",
    paragraphs: ["No details available."],
  };

  // Grab the relevant metric score from context
  const metricScoreProperty = metricScoreMap[selectedMetric];
  const metricScore =
    {
      field_name_score,
      field_sim_score,
      field_type_score,
      field_key_score,
      field_desc_score,
      score,
      error,
      scoreParams,
      updateScoreParams,
      loading
    }[metricScoreProperty] || 0;

  // Decide if we color labels red or keep neutral
  // We color them only if a schema is selected, not loading, and < 80
  const canColorByScore = Boolean(selectedSchemaName) && !loading;

  return (
    <Box style={cardFlipContainerStyle}>
      <Box style={innerStyle}>
        {/* FRONT FACE */}
        <Box style={cardFaceStyle}>
          <Card
            sx={{
              height: "100%",
              p: 1,
              bgcolor: "background.paper",
              color: "text.primary",
            }}
          >
            <CardHeader
              avatar={
                <Avatar>
                  <ArrowsDownUpIcon fontSize="var(--Icon-fontSize)" />
                </Avatar>
              }
              action={
                <IconButton>
                  <DotsThreeIcon weight="bold" />
                </IconButton>
              }
              title="Scoring Parameters"
              subheader="Click on a metric name to flip & see details"
            />
            <CardContent>
              <Stack spacing={3}>
                {/* Toggle advanced */}
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    sx={{ textTransform: "none" }}
                  >
                    {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                  </Button>
                  <Collapse in={showAdvanced} unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Advanced Similarity & Meaningfulness
                      </Typography>
                      <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                        <TextField
                          label="Similarity Threshold"
                          type="number"
                          value={similarityThreshold}
                          onChange={handleChangeSimilarityThreshold}
                          helperText="Default: 0.85"
                          sx={{ maxWidth: 200 }}
                        />
                        <TextField
                          label="Doc Sim Min"
                          type="number"
                          value={docMeaningfulMin}
                          onChange={handleChangeDocMeaningfulMin}
                          helperText="Default: 0.10"
                          sx={{ maxWidth: 200 }}
                        />
                        <TextField
                          label="Doc Sim Max"
                          type="number"
                          value={docPlaceholderMax}
                          onChange={handleChangeDocPlaceholderMax}
                          helperText="Default: 0.90"
                          sx={{ maxWidth: 200 }}
                        />
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>

                {/* Weights */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Scoring Weights
                  </Typography>
                  <Stack spacing={2}>
                    {WEIGHT_KEYS.map((key) => {
                      // figure out the context property for this key
                      const metricScoreProp = metricScoreMap[key];
                      // actual numeric score from context
                      const scoreVal =
                        {
                          field_name_score,
                          field_sim_score,
                          field_type_score,
                          field_key_score,
                          field_desc_score,
                          score,
                          error,
                          scoreParams,
                          updateScoreParams,
                          loading
                        }[metricScoreProp] || 0;

                        const numericScore = useScore()[metricScoreMap[selectedMetric]];

                        const isBelow80 = canColorByScore && numericScore < 80;

                      // color red if below 80 and we can color by score
                      // const isBelow80 = canColorByScore && scoreVal < 80;


                      return (
                        <ParameterSlider
                          key={key}
                          label={key}
                          value={weights[key]}
                          onSliderChange={handleSlider(key)}
                          onTextChange={handleWeightChange(key)}
                          onLabelClick={() => handleMetricClick(key)}
                          isBelow80Score={isBelow80}
                        />
                      );
                    })}
                  </Stack>
                </Box>

                {/* Buttons */}
                <Box>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" disabled={!hasUnsavedChanges} onClick={handleApply}>
                      Apply
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleRecalculate} disabled={recalculating}>
                      {recalculating ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Recalculating...
                        </>
                      ) : (
                        "Recalculate"
                      )}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* BACK FACE */}
        <Box style={cardBackStyle}>
          <Card
            sx={{
              height: "100%",
              p: 2,
              bgcolor: "background.paper",
              color: "text.primary",
            }}
          >
            <Typography variant="h5" gutterBottom>
              {details.title}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Score for this metric: {metricScore.toFixed(2)}%
            </Typography>
            {details.paragraphs.map((paragraph, idx) => (
              <Typography key={idx} variant="body1" paragraph>
                {paragraph}
              </Typography>
            ))}

            <Button variant="outlined" onClick={handleUnflip}>
              Back to Scoring
            </Button>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

// -----------------------
// ParameterSlider
// -----------------------
interface ParameterSliderProps {
  label: string;
  value: number;
  onSliderChange: (_: Event, newValue: number | number[]) => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLabelClick: () => void; // Flip the card on metric name click
  isBelow80Score: boolean;
}

function ParameterSlider({
  label,
  value,
  onSliderChange,
  onTextChange,
  onLabelClick,
  isBelow80Score,
}: ParameterSliderProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Typography
        onClick={onLabelClick}
        sx={{
          width: "160px",
          textTransform: "capitalize",
          cursor: "pointer",
          textDecoration: "underline",
          // Show red if isBelow80Score is true, else inherit color
          color: isBelow80Score ? "red" : "inherit",
        }}
      >
        {label}
      </Typography>

      <Slider
        value={value}
        onChange={onSliderChange}
        step={1}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        sx={{ flex: 1 }}
      />

      <TextField
        type="number"
        value={value}
        onChange={onTextChange}
        size="small"
        sx={{ width: 60 }}
        inputProps={{ min: 0, max: 100 }}
      />
    </Stack>
  );
}