import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichText, parseBlocks } from "./rich-text";

describe("parseBlocks", () => {
  it("splits paragraphs and lists", () => {
    expect(parseBlocks("Bonjour,\n\n**Pour démarrer :**\n- un\n- deux\n\nBienvenue !")).toEqual([
      { kind: "paragraph", lines: ["Bonjour,"] },
      { kind: "paragraph", lines: ["**Pour démarrer :**"] },
      { kind: "list", items: ["un", "deux"] },
      { kind: "paragraph", lines: ["Bienvenue !"] },
    ]);
  });
});

describe("RichText", () => {
  it("renders bold text and mentions", () => {
    render(<RichText text={"Merci **beaucoup** @Vincent_ETF."} />);

    expect(screen.getByText("beaucoup").tagName).toBe("STRONG");
    expect(screen.getByText("@Vincent_ETF")).toHaveClass("text-brand-text");
  });

  it("never interprets member content as HTML", () => {
    const { container } = render(<RichText text={'<img src=x onerror="alert(1)"> <script>alert(1)</script>'} />);

    expect(container.querySelector("img, script")).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror="alert(1)">');
  });

  it("does not take an e-mail address for a mention", () => {
    render(<RichText text="Écrivez à contact@lerevenu.com" />);

    expect(screen.getByText("Écrivez à contact@lerevenu.com").tagName).toBe("P");
  });
});
