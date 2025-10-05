import React, { useEffect, useState } from 'react';

type Props = { children: React.ReactNode };

export default function ClerkWrapper({ children }: Props) {
  const clerkKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
  const [ClerkProvider, setClerkProvider] = useState<any>(null);

  useEffect(() => {
    if (!clerkKey) return;
    let mounted = true;
    // dynamic import at runtime so builds don't fail when package is absent.
    // Build the specifier at runtime to avoid a literal string that Vite would try
    // to pre-resolve during import analysis. Use the Vite ignore hint inside
    // the import call so the bundler won't attempt to resolve the module when
    // it's not installed.
    const spec = ['@clerk', 'clerk-react'].join('/');
    // @ts-ignore
    import(/* @vite-ignore */ spec)
      .then((mod) => {
        if (mounted) setClerkProvider(() => mod.ClerkProvider);
      })
      .catch(() => {
        // ignore
      });
    return () => { mounted = false; };
  }, [clerkKey]);

  if (!clerkKey) return <>{children}</>;
  if (!ClerkProvider) return <>{/* loading clerk provider... */}{children}</>;

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {children}
    </ClerkProvider>
  );
}
