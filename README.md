# Navabe frontend

React + TypeScript + Tailwind CSS single-page application. It consumes the
Flask-RESTX API and keeps only the shopping cart in local storage; identity and
authorization remain server-side.

The interface uses Tailwind utilities directly in React components. Shared
utility strings live in `src/ui/styles.ts`, while `src/styles.css` only imports
Tailwind and declares the design theme. Add handwritten CSS only when Tailwind
cannot express the required behavior.

The visual language combines a calm, product-led storefront with high-contrast
EB Garamond typography, generous imagery, restrained green and beige color, and
generous whitespace. Avoid rounded cards, decorative gradients, glass effects,
and soft shadows in both light and dark themes. Book details always open in a
modal rather than a dedicated product page.

From the repository root, `./run.sh` builds the frontend `development` image
and runs Vite on `http://localhost:5173`. Source files are mounted into the
container, so Vite hot module replacement updates the browser after a change.
Vite proxies `/api` to the backend container, keeping browser requests and
session cookies on the same origin.

Changes to `package.json` or `package-lock.json` require rebuilding with
`./run.sh up`. The Dockerfile's `runtime` stage still produces the Nginx image
used for production:

```bash
docker build --target runtime -t navabe-frontend .
```

For local development without Docker:

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_PAYPAL_CLIENT_ID` to a PayPal sandbox or production client ID. The
PayPal SDK uses its test client when the variable is empty.

The catalog initially loads 24 books. An `IntersectionObserver` requests the
next API page near the bottom of the catalog until `pagination.has_next` is
false. Text and sort changes restart the catalog from page one. The search bar
uses an accessible Headless UI sorting menu and remains synchronized with the
compact version shown in the navigation after the hero leaves the viewport.

The navigation bar also provides an always-available light/dark theme switch.
The selected theme is persisted in local storage; the initial visit follows the
operating-system preference.

Quality commands:

```bash
npm test
npm run build
npm run lint
```

The main code areas are `domain` (types), `application` (cart rules),
`infrastructure` (REST adapter), and `ui` (React adapters/pages).
