"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../components/SideMenu';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import { Box, Typography, Paper, Grid, Chip, Stack } from '@mui/material';

interface Todo {
  id: string;
  title: string;
  status: string;
  dueTime?: string;
}

const STATUS_MAP: Record<string, string> = {
  BACKLOG: 'Backlog',
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  BACKLOG: 'text.secondary',
  PENDING: 'warning.main',
  IN_PROGRESS: 'info.main',
  COMPLETED: 'success.main',
};

export default function WorkloadPage() {
  const { user, loading, selectedUserId } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const params = selectedUserId ? { userId: selectedUserId, limit: 1000 } : { limit: 1000 };
      api.get('/todos', { params }).then((res) => setTodos(res.data.items)).catch(() => {});
    }
  }, [user, selectedUserId]);

  if (loading || !user) {
    return null;
  }

  // Calculate summary counts
  const summaryCounts = {
    BACKLOG: 0,
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };

  todos.forEach(todo => {
    if (summaryCounts[todo.status as keyof typeof summaryCounts] !== undefined) {
      summaryCounts[todo.status as keyof typeof summaryCounts]++;
    }
  });

  // Group by date
  const groupedTodos = todos.reduce((acc, todo) => {
    const dateObj = todo.dueTime ? new Date(todo.dueTime) : null;
    const dateKey = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        dateObj: dateObj,
        total: 0,
        counts: {
          BACKLOG: 0,
          PENDING: 0,
          IN_PROGRESS: 0,
          COMPLETED: 0,
        }
      };
    }
    
    acc[dateKey].total++;
    if (acc[dateKey].counts[todo.status as keyof typeof summaryCounts] !== undefined) {
      acc[dateKey].counts[todo.status as keyof typeof summaryCounts]++;
    }
    return acc;
  }, {} as Record<string, { dateObj: Date | null, total: number, counts: Record<string, number> }>);

  // Sort dates
  const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    const dateA = groupedTodos[a].dateObj;
    const dateB = groupedTodos[b].dateObj;
    return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
  });

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Main status board
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review how many tasks sit in each status and which dates are the busiest.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 6 }}>
        {Object.keys(STATUS_MAP).map((statusKey) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={statusKey}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} elevation={0} variant="outlined">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {STATUS_MAP[statusKey]}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {summaryCounts[statusKey as keyof typeof summaryCounts]}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Dates by workload
      </Typography>

      <Stack spacing={2}>
        {sortedDates.map((date) => {
            const data = groupedTodos[date];
            return (
                <Paper key={date} sx={{ p: 3, borderRadius: 2 }} elevation={0} variant="outlined">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {date}
                        </Typography>
                        <Chip label={`${data.total} total`} size="small" sx={{ borderRadius: 1 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {data.total} {data.total === 1 ? 'task' : 'tasks'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                        {Object.keys(STATUS_MAP).map((statusKey) => (
                            <Grid size="auto" key={statusKey}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 5, 
                                    px: 1.5, 
                                    py: 0.5 
                                }}>
                                    <Typography variant="body2" sx={{ color: STATUS_TEXT_COLORS[statusKey] }}>
                                        {STATUS_MAP[statusKey]}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {data.counts[statusKey]}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            );
        })}
      </Stack>
    </Layout>
  );
}