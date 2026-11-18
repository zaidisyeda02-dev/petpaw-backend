"use strict";

/* DOM execution check for the PetPaw backend rebuild. Runs the real
   shop frontend (public/app.js) in jsdom against the running server,
   the way a visitor would use it. Run the server first (node server.js),
   then run: node scripts/dom-check.js
   Run it on a clean database: it places one order, subscribes one
   email, sends one message and creates one admin account. It exits
   non-zero if any check fails. */

const { JSDOM, VirtualConsole, ResourceLoader } = require("jsdom");

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";

let failures = 0;
let checks = 0;

function check(name, ok, detail) {
  checks++;
  if (ok) {
    console.log("PASS  " + name);
  } else {
    failures++;
    console.log("FAIL  " + name + (detail ? "  " + detail : ""));
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(fn, timeoutMs, label) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      if (fn()) return true;
    } catch (e) {}
    await sleep(100);
  }
  console.log("TIMEOUT waiting for: " + label);
  return false;
}

function setInput(window, el, value) {
  el.value = value;
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function submitForm(window, form) {
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}

function click(window, el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

/* Only same-origin resources (the app's own scripts). Google Fonts and
   any other outside URL is blocked, so the check does not depend on it. */
class SameOriginLoader extends ResourceLoader {
  fetch(url, options) {
    if (url.startsWith(BASE)) return super.fetch(url, options);
    return Promise.resolve(Buffer.alloc(0));
  }
}

async function makeDom(path) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (err) => {
    const msg = String(err && err.message || err);
    if (/Could not load|not implemented/i.test(msg)) return;
    console.log("jsdom error: " + msg);
  });
  const dom = new JSDOM(html, {
    url: BASE + path,
    runScripts: "dangerously",
    resources: new SameOriginLoader(),
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.scrollTo = function () {};
      window.fetch = function (input, init) {
        const url = typeof input === "string" ? input : input.url;
        const full = url.indexOf("/") === 0 ? BASE + url : url;
        return fetch(full, init);
      };
    },
  });
  return dom;
}

async function main() {
  const dom = await makeDom("/");
  const window = dom.window;
  const document = window.document;
  const appText = () => document.getElementById("app").textContent;

  await waitFor(() => !!document.getElementById("skipIntro"), 3000, "intro Skip button to appear");
  check("intro shows with Skip intro", !!document.getElementById("skipIntro"));

  // Wait for the app script to finish loading and rendering first: the
  // Skip button exists in the static HTML before app.js attaches its
  // click listener, so clicking too early is lost.
  await waitFor(() => appText().indexOf("Natural goodness for your best friend") !== -1, 5000, "hero to render before Skip");

  const skip = document.getElementById("skipIntro");
  if (skip) click(window, skip);
  await waitFor(() => { const i = document.getElementById("intro"); return i && i.style.display === "none"; }, 3000, "intro to dismiss");
  check("Skip intro dismisses the intro", (document.getElementById("intro") || {}).style.display === "none");

  await waitFor(() => appText().indexOf("Natural goodness for your best friend") !== -1, 5000, "hero to render");
  check("hero Natural goodness for your best friend renders", appText().indexOf("Natural goodness for your best friend") !== -1);
  check("hero has a Shop All Products button", appText().indexOf("Shop All Products") !== -1);
  check("hero photo is present", !!document.querySelector(".hero-photo img"));

  click(window, document.querySelector('nav.main a[data-nav="/shop"]'));
  await waitFor(() => appText().indexOf("Showing 12 of 12 products") !== -1, 3000, "shop 12 of 12");
  check("Shop shows 12 of 12 products", appText().indexOf("Showing 12 of 12 products") !== -1);

  const petFood = document.querySelector('[data-chip="pet-food"]');
  check("Pet Food filter option is present", !!petFood);
  if (petFood) click(window, petFood);
  await waitFor(() => appText().indexOf("Showing 6 of 12 products") !== -1, 3000, "Pet Food 6 of 12");
  check("Pet Food filter shows 6 of 12 products", appText().indexOf("Showing 6 of 12 products") !== -1);

  const allChip = document.querySelector('[data-chip="all"]');
  if (allChip) click(window, allChip);
  await waitFor(() => appText().indexOf("Showing 12 of 12 products") !== -1, 3000, "all filter back to 12");
  check("All Products filter restores 12 of 12", appText().indexOf("Showing 12 of 12 products") !== -1);

  // Shop search: "salmon" returns the 2 salmon products.
  setInput(window, document.getElementById("shopSearch"), "salmon");
  await waitFor(() => appText().indexOf("Showing 2 of 12 products") !== -1, 3000, "shop search salmon 2 of 12");
  check("shop search salmon returns 2 of 12", appText().indexOf("Showing 2 of 12 products") !== -1);
  check("shop search salmon shows both salmon products",
    appText().indexOf("Salmon and Rice Dog Food") !== -1 && appText().indexOf("Adult Cat Salmon Kibble") !== -1);

  // Header search: "bed" suggests the Soft Pet Bed, submitting shows 1 of 12.
  click(window, document.getElementById("searchBtn"));
  setInput(window, document.getElementById("searchInput"), "bed");
  await waitFor(() => document.getElementById("suggest").textContent.indexOf("Soft Pet Bed") !== -1, 3000, "header search suggestion");
  check("header search suggests Soft Pet Bed", document.getElementById("suggest").textContent.indexOf("Soft Pet Bed") !== -1);
  submitForm(window, document.getElementById("searchForm"));
  await waitFor(() => appText().indexOf("Showing 1 of 12 products") !== -1, 3000, "header search bed 1 of 12");
  check("header search bed returns 1 of 12", appText().indexOf("Showing 1 of 12 products") !== -1);

  // Product detail page. The header search above left the shop filtered
  // to 1 product, so clear the shop search first to get all 12 back.
  click(window, document.querySelector('nav.main a[data-nav="/shop"]'));
  await waitFor(() => appText().indexOf("Showing 12 of 12 products") !== -1 || !!document.getElementById("shopSearch"), 3000, "shop page for detail");
  const shopSearch = document.getElementById("shopSearch");
  if (shopSearch) setInput(window, shopSearch, "");
  await waitFor(() => appText().indexOf("Showing 12 of 12 products") !== -1, 3000, "shop back to 12 of 12");
  check("shop search cleared, 12 of 12 shown again", appText().indexOf("Showing 12 of 12 products") !== -1);
  const openLink = document.querySelector('a[data-nav="/product/1"]');
  check("product card opens the detail page", !!openLink);
  if (openLink) click(window, openLink);
  await waitFor(() => appText().indexOf("Natural Chicken Kibble for Dogs") !== -1 && !!document.getElementById("detailAdd"), 3000, "detail page");
  check("detail page shows PKR 4,850", appText().indexOf("PKR 4,850") !== -1);
  check("detail page shows breadcrumb and back link",
    appText().indexOf("Home") !== -1 && appText().indexOf("Back to Pet Food") !== -1);

  // Add to Cart.
  const detailAdd = document.getElementById("detailAdd");
  if (detailAdd) click(window, detailAdd);
  await waitFor(() => {
    const badge = document.querySelector("#bagBtn .bag-count");
    return badge && badge.textContent === "1";
  }, 3000, "bag badge 1");
  check("Add to Cart sets the bag badge to 1", (document.querySelector("#bagBtn .bag-count") || {}).textContent === "1");
  check("Add to Cart shows a toast", document.getElementById("toast").textContent.indexOf("Added to bag") !== -1);

  // Cart page.
  click(window, document.getElementById("bagBtn"));
  await waitFor(() => appText().indexOf("Shopping Bag") !== -1, 3000, "cart page");
  check("cart shows the Natural Chicken Kibble line", appText().indexOf("Natural Chicken Kibble for Dogs") !== -1);
  check("cart subtotal is PKR 4,850", appText().indexOf("PKR 4,850") !== -1);

  // Checkout: fill the form and place the order through the API.
  click(window, document.querySelector('a[data-nav="/checkout"]'));
  await waitFor(() => !!document.getElementById("checkoutForm"), 3000, "checkout form");
  setInput(window, document.getElementById("coName"), "DOM Test");
  setInput(window, document.getElementById("coEmail"), "dom-test@example.com");
  setInput(window, document.getElementById("coPhone"), "03001234567");
  setInput(window, document.getElementById("coAddress"), "1 DOM Street, Test Area");
  setInput(window, document.getElementById("coCity"), "Karachi");
  submitForm(window, document.getElementById("checkoutForm"));
  await waitFor(() => appText().indexOf("Order confirmed") !== -1, 5000, "order confirmation");
  check("checkout places the order and shows confirmation", appText().indexOf("Order confirmed") !== -1);
  check("confirmation shows a PP order number", /PP-\d+/.test(appText()));
  check("confirmation total is PKR 4,850", appText().indexOf("PKR 4,850") !== -1);
  check("bag is empty after checkout", (document.querySelector("#bagBtn .bag-count") || {}).style.display === "none");

  // Newsletter, back on the homepage.
  click(window, document.querySelector('nav.main a[data-nav="/"]'));
  await waitFor(() => !!document.getElementById("newsForm"), 3000, "newsletter form");
  setInput(window, document.getElementById("newsEmail"), "dom-news-" + Date.now() + "@example.com");
  submitForm(window, document.getElementById("newsForm"));
  await waitFor(() => {
    const ok = document.getElementById("newsOk");
    return ok && ok.classList.contains("show");
  }, 5000, "newsletter confirmation");
  check("newsletter shows signed up confirmation", (document.getElementById("newsOk") || {}).classList.contains("show"));

  // Category detail page.
  click(window, document.querySelector('a[data-nav="/category/pet-accessories"]'));
  await waitFor(() => appText().indexOf("Pet Accessories") !== -1 && appText().indexOf("Showing 6 of 6 products") !== -1, 3000, "category page");
  check("Pet Accessories category page shows 6 of 6 products", appText().indexOf("Showing 6 of 6 products in Pet Accessories") !== -1);

  // About page.
  click(window, document.querySelector('nav.main a[data-nav="/about"]'));
  await waitFor(() => appText().indexOf("About PetPaw") !== -1, 3000, "about page");
  check("About page shows PetPaw is by Interlinkz", appText().indexOf("PetPaw is by Interlinkz") !== -1);

  // Contact page.
  click(window, document.querySelector('nav.main a[data-nav="/contact"]'));
  await waitFor(() => !!document.getElementById("contactForm"), 3000, "contact form");
  check("Contact page shows Not provided yet for phone, email and address", (appText().match(/Not provided yet/g) || []).length === 3);
  setInput(window, document.getElementById("ctName"), "DOM Test");
  setInput(window, document.getElementById("ctEmail"), "dom-test@example.com");
  setInput(window, document.getElementById("ctSubject"), "DOM check");
  setInput(window, document.getElementById("ctMsg"), "This is a DOM verification message.");
  submitForm(window, document.getElementById("contactForm"));
  await waitFor(() => document.getElementById("ctOk").style.display === "block", 5000, "contact sent");
  check("contact form shows message received", document.getElementById("ctOk").style.display === "block");

  // Footer Admin Panel link.
  check("footer has an Admin Panel link", !!document.getElementById("footer-admin-link"));

  // Mobile menu: About, Contact and Shopping Bag listed.
  click(window, document.getElementById("menuBtn"));
  await waitFor(() => document.getElementById("mobileMenu").classList.contains("open"), 3000, "menu opens");
  const menuText = document.getElementById("mobileMenu").textContent || "";
  check("menu lists About, Contact and Shopping Bag",
    menuText.indexOf("About") !== -1 && menuText.indexOf("Contact") !== -1 && menuText.indexOf("Shopping Bag") !== -1);

  window.close();

  // Admin Panel in its own DOM.
  const adminDom = await makeDom("/admin.html");
  const aWindow = adminDom.window;
  const aDocument = aWindow.document;
  await waitFor(() => aDocument.getElementById("admin-root").textContent.indexOf("Set up the Admin Panel") !== -1, 5000, "admin setup form");
  check("Admin Panel shows first-use setup", aDocument.getElementById("admin-root").textContent.indexOf("Set up the Admin Panel") !== -1);
  aDocument.getElementById("admin-email").value = "dom-admin@example.com";
  aDocument.getElementById("admin-password").value = "dom-pass-123";
  submitForm(aWindow, aDocument.getElementById("admin-auth-form"));
  await waitFor(() => aDocument.getElementById("admin-root").textContent.indexOf("Orders") !== -1 && aDocument.getElementById("admin-root").textContent.indexOf("Revenue") !== -1, 5000, "admin dashboard");
  check("Admin Panel dashboard shows stats after setup", aDocument.getElementById("admin-root").textContent.indexOf("Orders") !== -1 && aDocument.getElementById("admin-root").textContent.indexOf("Revenue") !== -1);
  check("Admin Panel dashboard lists the placed order", /PP-\d+/.test(aDocument.getElementById("admin-root").textContent));

  // Wrong password is rejected on the sign in form.
  click(aWindow, aDocument.getElementById("sign-out-btn"));
  await waitFor(() => aDocument.getElementById("admin-root").textContent.indexOf("Admin sign in") !== -1, 5000, "admin sign in form");
  aDocument.getElementById("admin-email").value = "dom-admin@example.com";
  aDocument.getElementById("admin-password").value = "wrong-password";
  submitForm(aWindow, aDocument.getElementById("admin-auth-form"));
  await waitFor(() => {
    const err = aDocument.getElementById("admin-error");
    return err && err.style.display !== "none" && err.textContent.length > 0;
  }, 5000, "wrong password error");
  check("Admin Panel shows an error for a wrong password", (aDocument.getElementById("admin-error") || {}).textContent.indexOf("Wrong email or password") !== -1);
  aWindow.close();

  console.log("\n" + checks + " checks, " + failures + " failed.");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error("DOM check failed:", err.message);
  process.exit(1);
});
