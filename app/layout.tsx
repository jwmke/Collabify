import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <title>Collabify</title>
        <meta name="description" content="Discover all of the collaborations between your favorite artists on Spotify." />
        <link rel="icon" href="/favicon/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
