# Price Compare

Imagine you have a bunch of stores and you want to know **who sells your eggs the cheapest**. This app helps you do that.

You type what you’re looking for (like `eggs`), the app talks to the internet, and then shows you a list of offers sorted from **cheapest** to **more expensive**.

---

## 1. What this project is

- **What it is:** A small React Native app built with **Expo**.
- **What it does:**
  - Lets you type a product name or SKU.
  - Calls a web API (via RapidAPI) to fetch offers.
  - Shows the offers in a list, highlighting the **cheapest** one.
- **Where the main code lives:** `App.js` and helper functions in `src/offerUtils.js`.

You don’t need to know all the fancy words right away; just follow the steps below.

---

## 2. What you need before you start

- **Node.js** (the thing that runs JavaScript outside the browser).
  - If you’re not sure you have it, run:
    ```bash
    node -v
    ```
- **npm** (comes with Node) or **yarn** to install packages.
- **Expo Go** app on your phone (optional but handy):
  - iOS: App Store → search for `Expo Go`.
  - Android: Play Store → search for `Expo Go`.

If `node -v` doesn’t work, install Node from <https://nodejs.org> first.

---

## 3. First-time setup (installing things)

In a terminal, go into this project folder (the one with `package.json`), then run:

```bash
npm install
```

This downloads all the pieces the app needs into the `node_modules` folder.

You only need to do this **once per machine** (or when dependencies change).

---

## 4. Putting in your RapidAPI key (without hard‑coding it)

This app needs a **RapidAPI key** to talk to the real API, but the key itself should **not** live in the code or be committed to Git.

High‑level idea (no deep DevOps knowledge required):

- You keep the key in a **secret place** (environment variables or your platform’s secret store).
- The app reads it at runtime.
- The key never appears in the repo.

Typical patterns (depending on where you run the app):

- **Local development:**
  - Use a `.env` file and something like `expo-env`, `react-native-dotenv`, or your preferred env loader.
  - Or set an environment variable in your shell before starting Expo.
- **CI / real deployments:**
  - Store the key in your CI / hosting provider’s **secrets** settings.
  - Map that secret into an env var the app can read.

You can also point `RAPIDAPI_BASE_URL`, `RAPIDAPI_PATH`, and `RAPIDAPI_HOST` at the real API endpoint you want to use, again via config / environment rather than hard‑coding sensitive values.

---

## 5. How to run the app (development)

From the project folder, start the Expo dev server with:

```bash
npm start
```

This is the same as running:

```bash
expo start
```

What happens next:

- A terminal menu and/or a browser window (Metro bundler) will appear.
- You’ll see a **QR code**.

To actually see the app:

- **On a physical device:**
  - Install **Expo Go**.
  - Make sure your phone and your computer are on the **same Wi‑Fi**.
  - Scan the QR code with your camera (iOS) or Expo Go app (Android).
- **On iOS Simulator (Mac only):**
  - Press `i` in the terminal running Expo, or click the iOS button in the Metro UI.
- **On Android Emulator:**
  - Press `a` in the terminal, or click the Android button.

If everything works, you should see the **Price Compare** screen with a search box and results area.

---

## 6. How to use the app

1. In the text box labeled **“Product or SKU”**, type something like:
   - `eggs`
   - a specific SKU / barcode / product name
2. Tap the **Compare** button (or hit enter on the keyboard).
3. The app will:
   - Show a loading spinner while it asks the API for offers.
   - Show an **error message** if the request fails.
   - List the offers it found, sorted so the **cheapest** one is at the top and marked with a **“Cheapest”** badge.

If you see **“Enter a query above and tap Compare to see offers.”**, it means no results yet—try another search.

---

## 7. How the code is roughly organized (non-scary version)

- **`App.js`**
  - Holds the main screen.
  - Keeps track of:
    - **`query`** – what you typed.
    - **`results`** – list of offers from the API.
    - **`loading`** – whether it’s currently fetching.
    - **`error`** – any error message.
  - Uses `handleSearch` to:
    - Build the API URL from your query.
    - Call `fetch` with the RapidAPI headers.
    - Parse the JSON response.
    - Use helper functions to extract and sort offers.
- **`src/offerUtils.js`** (not shown here, but referenced):
  - `extractOffers(responseJson)` – pulls out the offer list from the raw API response.
  - `mapOffersToViewModel(offers)` – converts raw offers into the shape the UI needs.
  - `sortOffersByPrice(offers)` – makes sure cheapest offers come first.

You only need to understand this if you want to change logic; to just **run** the app, you can ignore it.

---

## 8. How to run tests

This project has **two levels** of tests:

- **Unit tests** (tiny pieces of code, checked in isolation).
- **End-to-end (E2E) tests** with **Detox** (pretends to be a human tapping around the real app).

### 8.1 Unit tests (Jest)

This uses **Jest** and **@testing-library/react-native**.

- To run all unit tests:

  ```bash
  npm test
  ```

  or, if you prefer the more explicit name:

  ```bash
  npm run test:unit
  ```

Jest will:

- Look at the `jest` config in `package.json`.
- Use the React Native preset.
- Apply extra testing-library matchers from `@testing-library/jest-native`.
- Save machine-readable results under `test-results/jest` (used by CI).

You should see which tests pass or fail in the terminal.

### 8.2 End-to-end tests (Detox, iOS simulator)

E2E tests are like a tiny robot that opens the app and checks that basic flows still work.

Prerequisites (Mac only):

- Xcode + iOS simulator installed.
- You’ve generated native projects once via Expo:

  ```bash
  npx expo prebuild
  ```

- The iOS workspace / scheme names match what’s in `package.json` under the `detox` section. If they differ, update that config.

Useful commands:

- **Build the app for E2E (iOS debug simulator):**

  ```bash
  npm run e2e:build
  ```

- **Run the Detox E2E tests:**

  ```bash
  npm run e2e:test
  ```

- **Do both (build then test):**

  ```bash
  npm run e2e
  ```

Detox will:

- Build an iOS simulator build of the app.
- Launch a simulator (for example, an iPhone 15).
- Run the tests in `e2e/*.e2e.js` using Jest.
- Save machine-readable results under `test-results/e2e`.

If everything is wired up, you should see the simulator pop up and tests pass or fail in the terminal.

### 8.3 Where tests show up in CircleCI

On the **main** branch, CircleCI runs two jobs:

- A **unit test job** (`build-and-test`) that runs Jest and saves results from `test-results/jest`.
- An **E2E job** (`e2e-detox`) on macOS that runs `npm run e2e` and saves results from `test-results/e2e`.

In the CircleCI UI:

- The **Tests** tab shows both unit and E2E test results.
- The **Artifacts** tab lets you download the raw JUnit XML files if you’re curious.

---

## 9. How to develop / change things

Here’s how to safely poke at the app:

- **Change the default search query:**
  - In `App.js`, look for:
    ```js
    const [query, setQuery] = useState('eggs');
    ```
  - Change `'eggs'` to whatever you want as the default.

- **Change styling / colors:**
  - At the bottom of `App.js` there is a big `StyleSheet.create({ ... })` object.
  - Tweak colors, padding, fonts, etc.
  - Expo will hot-reload your changes.

- **Change how offers are sorted or displayed:**
  - Look at `src/offerUtils.js`.
  - Update `sortOffersByPrice` or how prices are formatted.

When you save a file, the app should automatically reload in your device/simulator.

---

## 10. Common gotchas

- **Nothing happens when searching:**
  - Double-check that you replaced `RAPIDAPI_KEY`.
  - Ensure `RAPIDAPI_BASE_URL`, `RAPIDAPI_PATH`, and `RAPIDAPI_HOST` match the real API.

- **Network / CORS / API errors:**
  - Watch the error message displayed in the UI.
  - Check your terminal for logs.

- **Expo dev tools not opening:**
  - If the browser doesn’t open automatically, go to <http://localhost:19002> manually.

---

## 11. Short version (too long; didn’t read)

- **Install stuff:** `npm install`
- **Wire up API key:** configure a RapidAPI key via environment variables / secrets (don’t hard‑code it)
- **Run the app:** `npm start` and open it via Expo Go / simulator
- **Run unit tests:** `npm test` (or `npm run test:unit`)
- **Run E2E tests (Mac + iOS simulator):** `npm run e2e`
- **See tests in CI:** check the **Tests** and **Artifacts** tabs for the `build-and-test` and `e2e-detox` jobs on CircleCI

That’s it. You now know enough to run and tinker with this app. 🎉
