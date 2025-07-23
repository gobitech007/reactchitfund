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
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changeLanguage } from '../redux/slices/languageSlice';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentLanguage, availableLanguages } = useAppSelector(state => state.language);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLanguage = (languageCode: string) => {
    dispatch(changeLanguage(languageCode));
    handleClose();
  };

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

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
        <Typography variant="body2">{currentLang.name}</Typography>
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
        {availableLanguages.map((language) => (
          <MenuItem 
            key={language.code} 
            onClick={() => handleChangeLanguage(language.code)}
            selected={currentLanguage === language.code}
          >
            <ListItemIcon>
              {currentLanguage === language.code && <CheckIcon fontSize="small" />}
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