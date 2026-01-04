import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUser } from './useUser';
import * as useApiModule from './useApi';

// Mock useApi
const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('./useApi', () => ({
    useApi: () => ({
        get: mockGet,
        put: mockPut,
    }),
}));

describe('useUser Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches user profile successfully', async () => {
        const mockData = { id: 1, username: 'test' };
        mockGet.mockResolvedValue({ data: { data: mockData } });

        const { result } = renderHook(() => useUser());

        await act(async () => {
            const data = await result.current.getUserProfile();
            expect(data).toEqual(mockData);
        });

        expect(mockGet).toHaveBeenCalledWith('/users/me');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('handles error fetching user profile', async () => {
        const errorMessage = 'Network error';
        mockGet.mockRejectedValue({ response: { data: { error: errorMessage } } });

        const { result } = renderHook(() => useUser());

        await act(async () => {
            try {
                await result.current.getUserProfile();
            } catch (e) {
                // Expected error
            }
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
    });

    it('updates user profile successfully', async () => {
        const mockData = { fullname: 'New Name', email: 'new@example.com' };
        const responseData = { ...mockData, id: 1 };

        mockPut.mockResolvedValue({ data: { data: responseData } });

        const { result } = renderHook(() => useUser());

        await act(async () => {
            const data = await result.current.updateUserProfile(mockData);
            expect(data).toEqual(responseData);
        });

        expect(mockPut).toHaveBeenCalledWith('/users/me', {
            fullName: 'New Name',
            email: 'new@example.com',
            phone: undefined,
            bio: undefined
        });
    });
});
