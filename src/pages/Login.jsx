import React, { useState, useContext } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Full Error:", err);
      console.error("Response Data:", err.response?.data);
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRequest = async () => {
    const email = prompt("Enter your email for request:");
    const name = prompt("Enter your full name:");
    const warehouseId = prompt("Enter warehouse ID or leave blank:");

    if (!email || !name) return;

    try {
      const res = await api.post("/api/admin/request-user", { name, email, warehouseId });
      alert(res.data.msg);
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };


  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '16px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo/Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #4c6ef5 0%, #3b5bdb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 25px rgba(76, 110, 245, 0.3)'
          }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold' }}>E</span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px',
            background: 'linear-gradient(90deg, #4c6ef5, #22b8cf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Engro Dashboard</h1>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            fontSize: '16px'
          }}>Sign in to access your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '8px',
              fontSize: '14px'
            }} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4c6ef5';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <label style={{
                color: '#e2e8f0',
                fontWeight: '600',
                fontSize: '14px'
              }} htmlFor="password">
                Password
              </label>
              <a href="#" style={{
                color: '#4c6ef5',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }} onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}>
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4c6ef5';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading
                ? 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)'
                : 'linear-gradient(135deg, #4c6ef5 0%, #3b5bdb 100%)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(76, 110, 245, 0.3)',
              opacity: isLoading ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(76, 110, 245, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(76, 110, 245, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing in...
              </>
            ) : (
              <>
                <span>🔒</span> Sign In
              </>
            )}
          </button>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>
              Don't have an account?{' '}
              <a href="#" onClick={handleRequest} style={{ color: '#4c6ef5', fontWeight: '600' }}>
                Contact admin
              </a>

            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <p>© 2023 Engro Corporation. All rights reserved.</p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}