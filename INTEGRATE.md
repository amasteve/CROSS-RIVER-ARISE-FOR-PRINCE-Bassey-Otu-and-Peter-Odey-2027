1. Copy src/lib/supabase.ts and src/portal/ into your project's src/.
2. npm i @supabase/supabase-js lucide-react   (react-router-dom + Tailwind assumed present)
3. Copy .env.example to .env and fill in URL + anon key.
4. In your existing router add (existing routes untouched):
   const PortalRoutes = lazy(() => import('./portal/PortalRoutes'));
   <Route path="/portal/*" element={<Suspense fallback={null}><PortalRoutes /></Suspense>} />
5. Run migrations 001 then 002 in the Supabase SQL editor.
6. Auth > Users: create an admin user, then:
   insert into admin_profiles(id, full_name, role) values ('<auth user uuid>', 'Your Name', 'super_admin');
7. npm run dev, open /portal/login.
