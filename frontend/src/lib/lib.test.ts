import { describe, expect, it } from "vitest";
import { feedHref, parseFeedParams, toDiscussionQuery } from "./feed-params";
import { safeRedirectPath } from "./form-state";
import { timeAgo } from "./format";
import { discussionSchema, firstFieldErrors } from "./validation";

describe("discussionSchema", () => {
  const valid = { title: "Faut-il ouvrir un PER à 45 ans ?", content: "Contexte", type: "question", category: "retraite" };

  it("accepts a complete discussion", () => {
    expect(discussionSchema.safeParse(valid).success).toBe(true);
  });

  it("requires 10 characters in the title once spaces are collapsed", () => {
    const result = discussionSchema.safeParse({ ...valid, title: "  PER    ?  " });

    expect(result.success).toBe(false);
    expect(firstFieldErrors(result.error!)).toMatchObject({ title: "Le titre doit contenir au moins 10 caractères." });
  });

  it("reports every missing field", () => {
    const result = discussionSchema.safeParse({ title: "", content: "   ", category: "" });

    expect(Object.keys(firstFieldErrors(result.error!)).sort()).toEqual(["category", "content", "title", "type"]);
  });
});

describe("feed URL state", () => {
  it("falls back to safe defaults for unknown values", () => {
    expect(parseFeedParams({ vue: "hack", tri: "random", page: "-3" })).toEqual({ view: "all", sort: "recent", page: 1, q: "" });
  });

  it("maps the view to API filters", () => {
    const state = parseFeedParams({ vue: "unanswered", tri: "oldest", page: "2" });

    expect(toDiscussionQuery(state, "bourse")).toMatchObject({ category: "bourse", status: "unanswered", sort: "oldest", page: 2 });
  });

  it("builds short canonical URLs and resets pagination when filters change", () => {
    const state = parseFeedParams({ page: "3", tri: "oldest" });

    expect(feedHref("/espaces/bourse", state, { view: "question" })).toBe("/espaces/bourse?vue=question&tri=oldest");
    expect(feedHref("/", state, { sort: "recent" })).toBe("/");
  });
});

describe("safeRedirectPath", () => {
  it("only allows same-site paths", () => {
    expect(safeRedirectPath("/publier")).toBe("/publier");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath("/\\evil.example")).toBe("/");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-10-24T12:00:00Z");

  it.each([
    ["2026-10-24T11:59:40Z", "à l’instant"],
    ["2026-10-24T11:35:00Z", "il y a 25 min"],
    ["2026-10-24T07:00:00Z", "il y a 5 h"],
    ["2026-10-23T10:00:00Z", "hier"],
    ["2026-10-20T12:00:00Z", "il y a 4 j"],
  ])("%s → %s", (date, expected) => {
    expect(timeAgo(date, now)).toBe(expected);
  });
});
