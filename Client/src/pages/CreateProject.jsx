import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!title) {
      setLocalError('Project title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/projects', {
        title,
        description,
        status,
      });
      setIsSubmitting(false);
      navigate('/');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setLocalError(err.response?.data?.error || 'Failed to initialize project registry. Please try again.');
    }
  };

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="glass-card form-card">
        <div className="form-header">
          <h1 style={{ background: 'linear-gradient(135deg, #ffffff 60%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Initialize Registry
          </h1>
          <p>Register a new pipeline orchestration module</p>
        </div>

        {localError && (
          <div className="alert alert-danger">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              className="form-input"
              placeholder="e.g. Production API Deploy Pipeline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="form-input"
              placeholder="Provide a narrative summary of this pipeline environment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="status">
              Initial Orchestration Status
            </label>
            <select
              id="status"
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="pending">Pending (Awaiting trigger)</option>
              <option value="active">Active (Deploy in progress)</option>
              <option value="completed">Completed (Successfully deployed)</option>
            </select>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loader" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }}></span>
                  Initializing...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
