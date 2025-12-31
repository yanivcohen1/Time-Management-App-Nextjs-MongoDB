"use client";

import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      enqueueSnackbar('Login successful', { variant: 'success' });
    } catch {
      // Handled by interceptor
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@todo.dev');
      setPassword('ChangeMe123!');
    } else {
      setEmail('user@todo.dev');
      setPassword('ChangeMe123!');
    }
    // Auto login after setting credentials
    // setTimeout(() => handleLogin(), 100);
  };

  const handleSeed = async () => {
    try {
      await api.post('/auth/seed');
      enqueueSnackbar('Database seeded with demo data', { variant: 'success' });
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Paper sx={{ p: 4, mt: 2, width: '100%' }}>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => handleDemoLogin('user')}>
                Demo User
              </Button>
              <Button fullWidth variant="outlined" onClick={() => handleDemoLogin('admin')}>
                Demo Admin
              </Button>
            </Box>
            <Button fullWidth color="secondary" onClick={handleSeed}>
              Reset & Seed Data
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button component={Link} href="/register" variant="text">
              Need an account? Create one
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}