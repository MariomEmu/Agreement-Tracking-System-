import { FiSearch } from 'react-icons/fi';
import { useLocation, NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const Header = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x); // Split path and filter out empty strings

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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
        <div className="user-profile">
          <img src="/avatar.png" alt="User Profile" className="user-avatar" />
          <span style={{whiteSpace: 'nowrap'}}>Welcome, MSH Pulak</span>
        </div>
      </div>
    </header>
  );
};

export default Header;