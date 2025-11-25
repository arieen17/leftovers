This repository is a small Expo + React Native (Expo Router) starter using TypeScript and NativeWind/Tailwind.

Keep the guidance short and actionable so AI coding agents can be immediately productive.

Project at-a-glance
- Frameworks: Expo (React Native), Expo Router for file-based routing, NativeWind (Tailwind) for styling.
- Entry points: `src/app/_layout.tsx` sets up the `Stack` (expo-router). App screens live under `src/app`.
- Shared components: `src/components/*` (e.g., `AppText.tsx`, `Button.tsx`). Utility for classnames: `src/utils/cn.ts` which wraps `clsx` + `tailwind-merge`.

Build / dev / common commands
- Start the dev server (Expo): `npm run start` (defined in `package.json`). Use `npm run android` / `npm run ios` / `npm run web` for platform-specific starts.
- Formatting: `npm run format` (Prettier + tailwind plugin). Linting: `npm run lint` (ESLint).

Important conventions and patterns
- Path aliases: `@/*` → `src/*` (see `tsconfig.json`). Use `@/components/...` in imports.
- Styling: components use `className` strings (NativeWind). Use the `cn` helper in `src/utils/cn.ts` for conditional class merging instead of manually concatenating.
- Components are small and presentational by default: prefer adding props for visual variants (see `Button` theme prop and `AppText` size/color props).
- Routing: File-based routing via Expo Router. Add screens under `src/app` (for example, `src/app/index.tsx`) and use modal/stack config via `_layout.tsx`.

Examples the agent should follow
- Add a new screen: create `src/app/settings.tsx` with a default export React component. Use `AppText` and `Button` from `src/components` for consistent styling.
- New presentational component: put in `src/components/`, export named function, and prefer `className` + `cn(...)` for styling.

Integration & external dependencies
- Tailwind / NativeWind: `tailwind.config.js`, `global.css` imports Tailwind layers. Babel + nativewind are configured in `babel.config.js` and `metro.config.js`.
- Keep versions consistent with `package.json`. Avoid adding native modules without updating `app.json` and testing on device/emulator.

Files to check first when editing or adding features
- `src/app/_layout.tsx` — routing/layout.
- `src/app/index.tsx` — example screen.
- `src/components/*` — shared UI patterns.
- `src/utils/cn.ts` — className merging helper.
- `package.json`, `tsconfig.json`, `babel.config.js`, `tailwind.config.js`, `metro.config.js` — build/dev tooling.

Style and behavior choices to preserve
- Use TypeScript types and strict mode (tsconfig extends expo base with `strict: true`).
- Prefer small, focused components and composition over large screens.
- Keep className-driven styling (NativeWind) rather than inline style objects unless necessary for platform-specific code.

Examples of code patterns
- Conditional classes with `cn`: `className={cn(condition && 'text-sm', 'mb-2')}` (see `src/components/AppText.tsx`).
- Button themes: follow `theme` prop pattern (`primary|secondary|tertiary`) and toggle `disabled` via `opacity-50` (see `src/components/Button.tsx`).

When to ask the user
- If a change needs native dependencies, or app.json/Android/iOS manifest edits, ask before adding.
- Ask when introducing global state or navigation patterns beyond simple file-based screens (e.g., adding Redux or navigation stacks with custom behavior).

If merging existing `.github/copilot-instructions.md` content, preserve any project-specific rules and add or replace the sections above when they conflict.

Questions for you
- Which CI/tooling (if any) should the agent assume (no CI config detected in repo)?
- Any private lint/commit hooks or local workflow notes to add?

End of instructions.
