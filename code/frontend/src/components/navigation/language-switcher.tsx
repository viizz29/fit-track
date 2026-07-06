import { useStorage } from "@/providers/local-storage-provider";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  FormControl,
  Select,
  MenuItem,
  type SelectChangeEvent,
  InputLabel,
} from "@mui/material";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { get, set } = useStorage();

  const handleChange = (event: SelectChangeEvent) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    set("lang", newLang);
  };

  useEffect(() => {
    const lang = get("lang") || "en";
    i18n.changeLanguage(lang as string);
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 60 }}>
      <InputLabel id="language-label">Language</InputLabel>

      <Select
        labelId="language-label"
        value={i18n.language}
        label="Language"
        onChange={handleChange}
      >
        <MenuItem value="en">Eng</MenuItem>
        <MenuItem value="hi">हिंदी</MenuItem>
        {/* <MenuItem value="bn">Bengali</MenuItem>
        <MenuItem value="fr">French</MenuItem> */}
      </Select>
    </FormControl>
  );
}