import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FaviconUpdater from "@/components/FaviconUpdater";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EEP Comprehensive Employees Data Management",
  description: "Ethiopian Electric Power Comprehensive Employees Data Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} style={{ position: 'relative' }}>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        {/* Global Suppressor for Next.js Dev Tools & Errors */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Suppress Error Overlays
            window.addEventListener('error', (e) => {
              if (e.message.includes('fetch') || e.message.includes('NetworkError')) {
                e.stopImmediatePropagation();
              }
            }, true);
            window.addEventListener('unhandledrejection', (e) => {
              if (e.reason?.message?.includes('fetch') || e.reason?.message?.includes('NetworkError')) {
                e.preventDefault();
              }
            }, true);

            // Hide Persistent Dev Indicators (Turbopack, Static, etc.)
            const hideDevTools = () => {
              const selectors = ['nextjs-portal', 'nextjs-dev-overlay', '#__next-build-watcher', '.nextjs-portal'];
              selectors.forEach(s => {
                document.querySelectorAll(s).forEach(el => {
                  el.style.display = 'none';
                  if (el.shadowRoot) {
                    const style = document.createElement('style');
                    style.innerHTML = ':host { display: none !important; }';
                    el.shadowRoot.appendChild(style);
                  }
                });
              });
            };
            
            setInterval(hideDevTools, 500);
          `
        }} />
        <div className="bg-blob" style={{ top: '-100px', left: '-100px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}></div>
        <div className="bg-blob" style={{ bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%)' }}></div>
        <AuthProvider>
          <FaviconUpdater />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
