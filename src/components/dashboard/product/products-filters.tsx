"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useNavigate } from "react-router-dom";

import { paths } from "@/paths";
import { FilterButton, FilterPopover, useFilterContext } from "@/components/core/filter-button";
import { Option } from "@/components/core/option";

/** Updated Filters: statementType instead of category, plus question, sku, status. */
export interface Filters {
  statementType?: string;
  sku?: string;
  status?: string;
  question?: string;
}
export type SortDir = "asc" | "desc";

export interface ProductsFiltersProps {
  filters?: Filters;
  sortDir?: SortDir;
  /**
   * A list of statement types from the actual data (dynamic).
   */
  statementTypes?: string[];
}

/** Example status tabs (unchanged) */
const tabs = [
  { label: "All", value: "", count: 5 },
  { label: "Published", value: "published", count: 3 },
  { label: "Draft", value: "draft", count: 2 },
] as const;

export function QueriesFilters({
  filters = {},
  sortDir = "desc",
  statementTypes = [],
}: ProductsFiltersProps): React.JSX.Element {
  const { statementType, sku, status, question } = filters;

  const navigate = useNavigate();

  const updateSearchParams = React.useCallback(
    (newFilters: Filters, newSortDir: SortDir): void => {
      const searchParams = new URLSearchParams();

      if (newSortDir === "asc") {
        searchParams.set("sortDir", newSortDir);
      }

      if (newFilters.status) {
        searchParams.set("status", newFilters.status);
      }

      if (newFilters.sku) {
        searchParams.set("sku", newFilters.sku);
      }

      if (newFilters.statementType) {
        searchParams.set("statementType", newFilters.statementType);
      }

      if (newFilters.question) {
        searchParams.set("question", newFilters.question);
      }

      navigate(`${paths.dashboard.products.list}?${searchParams.toString()}`);
    },
    [navigate]
  );

  const handleClearFilters = React.useCallback(() => {
    updateSearchParams({}, sortDir);
  }, [updateSearchParams, sortDir]);

  const handleStatusChange = React.useCallback(
    (_: React.SyntheticEvent, value: string) => {
      updateSearchParams({ ...filters, status: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleStatementTypeChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, statementType: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSkuChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, sku: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleQuestionChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, question: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSortChange = React.useCallback(
    (event: SelectChangeEvent) => {
      updateSearchParams(filters, event.target.value as SortDir);
    },
    [updateSearchParams, filters]
  );

  const hasFilters = !!(status || statementType || sku || question);

  return (
    <div>
      {/* TABS for status */}
      <Tabs onChange={handleStatusChange} sx={{ px: 3 }} value={status ?? ""} variant="scrollable">
        {tabs.map((tab) => (
          <Tab
            icon={<Chip label={tab.count} size="small" variant="soft" />}
            iconPosition="end"
            key={tab.value}
            label={tab.label}
            sx={{ minHeight: "auto" }}
            tabIndex={0}
            value={tab.value}
          />
        ))}
      </Tabs>

      <Divider />

      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: "1 1 auto", flexWrap: "wrap" }}>
          {/* Statement Type Filter */}
          <FilterButton
            displayValue={statementType || undefined}
            label="SQL Statement Type"
            onFilterApply={(value) => {
              handleStatementTypeChange(value as string);
            }}
            onFilterDelete={() => {
              handleStatementTypeChange();
            }}
            // Pass dynamic statementTypes into the popover
            popover={<StatementTypeFilterPopover statementTypes={statementTypes} />}
            value={statementType || undefined}
          />

          {/* SKU */}
          {/* <FilterButton
            displayValue={sku || undefined}
            label="SKU"
            onFilterApply={(value) => {
              handleSkuChange(value as string);
            }}
            onFilterDelete={() => {
              handleSkuChange();
            }}
            popover={<SkuFilterPopover />}
            value={sku || undefined}
          /> */}

          {/* Question */}
          <FilterButton
            displayValue={question || undefined}
            label="Question"
            onFilterApply={(value) => {
              handleQuestionChange(value as string);
            }}
            onFilterDelete={() => {
              handleQuestionChange();
            }}
            popover={<QuestionFilterPopover />}
            value={question || undefined}
          />

          {hasFilters ? <Button onClick={handleClearFilters}>Clear filters</Button> : null}
        </Stack>

        {/* Sort direction */}
        <Select
          name="sort"
          onChange={handleSortChange}
          sx={{ maxWidth: "100%", width: "120px" }}
          value={sortDir}
        >
          <Option value="desc">Newest</Option>
          <Option value="asc">Oldest</Option>
        </Select>
      </Stack>
    </div>
  );
}

/** 
 * Popover that lists out dynamic statement types 
 */
function StatementTypeFilterPopover(props: { statementTypes: string[] }): React.JSX.Element {
  const { statementTypes } = props;

  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? "");
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by Statement Type">
      <FormControl>
        <Select
          onChange={(event) => {
            setValue(event.target.value);
          }}
          value={value}
        >
          {/* Let user choose "All" if they want to clear */}
          <Option value="">All Statement Types</Option>
          {/* Dynamically populate with the statementTypes array */}
          {statementTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

/** SKU popover (unchanged) */
function SkuFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? "");
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by SKU">
      <FormControl>
        <OutlinedInput
          placeholder="Enter SKU"
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

/** Question popover (unchanged) */
function QuestionFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? "");
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by Question">
      <FormControl>
        <OutlinedInput
          placeholder="Type a question keyword..."
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}
