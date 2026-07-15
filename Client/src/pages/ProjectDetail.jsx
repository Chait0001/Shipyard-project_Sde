import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to retrieve project details.');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

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
    if (!dateString) return 'N/A';
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="loader" style={{ width: '40px', height: '40px', borderTopColor: '#6366f1' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in-up">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className="glass-card alert alert-danger" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Access Denied or Not Found</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      {project && (
        <div className="glass-card detail-header-card">
          <div className="detail-meta-row">
            <div className="detail-title-section">
              <h1>{project.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span className={`badge ${getStatusBadgeClass(project.status)}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.9rem' }}>
                  {project.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ID: <code>{project.id}</code>
                </span>
              </div>
            </div>
            <Link to="/" className="btn btn-secondary">
              Edit Project Settings
            </Link>
          </div>

          <div className="detail-description">
            {project.description || 'No description has been written for this deployment console instance.'}
          </div>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-info-label">Owner Reference</span>
              <span className="detail-info-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                {project.owner}
              </span>
            </div>
            
            <div className="detail-info-item">
              <span className="detail-info-label">Created At</span>
              <span className="detail-info-value">{formatDate(project.createdAt)}</span>
            </div>
            
            <div className="detail-info-item">
              <span className="detail-info-label">Last Modified</span>
              <span className="detail-info-value">{formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Extra Premium Feature: Simulation of Terminal Log Window */}
      {project && (
        <div className="glass-card fade-in-up" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--status-active)' }}>●</span> Pipeline Activity Console
          </h3>
          <div style={{
            backgroundColor: '#05070c',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            color: '#34d399',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
          }}>
            <div>[system] Initializing pipeline listener...</div>
            <div>[system] Fetching metadata for node ID: {project.id}</div>
            <div>[system] Status check: current state is "{project.status}"</div>
            {project.status === 'pending' && (
              <>
                <div style={{ color: 'var(--status-pending)' }}>[warning] Awaiting workflow dispatch trigger...</div>
                <div style={{ color: 'var(--text-muted)' }}>[system] Standing by for git push webhook events.</div>
              </>
            )}
            {project.status === 'active' && (
              <>
                <div style={{ color: 'var(--status-active)' }}>[info] Spinup orchestrator environment hook resolved.</div>
                <div>[build] Executing command: npm ci --legacy-peer-deps</div>
                <div>[build] Bundling resources into docker image layers...</div>
                <div className="loader" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: '#34d399', marginLeft: '0.5rem' }}></div>
              </>
            )}
            {project.status === 'completed' && (
              <>
                <div>[build] Container validation: success.</div>
                <div>[deploy] Routing network traffic to blue/green pods...</div>
                <div style={{ color: 'var(--status-completed)', fontWeight: 600 }}>[success] Application live at: https://shipyard.internal/{project.id}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
