import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/utils';
import Contact from './Contact';

describe('Contact', () => {
  it('menampilkan info kontak utama', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByRole('heading', { name: /Mari Berdiskusi/i })).toBeTruthy();

    const emailLink = screen
      .getAllByRole('link')
      .find((link) => link.getAttribute('href')?.startsWith('mailto:'));
    expect(emailLink).toBeTruthy();
    expect(emailLink?.getAttribute('href')).toContain('mailto:rajacapybara275@gmail.com');

    expect(screen.getByRole('link', { name: /pengikut-raja-capybara/i })).toBeTruthy();
  });
});
