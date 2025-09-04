import { Box, Card, CardContent, CardHeader, Typography, Divider } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const templateData = [
  { name: 'Jan', templates: 12 },
  { name: 'Feb', templates: 18 },
  { name: 'Mar', templates: 24 },
  { name: 'Apr', templates: 30 },
  { name: 'May', templates: 28 },
  { name: 'Jun', templates: 35 },
];

const projectData = [
  { name: 'Jan', projects: 8 },
  { name: 'Feb', projects: 10 },
  { name: 'Mar', projects: 14 },
  { name: 'Apr', projects: 20 },
  { name: 'May', projects: 18 },
  { name: 'Jun', projects: 22 },
];

export default function DashboardCharts() {
  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Card elevation={4} sx={{ maxWidth: 900, mx: 'auto', borderRadius: 4 }}>
        <CardHeader
          title={<Typography variant="h5" fontWeight={700}>Dashboard Analytics</Typography>}
          subheader={<Typography variant="subtitle1">Impressive charts powered by Material UI &amp; Recharts</Typography>}
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: 400, height: 300 }}>
              <Typography variant="h6" align="center" gutterBottom>Templates Growth (Line Chart)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={templateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="templates" stroke="#1976d2" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ width: 400, height: 300 }}>
              <Typography variant="h6" align="center" gutterBottom>Projects Created (Bar Chart)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#90caf9" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
