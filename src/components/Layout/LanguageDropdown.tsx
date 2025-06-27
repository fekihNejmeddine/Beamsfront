import React, { useState } from "react";
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import { useLanguage } from "../../hooks/useLanguage";
import i18n from "../../config/i18n";
import languages from "../../Data/languages";

const LanguageDropdown = () => {
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    handleClose(); // Fermer le menu après la sélection
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <img
          src={languages[language].flag}
          alt={language}
          style={{ height: "24px", width: "24px", borderRadius: "50%" }}
        />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {Object.keys(languages).map((key) => (
          <MenuItem key={key} onClick={() => changeLanguage(key)} selected={language === key}>
            <ListItemIcon>
              <img
                src={languages[key].flag}
                alt={key}
                style={{ height: "20px", width: "20px", borderRadius: "50%" }}
              />
            </ListItemIcon>
            <ListItemText primary={languages[key].label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageDropdown;
