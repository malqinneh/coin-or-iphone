require('isomorphic-fetch');

const fs = require('fs');
const css = require('sheetify');
const choo = require('choo');

css('@rosszurowski/vanilla');
css('./style.js');

const app = choo();

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')());
}

const checkResponse = res => {
  if (res.ok) {
    return res;
  }

  const err = new Error();
  err.message = res.statusText;
  err.status = res.status;
  throw err;
};

const parsePrice = amount => parseInt(amount, 10) * 100;

const headers = {
  'CB-VERSION': '2017-11-04'
};

app.use((state, emitter) => {
  state.events.CRYPTO_FETCH_CURRENT_PRICE = 'crypto_fetchCurrentPrice';
  state.events.CRYPTO_FETCH_INITIAL_PRICE = 'crypto_fetchInitialPrice';
  state.events.OPEN_MODAL = 'openModal';
  state.events.CLOSE_MODAL = 'closeModal';

  state.constants = {};
  state.constants.BITCOIN = 'btc';
  state.constants.LITECOIN = 'ltc';
  state.constants.IPHONE_PREORDER_DATE = '2017-10-27';
  state.constants.IPHONE_PRICE_AT_PREORDER = 114900;
  state.constants.CRYPTO_FETCH_INTERVAL = 15 * 1000;

  const variants = {
    [state.constants.BITCOIN]: {
      name: 'Bitcoin',
      qrCode: `data:image/png;base64,${fs.readFileSync('./assets/btc.png', 'base64')}`,
      hash: '13cHTQpKgTJSfi5fctKeaNVnj1B2rrNcvN'
    },
    [state.constants.LITECOIN]: {
      name: 'Litecoin',
      qrCode: `data:image/png;base64,${fs.readFileSync('./assets/ltc.png', 'base64')}`,
      hash: 'LRievMV6npPSQTLwwx5ZoVXM8bkk3Chupr'
    }
  }

  state.host = typeof window !== 'undefined' ? window.location.host.replace(/^www\./, '') : 'bitcoinoriphone.com'
  state.cryptoId = state.host === 'litecoinoriphone.com'
    ? state.constants.LITECOIN
    : state.constants.BITCOIN;
  state.cryptoName = variants[state.cryptoId].name;
  state.cryptoWalletHash = variants[state.cryptoId].hash;
  state.cryptoWalletCode = variants[state.cryptoId].qrCode;

  state.cryptoInitialPrice = null;
  state.cryptoPrice = null;
  state.cryptoErrorMessage = null;
  state.fetchingCryptoPrice = true;
  state.donateModalOpen = false;

  const endpoint = `https://api.coinbase.com/v2/prices/${state.cryptoId}-USD/spot`;

  emitter.on(state.events.OPEN_MODAL, () => {
    state.donateModalOpen = true;
    emitter.emit(state.events.RENDER);
  });

  emitter.on(state.events.CLOSE_MODAL, () => {
    state.donateModalOpen = false;
    emitter.emit(state.events.RENDER);
  });

  emitter.on(state.events.CRYPTO_FETCH_INITIAL_PRICE, () => {
    fetch(`${endpoint}?date=${state.constants.IPHONE_PREORDER_DATE}`, {
      headers
    })
      .then(checkResponse)
      .then(res => res.json())
      .then(body => {
        state.cryptoInitialPrice = parsePrice(body.data.amount);
        emitter.emit(state.events.RENDER);
      })
      .catch(err => {
        state.cryptoErrorMessage = err.message;
        emitter.emit(state.events.RENDER);
      });
  });

  emitter.on(state.events.CRYPTO_FETCH_CURRENT_PRICE, () => {
    state.fetchingCryptoPrice = true;
    emitter.emit(state.events.RENDER);

    fetch(endpoint, { headers })
      .then(checkResponse)
      .then(res => res.json())
      .then(body => {
        state.fetchingCryptoPrice = false;
        state.cryptoPrice = parsePrice(body.data.amount);

        emitter.emit(state.events.RENDER);
      })
      .catch(err => {
        state.fetchingCryptoPrice = false;
        state.cryptoErrorMessage = err.message;

        emitter.emit(state.events.RENDER);
      });
  });

  setInterval(() => {
    emitter.emit(state.events.CRYPTO_FETCH_CURRENT_PRICE);
  }, state.constants.CRYPTO_FETCH_INTERVAL);

  emitter.emit(state.events.CRYPTO_FETCH_INITIAL_PRICE);
  emitter.emit(state.events.CRYPTO_FETCH_CURRENT_PRICE);
});

app.use((state, emitter) => {

});

app.route('/', require('./views/main'));
app.route('/:name', require('./views/main'));

if (module.parent) {
  module.exports = app;
} else {
  app.mount('body');
}
