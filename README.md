# PetPaw Backend Rebuild

Portable Node.js rebuild of the canonical PetPaw pet food and pet
accessories store (Design 04: Fresh Nature Eco, forest green, leaf
green and warm kraft beige). This is step 1 of the backend rebuild
project: a source project that can be deployed to Hostinger as a Node
Web App with MySQL. It is not live yet. No Hostinger change was made
to build it, and the static live site at
https://pristine-aliceblue-albatross-89.hostingersite.com/ was not
touched. That static site stays as the fallback until this backend is
deployed and verified live on a separate new temp domain.

## What it is

- Express app, entry file `server.js`, start command `node server.js`.
  No build step is needed. The frontend is plain files in `public/`.
- The shop frontend is the canonical PetPaw frontend, copied verbatim
  from the live static export `workspace/your_files/petpaw-live/
  petpaw-live.html` (artifact petpaw-live, exact copy of canonical
  petpaw v4): same Design 04 palette, same PetPaw leaf logo, same
  opening animation with Skip intro, same 7 pages (Homepage, Shop and
  Category, Product Detail, Cart, Checkout, About, Contact), same copy,
  same filters, same cart and checkout flow, same animations. The only
  changes are that products now load from the API, orders, newsletter
  signups and contact messages are saved to the database, card details
  are never sent to the server, and the footer links to the Admin Panel.
- All fixes from the canonical build are kept: the blank page on open
  is prevented by guarded storage helpers and an error boundary with
  an "Open PetPaw again" retry screen; the header search shows live
  suggestions with photos and prices and matches descriptions and
  detail points, not just names; the checkout confirmation no longer
  claims a payment partner takes card payments; the Interlinkz name is
  on the opening animation, in the footer brand block, in the
  "PetPaw by Interlinkz" bottom strip and on the About page; both
  categories have full detail pages.
- 12 products, 6 Pet Food and 6 Pet Accessories, with the exact PKR
  prices from the canonical build, including Natural Chicken Kibble for
  Dogs 3 kg PKR 4,850, Salmon and Rice Dog Food 2 kg PKR 5,400, Kitten
  Chicken and Tuna Food 1.5 kg PKR 3,200 and Soft Pet Bed, Leaf Green
  PKR 4,500. Product photos are files in `public/images/`, not
  embedded data. All 16 images were byte scanned: 5 files carried
  EXIF or XMP packets (Adobe Photoshop data on the puppy food photo,
  EXIF on the ceramic bowl photo, XMP on the hero, about and grooming
  photos), and those packets were stripped from every file. A second
  byte scan after the strip found no EXIF, IPTC, XMP or C2PA metadata
  in any file, and every image still decodes. The hero and about
  photos are the same dog photo, used in both places as in the
  canonical build.
- Facts come only from the Resources PDF
  (`workspace/your_files/petpaw-resources-v1/petpaw-resources-v1.pdf`).
  Contact details are placeholders, Not provided yet, shown on the
  Contact page as "Not provided yet" for phone, email and address. No
  reviews, ratings, prices or client details were invented.

## Backend

- MySQL only, through the `mysql2` driver. Tables in `db/schema.sql`:
  products, orders, order_items, subscribers, messages, admins, sessions.
  The tables are created automatically on first start, and the 12
  products are seeded from `db/seed-products.json` when the products
  table is empty. Orders, subscribers, messages and admins start empty
  in production.
- Order placement: the server reads prices from the database and
  computes the total itself. A price or total sent by the browser is
  ignored. PetPaw products have no size variants, so order items carry
  only a product id and a quantity. Order numbers are PP-1001, PP-1002
  and so on.
- Newsletter and contact messages are saved to the database.
- Admin Panel at `/admin.html`, linked from the site footer. First use
  the owner sets her own admin email and password (minimum 8 characters).
  Passwords are salted with scrypt, mixed with the SESSION_SECRET
  pepper, never stored in plain text. Sign in returns a session token
  that lives for 30 days. Wrong passwords are rejected. The panel shows
  live stats (Orders, Revenue, Messages, Subscribers) and Orders,
  Messages and Subscribers tabs. Order status (New, Confirmed,
  Dispatched, Delivered, Cancelled) and message status (New, Read,
  Replied) can be changed and the change persists.

## API

- `GET /api/health`
- `GET /api/products` and `GET /api/products/:id`
- `POST /api/orders` with customerName, email, phone, address, city,
  notes, payment (cash or card) and items (productId, qty). Returns
  orderNumber and total. Card details are never sent or stored; no
  card payment is processed, as in the canonical build.
- `POST /api/newsletter` with email.
- `POST /api/contact` with name, email, subject and message.
- `GET /api/admin/status`, `POST /api/admin/setup`, `POST /api/admin/signin`,
  `POST /api/admin/signout`
- `GET /api/admin/data` (Bearer <redacted>), `PATCH /api/admin/orders/:id`,
  `PATCH /api/admin/messages/:id` (Bearer <redacted>)

## Environment variables

No credential is hardcoded anywhere. Set these in the environment:

| Variable | Value |
|---|---|
| PORT | Port to listen on. Hostinger sets this. Local default 3000. |
| DB_HOST | MySQL host. On Hostinger use 127.0.0.1, not localhost. |
| DB_PORT | MySQL port. 3306. |
| DB_USER | MySQL user. |
| DB_PASSWORD | MySQL password. |
| DB_NAME | MySQL database name. |
| SESSION_SECRET | Secret pepper mixed into admin password hashes. Set a long random value; changing it invalidates existing admin passwords. |

Copy `.env.example` to `.env` for local runs and fill in real values.
Never commit `.env`. No `.env` file ships with this project.

## Run locally

1. Install Node 18 or newer, and MySQL or MariaDB.
2. Create the database and a user, for example:
   `CREATE DATABASE petpaw;`
   `CREATE USER 'petpaw'@'127.0.0.1' IDENTIFIED BY 'a-strong-password';`
   `GRANT ALL PRIVILEGES ON petpaw.* TO 'petpaw'@'127.0.0.1';`
3. `npm install`
4. Set the environment variables in `.env` or the shell.
5. `node server.js`, then open http://127.0.0.1:3000
6. `node scripts/verify.js` runs the API end to end check (pages, 12
   products with exact prices, order saving with server computed
   totals, unknown product rejected, client sent totals ignored,
   newsletter, contact, admin first use setup, short password refused,
   second setup refused, wrong password rejected, correct sign in,
   admin data, order and message status changes that persist, sign
   out). It needs the server running, on a clean database.
7. `node scripts/dom-check.js` runs the real frontend in jsdom against
   the running server (intro with Skip intro, hero, Shop 12 of 12,
   Pet Food filter 6 of 12, shop search salmon 2 of 12, header search
   bed 1 of 12, detail page, Add to Bag, cart subtotal, checkout
   through the API, newsletter, category page, About, Contact, menu,
   Admin Panel setup, dashboard and wrong password error). It also
   needs a clean database.

## Deploy to Hostinger (next step, not done yet)

1. Push this folder to a GitHub repository (petpaw-backend, account
   zaidisyeda02-dev).
2. In Hostinger hPanel create a new Web App website on a new temp
   domain. Do not overwrite the existing static live site at
   https://pristine-aliceblue-albatross-89.hostingersite.com/. Use Node
   version 22.
3. Deploy from the GitHub repository. Build command: `npm install`.
   Entry file: `server.js`. Start command: `node server.js`.
4. In hPanel create a MySQL database and user, then create the tables
   with `db/schema.sql` (the app also creates them on first start).
5. Set the environment variables in the Web App settings: DB_HOST
   127.0.0.1, DB_PORT 3306, DB_USER, DB_PASSWORD, DB_NAME,
   SESSION_SECRET, and PORT if Hostinger asks for it. Never put
   credentials in the code.
6. Restart the app, open the live URL and verify every page, a full
   order, newsletter, contact, admin setup and sign in, at desktop and
   phone widths, before sending any link.

## Verification, done locally on 18 November 2026

- API check `node scripts/verify.js`: 52 checks, 0 failed. Pages, all
  12 products with exact PKR prices, 6 Pet Food and 6 Pet Accessories,
  order total 2 x 4850 + 4500 = 14200 with the client-sent total ignored,
  unknown product rejected, newsletter and contact saved, admin setup,
  short password refused, second setup refused, wrong password rejected,
  correct sign in, admin data and stats, order and message status
  changes persisting, sign out and signed out token refused.
- DOM execution check `node scripts/dom-check.js` (jsdom, real app.js
  against the running server): 36 checks, 0 failed. Intro with Skip
  intro, hero, Shop 12 of 12, Pet Food filter 6 of 12, shop search
  salmon 2 of 12, header search bed 1 of 12, detail page PKR 4,850 with
  breadcrumb and back link, Add to Cart badge 1 and toast, cart subtotal
  PKR 4,850, checkout through the API with PP order number, bag empty
  after checkout, newsletter, Pet Accessories category 6 of 6, About
  page PetPaw is by Interlinkz, Contact page Not provided yet x3 with
  message sent, footer Admin Panel link, mobile menu, Admin Panel
  first-use setup, dashboard stats and wrong password error.
- Two bugs were found in `scripts/dom-check.js` itself (not in the app)
  and fixed: the Skip intro click raced the app.js load so the listener
  was not attached yet, and the product detail check ran while the shop
  grid was still filtered to the 1 bed search result. Both checks pass
  after the fix.
- Test data was cleared after verification: orders, order items,
  subscribers, messages, admins and sessions were emptied and the
  order auto-increment reset, so the production database starts empty.
  Verified after the clear: 12 products seeded, 0 orders, 0
  subscribers, 0 messages, 0 admins, 0 sessions, 0 order items.
- Not yet verified: a real rendered browser check at 390px for
  horizontal overflow and console errors. No browser could be launched
  locally. The CSS is verbatim from the canonical build, which was
  verified at 390px with no overflow, and the only frontend changes
  are data loading from the API and the three submit handlers plus the
  Admin Panel link. A real browser check must still happen before any
  live deploy.

## Known items

- The shop cart is kept in the browser for the visit only, as in the
  canonical build. Orders are saved to the database at checkout.
- No live backend exists yet. This project has only been run and
  verified locally.
