import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve registries. Please try again.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'badge-completed';
      case 'active': return 'badge-active';
      case 'pending':
      default:
        return 'badge-pending';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and search logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="loader" style={{ width: '40px', height: '40px', borderTopColor: '#6366f1' }}></div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Registry Dashboard</h1>
          <p>Monitor and configure active deploy orchestration instances</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          ➕ New Project
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      {projects.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by title or description..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Filter:</span>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px', padding: '0.6rem 1.5rem 0.6rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="glass-card empty-state fade-in-up">
          <div className="empty-state-icon">🛳️</div>
          {projects.length === 0 ? (
            <>
              <h3>No registries initialized</h3>
              <p>Your shipyard dashboard is currently empty. Get started by creating your first deployment orchestration project.</p>
              <Link to="/projects/new" className="btn btn-primary">
                Create First Project
              </Link>
            </>
          ) : (
            <>
              <h3>No matches found</h3>
              <p>No projects match your current search queries or filter constraints. Try clearing your queries.</p>
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <Link to={`/projects/${project._id}`} key={project._id} className="glass-card glass-card-hover project-card fade-in-up">
              <div className="project-card-header">
                <h3 className="project-card-title">{project.title}</h3>
                <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="project-card-description">
                {project.description || 'No description provided for this console instance.'}
              </p>
              <div className="project-card-footer">
                <span>Created: {formatDate(project.createdAt)}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Inspect &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
