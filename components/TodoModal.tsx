/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import api from '../lib/axios';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
  duration?: number;
}

interface TodoModalProps {
  open: boolean;
  onClose: () => void;
  todo?: Todo; // If provided, edit mode
  onSuccess?: () => void;
}

const TodoModal = ({ open, onClose, todo, onSuccess }: TodoModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('BACKLOG');
  const [dueTime, setDueTime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStatus(todo.status);
      setDueTime(todo.dueTime ? new Date(todo.dueTime).toISOString().slice(0, 16) : '');
      setDuration(todo.duration || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('BACKLOG');
      setDueTime('');
      setDuration('');
    }
  }, [todo, open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        description,
        status,
        dueTime: dueTime ? new Date(dueTime) : undefined,
        duration: duration ? Number(duration) : undefined,
      };

      if (todo) {
        await api.put(`/todos/${todo.id}`, payload);
        enqueueSnackbar('Todo updated', { variant: 'success' });
      } else {
        await api.post('/todos', payload);
        enqueueSnackbar('Todo created', { variant: 'success' });
      }
      onClose();
      if (onSuccess) onSuccess();
      else router.reload(); // Refresh current page
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{todo ? 'Edit Todo' : 'Create Todo'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          name="title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          select
          margin="dense"
          label="Status"
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {['BACKLOG', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin="dense"
          label="Due Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Duration (hours)"
          type="number"
          fullWidth
          value={duration}
          onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {todo ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoModal;
