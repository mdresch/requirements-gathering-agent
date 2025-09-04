import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';

const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002/admin-api/v1';
const API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

async function fetchCount(endpoint: string) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { 'x-api-key': API_KEY }
  });
  if (!res.ok) return null;
  const data = await res.json();
  // Try to infer count from known structures
  if (Array.isArray(data)) return data.length;
  if (data.templates) return data.templates.length;
  if (data.projects) return data.projects.length;
  if (data.feedback) return data.feedback.length;
  if (data.jobs) return data.jobs.length;
  if (typeof data.total === 'number') return data.total;
  if (typeof data.count === 'number') return data.count;
  return null;
}

export default function AdminDashboardStats() {
  const [stats, setStats] = useState({
    templates: null,
    projects: null,
    feedback: null,
    jobs: null,
    loading: true
  });

  useEffect(() => {
    Promise.all([
      fetchCount('templates'),
      fetchCount('projects'),
      fetchCount('feedback'),
      fetchCount('documents/jobs')
    ]).then(([templates, projects, feedback, jobs]) => {
      setStats({ templates, projects, feedback, jobs, loading: false });
    });
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard Overview
      </Typography>
      {stats.loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Templates</Typography>
              <Typography variant="h3" color="primary">{stats.templates ?? '-'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Projects</Typography>
              <Typography variant="h3" color="primary">{stats.projects ?? '-'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Feedback</Typography>
              <Typography variant="h3" color="primary">{stats.feedback ?? '-'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Document Jobs</Typography>
              <Typography variant="h3" color="primary">{stats.jobs ?? '-'}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
