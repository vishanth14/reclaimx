import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  return (
    <div key={transitionKey} className="rx-page-enter-kinetic w-full h-full">
      {children}
    </div>
  );
}
