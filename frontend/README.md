# FucyTech Frontend

## Quick Setup

1. Clone the project.
2. Run `yarn` or `yarn install` to install dependencies. If you don't have yarn, run `npm install -g yarn` first.
3. To start the local JSON server, open another terminal and run `yarn run server`.
4. Start the development server with `yarn start`.

---

## Folder Structure (Post-Refactor)

```
frontend/
├── src/
│   ├── assets/               # Images, icons, and static assets
│   ├── components/           # Reusable React components
│   ├── config/               # Configuration files (e.g., config.js)
│   ├── layouts/              # Layout components (MainLayout, etc.)
│   ├── pages/                # Main app pages (formerly 'views')
│   ├── services/             # API and service modules
│   ├── store/                # Redux/Zustand state management
│   ├── themes/               # Theme and style definitions
│   ├── utils/                # Utility/helper functions
│   ├── Website/              # Standalone website module (untouched by migration)
│   ├── ...                   # Other supporting directories
│   └── index.js              # App entry point
├── public/                   # Static public assets
├── README.md                 # Project documentation (this file)
├── package.json              # Project dependencies and scripts
└── ...

### Key Migration Notes
- All imports have been updated to use the new folder names: `components/`, `layouts/`, `pages/`, `services/`, `config/`.
- The `Website/` directory remains untouched and can be developed independently.
- Old directories (`ui-component/`, `API/`, `views/`, `layout/`) have been removed after migration.

### Developer Guidance
- Place new UI elements in `components/`, layouts in `layouts/`, and pages in `pages/`.
- All API/service logic should go in `services/`.
- For app-wide configuration, use files in `config/`.
- Do **not** modify the `Website/` directory unless working on the website module.
- Follow the new structure for all future development to ensure maintainability.

---

## Additional Notes
- If you encounter missing imports, ensure you are using the updated folder structure as shown above.
- For restoring lost UI (e.g., login/register forms), refer to the migration notes or contact the project maintainer.