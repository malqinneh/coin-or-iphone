const html = require('choo/html');
const tinytime = require('tinytime');
const fs = require('fs');

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
      <button class="a-none bgc-fadedWhite pa-2 br-4" onclick=${handleOpenAddressClick}>
        <img src="data:image/svg+xml;utf8,${fs.readFileSync('./assets/qr-code.svg')}" style="vertical-align: top;" />
      </button>
    </header>
  `;

  if (state.cryptoInitialPrice === null || state.cryptoPrice === null) {
    return html`
      <body class="ff-sans bgc-black c-white">
        <div class="h-100p x xd-column pa-3 pa-4-m">
          ${header}
          <div class="x-auto x xa-center c-fadeWhite">
            <div class="p-absolute" style="left: 40%; top: 50%;">
              <div class="LoadingIcon" />
            </div>
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
        ${state.donateModalOpen ? html`
          <div class="p-fixed p-fill bgc-overlay x xa-center xj-center" onclick=${handleOverlayClick}>
            <div id="modal" class="p-relative bgc-white c-black mw-400 w-90p br-4 pv-4 ph-3 pa-4-m" onclick=${handleModalClick}>
              <button class="p-absolute c-overlay fs-20 pa-2 a-none" style="top: 12px; right: 12px; z-index: 9;" onclick=${handleCloseClick}>✕</button>
              <div class="fs-20 ta-center mb-4">
                ${state.cryptoName} Address
              </div>
              <div class="pa-3 b-donate brt-4 bb-0">
                <img class="ud-none" src=${state.cryptoWalletCode} alt="Donate ${state.cryptoName.toLowerCase()}" />
              </div>
              <div class="brb-4 b-donate of-hidden">
                ${isTouchDevice ? html`
                  <div class="fs-14 ta-center ph-2 pv-3 ls-0d5">${state.cryptoWalletHash}</div>
                ` : html`
                  <input class="ff-sans a-none fs-14 ta-center w-100p ph-2 pv-3 ls-0d5 c-text" type="text" readonly spellcheck="false" value=${state.cryptoWalletHash} onclick=${handleDesktopAddressClick} />
                `}
              </div>
            </div>
          </div>
        ` : ``}
      </div>
    </body>
  `;

  function handleOverlayClick (e) {
    if (e.target.id !== 'modal') {
      emit(state.events.CLOSE_MODAL);
    }
  }

  function handleModalClick (e) {
    e.stopPropagation();
  }

  function handleDesktopAddressClick () {
    if (isTouchDevice) {
      return;
    }

    this.focus();
    this.setSelectionRange(0, this.value.length);
  }

  function handleCloseClick () {
    emit(state.events.CLOSE_MODAL);
  }

  function handleOpenAddressClick () {
    if (state.donateModalOpen) {
      emit(state.events.CLOSE_MODAL);
    } else {
      emit(state.events.OPEN_MODAL);
    }
  }
};
