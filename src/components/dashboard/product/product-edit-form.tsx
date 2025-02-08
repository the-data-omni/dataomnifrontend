"use client";

import * as React from "react";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Option } from "@/components/core/option";
import { RouterLink } from "@/components/core/link";
import { toast } from "@/components/core/toaster";
import { logger } from "@/lib/default-logger";
import { paths } from "@/paths";

// In your table, you have e.g. { question, statementType, sql } plus count, etc.
export interface Query {
  id: string;
  question: string;
  statementType: string;
  sql: string;
}

/**
 * The Zod schema for your new "Query" editing form:
 * - question: required string
 * - statementType: optional string
 * - sql: optional string (some queries might be empty)
 */
const schema = zod.object({
  question: zod.string().min(1, "Question is required").max(1000),
  statementType: zod.string().max(255).optional(),
  sql: zod.string().max(5000).optional(),
});

/** React Hook Form type from the schema */
type FormValues = zod.infer<typeof schema>;

/** Convert your "Query" object to the default form state. */
function getDefaultValues(q: Query): FormValues {
  return {
    question: q.question ?? "",
    statementType: q.statementType ?? "",
    sql: q.sql ?? "",
  };
}

export interface QueryEditFormProps {
  query: Query;
}

export function QueryEditForm({ query }: QueryEditFormProps): React.JSX.Element {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: getDefaultValues(query),
    resolver: zodResolver(schema),
  });

  /**
   * If you have an API endpoint to update the query (PUT/PATCH),
   * call it here, then navigate or show a success message.
   */
  const onSubmit = React.useCallback(
    async (formData: FormValues) => {
      try {
        // Example: call your update API
        toast.success("Query updated!");
        navigate(paths.dashboard.products.list); // or wherever you want
      } catch (error) {
        logger.error(error);
        toast.error("Something went wrong!");
      }
    },
    [navigate]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={4} divider={<Divider />}>
                {/* Basic Info */}
                <Stack spacing={2}>
                  <Typography variant="h6">Basic Info</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {/* question */}
                      <Controller
                        control={control}
                        name="question"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.question)} fullWidth>
                            <InputLabel required>Question</InputLabel>
                            <OutlinedInput {...field} label="Question" />
                            {errors.question && (
                              <FormHelperText>{errors.question.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {/* statementType */}
                      <Controller
                        control={control}
                        name="statementType"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.statementType)} fullWidth>
                            <InputLabel>Statement Type</InputLabel>
                            <Select {...field} label="Statement Type">
                              <Option value="">Select a statement type</Option>
                              <Option value="SELECT">SELECT</Option>
                              <Option value="CREATE">CREATE</Option>
                              <Option value="UPDATE">UPDATE</Option>
                              <Option value="DELETE">DELETE</Option>
                            </Select>
                            {errors.statementType && (
                              <FormHelperText>{errors.statementType.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>

                {/* SQL Query */}
                <Stack spacing={2}>
                  <Typography variant="h6">SQL Query</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        control={control}
                        name="sql"
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.sql)} fullWidth>
                            <InputLabel>SQL</InputLabel>
                            <OutlinedInput
                              {...field}
                              label="SQL"
                              multiline
                              minRows={4}
                              placeholder="Type or edit your SQL here..."
                            />
                            {errors.sql && (
                              <FormHelperText>{errors.sql.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Button
                component={RouterLink}
                href={paths.dashboard.products.list}
                color="secondary"
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Save
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* A small side preview if you want */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="text.primary">
                {query.question}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Statement Type: {query.statementType || "N/A"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.primary">
                {query.sql || "No SQL found"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
}
