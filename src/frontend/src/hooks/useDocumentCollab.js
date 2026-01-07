import { useCallback, useEffect, useRef, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

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

export const useDocumentCollab = ({ docId, shareToken, displayName, onRemoteContent, onError, onStatusChange, onSaveConfirm }) => {
    const [connected, setConnected] = useState(false);
    const [remoteCursors, setRemoteCursors] = useState([]);
    const wsRef = useRef(null);
    const clientIdRef = useRef(`client_${Math.random().toString(36).slice(2)}`);
    const colorRef = useRef(getRandomColor());

    // Track the last confirmed content from server to calculate diffs against
    const lastSyncedContentRef = useRef('');

    useEffect(() => {
        if (!docId) return undefined;
        setRemoteCursors([]);
        lastSyncedContentRef.current = ''; // Reset on doc switch

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

                // 1. Initial Join
                if (data.type === 'joined' && data.content !== undefined) {
                    lastSyncedContentRef.current = data.content; // Sync baseline
                    onRemoteContent?.(data.content);
                    onStatusChange?.('saved');
                    return;
                }

                // 2. Full Content Update (Fallback)
                if (data.type === 'content-update') {
                    if (data.from !== clientIdRef.current) {
                        lastSyncedContentRef.current = data.content; // Update baseline
                        onRemoteContent?.(data.content);
                    }
                    onStatusChange?.('saved');
                    return;
                }

                // 3. Patch Update (Bandwidth Optimized)
                if (data.type === 'patch-update') {
                    if (data.from !== clientIdRef.current) {
                        // Apply patch to our shadow copy
                        const patches = dmp.patch_fromText(data.patches);
                        const [newContent, results] = dmp.patch_apply(patches, lastSyncedContentRef.current);

                        // Check if patch applied successfully (optional strictness)
                        // For LWW, we just accept the result
                        lastSyncedContentRef.current = newContent;
                        onRemoteContent?.(newContent);
                    } else {
                        // It's our own patch echoing back (optional confirmation)
                        // If backend rejected/modified it, we might need logic here
                        // For now, assume server ack
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
                if (data.type === 'saved') {
                    onStatusChange?.('saved');
                    onSaveConfirm?.(data.savedAt);
                    return;
                }
                if (data.type === 'save-error') {
                    onStatusChange?.('error');
                    onError?.(data.message || 'Save failed');
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

    const sendContentUpdate = useCallback((newContent) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            // WebSocket not ready - notify error so UI can handle
            onStatusChange?.('error');
            onError?.('WebSocket not connected');
            return false;
        }

        // Calculate diff
        const oldContent = lastSyncedContentRef.current;

        // If content is very small or very different, full update might be better?
        // But patches are usually safe.
        // Let's rely on patches if we have a baseline.

        if (oldContent === newContent) return; // No change

        // If this is the FIRST update and no baseline, send full.
        // But we usually have baseline from 'joined'.

        const diffs = dmp.diff_main(oldContent, newContent);
        dmp.diff_cleanupSemantic(diffs);
        const patches = dmp.patch_make(oldContent, diffs);
        const patchText = dmp.patch_toText(patches);

        // Optimistic update of our shadow
        // NOTE: If server rejects, we drift. But in LWW server accepts all.
        lastSyncedContentRef.current = newContent;

        // Heuristic: If patch is larger than content (rare), send content
        if (patchText.length > newContent.length) {
            wsRef.current.send(JSON.stringify({
                type: 'content-update',
                docId,
                content: newContent
            }));
        } else {
            wsRef.current.send(JSON.stringify({
                type: 'patch-update',
                docId,
                patches: patchText,
                // Optional: Send checksum or base version for robustness
            }));
        }
        return true;

    }, [docId, onStatusChange, onError]);

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
