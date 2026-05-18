
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ProjectMember {
  user: User;
  role: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: ProjectMember[];
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  project: { _id: string; name: string };
  assignedTo?: User;
  createdBy: User;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    assignedTo: '',
  });
  const { user } = useAuth();

  const isProjectAdmin =
    project?.members.find((m) => m.user._id === user?._id)?.role === 'Admin';
  const isGlobalAdmin = user?.role === 'Admin';
  const canManageTasks = isProjectAdmin || isGlobalAdmin;

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to fetch project', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Failed to search users', err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await api.post(`/projects/${id}/add-member`, { userId });
      setSearchQuery('');
      setSearchResults([]);
      setShowMemberModal(false);
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.post(`/projects/${id}/remove-member`, { userId });
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...taskForm,
        projectId: id,
      });
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        assignedTo: '',
      });
      setShowTaskModal(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: 'To Do' | 'In Progress' | 'Done'
  ) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const canEditTask = (task: Task) => {
    if (canManageTasks) return true;
    if (!task.assignedTo) return false;
    return task.assignedTo._id === user?._id;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <div className="project-detail">
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="header-actions">
          {canManageTasks && (
            <button onClick={() => setShowMemberModal(true)}>Add Member</button>
          )}
          {canManageTasks && (
            <button onClick={() => setShowTaskModal(true)}>Add Task</button>
          )}
        </div>
      </div>
      <div className="project-members">
        <h3>Members</h3>
        <div className="members-list">
          {project.members.map((member) => (
            <div key={member.user._id} className="member-item">
              <span>{member.user.name}</span>
              <span className="role-badge">{member.role}</span>
              {canManageTasks && member.user._id !== user?._id && (
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveMember(member.user._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="board">
        <div className="column">
          <h3>To Do</h3>
          <div className="task-list">
            {todoTasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <p>{task.description}</p>
                {task.assignedTo && (
                  <p className="assignee">Assigned to: {task.assignedTo.name}</p>
                )}
                <div className="task-actions">
                  {canEditTask(task) && (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTaskStatus(
                          task._id,
                          e.target.value as 'To Do' | 'In Progress' | 'Done'
                        )
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  )}
                  {canManageTasks && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="column">
          <h3>In Progress</h3>
          <div className="task-list">
            {inProgressTasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <p>{task.description}</p>
                {task.assignedTo && (
                  <p className="assignee">Assigned to: {task.assignedTo.name}</p>
                )}
                <div className="task-actions">
                  {canEditTask(task) && (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTaskStatus(
                          task._id,
                          e.target.value as 'To Do' | 'In Progress' | 'Done'
                        )
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  )}
                  {canManageTasks && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="column">
          <h3>Done</h3>
          <div className="task-list">
            {doneTasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <p>{task.description}</p>
                {task.assignedTo && (
                  <p className="assignee">Assigned to: {task.assignedTo.name}</p>
                )}
                <div className="task-actions">
                  {canEditTask(task) && (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTaskStatus(
                          task._id,
                          e.target.value as 'To Do' | 'In Progress' | 'Done'
                        )
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  )}
                  {canManageTasks && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      priority: e.target.value as 'Low' | 'Medium' | 'High',
                    })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Member</h2>
            <div className="form-group">
              <label>Search Users</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Search by name or email"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((foundUser) => {
                  const isAlreadyMember = project.members.some(
                    (m) => m.user._id === foundUser._id
                  );
                  return (
                    <div key={foundUser._id} className="search-result-item">
                      <div>
                        <strong>{foundUser.name}</strong>
                        <p>{foundUser.email}</p>
                      </div>
                      {isAlreadyMember ? (
                        <span className="already-member">Already a member</span>
                      ) : (
                        <button onClick={() => handleAddMember(foundUser._id)}>
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" onClick={() => {
                setShowMemberModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
