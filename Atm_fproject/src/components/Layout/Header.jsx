import { FiSearch } from 'react-icons/fi';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x); // Split path and filter out empty strings

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Get first name from email
  let firstName = 'User';
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    const namePart = userEmail.split('@')[0];
    // Split by dot, underscore, or dash, and capitalize first letter
    const first = namePart.split(/[._-]/)[0];
    firstName = first.charAt(0).toUpperCase() + first.slice(1);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setDropdownOpen(false);
    navigate('/signin');
  };

  return (
    <header className="header">
      {/* Column 1: Logo (aligned with LeftPanel) */}
      <div className="header-logo-column">
        <img src="/sonali_intellect_logo.png" alt="Sonali Intellect" className="full-logo" style={{height: 32}} />
      </div>

      {/* Column 2: Breadcrumb (aligned with Main Content) */}
      <div className="header-main-column">
        <span className="menu-path">
          {/* 'Menu' is always the first part, linking to dashboard */}
          <NavLink to="/" className="breadcrumb-link">Menu</NavLink>
          
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = name.replace(/-/g, ' ') // Replace hyphens with spaces
                                      .split(' ') // Split into words
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                                      .join(' '); // Join back with spaces

            return ( 
              <React.Fragment key={name}> 
                <span className="breadcrumb-separator">/</span>
                {isLast ? (
                  <span className="breadcrumb-current">{displayName === '' ? 'Dashboard' : displayName}</span> // Handle root path as Dashboard
                ) : (
                  <NavLink to={routeTo} className="breadcrumb-link">
                    {displayName}
                  </NavLink>
                )}
              </React.Fragment>
            );
          })}
        </span>
      </div>

      {/* Column 3: Time/Date and User Profile (aligned with RightPanel) */}
      <div className="header-right-column">
        <span className="time-date">{formattedTime} / {formattedDate}</span>
        <div className="user-profile" ref={profileRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setDropdownOpen(v => !v)}>
          <img src="/avatar.png" alt="User Profile" className="user-avatar" />
          <span style={{whiteSpace: 'nowrap', marginLeft: 4}}>Welcome, {firstName}</span>
          {dropdownOpen && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 6, minWidth: 120, zIndex: 10 }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 500, color: '#222', borderRadius: 6 }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;