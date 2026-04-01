import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import About from './About';

describe('About', () => {
  it('menampilkan heading halaman tentang', () => {
    renderWithProviders(<About />);

    expect(screen.getByRole('heading', { name: 'Tentang Kami' })).toBeTruthy();
    expect(screen.getByText(/Pengikut Raja Capybara/i)).toBeTruthy();
  });
});
