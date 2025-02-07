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

/** Extend your Filters interface to include `question?: string;` */
export interface Filters {
  category?: string;
  sku?: string;
  status?: string;
  question?: string; // NEW field for partial match on question
}

export type SortDir = "asc" | "desc";

export interface ProductsFiltersProps {
  filters?: Filters;
  sortDir?: SortDir;
}

/** Example tabs from your code, for "All", "Published", "Draft" */
const tabs = [
  { label: "All", value: "", count: 5 },
  { label: "Published", value: "published", count: 3 },
  { label: "Draft", value: "draft", count: 2 },
] as const;

/**
 * The main ProductsFilters component with:
 *  - Tabs for status
 *  - Category filter
 *  - SKU filter
 *  - Question filter (NEW)
 *  - Sort direction
 */
export function QueriesFilters({
  filters = {},
  sortDir = "desc",
}: ProductsFiltersProps): React.JSX.Element {
  const { category, sku, status, question } = filters;

  const navigate = useNavigate();

  /**
   * A helper to rebuild the URL with updated filters
   */
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

      if (newFilters.category) {
        searchParams.set("category", newFilters.category);
      }

      // If user typed a question filter, store it
      if (newFilters.question) {
        searchParams.set("question", newFilters.question);
      }

      navigate(`${paths.dashboard.products.list}?${searchParams.toString()}`);
    },
    [navigate]
  );

  /**
   * Clears all filters but preserves the sort direction
   */
  const handleClearFilters = React.useCallback(() => {
    updateSearchParams({}, sortDir);
  }, [updateSearchParams, sortDir]);

  /**
   * For each filter field
   */
  const handleStatusChange = React.useCallback(
    (_: React.SyntheticEvent, value: string) => {
      updateSearchParams({ ...filters, status: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleCategoryChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, category: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSkuChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, sku: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  // NEW: handle the question filter
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

  // This helps show/hide a "Clear filters" button if user set any
  const hasFilters = !!(status || category || sku || question);

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
          {/* Category */}
          <FilterButton
            displayValue={category || undefined}
            label="Category"
            onFilterApply={(value) => {
              handleCategoryChange(value as string);
            }}
            onFilterDelete={() => {
              handleCategoryChange();
            }}
            popover={<CategoryFilterPopover />}
            value={category || undefined}
          />

          {/* SKU */}
          <FilterButton
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
          />

          {/* NEW: Question filter */}
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

          {/* Clear filters if any are applied */}
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
 * Re-usable popover for Category 
 */
function CategoryFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? "");
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by category">
      <FormControl>
        <Select
          onChange={(event) => {
            setValue(event.target.value);
          }}
          value={value}
        >
          <Option value="">Select a category</Option>
          <Option value="Healthcare">Healthcare</Option>
          <Option value="Makeup">Makeup</Option>
          <Option value="Skincare">Skincare</Option>
          {/* Add more if needed */}
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

/**
 * Re-usable popover for SKU
 */
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

/**
 * NEW: Popover for "Question" filter
 */
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
