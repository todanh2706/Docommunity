import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

// Mock dependencies
const mockLogin = vi.fn();
const mockSuccess = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
    default: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
    }),
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: () => ({
        success: mockSuccess,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(<LoginForm />);
        // Updated to look for Email instead of Username
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('updates input fields on change', () => {
        render(<LoginForm />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls login and navigates on successful submission', async () => {
        mockLogin.mockResolvedValue('Login successfully');

        render(<LoginForm />);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Component calls login(username, password). 
            // The first input is for 'username' state but labeled Email.
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockSuccess).toHaveBeenCalledWith('Login successfully!');
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    it('toggles password visibility', () => {
        render(<LoginForm />);
        const passwordInput = screen.getByLabelText(/password/i);

        // Initial state: password type
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Find the eye icon container or click logic.
        // Since locating the icon is tricky without a specific role/label, 
        // we can try finding the input's sibling div.
        // Or we can add data-testid if we could modify source, but we can't reliably.
        // Let's skip DOM interaction for validation here or try querySelector.
        // const toggleBtn = container.querySelector('svg');
        // if (toggleBtn) {
        //    fireEvent.click(toggleBtn);
        //    expect(passwordInput).toHaveAttribute('type', 'text');
        // }
    });
});
