import { useMemo, useState, useEffect } from "react";
import { TextField, Button, Box, Alert, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import FormCard from "@/components/forms/form-card";
import LoadingState from "@/components/data-display/loading-state";
import { useAuth } from "@/context/use-auth";
import { updateProfileApi, updateEmailPreferencesApi, getProfileApi, getEmailPreferencesApi } from "@/api/auth-api";
import { getTimezones } from "@/utils/timezones";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const timezones = useMemo(() => getTimezones(), []);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    staleTime: 0,
    refetchOnMount: true,
  });

  const emailPrefsQuery = useQuery({
    queryKey: ["email-preferences"],
    queryFn: getEmailPreferencesApi,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (emailPrefsQuery.data) {
      setEmailNotifications(emailPrefsQuery.data.emailNotifications);
    }
  }, [emailPrefsQuery.data]);

  const profileData = profileQuery.data;

  useEffect(() => {
    if (profileData) updateProfile(profileData);
  }, [profileData, updateProfile]);

  const profileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      updateProfile(data);
      toast.info("Profile updated");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const emailPrefsMutation = useMutation({
    mutationFn: updateEmailPreferencesApi,
    onSuccess: () => {
      toast.info("Email preferences updated");
    },
    onError: () => {
      toast.error("Failed to update email preferences");
      setEmailNotifications((prev) => !prev);
    },
  });

  const handleEmailToggle = (_: unknown, checked: boolean) => {
    setEmailNotifications(checked);
    emailPrefsMutation.mutate({ emailNotifications: checked });
  };

  return (
    <PageWrapper>
      <FormCard title="Profile" maxWidth={480}>

        {profileMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update profile
          </Alert>
        )}

        {profileQuery.isLoading ? (
          <LoadingState rows={3} height={56} />
        ) : (
        <Formik
          enableReinitialize
          initialValues={{
            email: profileData?.email || user?.email || "",
            name: profileData?.name || user?.name || "",
            timezone: profileData?.timezone || user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          }}
          validationSchema={Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            name: Yup.string(),
            timezone: Yup.string().required("Required"),
          })}
          onSubmit={(values) => {
            profileMutation.mutate(values);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            dirty,
          }) => (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 448 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && !!errors.email}
                helperText={touched.email && typeof errors.email === "string" ? errors.email : undefined}
              />

              <TextField
                fullWidth
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && !!errors.name}
                helperText={touched.name && typeof errors.name === "string" ? errors.name : undefined}
              />

              <TextField
                fullWidth
                select
                label="Timezone"
                name="timezone"
                value={values.timezone}
                onChange={handleChange}
                error={touched.timezone && !!errors.timezone}
                helperText={touched.timezone && typeof errors.timezone === "string" ? errors.timezone : undefined}
              >
                {timezones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained" disabled={!dirty || profileMutation.isPending}>
                  {profileMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
        )}
      </FormCard>

      <FormCard title="Email Preferences">

        <FormControlLabel
          control={
            <Switch
              checked={emailNotifications}
              onChange={handleEmailToggle}
              disabled={emailPrefsMutation.isPending}
            />
          }
          label="Receive email notifications"
        />
      </FormCard>
    </PageWrapper>
  );
}
