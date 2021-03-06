const html = require('choo/html');
const tinytime = require('tinytime');

const qrCodeIcon = `<svg width="20" height="20" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>qr-code</title><desc>Created with Sketch.</desc><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="desktop" transform="translate(-1348.000000, -56.000000)" fill-rule="nonzero" fill="#FFF"><g id="Group-2" transform="translate(1336.000000, 50.000000)"><g id="qr-code" transform="translate(12.000000, 6.000000)"><path d="M0,20 L9,20 L9,11 L0,11 L0,20 Z M1,12 L8,12 L8,19 L1,19 L1,12 Z" id="Shape"/><polygon id="Rectangle-path" points="3 14 6 14 6 17 3 17"/><polygon id="Shape" points="14 16 14 19 15 19 15 17 18 17 18 16"/><polygon id="Shape" transform="translate(13.500000, 18.000000) rotate(-90.000000) translate(-13.500000, -18.000000)" points="11.5 15.5 11.5 20.5 12.5 20.5 12.5 16.5 15.5 16.5 15.5 15.5"/><polygon id="Shape" transform="translate(19.500000, 13.000000) rotate(-90.000000) translate(-19.500000, -13.000000)" points="17.5 12.5 17.5 13.5 21.5 13.5 21.5 12.5"/><polygon id="Shape" transform="translate(11.500000, 12.000000) rotate(-90.000000) translate(-11.500000, -12.000000)" points="10.5 11.5 10.5 12.5 12.5 12.5 12.5 11.5"/><polygon id="Shape" transform="translate(13.000000, 11.500000) rotate(-360.000000) translate(-13.000000, -11.500000)" points="12 11 12 12 14 12 14 11"/><polygon id="Shape" transform="translate(13.500000, 14.500000) rotate(-360.000000) translate(-13.500000, -14.500000)" points="13 14 13 15 14 15 14 14"/><polygon id="Shape" transform="translate(16.500000, 11.500000) rotate(-360.000000) translate(-16.500000, -11.500000)" points="16 11 16 12 17 12 17 11"/><polygon id="Shape" transform="translate(16.500000, 14.500000) rotate(-270.000000) translate(-16.500000, -14.500000)" points="15 13 15 16 16 16 16 14 18 14 18 13"/><polygon id="Shape" transform="translate(18.000000, 18.500000) rotate(-180.000000) translate(-18.000000, -18.500000)" points="16 17 16 20 17 20 17 18 20 18 20 17"/><path d="M0,9 L9,9 L9,0 L0,0 L0,9 Z M1,1 L8,1 L8,8 L1,8 L1,1 Z" id="Shape"/><rect id="Rectangle-path" x="3" y="3" width="3" height="3"/><path d="M11,0 L11,9 L20,9 L20,0 L11,0 Z M12,8 L12,1 L19,1 L19,8 L12,8 Z" id="Shape"/><polygon id="Rectangle-path" points="14 3 17 3 17 6 14 6"/></g></g></g></g></svg>`
const isTouchDevice = typeof document !== 'undefined' && 'ontouchstart' in document.documentElement;

const capitalize = str => str.substr(0, 1).toUpperCase() + str.substr(1);
const replaceDashes = str => str.replace(/\-/g, ' ');
const formatName = str => capitalize(replaceDashes(str).trim());
const formatTimestamp = n =>
  tinytime('{YYYY}-{MM}-{DD} {H}:{mm}:{ss}').render(new Date(n));
const formatMoney = n => (n / 100).toFixed(0).toString().replace(/(\d+)(\d{3})/, `$1,$2`);

module.exports = function view(state, emit) {
  const title = `${state.cryptoName} or iPhone X`;

  if (state.title !== title) {
    emit(state.events.DOMTITLECHANGE, title);
  }

  const header = html`
    <header class="x xj-spaceBetween">
      <div class="bgc-fadedWhite d-none d-block-m pa-2 br-4 ls-1">${state.host}</div>
    </header>
  `;

  if (state.cryptoInitialPrice === null || state.cryptoPrice === null) {
    return html`
      <body class="ff-sans bgc-black c-white">
        <div class="h-100p x xd-column pa-3 pa-4-m">
          ${header}
          <div class="x-auto x xa-center xj-center c-fadeWhite">
            <div class="LoadingIcon" />
          </div>
        </div>
      </body>
    `;
  }

  const cryptoAtPreorder = state.constants.IPHONE_PRICE_AT_PREORDER / state.cryptoInitialPrice;
  const fiatNow = state.cryptoPrice * cryptoAtPreorder;

  const differenceAmount = fiatNow - state.constants.IPHONE_PRICE_AT_PREORDER;

  let differenceVerb;
  let differenceColor;
  let differenceUnit;

  if (differenceAmount > 0) {
    differenceVerb = 'earned';
    differenceColor = 'green';
    differenceUnit = '+';
  } else if (differenceAmount < 0) {
    differenceVerb = 'lost';
    differenceColor = 'red';
    differenceUnit = '-';
  } else {
    differenceVerb = 'earned';
    differenceColor = 'white';
  }

  return html`
    <body class="ff-sans bgc-black c-white">
      <div class="h-100p x xd-column pa-3 pb-4 pa-4-m">
        ${header}
        <div class="x-auto x xa-center">
          <h1 class="fs-10vw fs-80-m lh-1d2 mw-1400">
            ${state.params.name ? `${formatName(state.params.name.trim())}, you’d` : 'You’d'} have ${`${differenceVerb} `}
            <span class="c-${differenceColor} ws-noWrap">${differenceUnit}$${formatMoney(Math.abs(differenceAmount))} USD</span>
            if you bought ${state.cryptoName.toLowerCase()} instead of the <span class="ws-noWrap">iPhone X</span>.
          </h1>
        </div>
        <footer class="c-fadeWhite fs-14 lh-1d5 ls-0d5 mw-900">
          <p>
            Based on the purchase of ${cryptoAtPreorder.toFixed(6)} ${` ${state.cryptoId.toUpperCase()}`}
            (equivalent to $${formatMoney(state.constants.IPHONE_PRICE_AT_PREORDER)} USD—the price of an iPhone X 256GB)
            on 2017-10-27 12:01 AM PST at <span class="ws-noWrap">$${formatMoney(state.cryptoInitialPrice)} per ${state.cryptoName.toLowerCase()}.</span>
          </p>
        </footer>
      </div>
    </body>
  `;
};
