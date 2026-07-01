import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
};

const countries = ['India', 'USA', 'UK', 'Germany'];

export default function PersonModal({ open, onClose, onSubmit }: Props) {
  const formik = useFormik({
    initialValues: {
      name: '',
      gender: '',
      dob: '',
      country: '',
      phone: '',
      email: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      gender: Yup.string().required('Gender is required'),
      dob: Yup.date().required('Date of birth is required'),
      country: Yup.string().required('Country is required'),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Must be 10 digits')
        .required('Phone is required'),
      email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
    }),
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enter Person Details</DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="Name"
                {...formik.getFieldProps('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <TextField
                select
                fullWidth
                label="Gender"
                {...formik.getFieldProps('gender')}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                helperText={formik.touched.gender && formik.errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid  size={{xs: 12}}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                {...formik.getFieldProps('dob')}
                error={formik.touched.dob && Boolean(formik.errors.dob)}
                helperText={formik.touched.dob && formik.errors.dob}
              />
            </Grid>

            <Grid  size={{xs: 12}}>
              <TextField
                select
                fullWidth
                label="Country"
                {...formik.getFieldProps('country')}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid  size={{xs: 12}}>
              <TextField
                fullWidth
                label="Phone Number"
                {...formik.getFieldProps('phone')}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="Email"
                {...formik.getFieldProps('email')}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}