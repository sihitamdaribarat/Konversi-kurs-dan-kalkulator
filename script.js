/**
 * ==========================================================================
 * Konverter Mata Uang IDR ↔ USD & Kalkulator Digital
 * Berkas Utama Logika Frontend (Iterasi 3 - Final)
 * ==========================================================================
 */

// ==========================================================================
// MODUL 1: KONVERTER MATA UANG IDR ↔ USD
// ==========================================================================
const CurrencyConverter = (() => {
  // -------------------- 1. Konfigurasi & State --------------------
  const CONFIG = {
    API_URL: 'https://open.er-api.com/v6/latest/USD',
    DEFAULT_FALLBACK_RATE: 16000,
    DEFAULT_AMOUNT: 100000,
    FETCH_TIMEOUT_MS: 8000
  };

  const state = {
    fromCurrency: 'IDR',
    toCurrency: 'USD',
    exchangeRate: CONFIG.DEFAULT_FALLBACK_RATE,
    lastUpdated: null,
    isLoadingRate: false,
    isRateManuallyEdited: false
  };

  // -------------------- 2. Intl.NumberFormat Formatters --------------------
  const formatters = {
    idr: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    usd: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    decimalId: new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  };

  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // -------------------- 3. Referensi DOM --------------------
  let DOM = {};

  const cacheDOMElements = () => {
    DOM = {
      form: document.getElementById('converter-form'),
      fromSelect: document.getElementById('from-currency'),
      toSelect: document.getElementById('to-currency'),
      btnSwap: document.getElementById('btn-swap-currency'),
      amountInput: document.getElementById('amount-input'),
      currencySymbolSpan: document.getElementById('amount-currency-symbol'),
      exchangeRateInput: document.getElementById('exchange-rate-input'),
      btnUpdateRate: document.getElementById('btn-update-rate'),
      btnConvert: document.getElementById('btn-convert'),
      resultBox: document.getElementById('conversion-result'),
      resultTitleLabel: document.getElementById('result-title-label') || document.querySelector('.result-title'),
      resultDisplay: document.getElementById('converted-result-display'),
      resultDetails: document.getElementById('conversion-details-text'),
      rateBadge: document.getElementById('rate-badge-info'),
      lastUpdatedDate: document.getElementById('last-updated-date')
    };
  };

  // -------------------- 4. Validasi Input --------------------
  const validateInputs = (amount, rate) => {
    if (!Number.isFinite(amount) || amount < 0) {
      return {
        isValid: false,
        errorMsg: 'Jumlah tidak valid. Harap masukkan nominal angka valid bernilai minimal 0.'
      };
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      return {
        isValid: false,
        errorMsg: 'Kurs tidak valid. Nilai kurs harus berupa angka positif lebih besar dari 0.'
      };
    }

    return { isValid: true, errorMsg: null };
  };

  // -------------------- 5. Penampil Pesan Error UI --------------------
  const showError = (message) => {
    if (!DOM.resultBox || !DOM.resultDisplay || !DOM.resultDetails) return;
    DOM.resultBox.classList.add('is-error');
    DOM.resultDisplay.textContent = 'Input Tidak Valid';
    DOM.resultDetails.textContent = message;
  };

  const clearError = () => {
    if (!DOM.resultBox) return;
    DOM.resultBox.classList.remove('is-error');
  };

  const updateResultLabel = (from, to) => {
    if (!DOM.resultTitleLabel) return;
    DOM.resultTitleLabel.textContent = `Hasil (${from} → ${to}):`;
  };

  // -------------------- 6. Kalkulasi & Mekanisme Arah Konversi --------------------
  const calculateConversion = (showErrors = false) => {
    clearError();

    const amount = parseFloat(DOM.amountInput.value);
    const rate = parseFloat(DOM.exchangeRateInput.value);
    const from = DOM.fromSelect.value;
    const to = DOM.toSelect.value;

    const validation = validateInputs(amount, rate);
    if (!validation.isValid) {
      if (showErrors) {
        showError(validation.errorMsg);
      } else {
        DOM.resultDisplay.textContent = '-';
        DOM.resultDetails.textContent = '';
      }
      return;
    }

    state.fromCurrency = from;
    state.toCurrency = to;
    state.exchangeRate = rate;

    let convertedAmount = 0;
    let formattedResult = '';
    let detailsText = '';

    if (from === 'IDR' && to === 'USD') {
      convertedAmount = amount / rate;
      formattedResult = formatters.usd.format(convertedAmount);
      detailsText = `${formatters.idr.format(amount)} setara dengan ${formattedResult} pada kurs Rp ${formatters.decimalId.format(rate)} / USD`;
    } else if (from === 'USD' && to === 'IDR') {
      convertedAmount = amount * rate;
      formattedResult = formatters.idr.format(convertedAmount);
      detailsText = `${formatters.usd.format(amount)} setara dengan ${formattedResult} pada kurs Rp ${formatters.decimalId.format(rate)} / USD`;
    } else {
      convertedAmount = amount;
      formattedResult = from === 'IDR' ? formatters.idr.format(amount) : formatters.usd.format(amount);
      detailsText = `Mata uang sumber dan tujuan sama (${from}). Tidak ada selisih konversi.`;
    }

    DOM.resultDisplay.textContent = formattedResult;
    DOM.resultDetails.textContent = detailsText;
    updateRateBadge(rate);
    updateResultLabel(from, to);
  };

  const updateRateBadge = (rate) => {
    if (!DOM.rateBadge) return;
    DOM.rateBadge.textContent = `1 USD = Rp ${formatters.decimalId.format(rate)}`;
  };

  const updateInputPrefix = () => {
    if (!DOM.currencySymbolSpan || !DOM.fromSelect) return;
    const currentFrom = DOM.fromSelect.value;
    DOM.currencySymbolSpan.textContent = currentFrom === 'IDR' ? 'Rp' : '$';
  };

  // -------------------- 7. Mekanisme Swap (⇄ / ⇅) --------------------
  const swapCurrencies = () => {
    const currentFrom = DOM.fromSelect.value;
    const currentTo = DOM.toSelect.value;

    DOM.fromSelect.value = currentTo;
    DOM.toSelect.value = currentFrom;

    state.fromCurrency = currentTo;
    state.toCurrency = currentFrom;

    updateInputPrefix();
    updateResultLabel(currentTo, currentFrom);
    calculateConversion(false);
  };

  // -------------------- 8. Pengambilan Data Kurs Dinamis (API) --------------------
  const fetchExchangeRate = async (isManual = false) => {
    if (state.isLoadingRate) return;

    state.isLoadingRate = true;
    let isFetchFailed = false;
    const originalBtnText = DOM.btnUpdateRate ? DOM.btnUpdateRate.innerHTML : '';

    if (isManual && DOM.btnUpdateRate) {
      DOM.btnUpdateRate.disabled = true;
      DOM.btnUpdateRate.innerHTML = '<span class="btn-icon">⏳</span> Memperbarui...';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

      const response = await fetch(CONFIG.API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.result === 'success' && data.rates && Number.isFinite(data.rates.IDR)) {
        const freshRate = data.rates.IDR;
        const shouldApplyRate = isManual || !state.isRateManuallyEdited;

        // Klik manual "Perbarui kurs" selalu menerapkan kurs API dan mereset isRateManuallyEdited
        if (shouldApplyRate) {
          state.isRateManuallyEdited = false;
          state.exchangeRate = freshRate;
          DOM.exchangeRateInput.value = freshRate;
          updateRateBadge(freshRate);
          calculateConversion(false);

          // Footer hanya berubah jika kurs diterapkan
          if (DOM.lastUpdatedDate && data.time_last_update_unix) {
            const updateDate = new Date(data.time_last_update_unix * 1000);
            state.lastUpdated = updateDate;
            DOM.lastUpdatedDate.textContent = dateFormatter.format(updateDate);
          }
        }
      } else {
        throw new Error('Data kurs tidak valid.');
      }
    } catch (error) {
      isFetchFailed = true;

      if (DOM.lastUpdatedDate && !state.lastUpdated) {
        DOM.lastUpdatedDate.textContent = 'Kurs bawaan (offline)';
      }

      if (isManual && DOM.btnUpdateRate) {
        DOM.btnUpdateRate.innerHTML = '<span class="btn-icon">⚠️</span> Gagal memuat, kurs tidak diubah';
        setTimeout(() => {
          if (DOM.btnUpdateRate) {
            DOM.btnUpdateRate.innerHTML = originalBtnText;
            DOM.btnUpdateRate.disabled = false;
          }
        }, 2500);
      }
    } finally {
      state.isLoadingRate = false;
      if (isManual && DOM.btnUpdateRate && !isFetchFailed) {
        DOM.btnUpdateRate.disabled = false;
        DOM.btnUpdateRate.innerHTML = originalBtnText;
      }
    }
  };

  // -------------------- 9. Pendaftaran Event Listeners --------------------
  const registerEventListeners = () => {
    if (DOM.form) {
      DOM.form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateConversion(true);
      });
    }

    if (DOM.btnConvert) {
      DOM.btnConvert.addEventListener('click', (e) => {
        e.preventDefault();
        calculateConversion(true);
      });
    }

    if (DOM.btnSwap) {
      DOM.btnSwap.addEventListener('click', (e) => {
        e.preventDefault();
        swapCurrencies();
      });
    }

    if (DOM.btnUpdateRate) {
      DOM.btnUpdateRate.addEventListener('click', (e) => {
        e.preventDefault();
        fetchExchangeRate(true);
      });
    }

    if (DOM.fromSelect) {
      DOM.fromSelect.addEventListener('change', () => {
        if (DOM.fromSelect.value === DOM.toSelect.value) {
          DOM.toSelect.value = DOM.fromSelect.value === 'IDR' ? 'USD' : 'IDR';
        }
        updateInputPrefix();
        updateResultLabel(DOM.fromSelect.value, DOM.toSelect.value);
        calculateConversion(false);
      });
    }

    if (DOM.toSelect) {
      DOM.toSelect.addEventListener('change', () => {
        if (DOM.toSelect.value === DOM.fromSelect.value) {
          DOM.fromSelect.value = DOM.toSelect.value === 'IDR' ? 'USD' : 'IDR';
        }
        updateInputPrefix();
        updateResultLabel(DOM.fromSelect.value, DOM.toSelect.value);
        calculateConversion(false);
      });
    }

    if (DOM.amountInput) {
      DOM.amountInput.addEventListener('input', () => {
        calculateConversion(false);
      });
    }

    if (DOM.exchangeRateInput) {
      DOM.exchangeRateInput.addEventListener('input', () => {
        state.isRateManuallyEdited = true;
        const rate = parseFloat(DOM.exchangeRateInput.value);
        if (Number.isFinite(rate) && rate > 0) {
          updateRateBadge(rate);
        }
        calculateConversion(false);
      });
    }
  };

  // -------------------- 10. Inisialisasi Publik --------------------
  const init = () => {
    cacheDOMElements();
    registerEventListeners();
    updateInputPrefix();
    updateResultLabel(DOM.fromSelect.value, DOM.toSelect.value);
    calculateConversion(false);
    fetchExchangeRate(false);
  };

  return {
    init,
    convert: calculateConversion,
    swap: swapCurrencies,
    fetchRate: fetchExchangeRate
  };
})();


// ==========================================================================
// MODUL 2: MESIN KALKULATOR DIGITAL MANDIRI (ITERASI 3)
// ==========================================================================
const Calculator = (() => {
  // -------------------- 1. State Mesin Kalkulator --------------------
  const state = {
    previousOperand: '',  // Angka pertama / riwayat ekspresi
    currentOperand: '0',  // Angka aktif yang sedang diketik atau hasil
    operation: null,      // Operator aktif: '+', '-', '×', '÷'
    shouldResetScreen: false, // Flag reset layar saat angka baru ditekan setelah operasi
    hasError: false       // Flag kondisi error (misal: pembagian nol)
  };

  // -------------------- 2. Referensi DOM Kalkulator --------------------
  let DOM = {};

  const cacheDOMElements = () => {
    DOM = {
      historyDisplay: document.getElementById('calc-history-display'),
      activeDisplay: document.getElementById('calc-active-display'),
      keypad: document.querySelector('.calculator-keypad'),
      btnClear: document.getElementById('btn-calc-clear'),
      btnBackspace: document.getElementById('btn-calc-backspace'),
      btnEquals: document.getElementById('btn-calc-equals'),
      btnDecimal: document.getElementById('btn-calc-decimal')
    };
  };

  // -------------------- 3. Logika & Operasi Kalkulator --------------------
  /**
   * Menambahkan digit angka ke layar aktif
   * @param {string} number 
   */
  const appendNumber = (number) => {
    // Jika sedang dalam kondisi error, reset kalkulator sebelum menerima angka baru
    if (state.hasError) {
      clear();
    }

    // Jika layar siap di-reset (setelah memilih operator atau selesai menghitung)
    if (state.shouldResetScreen) {
      state.currentOperand = number;
      state.shouldResetScreen = false;
    } else {
      // Jika tampilan awal adalah '0', ganti dengan angka yang diketik (kecuali angka 0 berulang)
      if (state.currentOperand === '0') {
        state.currentOperand = number;
      } else {
        // Batasi panjang digit agar tampilan tetap proporsional
        if (state.currentOperand.replace(/[-.]/g, '').length >= 15) return;
        state.currentOperand += number;
      }
    }

    updateDisplay();
  };

  /**
   * Menambahkan tanda desimal (koma/titik)
   * Wajib cegah pengetikan koma/titik ganda pada satu bilangan
   */
  const appendDecimal = () => {
    if (state.hasError) {
      clear();
    }

    if (state.shouldResetScreen) {
      state.currentOperand = '0.';
      state.shouldResetScreen = false;
      updateDisplay();
      return;
    }

    // Proteksi: Cegah koma/titik ganda
    if (state.currentOperand.includes('.')) {
      return;
    }

    if (!state.currentOperand || state.currentOperand === '') {
      state.currentOperand = '0.';
    } else {
      state.currentOperand += '.';
    }

    updateDisplay();
  };

  /**
   * Memilih operator aritmatika (+, -, ×, ÷)
   * @param {string} op 
   */
  const chooseOperation = (op) => {
    if (state.hasError) return;

    // Jika pengguna berganti operator saat layar belum menerima angka kedua
    if (state.operation !== null && state.shouldResetScreen) {
      state.operation = op;
      updateDisplay();
      return;
    }

    // Jika sudah ada angka pertama dan operator, selesaikan kalkulasi parsial terlebih dahulu
    if (state.previousOperand !== '' && state.operation !== null) {
      compute();
      if (state.hasError) return;
    }

    state.operation = op;
    state.previousOperand = state.currentOperand;
    state.shouldResetScreen = true;
    updateDisplay();
  };

  /**
   * Menghitung hasil operasi matematika
   * Mengevaluasi kasus khusus pembagian dengan nol (÷ 0)
   */
  const compute = () => {
    if (state.hasError || state.operation === null || state.previousOperand === '') {
      return;
    }

    const prev = parseFloat(state.previousOperand);
    const curr = parseFloat(state.currentOperand);

    if (isNaN(prev) || isNaN(curr)) {
      return;
    }

    let computation = 0;

    switch (state.operation) {
      case '+':
        computation = prev + curr;
        break;
      case '-':
        computation = prev - curr;
        break;
      case '×':
      case '*':
        computation = prev * curr;
        break;
      case '÷':
      case '/':
        // Evaluasi Kasus Pembagian Nol: Jangan biarkan keluar nilai 'Infinity'
        if (curr === 0) {
          state.currentOperand = 'Error: Pembagi 0';
          state.previousOperand = `${prev} ÷ 0`;
          state.operation = null;
          state.shouldResetScreen = true;
          state.hasError = true;
          updateDisplay();
          return;
        }
        computation = prev / curr;
        break;
      default:
        return;
    }

    // Periksa jika hasil tidak finite (terlalu besar atau overflow)
    if (!Number.isFinite(computation)) {
      state.currentOperand = 'Error: Hasil terlalu besar';
      state.previousOperand = '';
      state.operation = null;
      state.shouldResetScreen = true;
      state.hasError = true;
      updateDisplay();
      return;
    }

    // Bersihkan presisi dengan toPrecision(12)
    const cleanedResult = parseFloat(Number(computation).toPrecision(12));

    // Simpan riwayat operasi lengkap pada previousOperand
    state.previousOperand = `${prev} ${state.operation} ${curr} =`;
    state.currentOperand = String(cleanedResult);
    state.operation = null;
    state.shouldResetScreen = true;
    state.hasError = false;

    updateDisplay();
  };

  /**
   * Menghapus 1 karakter terakhir (Backspace)
   * Abaikan setelah operator/hasil; setelah error, reset juga riwayat
   */
  const deleteLastChar = () => {
    // Setelah error, reset total juga riwayat
    if (state.hasError) {
      clear();
      return;
    }

    // Abaikan setelah operator atau setelah hasil dihitung
    if (state.shouldResetScreen) {
      return;
    }

    if (state.currentOperand.length <= 1 || state.currentOperand === '0') {
      state.currentOperand = '0';
    } else {
      state.currentOperand = state.currentOperand.slice(0, -1);
      if (state.currentOperand === '-' || state.currentOperand === '') {
        state.currentOperand = '0';
      }
    }

    updateDisplay();
  };

  /**
   * Reset total seluruh state kalkulator dan layar ke kondisi awal (Clear)
   */
  const clear = () => {
    state.previousOperand = '';
    state.currentOperand = '0';
    state.operation = null;
    state.shouldResetScreen = false;
    state.hasError = false;
    updateDisplay();
  };

  /**
   * Helper untuk menampilkan titik desimal internal (.) sebagai koma (,) di layar
   * @param {string} str 
   * @returns {string}
   */
  const formatForDisplay = (str) => {
    if (!str) return '';
    return str.replace(/\./g, ',');
  };

  /**
   * Memperbarui antarmuka layar kalkulator atas dan bawah (tampilan desimal menggunakan koma)
   */
  const updateDisplay = () => {
    if (!DOM.activeDisplay || !DOM.historyDisplay) return;

    // Layar Atas: Riwayat ekspresi dengan koma desimal
    if (state.operation !== null) {
      DOM.historyDisplay.textContent = `${formatForDisplay(state.previousOperand)} ${state.operation}`;
    } else {
      DOM.historyDisplay.textContent = formatForDisplay(state.previousOperand);
    }

    // Layar Bawah: Input aktif atau hasil dengan koma desimal
    DOM.activeDisplay.textContent = formatForDisplay(state.currentOperand);

    // Penyesuaian ukuran font dinamis jika terjadi pesan error
    if (state.hasError) {
      DOM.activeDisplay.style.fontSize = '1.35rem';
      DOM.activeDisplay.style.color = '#ef4444';
    } else {
      DOM.activeDisplay.style.fontSize = '';
      DOM.activeDisplay.style.color = '';
    }
  };

  // -------------------- 4. Dukungan Input Keyboard Fisik --------------------
  /**
   * Menangani event keyboard fisik
   * @param {KeyboardEvent} e 
   */
  const handleKeyboardInput = (e) => {
    // Abaikan jika tombol modifier (Ctrl, Meta/Cmd, Alt) sedang ditekan
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Abaikan jika fokus sedang berada pada elemen interaktif di luar kartu kalkulator
    const activeEl = document.activeElement;
    if (activeEl && activeEl !== document.body && !activeEl.closest('.calculator-card')) {
      return;
    }

    const key = e.key;

    // Angka 0 - 9
    if (/^[0-9]$/.test(key)) {
      appendNumber(key);
      highlightButton(`[data-num="${key}"]`);
      return;
    }

    // Titik desimal (. atau ,)
    if (key === '.' || key === ',') {
      appendDecimal();
      highlightButton('#btn-calc-decimal');
      return;
    }

    // Operasi Penjumlahan (+)
    if (key === '+') {
      chooseOperation('+');
      highlightButton('#btn-calc-plus');
      return;
    }

    // Operasi Pengurangan (-)
    if (key === '-') {
      chooseOperation('-');
      highlightButton('#btn-calc-minus');
      return;
    }

    // Operasi Perkalian (* atau x atau X)
    if (key === '*' || key.toLowerCase() === 'x') {
      chooseOperation('×');
      highlightButton('#btn-calc-multiply');
      return;
    }

    // Operasi Pembagian (/)
    if (key === '/') {
      e.preventDefault();
      chooseOperation('÷');
      highlightButton('#btn-calc-divide');
      return;
    }

    // Sama dengan / Hitung (Enter atau =)
    if (key === 'Enter' || key === '=') {
      // preventDefault Enter hanya untuk fokus di kalkulator
      if (activeEl && activeEl.closest('.calculator-card')) {
        e.preventDefault();
      }
      compute();
      highlightButton('#btn-calc-equals');
      return;
    }

    // Backspace (⌫)
    if (key === 'Backspace') {
      deleteLastChar();
      highlightButton('#btn-calc-backspace');
      return;
    }

    // Clear (Escape atau huruf c)
    if (key === 'Escape' || key.toLowerCase() === 'c') {
      clear();
      highlightButton('#btn-calc-clear');
      return;
    }
  };

  /**
   * Memberikan efek visual feedback saat keyboard ditekan
   * @param {string} selector 
   */
  const highlightButton = (selector) => {
    try {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.add('btn-calc-active');
        setTimeout(() => btn.classList.remove('btn-calc-active'), 150);
      }
    } catch (_) {}
  };

  // -------------------- 5. Pendaftaran Event Listeners --------------------
  const registerEventListeners = () => {
    // Event delegation pada papan tombol kalkulator
    if (DOM.keypad) {
      DOM.keypad.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        // Klik tombol angka
        if (target.dataset.num !== undefined) {
          appendNumber(target.dataset.num);
          return;
        }

        // Klik tombol operator (+, -, ×, ÷)
        if (target.dataset.op !== undefined) {
          chooseOperation(target.dataset.op);
          return;
        }

        // Klik tombol aksi fungsional
        const action = target.dataset.action;
        if (action === 'decimal') {
          appendDecimal();
        } else if (action === 'clear') {
          clear();
        } else if (action === 'backspace') {
          deleteLastChar();
        } else if (action === 'equals') {
          compute();
        }
      });
    }

    // Listener Keyboard Global
    window.addEventListener('keydown', handleKeyboardInput);
  };

  // -------------------- 6. Inisialisasi Publik --------------------
  const init = () => {
    cacheDOMElements();
    registerEventListeners();
    clear();
  };

  return {
    init,
    appendNumber,
    appendDecimal,
    chooseOperation,
    compute,
    deleteLastChar,
    clear
  };
})();


// ==========================================================================
// INISIALISASI SELURUH APLIKASI SAAT DOM SELESAI DIMUAT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  CurrencyConverter.init();
  Calculator.init();
});
