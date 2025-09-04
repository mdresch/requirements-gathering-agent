import React, { useEffect, useState } from 'react';
import { getAdminTemplates } from '../lib/adminApi';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminTemplates()
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Admin Templates</Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {templates.map(t => (
          <ListItem key={t.id} divider>
            <ListItemText primary={t.name} secondary={t.description} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
