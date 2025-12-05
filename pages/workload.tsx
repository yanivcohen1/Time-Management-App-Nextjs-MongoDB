import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';

interface Todo {
  id: string;
  title: string;
  status: string;
  dueTime?: string;
}

export default function Workload() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get('/todos').then((res) => setTodos(res.data)).catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return null;
  }

  // Group by date
  const groupedTodos = todos.reduce((acc, todo) => {
    const date = todo.dueTime ? new Date(todo.dueTime).toLocaleDateString() : 'No Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Dates by Workload
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sortedDates.map((date) => (
          <Paper key={date} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              {date} ({groupedTodos[date].length})
            </Typography>
            <Divider />
            <List>
              {groupedTodos[date].map((todo) => (
                <ListItem key={todo.id}>
                  <ListItemText
                    primary={todo.title}
                    secondary={`Status: ${todo.status}`}
                  />
                  <Chip 
                    label={todo.status} 
                    color={
                      todo.status === 'COMPLETED' ? 'success' :
                      todo.status === 'IN_PROGRESS' ? 'info' :
                      todo.status === 'PENDING' ? 'warning' :
                      'default'
                    }
                    size="small" 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Box>
    </Layout>
  );
}
