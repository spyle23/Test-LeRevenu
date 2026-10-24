import { type Page, expect, test } from "@playwright/test";

const DEMO_PASSWORD = process.env.DEMO_USERS_PASSWORD ?? "Revenu2026!";

async function signIn(page: Page, username = "Camille_B", next = "/") {
  await page.goto(`/connexion?redirect=${encodeURIComponent(next)}`);
  await page.getByLabel("E-mail ou identifiant").fill(username);
  await page.getByLabel("Mot de passe").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.waitForURL((url) => url.pathname === next.split("?")[0]);
}

const feed = (page: Page) => page.getByRole("region", { name: "Discussions" });

test.describe("Visitors", () => {
  test("browse the discussions coming from Strapi @mobile", async ({ page }) => {
    await page.goto("/");

    const cards = feed(page).getByRole("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(1);
    await expect(cards.first().getByRole("heading", { level: 3 })).not.toBeEmpty();
    await expect(cards.first().getByText(/réponses?|rép\./).filter({ visible: true }).first()).toBeVisible();
  });

  test("filter by space and sort by publication date", async ({ page }) => {
    await page.goto("/espaces/bourse");
    await expect(page.getByRole("heading", { level: 1, name: "Bourse & actions" })).toBeVisible();

    const spaces = feed(page).getByRole("article").getByRole("link", { name: "Bourse & actions" });
    const total = await feed(page).getByRole("article").count();
    await expect(spaces).toHaveCount(total);

    const titles = () => feed(page).getByRole("heading", { level: 3 }).allTextContents();
    const recent = await titles();
    await page.getByRole("link", { name: "Plus anciennes" }).click();
    await expect(page).toHaveURL(/tri=oldest/);
    await expect.poll(titles).toEqual([...recent].reverse());
  });

  test("open a discussion and are invited to sign in before replying", async ({ page }) => {
    await page.goto("/espaces/bourse");
    await feed(page).getByRole("link", { name: /Ouvrir un PEA avec 5 000 €/ }).click();

    await expect(page).toHaveURL(/\/discussions\/ouvrir-un-pea-avec-5-000-par-ou-commencer$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Ouvrir un PEA/);
    await expect(page.getByRole("heading", { name: /\d+ réponses/ })).toBeVisible();
    await expect(page.getByText("Réponse de la rédaction")).toBeVisible();
    await expect(page.getByRole("link", { name: "Se connecter pour répondre" })).toBeVisible();
  });

  test("are sent to the login page when they try to publish", async ({ page }) => {
    await page.goto("/publier");
    await expect(page).toHaveURL(/\/connexion\?redirect=%2Fpublier/);
  });
});

test.describe("Members", () => {
  test("see validation errors, then publish a discussion and reply to it", async ({ page }) => {
    await signIn(page, "Camille_B", "/publier");

    await page.getByLabel("Titre").fill("PER ?");
    await page.getByRole("button", { name: "Publier" }).click();
    await expect(page.getByText("Le titre doit contenir au moins 10 caractères.")).toBeVisible();
    await expect(page.getByText("Le contenu est obligatoire.")).toBeVisible();
    await expect(page.getByText("Choisissez un espace.")).toBeVisible();
    await expect(page.getByLabel("Titre")).toHaveValue("PER ?");

    const title = `Faut-il ouvrir un PER à 45 ans ? (e2e ${Date.now()})`;
    await page.getByLabel("Titre").fill(title);
    await page.getByLabel("Espace").selectOption("retraite");
    await page.getByLabel("Détails").fill("Salariée, imposée à 30 %, je me demande si la déduction vaut le blocage.");
    await page.getByRole("button", { name: "Publier" }).click();

    await page.waitForURL(/\/discussions\/faut-il-ouvrir-un-per-a-45-ans/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("heading", { name: "Aucune réponse pour l’instant" })).toBeVisible();

    await page.getByLabel("Votre réponse").fill("Je complète : je verse surtout en fin d’année.");
    await page.getByRole("button", { name: "Publier ma réponse" }).click();

    await expect(page.getByText("Votre réponse est publiée.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "1 réponse" })).toBeVisible();
    await expect(page.getByText("Je complète : je verse surtout en fin d’année.")).toBeVisible();

    await page.goto("/espaces/retraite");
    await expect(feed(page).getByRole("link", { name: title })).toBeVisible();
  });
});
