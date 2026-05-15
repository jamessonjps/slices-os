import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerSW } from 'virtual:pwa-register'

// Sync dark mode with system preference immediately (before render)
const mq = window.matchMedia('(prefers-color-scheme: dark)');
if (mq.matches) document.documentElement.classList.add('dark');
mq.addEventListener('change', (e) => {
  e.matches
    ? document.documentElement.classList.add('dark')
    : document.documentElement.classList.remove('dark');
});

// Register PWA Service Worker
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)