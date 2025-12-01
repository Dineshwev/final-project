# New Dashboard Page

A modern SEO Dashboard page has been added using React + Tailwind with small shadcn-style UI primitives.

- Route: `/dashboard` (protected)
- Components:
  - `src/components/ui/button.tsx` – Button with `variant` (default | secondary | outline | ghost) and `size` props.
  - `src/components/ui/card.tsx` – Card layout with `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`.
- Icons: `lucide-react`.

## Run

From `frontand/`:

```powershell
npm start
```

Then open http://localhost:3000/dashboard

## Notes
- The page uses absolute imports like `components/ui/button`, enabled by setting `baseUrl` to `src` in `tsconfig.json`.
- Tailwind is already configured; no extra steps needed.
- If you want to reuse the Button and Card elsewhere, import from `components/ui/*`.
