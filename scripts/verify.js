"use strict";

/* End to end check for the PetPaw backend rebuild. Run the server
   first (node server.js), then run: node scripts/verify.js
   It uses only the public API and pages, the same way a visitor and
   the owner would. It exits non-zero if any check fails. */

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

async function req(path, options) {
  const res = await fetch(BASE + path, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, text, json };
}

async function main() {
  const health = await req("/api/health");
  check("health endpoint", health.status === 200 && health.json && health.json.ok);

  for (const page of ["/", "/shop", "/about", "/contact", "/cart", "/checkout", "/category/pet-food", "/product/1"]) {
    const r = await req(page);
    check("page loads " + page, r.status === 200 && r.text.indexOf('<main id="app">') !== -1 && r.text.indexOf('<script src="/app.js">') !== -1, "status " + r.status);
  }

  const adminPage = await req("/admin.html");
  check("admin page loads", adminPage.status === 200 && adminPage.text.indexOf("Admin Panel") !== -1 && adminPage.text.indexOf('<script src="/admin.js">') !== -1, "status " + adminPage.status);

  const products = await req("/api/products");
  check("products endpoint returns 12", products.status === 200 && Array.isArray(products.json) && products.json.length === 12, products.status + " count " + (products.json && products.json.length));
  const byId = {};
  if (Array.isArray(products.json)) {
    for (const p of products.json) byId[p.id] = p;
  }
  check("Natural Chicken Kibble for Dogs PKR 4,850", byId["natural-chicken-kibble"] && byId["natural-chicken-kibble"].price === 4850);
  check("Salmon and Rice Dog Food PKR 5,400", byId["salmon-rice-dog-food"] && byId["salmon-rice-dog-food"].price === 5400);
  check("Kitten Chicken and Tuna Food PKR 3,200", byId["kitten-chicken-tuna"] && byId["kitten-chicken-tuna"].price === 3200);
  check("Adult Cat Salmon Kibble PKR 3,850", byId["adult-cat-salmon-kibble"] && byId["adult-cat-salmon-kibble"].price === 3850);
  check("Puppy Growth Formula PKR 4,200", byId["puppy-growth-formula"] && byId["puppy-growth-formula"].price === 4200);
  check("Grain Free Lamb Dog Food PKR 5,900", byId["grain-free-lamb-dog-food"] && byId["grain-free-lamb-dog-food"].price === 5900);
  check("Wooden Chew Bone Toy PKR 850", byId["wooden-chew-bone"] && byId["wooden-chew-bone"].price === 850);
  check("Soft Pet Bed, Leaf Green PKR 4,500", byId["soft-pet-bed"] && byId["soft-pet-bed"].price === 4500);
  check("Adjustable Dog Collar and Leash Set PKR 1,650", byId["collar-leash-set"] && byId["collar-leash-set"].price === 1650);
  check("Ceramic Pet Food Bowl PKR 1,250", byId["ceramic-pet-bowl"] && byId["ceramic-pet-bowl"].price === 1250);
  check("Cat Scratching Post PKR 3,400", byId["cat-scratching-post"] && byId["cat-scratching-post"].price === 3400);
  check("Pet Grooming Brush Set PKR 1,450", byId["grooming-brush-set"] && byId["grooming-brush-set"].price === 1450);
  check("6 Pet Food and 6 Pet Accessories",
    Array.isArray(products.json) &&
    products.json.filter((p) => p.category === "Pet Food").length === 6 &&
    products.json.filter((p) => p.category === "Pet Accessories").length === 6);
  check("every product has an image, a description and details",
    Array.isArray(products.json) && products.json.every((p) => p.img && p.img.indexOf("/images/") === 0 && p.description && p.details.length > 0));

  const detail = await req("/api/products/kitten-chicken-tuna");
  check("product detail endpoint", detail.status === 200 && detail.json && detail.json.name === "Kitten Chicken and Tuna Food");
  const missing = await req("/api/products/no-such-product");
  check("unknown product detail is 404", missing.status === 404);

  for (const img of ["/images/hero.jpg", "/images/natural-chicken-kibble.jpg", "/images/soft-pet-bed.jpg", "/images/salmon-rice-dog-food.png"]) {
    const r = await req(img);
    check("image serves " + img, r.status === 200 && r.text.length > 1000);
  }

  const order = await req("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Verify Test",
      email: "verify@example.com",
      phone: "03001234567",
      address: "1 Test Street",
      city: "Karachi",
      notes: "verify run",
      payment: "cash",
      items: [
        { productId: "natural-chicken-kibble", qty: 2 },
        { productId: "soft-pet-bed", qty: 1 },
      ],
    }),
  });
  check("checkout saves an order", order.status === 201 && order.json && /^PP-\d+$/.test(order.json.orderNumber), order.status + " " + order.text.slice(0, 120));
  check("order total is 2 x 4850 + 4500 = 14200", order.json && order.json.total === 14200, "got " + (order.json && order.json.total));

  const badOrder = await req("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Verify Test",
      email: "verify@example.com",
      phone: "03001234567",
      address: "1 Test Street",
      city: "Karachi",
      total: 1,
      items: [{ productId: "natural-chicken-kibble", qty: 1 }],
    }),
  });
  check("order total is not trusted from the client (server prices only)", badOrder.status === 201 && badOrder.json && badOrder.json.total === 4850, "got " + (badOrder.json && badOrder.json.total));

  const unknown = await req("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Verify Test",
      email: "verify@example.com",
      phone: "03001234567",
      address: "1 Test Street",
      city: "Karachi",
      items: [{ productId: "no-such-product", qty: 1 }],
    }),
  });
  check("unknown product is rejected", unknown.status === 400);

  const news = await req("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "verify-" + Date.now() + "@example.com" }),
  });
  check("newsletter saves", news.status === 200 && news.json && news.json.subscribed);

  const contact = await req("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Verify Test", email: "verify@example.com", subject: "Verify", message: "This is a verification message." }),
  });
  check("contact message saves", contact.status === 201 && contact.json && contact.json.saved);

  const status = await req("/api/admin/status");
  check("admin status endpoint", status.status === 200 && typeof status.json.hasAdmin === "boolean", JSON.stringify(status.json));

  const email = "admin-" + Date.now() + "@example.com";
  let token = null;
  if (status.json && !status.json.hasAdmin) {
    const short = await req("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "short@example.com", password: "short" }),
    });
    check("short admin password is refused", short.status === 400, short.status + " " + short.text.slice(0, 120));
    const setup = await req("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "verify-pass-123" }),
    });
    check("admin first use setup", setup.status === 201 && setup.json && setup.json.token, setup.status + " " + setup.text.slice(0, 120));
    token = setup.json && setup.json.token;
    const second = await req("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "other@example.com", password: "verify-pass-123" }),
    });
    check("second admin setup is refused", second.status === 409);
  } else {
    console.log("NOTE  admin already exists in this database, setup checks skipped");
  }

  const wrong = await req("/api/admin/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-password" }),
  });
  if (token) check("wrong admin password is rejected", wrong.status === 401);

  if (token) {
    const ok = await req("/api/admin/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "verify-pass-123" }),
    });
    check("correct admin password signs in", ok.status === 200 && ok.json && ok.json.token);
    token = ok.json.token;
  }

  const noAuth = await req("/api/admin/data");
  check("admin data without a token is refused", noAuth.status === 401);

  if (token) {
    const data = await req("/api/admin/data", {
      headers: { Authorization: "Bearer " + token },
    });
    check("admin data loads", data.status === 200 && data.json && data.json.stats, data.status);
    check("admin stats count the saved orders, message and subscriber",
      data.json && data.json.stats.orders >= 2 && data.json.stats.messages >= 1 && data.json.stats.subscribers >= 1,
      JSON.stringify(data.json && data.json.stats));
    check("admin revenue matches the saved orders",
      data.json && data.json.stats.revenue >= 14200,
      JSON.stringify(data.json && data.json.stats));
    const firstOrder = data.json && data.json.orders && data.json.orders[0];
    if (firstOrder) {
      const patch = await req("/api/admin/orders/" + firstOrder.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: "Confirmed" }),
      });
      check("order status change saves", patch.status === 200);
      const again = await req("/api/admin/data", {
        headers: { Authorization: "Bearer " + token },
      });
      const same = again.json.orders.find((o) => o.id === firstOrder.id);
      check("order status change persists", same && same.status === "Confirmed");
    }
    const firstMessage = data.json && data.json.messages && data.json.messages[0];
    if (firstMessage) {
      const patch = await req("/api/admin/messages/" + firstMessage.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: "Read" }),
      });
      check("message status change saves", patch.status === 200);
    }
    const signout = await req("/api/admin/signout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({}),
    });
    check("admin sign out works", signout.status === 200);
    const afterOut = await req("/api/admin/data", {
      headers: { Authorization: "Bearer " + token },
    });
    check("signed out token is refused", afterOut.status === 401);
  }

  console.log("\n" + checks + " checks, " + failures + " failed.");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error("Verify run failed:", err.message);
  process.exit(1);
});
