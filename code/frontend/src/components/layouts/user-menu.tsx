import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import { useAuth } from "../../context/use-auth";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/providers/local-storage-provider";

const UserAvatarIcon = () => <PersonIcon />;



const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t, i18n } = useTranslation();
  const { get, set } = useStorage();

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (isAuthReady) {
      setIsLoggedIn(!!user);
    }
  }, [isAuthReady, user]);

  useEffect(() => {
    const lang = get("lang") || "en";
    i18n.changeLanguage(lang as string);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    set("lang", langCode);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      {!isLoggedIn ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
        >
          {t("login")}
        </Button>
      ) : (
        <>
          <Avatar
            onClick={handleProfileClick}
            sx={{
              width: 40,
              height: 40,
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <UserAvatarIcon />
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box px={2} py={1}>
              <Typography variant="body2">
                {t("hello", { name: user?.name || user?.sub || "User" })}
              </Typography>
            </Box>
            <MenuItem onClick={() => { handleClose(); navigate("/profile"); }}>
              {t("Profile")}
            </MenuItem>
            <Divider />
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => { handleClose(); handleLanguageChange(lang.code); }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {i18n.language === lang.code && <CheckIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>{lang.label}</ListItemText>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              onClick={() => {
                handleClose();
                logout();
              }}
              sx={{ color: "error.main" }}
            >
              {t("logout")}
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};

export default UserMenu;