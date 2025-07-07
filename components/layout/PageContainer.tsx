import React from 'react';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return <main className={`pt-16 ${className}`}>{children}</main>;
}
