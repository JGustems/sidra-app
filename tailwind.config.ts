import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      colors: {
        amber: {
          sidra: '#BA7517',
          light: '#FAEEDA',
          mid:   '#EF9F27',
        },
        teal: {
          sidra: '#0F6E56',
          light: '#E1F5EE',
          mid:   '#1D9E75',
        },
      },
    },
  },
  plugins: [],
}

export default config
