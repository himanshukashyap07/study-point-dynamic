"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const validateStep1 = () => {
    setError("");
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    
    setIsLoading(true);
    setError("");

    try {
      // Register User directly (no avatar step)
      const res = await axios.post("/api/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: "" // API will use default
      });

      if (res.status === 201) {
        setStep(3); // Success & Verification
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card auth-card--wide">
        
        {/* Progress Bar */}
        <div className="auth-progress-track">
          <div 
            className="auth-progress-fill"
            style={{ width: `${(step === 1 ? 50 : 100)}%` }}
          />
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="animate-fade-in-right">
            <div className="auth-header">
              <div className="auth-logo-box">
                <span>SP</span>
              </div>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join the StudyPoint community today</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-grid">
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="username">Username</label>
                  <input 
                    id="username" type="text" required
                    value={formData.username} onChange={handleChange}
                    className="auth-input"
                    placeholder="Johndoe"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="email">Email Address</label>
                  <input 
                    id="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    className="auth-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="auth-grid auth-grid--2col">
                  <div className="auth-field-group">
                    <label className="auth-label" htmlFor="password">Password</label>
                    <input 
                      id="password" type="password" required
                      value={formData.password} onChange={handleChange}
                      className="auth-input"
                      placeholder="••••••••" minLength={6}
                    />
                  </div>
                  <div className="auth-field-group">
                    <label className="auth-label" htmlFor="confirmPassword">Confirm</label>
                    <input 
                      id="confirmPassword" type="password" required
                      value={formData.confirmPassword} onChange={handleChange}
                      className="auth-input"
                      placeholder="••••••••" minLength={6}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="auth-btn-primary"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 3: Success & Verification */}
        {step === 3 && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <div className="auth-success-icon">
               <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h1 className="auth-title">Registration Complete!</h1>
            <div className="auth-alert--success-box">
              <p className="auth-subtitle" style={{ opacity: 1, color: 'var(--gray-600)' }}>
                 Welcome aboard, <strong style={{ color: 'var(--gray-900)' }}>{formData.username}</strong>!<br/><br/>
                 We've sent a verification link to <strong style={{ color: 'var(--blue-600)' }}>{formData.email}</strong>. Please verify your email to access all premium features.
              </p>
            </div>

            <button onClick={() => router.push("/login")} className="auth-btn-primary" style={{ background: 'var(--gray-900)' }}>
              Continue to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
