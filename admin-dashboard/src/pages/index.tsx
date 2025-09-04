import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardHero from '../components/DashboardHero';
import AdminDashboardStats from '../components/AdminDashboardStats';
import DashboardCharts from '../components/DashboardCharts';
import MaterialUIShowcase from '../components/MaterialUIShowcase';
import { Container } from '@mui/material';

export default function HomePage() {
  return (
    <DashboardLayout>
      <Container maxWidth="md">
        <DashboardHero />
        <AdminDashboardStats />
        <DashboardCharts />
        <MaterialUIShowcase />
      </Container>
    </DashboardLayout>
  );
}
