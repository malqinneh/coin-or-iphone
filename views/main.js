const html = require('choo/html');
const tinytime = require('tinytime');

const TITLE = 'Bitcoin or iPhone X';
const IPHONE_X_PRICE_AT_PREORDER = 114900;

const capitalize = str => str.substr(0, 1).toUpperCase() + str.substr(1);
const replaceDashes = str => str.replace(/\-/g, ' ');
const formatName = str => capitalize(replaceDashes(str).trim());
const formatTimestamp = n =>
  tinytime('{YYYY}-{MM}-{DD} {H}:{mm}:{ss}').render(new Date(n));
const formatMoney = n => (n / 100).toFixed(0).toString().replace(/(\d+)(\d{3})/, `$1,$2`);

module.exports = function view(state, emit) {
  if (state.title !== TITLE) {
    emit(state.events.DOMTITLECHANGE, TITLE);
  }

  let header = html`
    <header>
      <span class="d-inlineBlock bgc-fadedWhite pa-2 br-4 ls-1">${window.location.host}</span>
    </header>
  `;

  if (state.cryptoInitialPrice === null) {
    return html`
      <body class="ff-sans bgc-black c-white">
        <div class="h-100p x xd-column pa-4">
          ${header}
          <div class="x-auto x xa-center c-fadeWhite">
            <h2>Loading...</h2>
          </div>
        </div>
      </body>
    `;
  }

  const cryptoAtPreorder =
    IPHONE_X_PRICE_AT_PREORDER / state.cryptoInitialPrice;
  const fiatNow = state.cryptoPrice * cryptoAtPreorder;

  const differenceAmount = fiatNow - IPHONE_X_PRICE_AT_PREORDER;

  let differenceType;
  let differenceColor;
  let differenceUnit;

  if (differenceAmount > 0) {
    differenceType = 'gain';
    differenceColor = 'green';
    differenceUnit = '+';
  } else if (differenceAmount < 0) {
    differenceType = 'loss';
    differenceColor = 'red';
    differenceUnit = '-';
  } else {
    differenceType = 'neutral';
    differenceColor = 'white';
  }

  return html`
    <body class="ff-sans bgc-black c-white">
      <div class="h-100p x xd-column pa-4">
        ${header}
        <div class="x-auto x xa-center">
          <h1 class="fs-10vw fs-80-m lh-1d2">
            ${state.params.name
              ? `${formatName(state.params.name.trim())}, you’d`
              : 'You’d'} now have
            <span class="c-${differenceColor}">${differenceUnit}$${formatMoney(
    Math.abs(differenceAmount)
  )} USD</span>
            if you bought ${capitalize(
              state.cryptoName
            )} instead of the iPhone X.
          </h1>
        </div>
        <footer class="c-fadeWhite fs-14 lh-1d5 ls-1">
          <p>
            Based on the purchase price of ${cryptoAtPreorder.toFixed(
              6
            )} ${` ${state.cryptoId}`}
            (equivalent to $${formatMoney(
              IPHONE_X_PRICE_AT_PREORDER
            )}—the price of an iPhone X 256GB)
            on 2017-10-27 12:01 AM PST at $${formatMoney(
              cryptoAtPreorder
            )} per ${state.cryptoName.toLowerCase()}.
          </p>
        </footer>
      </div>
    </body>
  `;
};
