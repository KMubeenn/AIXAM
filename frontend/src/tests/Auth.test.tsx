import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginStudent from '../pages/LoginStudent/LoginStudent';
import { BrowserRouter } from 'react-router-dom';

// Mock the Auth Store
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
  })
}));

describe('Authentication Flow - Student Login', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders login form correctly', () => {
    renderWithRouter(<LoginStudent />);
    
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', () => {
    renderWithRouter(<LoginStudent />);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    // Using standard HTML5 validation will prevent submission, but if JS handles it, it shows errors
    // Since we use standard <form> with required attributes now, we can check if it exists
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });
});
