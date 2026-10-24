import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DiscussionSummary } from "@/lib/strapi/types";
import { DiscussionCard, DiscussionList } from "./discussion-card";

const now = new Date("2026-10-24T12:00:00Z");

const discussion = (overrides: Partial<DiscussionSummary> = {}): DiscussionSummary => ({
  documentId: "doc-1",
  slug: "ouvrir-un-pea-avec-5-000-par-ou-commencer",
  title: "Ouvrir un PEA avec 5 000 € : par où commencer ?",
  excerpt: "Je viens d’ouvrir un PEA en ligne et j’ai 5 000 € à y placer.",
  type: "question",
  replyCount: 4,
  createdAt: "2026-10-24T09:00:00Z",
  lastActivityAt: "2026-10-24T11:30:00Z",
  author: { username: "Thomas_PEA", displayName: "Thomas", isEditorial: false, isSubscriber: false },
  category: { documentId: "cat-1", name: "Bourse & actions", slug: "bourse", icon: "candles", color: "#007aff" },
  ...overrides,
});

describe("DiscussionCard", () => {
  it("shows the title, author, space, reply count and publication date", () => {
    render(<DiscussionCard discussion={discussion()} now={now} />);

    expect(screen.getByRole("link", { name: "Ouvrir un PEA avec 5 000 € : par où commencer ?" })).toHaveAttribute(
      "href",
      "/discussions/ouvrir-un-pea-avec-5-000-par-ou-commencer",
    );
    expect(screen.getByText("Thomas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bourse & actions" })).toHaveAttribute("href", "/espaces/bourse");
    expect(screen.getByText("4", { selector: "b" })).toBeInTheDocument();
    expect(screen.getByText("il y a 3 h").closest("time")).toHaveAttribute("dateTime", "2026-10-24T09:00:00Z");
    expect(screen.getByText("Question")).toBeInTheDocument();
  });

  it("flags recent threads nobody has answered yet", () => {
    render(<DiscussionCard discussion={discussion({ replyCount: 0, createdAt: "2026-10-24T10:00:00Z" })} now={now} />);

    expect(screen.getByText("Nouveau")).toBeInTheDocument();
    expect(screen.getByText("0", { selector: "b" })).toHaveClass("text-alert");
  });

  it("marks editorial posts and survives a deleted author", () => {
    const { rerender } = render(
      <DiscussionCard
        discussion={discussion({ author: { username: "LaRedaction", displayName: "La rédaction du Revenu", isEditorial: true, isSubscriber: false } })}
        now={now}
      />,
    );
    expect(screen.getByText("Rédaction")).toBeInTheDocument();

    rerender(<DiscussionCard discussion={discussion({ author: null })} now={now} />);
    expect(screen.getByText("Membre supprimé")).toBeInTheDocument();
  });
});

describe("DiscussionList", () => {
  it("renders discussions in the order given by the API", () => {
    render(
      <DiscussionList
        now={now}
        discussions={[
          discussion({ documentId: "a", slug: "a", title: "Première discussion du fil" }),
          discussion({ documentId: "b", slug: "b", title: "Deuxième discussion du fil" }),
        ]}
      />,
    );

    const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => within(heading).getByRole("link").textContent);
    expect(titles).toEqual(["Première discussion du fil", "Deuxième discussion du fil"]);
  });
});
