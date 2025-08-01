import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip
} from '@mui/material';
import {
  Download as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TransactionQuickActionsProps {
  selectedUser?: {
    user_id: string;
    fullName: string;
    email?: string;
    mobileNumber?: string;
  };
  selectedChit?: {
    chit_id: string;
    chit_no: string;
    amount: number;
    description?: string;
  };
  transactionCount: number;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  onEmailReport?: () => void;
}

const TransactionQuickActions: React.FC<TransactionQuickActionsProps> = ({
  selectedUser,
  selectedChit,
  transactionCount,
  onExport,
  onRefresh,
  onPrint,
  onEmailReport
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportClick = () => {
    setExportDialogOpen(true);
    handleMenuClose();
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport?.(format);
    setExportDialogOpen(false);
  };

  const handleRefresh = () => {
    onRefresh?.();
    handleMenuClose();
  };

  const handlePrint = () => {
    onPrint?.();
    handleMenuClose();
  };

  const handleEmailReport = () => {
    onEmailReport?.();
    handleMenuClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {/* Context Info */}
        <Box sx={{ flexGrow: 1 }}>
          {selectedUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`User: ${selectedUser.fullName}`}
                variant="outlined"
                size="small"
                color="primary"
              />
              {selectedChit && (
                <Chip
                  label={`Chit #${selectedChit.chit_no}`}
                  variant="outlined"
                  size="small"
                  color="secondary"
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} found
              </Typography>
            </Box>
          )}
        </Box>

        {/* Quick Actions */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          {t('common.refresh')}
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ExportIcon />}
          onClick={handleExportClick}
          disabled={transactionCount === 0}
        >
          {t('common.export')}
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<MoreIcon />}
          onClick={handleMenuOpen}
          disabled={transactionCount === 0}
        >
          {t('common.more')}
        </Button>
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.print')}</ListItemText>
        </MenuItem>
        
        {selectedUser?.email && (
          <MenuItem onClick={handleEmailReport}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('transactionHistory.actions.emailReport')}</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleExportClick}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.export')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>{t('transactionHistory.export.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('transactionHistory.export.description', { count: transactionCount })}
          </Typography>
          
          {selectedUser && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('transactionHistory.export.filters')}:
              </Typography>
              <Chip label={`User: ${selectedUser.fullName}`} size="small" sx={{ mr: 1 }} />
              {selectedChit && (
                <Chip label={`Chit #${selectedChit.chit_no}`} size="small" />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outlined">
            CSV
          </Button>
          <Button onClick={() => handleExport('excel')} variant="outlined">
            Excel
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="contained">
            PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransactionQuickActions;