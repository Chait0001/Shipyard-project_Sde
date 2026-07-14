import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span>🛳️</span> Shipyard
        </Link>

        {user && (
          <div className="navbar-menu">
            <span className="navbar-user">
              Welcome, <span className="navbar-user-name">{user.name}</span>
            </span>
            <button className="btn btn-secondary" onClick={logout} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
