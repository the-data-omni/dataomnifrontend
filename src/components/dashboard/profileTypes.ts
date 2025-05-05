// profileTypes.ts

export interface Statistics {
    min: number | null;
    max: number | null;
    median: number | null;
    mean?: number;
    variance?: number;
    stddev?: number;
    skewness?: number;
    kurtosis?: number;
    quantiles?: {
      [key: string]: number;
    };
    null_count: number;
    unique_ratio: number;
    categorical_count?: {
      [key: string]: number;
    };
  }
  
  export interface DataStats {
    column_name: string;
    data_type: string;
    categorical: boolean;
    statistics: Statistics;
    // add other properties as needed
  }
  