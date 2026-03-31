import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import About from './About';

describe('About', () => {
  it('menampilkan heading halaman tentang', () => {
    renderWithProviders(<About />);

    expect(screen.getByRole('heading', { name: 'Pengikut Raja Capybara' })).toBeTruthy();
    expect(screen.getByText('Misi')).toBeTruthy();
  });
});
