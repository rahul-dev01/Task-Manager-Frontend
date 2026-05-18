
import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
  tasksPerUser: Array<{
    user: { _id: string; name: string; email: string };
    count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats?.totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>To Do</h3>
          <p className="stat-number">{stats?.todoTasks}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats?.inProgressTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Done</h3>
          <p className="stat-number">{stats?.doneTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <p className="stat-number overdue">{stats?.overdueTasks}</p>
        </div>
      </div>
      {stats && stats.tasksPerUser && stats.tasksPerUser.length > 0 && (
        <div className="tasks-per-user">
          <h2>Tasks per User</h2>
          <ul>
            {stats.tasksPerUser.map((item) => (
              <li key={item.user._id}>
                <span>{item.user.name}</span>
                <span className="task-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
