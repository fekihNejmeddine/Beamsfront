import React from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

interface AutocompleteInputProps {
  options: any[];
  value: any[];
  onChange: (value: any[]) => void;
  label: string;
  getOptionLabel: (option: any) => string;
  getOptionDisabled?: (option: any) => boolean;
  disabled?: boolean;
  error?: boolean; // Add error prop
  helperText?: string; // Add helperText prop
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  options,
  value,
  onChange,
  label,
  getOptionLabel,
  getOptionDisabled,
  disabled,
  error,
  helperText,
}) => {
  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={getOptionDisabled}
      disabled={disabled}
      isOptionEqualToValue={(option, value) =>
        (option?.id || option) === (value?.id || value)
      } // Handle cases where id is missing
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          error={error} // Display error state
          helperText={helperText} // Display error message
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option?.id || index}
            label={getOptionLabel(option)}
            {...getTagProps({ index })}
          />
        ))
      }
    />
  );
};

export default AutocompleteInput;
