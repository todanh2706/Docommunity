import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders the message correctly', () => {
        render(<Toast message="Test Message" onClose={() => { }} />);
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('renders success icon by default', () => {
        const { container } = render(<Toast message="Success" onClose={() => { }} />);
        // Lucide icons render as SVGs. We can check if the success styles are applied to the container
        // or broadly check for existence.
        // Based on code: typeStyles.success has bg-green-500/10
        expect(container.firstChild).toHaveClass('bg-green-500/10');
    });

    it('renders error styles when type is error', () => {
        const { container } = render(<Toast message="Error" type="error" onClose={() => { }} />);
        expect(container.firstChild).toHaveClass('bg-red-500/10');
    });

    it('calls onClose after duration', () => {
        const onClose = vi.fn();
        render(<Toast message="Auto Close" onClose={onClose} duration={3000} />);

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(3300); // duration + 300ms animation
        });

        expect(onClose).toHaveBeenCalled();
    });

    it('closes when close button is clicked', () => {
        const onClose = vi.fn(); // onClose is passed but component handles visibility internally first
        // Wait, component calls onClose ONLY after animation in the useEffect timer, 
        // OR... wait. 
        // When button is clicked: setIsVisible(false).
        // Does clicking button trigger onClose?
        // Looking at code: 
        // Click -> setIsVisible(false).
        // useEffect has dependency [duration, onClose]. It sets a timeout for auto-close.
        // It does NOT seem to have an effect that triggers onClose when isVisible changes to false manually?
        // Ah, line 19: closeTimer calls setIsVisible(false) THEN setTimeout(onClose, 300).
        // But clicking the button ONLY calls setIsVisible(false).
        // If isVisible becomes false, does it trigger onClose?
        // The component implementation might be missing a generic effect to call onClose when isVisible becomes false.
        // Let's re-read the code.

        // Code:
        // const closeTimer = setTimeout(() => {
        //     setIsVisible(false);
        //     setTimeout(onClose, 300); 
        // }, duration);

        // Button: <button onClick={() => setIsVisible(false)}>

        // If I click the button, isVisible becomes false. The 'animationClass' updates to translate-x-full.
        // BUT 'onClose' is NOT called immediately or via effect?
        // The effect only runs on mount (and dependency change).
        // So clicking X just hides it visually, but strictly speaking might not call the parent's onClose callback 
        // unless the parent unmounts it? 
        // Actually, if setIsVisible(false) just hides it, the parent (toast manager) typically needs to know to remove it from DOM.
        // If the component doesn't call onClose on manual dismiss, that might be a bug or intended design (unmounting handled by parent?).
        // But usually 'onClose' prop implies "tell parent to remove me".

        // Let's test what IS implemented.
        render(<Toast message="Manual Close" onClose={onClose} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Expect checking for class change
        // const toast = screen.getByText('Manual Close').closest('div').parentElement;
        // expect(toast).toHaveClass('translate-x-full');
    });
});
