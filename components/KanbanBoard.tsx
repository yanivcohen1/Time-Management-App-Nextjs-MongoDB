import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../lib/axios';
import TodoModal from './TodoModal';
import { useAuth } from '../context/AuthContext';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueTime?: string;
  duration?: number;
}

const columns = {
  BACKLOG: 'Backlog',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const columnColors: Record<string, string> = {
  BACKLOG: '#757575', // Grey
  PENDING: '#ff9800', // Orange
  IN_PROGRESS: '#03a9f4', // Light Blue
  COMPLETED: '#4caf50', // Green
};

const KanbanBoard = () => {
  const { selectedUserId } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [columnsData, setColumnsData] = useState<Record<string, Todo[]>>({
    BACKLOG: [],
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTodos = React.useCallback(async () => {
    try {
      const params = selectedUserId ? { userId: selectedUserId, limit: 1000 } : { limit: 1000 };
      const res = await api.get('/todos', { params });
      setTodos(res.data.items);
    } catch (error) {
      console.error(error);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    const newColumns: Record<string, Todo[]> = {
      BACKLOG: [],
      PENDING: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    todos.forEach((todo) => {
      if (newColumns[todo.status]) {
        newColumns[todo.status].push(todo);
      }
    });
    // eslint-disable-next-line
    setColumnsData(newColumns);
  }, [todos]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = columnsData[source.droppableId];
    const finishColumn = columnsData[destination.droppableId];

    // Optimistic update
    const newStartList = Array.from(startColumn);
    const [movedTodo] = newStartList.splice(source.index, 1);
    const newFinishList = Array.from(finishColumn);
    
    // If moving in same column
    if (source.droppableId === destination.droppableId) {
        newStartList.splice(destination.index, 0, movedTodo);
        setColumnsData({
            ...columnsData,
            [source.droppableId]: newStartList,
        });
    } else {
        // Moving to different column
        const updatedTodo = { ...movedTodo, status: destination.droppableId };
        newFinishList.splice(destination.index, 0, updatedTodo);
        setColumnsData({
            ...columnsData,
            [source.droppableId]: newStartList,
            [destination.droppableId]: newFinishList,
        });

        // API Call
        try {
            await api.put(`/todos/${draggableId}`, { status: destination.droppableId });
            // Refresh to ensure sync? Or just trust optimistic.
            // fetchTodos(); 
        } catch {
            // Revert on error (simplified: just fetch)
            fetchTodos();
        }
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      overflowX: { xs: 'hidden', md: 'auto' },
      height: { xs: 'auto', md: 'calc(100vh - 190px)' },
      gap: 2,
      p: 2
    }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, columnTitle]) => (
          <Box key={columnId} sx={{ 
            width: { xs: '100%', md: 'auto' },
            flex: { md: 1 },
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            maxHeight: '100%'
          }}>
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '1rem' }}>
                  {columnTitle}
                </Typography>
                <Box sx={{ 
                    bgcolor: columnColors[columnId], 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {columnsData[columnId].length}
                </Box>
            </Box>

            <Droppable droppableId={columnId}>
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    minHeight: 100,
                    overflowY: 'auto'
                  }}
                >
                  {columnsData[columnId].map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 2,
                            bgcolor: snapshot.isDragging ? 'action.hover' : '#1e1e1e',
                            color: 'white',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {todo.title}
                                </Typography>
                                <IconButton size="small" onClick={() => handleEdit(todo)} sx={{ color: 'white' }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            {todo.description && (
                                <Typography variant="body2" sx={{ color: 'grey.500', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {todo.description}
                                </Typography>
                            )}

                            {todo.dueTime && (
                                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>
                                    Due: {new Date(todo.dueTime).toLocaleDateString()}
                                </Typography>
                            )}
                            {todo.duration && (
                                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>
                                    Duration: {todo.duration} hours
                                </Typography>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </DragDropContext>
      <TodoModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTodo(undefined); }}
        todo={editTodo}
        onSuccess={fetchTodos}
      />
    </Box>
  );
};

export default KanbanBoard;
