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
      fadeWhite: 'rgba(255, 255, 255, 0.75)'
    },
    fontFamily: {
      sans: `'Basis Grotesque', -apple-system, BlinkMacSystemFont, sans-serif`
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
    }
  }),
  { m: '767px' }
);

const custom = `
@font-face {
  font-family: 'Basis Grotesque';
  font-style: normal;
  font-weight: normal;
  src: url('/assets/basis-grotesque-off-white.woff') format('woff'),
       url('/assets/basis-grotesque-off-white.woff2') format('woff2');
}

html,
body {
  height: 100%;
}

body {
  font-size: 16px;
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

.br-4 { border-radius: 4px; }
`;

module.exports = custom + fcss;
