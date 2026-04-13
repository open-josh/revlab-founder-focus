import './globals.css'

export const metadata = {
  title: 'Founder Focus — Daily Prioritization for Founders',
  description: 'Stop drowning in your task list. Get a prioritized "start here" recommendation matched to your energy level every morning.',
}

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
