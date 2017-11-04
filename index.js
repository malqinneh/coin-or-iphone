const css = require('sheetify');
const choo = require('choo');

css('@rosszurowski/vanilla');
css('./design.js');

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
  'CB-VERSION': '2017-11-04',
};

app.use((state, emitter) => {
  state.events.CRYPTO_FETCH_CURRENT_PRICE = 'crypto_fetchCurrentPrice';
  state.events.CRYPTO_FETCH_INITIAL_PRICE = 'crypto_fetchInitialPrice';

  state.constants = {};
  state.constants.BITCOIN = 'btc';
  state.constants.LITECOIN = 'ltc';
  state.constants.IPHONE_PREORDER_DATE = '2017-10-27';
  state.constants.CRYPTO_FETCH_INTERVAL = 15 * 1000;

  state.intervalId = null;
  state.fetchingCryptoPrice = true;
  state.cryptoId = state.constants.BITCOIN;
  state.cryptoInitialPrice = null;
  state.cryptoPrice = null;
  state.cryptoPriceFetchedAt = Date.now();
  state.cryptoErrorMessage = null;

  emitter.on(state.events.CRYPTO_FETCH_INITIAL_PRICE, () => {
    fetch(`https://api.coinbase.com/v2/prices/BTC-USD/spot?date=${state.constants.IPHONE_PREORDER_DATE}`, { headers })
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

    fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', { headers })
      .then(checkResponse)
      .then(res => res.json())
      .then(body => {
        state.fetchingCryptoPrice = false;
        state.cryptoPrice = parsePrice(body.data.amount);
        state.cryptoPriceFetchedAt = Date.now();

        emitter.emit(state.events.RENDER);
      })
      .catch(err => {
        state.fetchingCryptoPrice = false;
        state.cryptoErrorMessage = err.message;

        emitter.emit(state.events.RENDER);
      });
  });

  state.intervalId = setInterval(() => {
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
