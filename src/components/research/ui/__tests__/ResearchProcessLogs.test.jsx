
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResearchProcessLogs from '../ResearchProcessLogs';

// Mocks
vi.mock('@/components/ui/badge', () => ({ Badge: ({ children }) => <span data-testid="badge">{children}</span> }));
vi.mock('@/components/ui/card', () => ({ Card: ({ children }) => <div data-testid="card">{children}</div>, CardContent: ({ children }) => <div>{children}</div> }));
vi.mock('@/components/ui/separator', () => ({ Separator: () => <hr /> }));
vi.mock('@/lib/utils', () => ({ cn: (...args) => args.join(' ') }));

describe('ResearchProcessLogs', () => {
    it('renders stream events correctly', () => {
        const streamEvents = [
            { step: 'queued', timestamp: Date.now(), data: { title: 'Test Research' } },
            { step: 'web_research', timestamp: Date.now(), data: { sources_gathered: [{ title: 'Source 1', url: 'http://example.com' }] } }
        ];

        render(<ResearchProcessLogs streamEvents={streamEvents} />);

        // "Test Research" appears in header and potentially as message
        expect(screen.getAllByText('Test Research').length).toBeGreaterThan(0);
        expect(screen.getByText('Queued')).toBeDefined();
        expect(screen.getByText('Web research')).toBeDefined();
        expect(screen.getByText('Source 1')).toBeDefined();
    });
});
