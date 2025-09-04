import { Box, Card, CardContent, CardHeader, Typography, Button, Chip, Stack, Divider } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PaletteIcon from '@mui/icons-material/Palette';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SecurityIcon from '@mui/icons-material/Security';

export default function MaterialUIShowcase() {
  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Card elevation={6} sx={{ maxWidth: 700, mx: 'auto', borderRadius: 4 }}>
        <CardHeader
          avatar={<AutoAwesomeIcon color="primary" fontSize="large" />}
          title={<Typography variant="h4" fontWeight={700}>Why We're Building an Admin Dashboard</Typography>}
          subheader={<Typography variant="subtitle1">A foundation for future enterprise management tools</Typography>}
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Our admin dashboard is designed to give teams secure, efficient control over templates, projects, and feedback. With Material UI, we can quickly build:
              <ul>
                <li>Real-time analytics dashboards with charts and graphs</li>
                <li>Role-based access and user management</li>
                <li>Interactive tables for bulk editing and review</li>
                <li>Customizable widgets and quick actions</li>
                <li>Responsive layouts for desktop and mobile</li>
                <li>Integrated notifications and approval workflows</li>
              </ul>
              <br />
              This dashboard is just the start. Future dashboards might include:
              <ul>
                <li>Project health and risk visualizations</li>
                <li>Automated compliance reporting</li>
                <li>Team collaboration spaces</li>
                <li>Advanced search and filtering</li>
                <li>Embedded AI assistants for requirements gathering</li>
              </ul>
              <br />
              Material UI gives us the flexibility, accessibility, and design power to deliver beautiful, enterprise-grade tools—fast.
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <PaletteIcon color="secondary" fontSize="large" />
              <Typography variant="h6">Themeable &amp; Customizable</Typography>
              <Chip label="Easy theming" color="primary" />
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <WidgetsIcon color="action" fontSize="large" />
              <Typography variant="h6">Rich Component Library</Typography>
              <Chip label="Hundreds of components" color="secondary" />
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <SecurityIcon color="success" fontSize="large" />
              <Typography variant="h6">Enterprise Ready</Typography>
              <Chip label="Accessibility &amp; Security" color="success" />
            </Box>
            <Button variant="contained" color="primary" size="large" sx={{ alignSelf: 'center' }}>
              See Material UI Examples
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
