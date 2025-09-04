import { Box, Typography } from '@mui/material';

export default function DashboardHero() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      background: 'linear-gradient(90deg, #1976d2 0%, #90caf9 100%)',
      borderRadius: 4,
      mb: 4,
      color: 'white',
      boxShadow: 3,
    }}>
      <img
        src="/dashboard-logo.svg"
        alt="Dashboard Logo"
        style={{ width: 120, marginBottom: 24 }}
      />
      <Typography variant="h2" fontWeight={700} gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h5" fontWeight={400}>
        Modern, secure, and beautiful—powered by Material UI
      </Typography>
    </Box>
  );
}
