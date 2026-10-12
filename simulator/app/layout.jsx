import './globals.css';

export const metadata = {
  title: 'Login | Pojok Statistik',
  description: 'Masuk ke Simulator Penilaian IPotik 2026'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
