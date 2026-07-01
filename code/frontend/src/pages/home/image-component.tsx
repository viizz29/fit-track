import React, { useEffect, useState } from "react";
import { getImageFile } from "@/api/image-apis";


interface ImageComponentProps {
  imageId: string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ imageId }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getImageFile(imageId);
        const imageUrl = URL.createObjectURL(response);
        setImageSrc(imageUrl);
      } catch (err) {
        setError("Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // cleanup to avoid memory leaks
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  if (loading) return <p>Loading image...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Fetched"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
    </div>
  );
};

export default ImageComponent;