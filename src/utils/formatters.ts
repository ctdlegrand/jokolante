export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function getMonthName(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) return '';
  return MONTHS[monthNumber - 1];
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}

export function formatDate(dateStr: string, includeTime = false): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(d);
  } catch {
    return dateStr;
  }
}

export function generateReceiptNumber(seq: number): string {
  const year = new Date().getFullYear();
  return `REC-${year}-${String(seq).padStart(3, '0')}`;
}

export function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not available or permission restricted, fail silently
  }
}

export function amountToFrenchWords(amount: number): string {
  if (amount === 0) return 'Zéro franc CFA';
  
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  function convertGroup(n: number): string {
    let out = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;

    if (h > 0) {
      if (h === 1) out += 'cent ';
      else out += units[h] + ' cents ';
    }

    if (rem > 0) {
      if (rem < 10) {
        out += units[rem];
      } else if (rem < 20) {
        out += teens[rem - 10];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        if (t === 7) {
          out += 'soixante-' + (u === 1 ? 'et-onze' : teens[u]);
        } else if (t === 9) {
          out += 'quatre-vingt-' + teens[u];
        } else {
          if (u === 1 && t < 8) {
            out += tens[t] + ' et un';
          } else if (u > 0) {
            out += tens[t] + '-' + units[u];
          } else {
            out += tens[t];
          }
        }
      }
    }
    return out.trim();
  }

  let result = '';
  const millions = Math.floor(amount / 1000000);
  const thousands = Math.floor((amount % 1000000) / 1000);
  const remainder = amount % 1000;

  if (millions > 0) {
    result += (millions === 1 ? 'un million ' : convertGroup(millions) + ' millions ');
  }

  if (thousands > 0) {
    if (thousands === 1) {
      result += 'mille ';
    } else {
      result += convertGroup(thousands) + ' mille ';
    }
  }

  if (remainder > 0) {
    result += convertGroup(remainder);
  }

  const capitalized = result.trim().charAt(0).toUpperCase() + result.trim().slice(1);
  return `${capitalized} francs CFA`;
}
