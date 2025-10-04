import React, { useState } from "react";
import "../Login/loginStyle.css";
import Home from "../Main/Main"; // Import Home component

const Login = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Replace with your actual authentication logic
      if (name === "admin" && password === "password") {
        setError(false);
        setIsLoggedIn(true); // Navigate to Home page
      } else {
        setError(true);
      }
      setIsLoading(false);
    }, 1000);
  };

  // If logged in, show Home page
  if (isLoggedIn) {
    return <Home />;
  }

  return (
    <div className="login-container">
      {/* Left Side - Decorative */}
      <div className="login-left-side">
        <div className="decorative-overlay"></div>
        
        {/* Decorative circles */}
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>
        
        {/* Content */}
        <div className="left-side-content">
          <div className="left-side-text">
            <h1 className="welcome-title">Bienvenue</h1>
            <p className="welcome-description">
              Connectez-vous à votre espace personnel pour accéder à toutes vos fonctionnalités.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Accès sécurisé</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Interface intuitive</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right-side">
        <div className="login-form-wrapper">
          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <div className="error-content">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
                </svg>
                <p className="error-message">
                  Données invalides. Veuillez réessayer.
                </p>
              </div>
            </div>
          )}

          {/* Login Card */}
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Connexion</h2>
              <div className="title-underline"></div>
            </div>

            <div className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
                  </svg>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="Entrez votre nom"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <input
                    type={passwordShown ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Entrez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="password-toggle"
                  >
                    {passwordShown ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-label">Se souvenir de moi</span>
                </label>
                <button className="forgot-password">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitHandler}
                disabled={isLoading}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
              >
                {isLoading ? (
                  <span className="loading-content">
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="login-footer">
              Vous n'avez pas de compte ?{" "}
              <button className="signup-link">S'inscrire</button>
            </div>
          </div>

          {/* Security Note */}
          <p className="security-note">
            Connexion sécurisée par chiffrement SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;