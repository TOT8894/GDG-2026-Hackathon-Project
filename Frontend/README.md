# KuraLew Frontend

A React + Vite frontend for the Digital Kuralew project. This app includes:

- React Router-based page routing
- A shared layout with navbar and footer
- Reusable UI components in `src/components`
- Pages for `Home`, `Chat`, `About`, and `NotFound`

## Project Structure

```
Frontend/
├── package.json
├── README.md
├── index.html
├── vite.config.js
├── public/
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Layout.jsx
    │   ├── Navbar.jsx
    │   └── FeatureCard.jsx
    └── pages/
        ├── Home.jsx
        ├── Chat.jsx
        ├── About.jsx
        └── NotFound.jsx
```

## Installation

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL shown by Vite, for example:

```bash
http://localhost:5173
```

## Available Routes

- `/` → Home
- `/chat` → Chat
- `/about` → About
- any unknown route → NotFound

## Notes

- `src/App.jsx` configures routing using `react-router-dom`.
- `src/components/Layout.jsx` renders the shared navbar and footer.
- `src/components/Navbar.jsx` contains the navigation links.
- `src/components/FeatureCard.jsx` is a reusable UI component used on the home page.

## Local Development

Run the backend and frontend separately:

```bash
cd Backend
npm install
npm run dev
```

```bash
cd Frontend
npm install
npm run dev
```

Then open the Vite URL in your browser.

## Build

```bash
cd Frontend
npm run build
```
