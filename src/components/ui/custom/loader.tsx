import { Loader2 } from 'lucide-react';

export function Loader({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function LoaderWithText({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader />
      <p>Loading</p>
    </div>
  );
}
