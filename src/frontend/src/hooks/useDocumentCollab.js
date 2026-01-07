import { useCallback, useEffect, useRef, useState } from 'react';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#14b8a6'];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getWsUrl = () => {
    const explicit = import.meta.env.VITE_WS_URL;
    if (explicit) return trimTrailingSlash(explicit);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
    const wsBase = trimTrailingSlash(backendUrl).replace(/^http/, 'ws');
    return `${wsBase}/ws/documents`;
};

export const useDocumentCollab = ({ docId, shareToken, displayName, onRemoteContent, onError, onStatusChange }) => {
    const [connected, setConnected] = useState(false);
    const [remoteCursors, setRemoteCursors] = useState([]);
    const wsRef = useRef(null);
    const clientIdRef = useRef(`client_${Math.random().toString(36).slice(2)}`);
    const colorRef = useRef(getRandomColor());

    useEffect(() => {
        if (!docId) return undefined;
        setRemoteCursors([]);

        const wsUrl = getWsUrl();
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            const authToken = localStorage.getItem('accessToken');
            const payload = {
                type: 'join',
                docId,
                clientId: clientIdRef.current,
                displayName,
                color: colorRef.current
            };
            if (shareToken) {
                payload.shareToken = shareToken;
            } else if (authToken) {
                payload.authToken = authToken;
            }
            ws.send(JSON.stringify(payload));
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'joined' && data.content !== undefined) {
                    onRemoteContent?.(data.content);
                    onStatusChange?.('saved');
                    return;
                }
                if (data.type === 'content-update') {
                    if (data.from !== clientIdRef.current) {
                        onRemoteContent?.(data.content);
                    }
                    onStatusChange?.('saved');
                    return;
                }
                if (data.type === 'cursor-update') {
                    if (data.user?.clientId === clientIdRef.current) return;
                    setRemoteCursors((prev) => {
                        const filtered = prev.filter((c) => c.user?.clientId !== data.user?.clientId);
                        return [...filtered, data];
                    });
                    return;
                }
                if (data.type === 'presence') {
                    const activeIds = new Set((data.users || []).map((u) => u.clientId));
                    setRemoteCursors((prev) => prev.filter((c) => activeIds.has(c.user?.clientId)));
                    return;
                }
                if (data.type === 'error') {
                    onError?.(data.message || 'WebSocket error');
                }
            } catch (err) {
                onError?.(err?.message || 'WebSocket parse error');
            }
        };

        ws.onerror = () => {
            onError?.('WebSocket connection error');
            onStatusChange?.('error');
        };

        ws.onclose = () => {
            setConnected(false);
            onStatusChange?.('error');
        };

        return () => {
            ws.close();
        };
    }, [docId, shareToken, displayName, onRemoteContent, onError, onStatusChange]);

    const sendContentUpdate = useCallback((content) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({
            type: 'content-update',
            docId,
            content
        }));
    }, [docId]);

    const sendCursorUpdate = useCallback((selectionStart, selectionEnd) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({
            type: 'cursor-update',
            docId,
            selectionStart,
            selectionEnd
        }));
    }, [docId]);

    return {
        connected,
        remoteCursors,
        sendContentUpdate,
        sendCursorUpdate
    };
};
