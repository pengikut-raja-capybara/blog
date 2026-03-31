import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BlogCard from './BlogCard';
import { renderWithProviders } from '../../../test/utils';

describe('BlogCard', () => {
  it('menampilkan judul blog', () => {
    renderWithProviders(
      <BlogCard
        title="Pengikut Raja Capybara"
        excerpt="Catatan damai dari tepian sungai kerajaan."
        date="2026-03-31"
        image="/images/capybara-forest.jpg"
        slug="pengikut-raja-capybara"
        tags={['alam', 'kerajaan']}
        author="Raja Capybara"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Pengikut Raja Capybara' }),
    ).toBeTruthy();
  });
});