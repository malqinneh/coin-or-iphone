const hibiscss = require('hibiscss').default;
const kit = require('hibiscss/default');

const fcss = hibiscss(
  kit({
    borderRadius: { '4': '4px' },
    colors: {
      black: '#002230',
      green: '#03c899',
      red: '#fd3d50',
      white: '#fff',
      fadedWhite: 'rgba(255, 255, 255, 0.1)',
      fadeWhite: 'rgba(255, 255, 255, 0.75)',
      overlay: 'rgba(0, 34, 48, 0.75)'
    },
    fontFamily: {
      sans: `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif`
    },
    fontSize: {
      12: '12px',
      14: '14px',
      16: '16px',
      20: '20px',
      36: '36px',
      48: '48px',
      80: '80px',
      96: '96px',
      '5vw': '5vw',
      '10vw': '10vw',
      '20vw': '20vw'
    },
    letterSpacing: {
      '0.5': '0.5px',
      '1': '1px',
    },
    lineHeight: {
      '1.2': 1.2,
      '1.5': 1.5
    },
    maxWidths: {
      400: '400px',
      1400: '1400px'
    }
  }),
  { m: '767px' }
);

const custom = `
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: normal;
  src: url('/assets/ibm-plex-sans-regular.woff') format('woff'),
       url('/assets/ibm-plex-sans-regular.woff2') format('woff2');
}

html,
body {
  height: 100%;
}

body {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  cursor: pointer;
}

.a-none {
  border: 0;
  outline: 0;
  background-color: inherit;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.LoadingIcon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: blink 200ms linear infinite;
}

@keyframes blink {
  0% { opacity: 1.0; }
  1% { opacity: 0.0; }
  24% { opacity: 0.0; }
  25% { opacity: 1.0; }
  50% { opacity: 1.0; }
  51% { opacity: 0.0; }
  74% { opacity: 0.0; }
  75% { opacity: 1.0; }
  100% { opacity: 1.0; }
}

.Link {
  display: inline-block;
  padding-bottom: 1px;
  border-bottom: 1px currentColor solid;
  transition: opacity 200ms ease;
}

.Link:hover {
  opacity: 0.75;
}

.c-text { cursor: text; }
.p-fixed { position: fixed; }
.p-fill { top: 0; left: 0; bottom: 0; right: 0; }
.b-donate { border: 1px #ccc solid; }
.bb-0 { border-bottom: none; }
.br-4 { border-radius: 4px; }
.brt-4 { border-top-left-radius: 4px; border-top-right-radius: 4px; }
.brb-4 { border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
.w-90p { width: 95%; }
.ud-none { -webkit-user-drag: none; -moz-user-drag: none; user-drag: none; }
.ws-noWrap { white-space: nowrap; }
`;

module.exports = custom + fcss;
