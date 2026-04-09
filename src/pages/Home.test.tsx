import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./Home";
import type { BlogPost, SiteSettings } from "../types/blog";
import { renderWithProviders } from "../test/utils";

const { mockFetchPosts, mockFetchSiteSettings } = vi.hoisted(() => {
  return {
    mockFetchPosts: vi.fn(),
    mockFetchSiteSettings: vi.fn(),
  };
});

vi.mock("../features/blog/services/cms", () => ({
  fetchPosts: mockFetchPosts,
  fetchSiteSettings: mockFetchSiteSettings,
  resolveCmsImageUrl: (imagePath: string | undefined) => imagePath ?? "/images/placeholder-blog.jpg",
}));

describe("Home", () => {
  it("menampilkan judul situs dan judul artikel dari CMS", async () => {
    const posts: BlogPost[] = [
      {
        title: "Pengikut Raja Capybara",
        slug: "pengikut-raja-capybara",
        image: "/images/capybara-forest.jpg",
        date: "2026-03-31",
        author: "Raja Capybara",
        tags: ["alam"],
        excerpt: "Catatan damai dari tepian sungai.",
        body: "Konten artikel.",
      },
    ];

    const settings: SiteSettings = {
      site_title: "Pengikut Raja Capybara",
      description: "Blog resmi kerajaan capybara.",
    };

    mockFetchPosts.mockResolvedValueOnce(posts);
    mockFetchSiteSettings.mockResolvedValueOnce(settings);

    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: /Ketenangan dalam/i })).toBeTruthy();
    expect(await screen.findByRole("heading", { name: posts[0].title })).toBeTruthy();
  });
});
