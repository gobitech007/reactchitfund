import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'ta', name: 'தமிழ்' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' }
];

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Box>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        onClick={handleClick}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Typography variant="body2">{currentLanguage.name}</Typography>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">{t('language.selectLanguage')}</Typography>
        </MenuItem>
        {languages.map((language) => (
          <MenuItem 
            key={language.code} 
            onClick={() => changeLanguage(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemIcon>
              {i18n.language === language.code && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {language.name} ({t(`language.${language.code === 'en' ? 'english' : language.code === 'hi' ? 'hindi' : 'tamil'}`).toString()})
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;