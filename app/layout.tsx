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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  )
}
