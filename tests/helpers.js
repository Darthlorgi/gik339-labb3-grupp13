// tests/helpers.js
// Delad hjälpfunktion för tests/*.test.js. Ligger i tests/ men matchar inte
// "*.test.js" i jest.config.js, så den körs inte som ett eget testfall.

// Kör en vanlig expect(...)-kedja men lägg till en mänskligt läsbar
// beskrivning FÖRST i felmeddelandet om den skulle fela. Jests egna
// Expected/Received hamnar kvar efter beskrivningen (om inte { detail: false }
// anges), så minimalReporter.cjs kan visa båda: beskrivningen som huvudrad,
// Expected/Received som detalj.
//
// { detail: false } döljer Expected/Received helt. Använd det när de
// underliggande testvärdena är godtycklig testdata (t.ex. en specifik
// titel-sträng eller ett specifikt datum) som riskerar att förvirra mer än
// de hjälper – en elev kan tro att just DET värdet är viktigt, istället för
// att förstå att fältet generellt ska spegla det som skickades in.
function friendly(description, assertionFn, { detail = true } = {}) {
  try {
    assertionFn();
  } catch (err) {
    if (err instanceof Error) {
      err.message = detail ? `##FRIENDLY## ${description}\n${err.message}` : `##FRIENDLY## ${description}`;
    }
    throw err;
  }
}

module.exports = { friendly };
