// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Characters from './Characters';
import { BrowserRouter } from 'react-router-dom';

// Mock API
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn().mockResolvedValue({
            data: [
                {
                    _id: '1',
                    name: { en: 'Thanatos' },
                    rarity: 'UR',
                    factionKey: 'hades',
                    roleKey: 'fighter',
                    row: 'back',
                    attackTypeKey: 'physical',
                    imageUrl: 'http://example.com/image.png',
                    skills: []
                }
            ]
        })
    }
}));

// Mock Auth
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ canEdit: false })
}));

// Mock Translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    })
}));

// Mock AdUnit
vi.mock('../components/AdUnit', () => ({
    default: () => <div>AdUnit</div>
}));

describe('Characters Page', () => {
    it('renders character list with colored dots for attributes', async () => {
        render(
            <BrowserRouter>
                <Characters />
            </BrowserRouter>
        );

        // Wait for data to load
        await screen.findByText('Thanatos');

        // Check for colored dots (by class name presence in the rendered HTML)
        // Faction: Blue
        const blueDot = document.querySelector('.bg-blue-500');
        expect(blueDot).toBeTruthy();

        // Role: Green
        const greenDot = document.querySelector('.bg-green-500');
        expect(greenDot).toBeTruthy();

        // Position: Yellow
        const yellowDot = document.querySelector('.bg-yellow-500');
        expect(yellowDot).toBeTruthy();

        // AttackType: Red
        const redDot = document.querySelector('.bg-red-500');
        expect(redDot).toBeTruthy();
    });
});
