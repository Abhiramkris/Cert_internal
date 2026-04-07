import { getUserProfile } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates';
import { LibraryClient } from './library-client';
import { ShieldAlert, Layout, Cpu, Box } from 'lucide-react';

export default async function LibraryPage() {
  const user = await getUserProfile();
  
  if (!user) redirect('/login');

  const role = user.profile?.role?.toLowerCase();
  const isAuthorized = role === 'admin' || role === 'developer' || role === 'dev' || role === 'manager';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-zinc-950 mb-2">Restricted Access</h1>
        <p className="text-zinc-500 max-w-md">
          The Studio Library is a high-fidelity design vault reserved for Administrators and Developers.
        </p>
      </div>
    );
  }

  // Categorize components
  const components = Object.entries(COMPONENT_TEMPLATES).map(([id, template]) => {
    const { preview, code, ...safeTemplate } = template as any;
    return {
      id,
      ...safeTemplate
    };
  });

  const categories = components.reduce((acc: Record<string, any[]>, component) => {
    const prefix = component.id.includes('_') ? component.id.split('_')[0].toLowerCase() : 'uncategorized';
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(component);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Design Intelligence</span>
        </div>
        <h1 className="text-5xl font-black text-zinc-950 tracking-tighter italic uppercase">Studio Library</h1>
        <p className="text-zinc-500 max-w-2xl text-lg font-medium">
          Audit and verify all high-fidelity components in real-world scenarios using the synchronous Live Preview Node.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-16">
        {Object.entries(categories).map(([key, items]) => items.length > 0 && (
          <section key={key} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
               <div className="p-2 bg-zinc-100 rounded-lg">
                  {key === 'hero' ? <Layout className="w-5 h-5 text-zinc-900" /> : <Box className="w-5 h-5 text-zinc-900" />}
               </div>
               <h2 className="text-xl font-black text-zinc-950 uppercase tracking-widest">{key}s</h2>
               <span className="ml-auto text-[10px] font-bold px-3 py-1 bg-zinc-100 rounded-full text-zinc-500 uppercase tracking-widest">
                  {items.length} Units
               </span>
            </div>

            <LibraryClient components={items} />
          </section>
        ))}
      </div>
    </div>
  );
}
