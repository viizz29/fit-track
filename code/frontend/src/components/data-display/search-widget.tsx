import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
} from "@mui/material";

type Props = {
  onInput: (value: string | null) => void;
};

const SearchWidget: React.FC<Props> = ({ onInput }) => {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(input);
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!!debounced) {
      onInput(debounced);
    } else {
      onInput(null);
    }
  }, [debounced, onInput]);

  return (
    <Box sx={{ position: "relative", width: 300 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search images..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />


    </Box>
  );
};

export default SearchWidget;