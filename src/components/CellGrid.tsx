import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  styled, 
  useTheme,
  Tooltip,
  PaperProps
} from '@mui/material';

// Define custom props interface for the Cell component
interface CellProps extends PaperProps {
  selected?: boolean;
  disabled?: boolean;
  paid?: boolean;
}

// Styled component for the clickable cell
const Cell = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'paid' && prop !== 'disabled'
})<CellProps>(({ theme, selected, disabled, paid }) => ({
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: paid 
    ? theme.palette.success.light 
    : selected 
      ? theme.palette.primary.main 
      : theme.palette.background.paper,
  color: (paid || selected) ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: disabled 
      ? theme.palette.action.disabledBackground 
      : paid
        ? theme.palette.success.main
        : selected 
          ? theme.palette.primary.dark 
          : theme.palette.action.hover,
  },
  transition: 'background-color 0.3s, color 0.3s',
  opacity: disabled ? 0.6 : 1,
}));

export interface CellData {
  week: number;
  is_paid: 'Y' | 'N';
}

interface CellGridProps {
  onCellClick?: (cellNumber: number) => void;
  disabledCells?: number[];
  selectedCells?: number[];
  paidCells?: CellData[];
  title?: string;
}

const CellGrid: React.FC<CellGridProps> = ({ 
  onCellClick, 
  disabledCells = [], 
  selectedCells = [],
  paidCells = [],
  title = "Select a week"
}) => {
  const theme = useTheme();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Generate array of 52 cells (1-52)
  const cells = Array.from({ length: 54 }, (_, i) => i + 1);

  const handleCellClick = (cellNumber: number) => {
    if (!disabledCells.includes(cellNumber) && onCellClick) {
      onCellClick(cellNumber);
    }
  };

  // Create a map of paid cells for faster lookup
  const paidCellsMap = new Map<number, boolean>();
  paidCells.forEach(cell => {
    if (cell.is_paid === 'Y') {
      paidCellsMap.set(cell.week, true);
    }
  });

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        {title}
      </Typography>
      
      <Grid container spacing={2}>
        {cells.map((cellNumber) => {
          const isPaid = paidCellsMap.has(cellNumber);
          // If a cell is paid, it should also be disabled
          const isDisabled = disabledCells.includes(cellNumber) || isPaid;
          const isSelected = selectedCells.includes(cellNumber);
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={cellNumber}>
              <Tooltip 
                title={isPaid 
                  ? "Already paid for this week" 
                  : isDisabled 
                    ? "This week is not available" 
                    : `Week ${cellNumber}`}
                arrow
              >
                <Box>
                  <Cell
                    elevation={isSelected || isPaid ? 6 : 1}
                    onClick={() => handleCellClick(cellNumber)}
                    onMouseEnter={() => setHoveredCell(cellNumber)}
                    onMouseLeave={() => setHoveredCell(null)}
                    paid={isPaid}
                    disabled={isDisabled}
                    selected={isSelected}
                    sx={{
                      border: hoveredCell === cellNumber && !isDisabled ? 
                        `2px solid ${theme.palette.primary.main}` : 
                        '2px solid transparent',
                    }}
                  >
                    <Typography variant="h6">
                      {cellNumber}
                    </Typography>
                  </Cell>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CellGrid;