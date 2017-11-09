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
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQAAAACoxAthAAABsUlEQVR4Ae3bgWnDMBCFYUEHyEhZPSN5gICqPn6qEwlAW4Ar/A+Ikzt/BUAWsuWOmvnch3s+5sq1DqNGIulIPiZ5fJP8ov4ct/VZz5I0JZJrrNxCcqCfOt/3We2JRML8XfpzcvhXRCIhWYTs+fuvRCIhi3BaWqt+jFQikTQlJSHIRXLfxmFHImlJ5pH0Q1j0MvhrJJKOhFVtHdUM+D2N81cGkUg6EhYejPrIcxpHJqsukbQkZW7e3+nvmT2/JJLGJLWEZQcPhxnunJbwzEMi6Ug4LR/0z6V1SvnFQkUi6Ujqnga19ClBcilQl0g6EgZ/GnxnM6XcENYtl58SiYQWY/C8fRvHzgdcIulIqNWt57RSTyJXJJLOhE1lHgHva+D+evsmkTQmc76+ckbOZxOXRNKZUNt7GpNDOZdrgLs7iaQjqaHPNM71cLRXJJKWZJbQZ9x/ueMpG3WJpCOpoZY+CUFm5S2RdCSpkfMtNkrJHvzhEklP8vbf5aindF4bvycSCePu/cuTe5tDImlPqO3sFcWNNbFE0pWQB30WunBmc3JJJF1JyblhV7eeI5nlJZKG5BPTEVFHW9KadwAAAABJRU5ErkJggg==`,
      hash: '13cHTQpKgTJSfi5fctKeaNVnj1B2rrNcvN'
    },
    [state.constants.LITECOIN]: {
      name: 'Litecoin',
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQAAAACoxAthAAABp0lEQVR4Ae3bAab1MBQE4MNdQJfUrXdJWcBlfiYZmT8uvPfgXGbQtMn5AvqiN68tD951YeWpqrqxusoTEtKRvHbRHr/wvDCMWFVTEhIyikUkpTKSKsx4VUjIV5CSZD+H75CQ7yIsW4R8jiAk5G9kxm5LXs3+81GhKwkJsXD8WY1W1tlYOpKQEJx5+PdAoln+T0cSElK198x8Nb95LsKmlHYkJETZ+2fMYOfu8lU+JKQj0TgvuHTPrvtNMp+p2fAQEtKWsN23+A3/uxBhOGNISFPiC7ftbbx96WYJyY2QkI5ktSZVRq5zT0hIYzLKcx17z7v/CQn5IVlDdORsMIm211jF/pCQvqTs5teiKrKbqpCQvkRlPNi7FJoFMyRASEhbcvynzq/KSV2aMSSkK/HfampEtEeMUfPQkoSEfIptqVlZZxISAs/5QvsNnQNDj9YdSUiIRVwbd4qW8a4kJOTzh5/WJQKIAD1JSMjnDz9hy7iimz8k5NcEwLGlRr66gJCQbyH+8qTtTdgvuq4kJOR8VFBjn2lUaaqeJCTEIqLLaxNNPMR7kZCQfx0usJOnvHFJAAAAAElFTkSuQmCC`,
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
