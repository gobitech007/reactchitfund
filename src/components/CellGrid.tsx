import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  styled, 
  useTheme,
  Tooltip
} from '@mui/material';

// Styled component for the clickable cell
const Cell = styled(Paper)(({ theme, selected, disabled }: any) => ({
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: disabled 
      ? theme.palette.action.disabledBackground 
      : selected 
        ? theme.palette.primary.dark 
        : theme.palette.action.hover,
  },
  transition: 'background-color 0.3s, color 0.3s',
  opacity: disabled ? 0.6 : 1,
}));

interface CellGridProps {
  onCellClick?: (cellNumber: number) => void;
  disabledCells?: number[];
  selectedCells?: number[];
  title?: string;
}

const CellGrid: React.FC<CellGridProps> = ({ 
  onCellClick, 
  disabledCells = [], 
  selectedCells = [],
  title = "Select a Cell"
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

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        {title}
      </Typography>
      
      <Grid container spacing={2}>
        {cells.map((cellNumber) => {
          const isDisabled = disabledCells.includes(cellNumber);
          const isSelected = selectedCells.includes(cellNumber);
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={cellNumber}>
              <Tooltip 
                title={isDisabled ? "This cell is not available" : `Cell ${cellNumber}`}
                arrow
              >
                <Box>
                  <Cell
                    elevation={isSelected ? 6 : 1}
                    onClick={() => handleCellClick(cellNumber)}
                    onMouseEnter={() => setHoveredCell(cellNumber)}
                    onMouseLeave={() => setHoveredCell(null)}
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