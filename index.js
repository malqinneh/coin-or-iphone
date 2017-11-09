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

const cryptoIdToName = {
  BTC: 'Bitcoin',
  LTC: 'Litecoin'
};

app.use((state, emitter) => {
  state.events.CRYPTO_FETCH_CURRENT_PRICE = 'crypto_fetchCurrentPrice';
  state.events.CRYPTO_FETCH_INITIAL_PRICE = 'crypto_fetchInitialPrice';
  state.events.OPEN_MODAL = 'openModal';
  state.events.CLOSE_MODAL = 'closeModal';

  state.constants = {};
  state.constants.BITCOIN = 'BTC';
  state.constants.LITECOIN = 'LTC';
  state.constants.IPHONE_PREORDER_DATE = '2017-10-27';
  state.constants.CRYPTO_FETCH_INTERVAL = 15 * 1000;


  state.cryptoId =
    window.location.host.replace(/^www\./, '') === 'litecoinoriphone.com'
      ? state.constants.LITECOIN
      : state.constants.BITCOIN;
  state.cryptoName = cryptoIdToName[state.cryptoId];

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

app.route('/', require('./views/main'));
app.route('/:name', require('./views/main'));

if (!module.parent) {
  app.mount('body');
} else {
  module.exports = app;
}
