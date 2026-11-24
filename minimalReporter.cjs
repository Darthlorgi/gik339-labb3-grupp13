// minimalReporter.cjs
const chalk = require('chalk');
const path = require('path');

class MinimalReporter {
  constructor(globalConfig) {
    this.pattern = globalConfig.testNamePattern ? new RegExp(globalConfig.testNamePattern) : null;
  }

  onRunComplete(_, results) {
    const green = chalk.green.bold;
    const red = chalk.red.bold;
    const dim = chalk.gray;

    console.log(chalk.bold('\nLabb 3 – API-tester\n'));

    const suites = results.testResults
      .slice()
      .sort((a, b) =>
        path.basename(a.testFilePath).localeCompare(path.basename(b.testFilePath), 'sv', { numeric: true })
      );

    // Alla körda tester, oavsett fil, i en enda lista.
    const allTests = suites
      .flatMap((suite) => suite.testResults)
      .filter((t) => t.status === 'passed' || t.status === 'failed')
      .filter((t) => !this.pattern || this.pattern.test(t.fullName));

    // Gruppera tester som hör till samma "Uppgift N" (via describe-block eller
    // testnamn som börjar med "Uppgift N"), så flera tester (lokala + fördjupade)
    // kan bidra till en och samma rad i utskriften.
    const uppgiftGroups = new Map(); // "N" -> { label, tests: [] }
    const ungrouped = [];

    for (const t of allTests) {
      const m = t.fullName.trim().match(/^Uppgift\s*(\d+)/);
      if (!m) {
        ungrouped.push(t);
        continue;
      }
      const n = m[1];
      if (!uppgiftGroups.has(n)) uppgiftGroups.set(n, { label: null, tests: [] });
      const group = uppgiftGroups.get(n);
      group.tests.push(t);
      // Den lokala "Uppgift N) ..."-varianten används som rubrik för raden.
      if (/^Uppgift\s*\d+\)/.test(t.fullName.trim())) group.label = t.fullName.trim();
    }

    // Plockar ut en eventuell "##FRIENDLY## <text>"-rad (skriven av
    // tests/helpers.js:s friendly()-hjälpare) ur ett felmeddelande, samt de
    // vanliga Expected/Received-raderna som Jest själv genererar (om
    // friendly() inte explicit dolde dem via { detail: false }).
    const parseFailure = (t) => {
      const msg = (t.failureMessages || []).join('\n');
      const headline = (msg.match(/##FRIENDLY##\s*([^\n]+)/) || [])[1];
      const exp = (msg.match(/^\s*Expected:\s*(.+)$/m) || [])[1];
      const rec = (msg.match(/^\s*Received:\s*(.+)$/m) || [])[1];
      return { headline: headline?.trim(), exp: exp?.trim(), rec: rec?.trim() };
    };

    const printFailureDetail = (t, indent) => {
      const { headline, exp, rec } = parseFailure(t);
      // Huvudrad: den mänskligt skrivna beskrivningen om testet använde
      // friendly(), annars faller vi tillbaka på testets eget namn.
      console.log(dim(`${indent}↳ ${headline || t.title}`));
      // Förväntat/Faktiskt resultat på svenska - visas bara när friendly()
      // faktiskt skickade med dem (dvs. inte { detail: false }).
      if (exp) console.log(dim(`${indent}   Förväntat resultat: ${exp}`));
      if (rec) console.log(dim(`${indent}   Faktiskt resultat: ${rec}`));
    };

    const sortedUppgiftNumbers = [...uppgiftGroups.keys()].sort((a, b) => Number(a) - Number(b));

    for (const n of sortedUppgiftNumbers) {
      const group = uppgiftGroups.get(n);
      const failed = group.tests.filter((t) => t.status === 'failed');
      const label = group.label || `Uppgift ${n}`;

      if (failed.length === 0) {
        console.log(`${green('✓')} ${label}`);
        continue;
      }

      console.log(`${red('✗')} ${label}`);
      // Om ALLT i uppgiften felar (troligen inte påbörjad än, eller helt fel
      // spår) - visa bara den FÖRSTA avvikelsen istället för att lista varje
      // enskild felande delkontroll. Så fort något i uppgiften faktiskt
      // passerar vet vi att den är påbörjad, och då är full detalj om det
      // som återstår mer värt.
      const toShow = failed.length === group.tests.length ? failed.slice(0, 1) : failed;
      for (const t of toShow) {
        printFailureDetail(t, '   ');
      }
    }

    // Tester som inte hör till någon "Uppgift N" skrivs ut som tidigare, var för sig.
    for (const t of ungrouped.sort((a, b) => a.fullName.localeCompare(b.fullName, 'sv', { numeric: true }))) {
      const mark = t.status === 'passed' ? green('✓') : red('✗');
      console.log(`${mark} ${t.fullName.trim()}`);
      if (t.status === 'failed') printFailureDetail(t, '');
    }

    // Räknas per rad (Uppgift-grupp), inte per rått Jest-test - annars kan
    // t.ex. "5 tester" visas trots att bara 4 rader syns ovan (Uppgift 3
    // motsvarar två separata test()-funktioner internt, men en rad).
    const totalGroups = uppgiftGroups.size + ungrouped.length;
    const failedGroups =
      [...uppgiftGroups.values()].filter((g) => g.tests.some((t) => t.status === 'failed')).length +
      ungrouped.filter((t) => t.status === 'failed').length;
    const passedGroups = totalGroups - failedGroups;

    console.log(
      dim('\n───────────────────────────────'),
      '\n',
      failedGroups > 0
        ? red(`${failedGroups} fel`) + dim(`, ${passedGroups} passerade av ${totalGroups} uppgifter\n`)
        : green(`Alla ${totalGroups} uppgifter passerade!\n`)
    );
  }
}

module.exports = MinimalReporter;
