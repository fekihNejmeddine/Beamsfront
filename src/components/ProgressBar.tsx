import { Box, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
}));

interface ProgressBarProps {
  value: number;
  color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  height?: number;
}

const ProgressBar = ({ value, color, height = 8 }: ProgressBarProps) => {
  return (
    <Box sx={{ width: "100%" }}>
      <BorderLinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height }}
      />
    </Box>
  );
};

export default ProgressBar;
