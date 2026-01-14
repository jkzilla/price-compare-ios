# Price Compare (Like I’m Five Version)

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

## 4. Putting in your RapidAPI key

Right now, `App.js` has a **fake placeholder** for the API key so you don’t accidentally commit a real key:

```js
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE';
```

To make the app actually talk to the API:

1. **Get a RapidAPI key** from <https://rapidapi.com/>.
2. In `App.js`, change the line above to use your real key **locally only**, for example:
   ```js
   const RAPIDAPI_KEY = 'YOUR_REAL_KEY_HERE';
   ```
3. Make sure you **never commit** your real key to a public repo.
   - For a quick local demo, editing `App.js` is fine.
   - For something more serious, switch later to environment variables / secrets.

You can also point `RAPIDAPI_BASE_URL`, `RAPIDAPI_PATH`, and `RAPIDAPI_HOST` at the real API endpoint you want to use.

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

This project uses **Jest** and **@testing-library/react-native**.

To run the tests:

```bash
npm test
```

Jest will:

- Look at the `jest` config in `package.json`.
- Use the React Native preset.
- Apply extra testing-library matchers from `@testing-library/jest-native`.

You should see which tests pass or fail in the terminal.

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
- **Add API key:** update `RAPIDAPI_KEY` in `App.js`
- **Run the app:** `npm start` and open it via Expo Go / simulator
- **Run tests:** `npm test`

That’s it. You now know enough to run and tinker with this app, even if you’re “five”. 🎉
