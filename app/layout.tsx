import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

/**
 * Configuración de metadata de la aplicación
 */
export const metadata: Metadata = {
  title: 'Mony - Tu Coach Financiero Personal por WhatsApp',
  description: 'Transforma tus finanzas conversando por WhatsApp. Tu coach personal te ayuda a ahorrar, controlar gastos y alcanzar tus metas financieras de forma automática.',
  keywords: 'finanzas, dinero, gastos, ahorro, presupuesto, fintech',
  authors: [{ name: 'Mony Team' }],
}

/**
 * Configuración de viewport para Next.js 14
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0284c7' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-mony.png" />
        <link rel="apple-touch-icon" href="/logo-mony.png" />
        <link rel="preconnect" href="https://crm.whitelabel.lat" />
        <link rel="dns-prefetch" href="https://crm.whitelabel.lat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} ${inter.variable} ${jetbrains.variable} antialiased min-h-screen overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            containerClassName="sm:!top-4 !top-2"
            toastOptions={{
              duration: 4000,
              className: 'text-sm sm:text-base',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                maxWidth: '90vw',
                wordBreak: 'break-word',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </ThemeProvider>
        
        {/* Chatwoot Widget */}
        <Script
          id="chatwoot-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,t) { 
                var BASE_URL="https://crm.whitelabel.lat"; 
                var g=d.createElement(t),s=d.getElementsByTagName(t)[0]; 
                g.src=BASE_URL+"/packs/js/sdk.js"; 
                g.async = true; 
                s.parentNode.insertBefore(g,s); 
                g.onload=function(){ 
                  window.chatwootSDK.run({ 
                    websiteToken: 'PdqXYKMHJKZJKdDagUvd7vbg', 
                    baseUrl: BASE_URL 
                  }) 
                } 
              })(document,"script");
            `,
          }}
        />
      </body>
    </html>
  )
}