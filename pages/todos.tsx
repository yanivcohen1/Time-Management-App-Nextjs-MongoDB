import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Box,
  Stack,
  TablePagination,
  Popover,
  Button,
  TableSortLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TodoModal from '../components/TodoModal';
import { useSnackbar } from 'notistack';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
}

export default function Todos() {
  const { user, loading, selectedUserId } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [filterTitle, setFilterTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Todo>('title');

  const handleRequestSort = (property: keyof Todo) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTodos = todos;

  const sortedTodos = React.useMemo(() => {
    return [...filteredTodos].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';

      if (bValue < aValue) {
        return order === 'desc' ? -1 : 1;
      }
      if (bValue > aValue) {
        return order === 'desc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredTodos, order, orderBy]);

  const fetchTodos = React.useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedUserId) {
        params.userId = selectedUserId;
      }
      if (filterStatus && filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      if (filterTitle) {
        params.title = filterTitle;
      }
      if (filterStartDate) {
        params.startDate = filterStartDate;
      }
      if (filterEndDate) {
        params.endDate = filterEndDate;
      }
      const res = await api.get('/todos', { params });
      setTodos(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [selectedUserId, filterStatus, filterTitle, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenDeletePopover = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setDeleteAnchorEl(event.currentTarget);
    setDeleteId(id);
  };

  const handleCloseDeletePopover = () => {
    setDeleteAnchorEl(null);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await api.delete(`/todos/${deleteId}`);
        enqueueSnackbar('Todo deleted', { variant: 'success' });
        fetchTodos();
      } catch {
        // Handled by interceptor
      }
    }
    handleCloseDeletePopover();
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Track Status
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Filter by Name"
            variant="outlined"
            value={filterTitle}
            onChange={(e) => { setFilterTitle(e.target.value); setPage(0); }}
            size="small"
          />
          <TextField
            select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="BACKLOG">Backlog</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
          <TextField
            label="Start Date"
            type="date"
            value={filterStartDate}
            onChange={(e) => { setFilterStartDate(e.target.value); setPage(0); }}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={filterEndDate}
            onChange={(e) => { setFilterEndDate(e.target.value); setPage(0); }}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleRequestSort('description')}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dueTime'}
                  direction={orderBy === 'dueTime' ? order : 'asc'}
                  onClick={() => handleRequestSort('dueTime')}
                >
                  Due Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTodos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((todo) => (
              <TableRow
                key={todo.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:nth-of-type(odd)': {
                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#e0e0e0' : theme.palette.action.hover,
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  {todo.title}
                </TableCell>
                <TableCell>{todo.description}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {todo.dueTime ? new Date(todo.dueTime).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(todo)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleOpenDeletePopover(e, todo.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTodos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <TodoModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTodo(undefined); }}
        todo={editTodo}
        onSuccess={fetchTodos}
      />
      <Popover
        open={Boolean(deleteAnchorEl)}
        anchorEl={deleteAnchorEl}
        onClose={handleCloseDeletePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography sx={{ mb: 2 }}>Are you sure you want to delete this todo?</Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseDeletePopover} size="small">Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained" size="small">Delete</Button>
          </Stack>
        </Box>
      </Popover>
    </Layout>
  );
}
