
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    user: { _id: string; name: string; email: string };
    role: string;
  }>;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const isGlobalAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', { name, description });
      setName('');
      setDescription('');
      setShowModal(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        {isGlobalAdmin && (
          <button onClick={() => setShowModal(true)}>Create Project</button>
        )}
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description || 'No description'}</p>
            <p className="member-count">{project.members.length} members</p>
          </Link>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Project</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
