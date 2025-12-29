"use client";

import React, { useEffect, Suspense } from 'react';
import Layout from '../../components/SideMenu';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Typography, Box } from '@mui/material';

const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false });

export default function Board() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <Box sx={{ mb: 2, px: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" component="h1">
            Task Board
          </Typography>
          <Typography variant="caption" color="text.secondary">
            drag&drop
          </Typography>
        </Box>
        <KanbanBoard />
      </Layout>
    </Suspense>
  );
}