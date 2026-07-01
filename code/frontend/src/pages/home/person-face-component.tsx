import { getPersonFace, type Person } from "@/api/person-apis";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { Avatar, Box, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface PersonFaceProps {
  person: Person;
  size?: number;
  onEditName: () => void;
}

const PersonFace: React.FC<PersonFaceProps> = ({ person, size = 72, onEditName }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const fetchImage = async () => {
      setLoading(true);
      setError(null);
      setImageSrc(null);

      try {
        const response = await getPersonFace(person.id);
        objectUrl = URL.createObjectURL(response);

        if (isMounted) {
          setImageSrc(objectUrl);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load image");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [person]);

  if (loading) {
    return (
      <Stack spacing={1} alignItems="center" sx={{ width: size + 24, flex: "0 0 auto" }}>
        <Skeleton variant="circular" width={size} height={size} />
        {person.name && <Skeleton variant="text" width={size} />}
      </Stack>
    );
  }

  return (
    <Stack
      spacing={1}
      alignItems="center"
      sx={{
        width: size + 24,
        flex: "0 0 auto",
        textAlign: "center"
      }}
    >
      <Tooltip title={error ? `${person.name || "Face"} unavailable` : person.name || "Person face"}>
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            p: 0.5,
            bgcolor: "background.paper",
            boxShadow: 2,
            border: "1px solid",
            borderColor: "divider"
          }}
        >
          <Avatar
            src={imageSrc ?? undefined}
            alt={person.name ? `${person.name} face` : "Person face"}
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: error ? "error.light" : "primary.light",
              color: error ? "error.contrastText" : "primary.contrastText",
              "& img": {
                objectFit: "cover",
                objectPosition: "center"
              }
            }}
            onClick={onEditName}
          >
            {error ? <BrokenImageIcon fontSize="small" /> : null}
          </Avatar>
        </Box>
      </Tooltip>

      {person.name && (
        <Typography
          variant="caption"
          color="text.secondary"
          title={person.name}
          sx={{
            width: "100%",
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {person.name}
        </Typography>
      )}
    </Stack>
  );
};

export default PersonFace;
