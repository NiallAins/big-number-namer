const
    EXAMPLE = '-12.34e56',
    NAMES = {
        and: 'and',
        neg: 'minus',
        decimal: 'point',
        googol: 'googol',
        error: 'Ahhh - Too big!',
        units: [
            'zero',
            'one',
            'two',
            'three',
            'four',
            'five',
            'six',
            'seven',
            'eight',
            'nine',
            'ten',
            'eleven',
            'twelve',
            'thirteen',
            'fourteen',
            'fifteen',
            'sixteen',
            'seventeen',
            'eighteen',
            'nineteen'
        ],
        tens: [
            '',
            'ten',
            'twenty',
            'thirty',
            'fourty',
            'fifty',
            'sixty',
            'seventy',
            'eighty',
            'ninty',
        ],
        suffixs: [
            'llion',
            'hundred',
            'thousand',    
            'million',
            'billion',
            'trillion',
            'quadrillion',
            'quintillion',
            'sextillion',
            'septillion',
            'octillion',
            'nonillion',
        ],
        latin_units: [
            '',
            'un',
            'duo',
            'tre',
            'quattuor',
            'quin',
            'sex',
            'sep',
            'octo',
            'novem',
        ],
        latin_tens: [
            '',
            'deci',
            'viginti',
            'triginti',
            'quadraginti',
            'quinquaginti',
            'sexaginti',
            'septuaginti',
            'octoginti',
            'nonaginti'
        ],
        latin_prefixs: [
            '',
            '',
            'bi',
            'tri',
            'quadri',
            'quinti',
            'sexti',
            'septi',
            'octi',
            'noni'
        ],
        latin_suffixs: [
            '',
            'centi',
            'mili',
            'megali',
            'gigali',
            'terali',
            'petali',
            'exali',
            'zettali',
            'yottali',
            'ronnali',
            'quettali'
        ]
    };

function init() {
    el_inp.value = EXAMPLE;
    update('', EXAMPLE);
}

function update(key, value) {
    if (key.substr(0, 5) === 'Arrow') {
        return;
    }
    
    const INP = cleanInput(value);
    if (isValidNumber(INP)) {
        const NUM = inputToNum(INP);
        el_txt_num.innerHTML = numToFormatted(NUM);
        el_txt_num.style.fontSize =
            Math.max(
                12,
                Math.floor(48 / Math.pow(el_txt_num.innerText.length, 0.2))
            ) + 'px';
        el_txt_name.innerHTML = numToText(NUM);
        
        if (el_txt_name.innerHTML.indexOf('undefined') > -1) {
            el_txt_name.innerHTML = NAMES.error;
        }

        el_inp.classList.remove('error');
    } else {
        el_inp.classList.add('error');
    }
}

function cleanInput(inp) {
    return inp
        .replace(/[ ,+]/g, '')
        .replace(/[−‐–]/, '-')
        .replace(/^(-?)0*/, '$1')
        .replace(/(\.[0-9]*?)0*$/, '$1')
        .replace(/^\./, '0.')
        .replace(/\.($|e)/, '$1')
        .replace(/[x×*]10\^/, 'e')
        .replace(/e-?$/, '')
        .replace(/^-?$/, '0');
}

function isValidNumber(num) {
    return !!num.match(/^-?[0-9]+(\.[0-9]+)?(e-?[0-9]+)?$/);
}

function inputToNum(inp) {
    let num = {
        neg: false,
        thous: [],
        dec: 0,
        exp: 0
    };
    
    // Negative
    if (inp[0] === '-') {
        inp = inp.substr(1);
        num.neg = true;
    }
    
    // Exponent
    [inp, num.exp] = inp.split('e');
    num.exp = BigInt(num.exp || 0);
    const ZEROS = inp.match(/0+$/);
    if (ZEROS) {
        num.exp += BigInt(ZEROS[0].length);
        inp = inp.substring(0, ZEROS.index);
    }
    // Adjust decimal place
    if (num.exp < 0) {
        inp = moveDecimal(inp, num.exp);
        num.exp = 0n;
    } else if (num.exp > 0) {
        const PT = inp.indexOf('.');
        if (PT > -1) {
            const MOVE = Math.min(inp.length - PT - 1, parseInt(num.exp));
            inp = moveDecimal(inp, MOVE);
            num.exp -= BigInt(MOVE);
        }
    }
    inp = moveDecimal(inp, parseInt(num.exp % 3n));
    num.exp -= num.exp % 3n;
    
    // Decimal
    [inp, num.dec] = inp.split('.');
    
    // Thousands
    for (let i = inp.length; i > 0; i -= 3) {
        num.thous.unshift(inp.substring(i - 3, i));
    }
    
    return num;
}

function moveDecimal(num, pos = 0) {
    let pt = num.indexOf('.');
    if (pt === -1) {
        pt = num.length;
    }
    num = num.replace('.', '');
    if (pt + pos >= num.length) {
        return num.padEnd(pt + pos, '0');
    }
    if (pt + pos <= 0) {
        return '0.' + num.padStart(num.length - pt - pos, '0');
    }
    return num = num.substr(0, pt + pos) + '.' + num.substr(pt + pos);
}

function numToFormatted(num) {
    let str =
        (num.neg ? '&minus;' : '') +
        num.thous.join(',');
    if (parseInt(num.exp) + (num.thous.length * 3) > 1500) {
        let expStr = num.exp.toString();
        for (let i = expStr.length - 3; i > 0; i -= 3) {
            expStr = expStr.substring(0, i) + ',' + expStr.substr(i);
        }
        return str +
            '&times10<sup>' +
            expStr +
            '</sup>';
    } else {
        return str +
            (new Array(parseInt(num.exp) / 3).fill(',000').join('')) +
            (num.dec ? '.' + num.dec : '');
    }    
}

function numToText(num, isGoogol) {
    let str = '';
    
    // Zero
    if (num.thous[0] === '0' || num.thous[0] === '-0') {
        return NAMES.units[0];
    }
    
    // Minus
    if (!isGoogol && num.neg) {
        str += NAMES.neg + ' ';
    }
    
    // Googol
    if (
        !isGoogol &&
        parseInt(num.exp) + num.thous.join('').length - 1 >= 100
    ) {
        if (num.exp > 101) {
            num.exp -= 102n;
            let thousStr = num.thous.join('') + '00';
            num.thous = [];
            for (let i = thousStr.length; i > 0; i -= 3) {
                num.thous.unshift(thousStr.substring(i - 3, i));
            }
            return str +
                numToText(num, true) + ' ' +
                NAMES.googol;
        } else {
            let
                thousStr = num.thous.join(''),
                split = thousStr.length - (100 - parseInt(num.exp)),
                thousL = [];
            for (let i = split; i > 0; i -= 3) {
                thousL.unshift(thousStr.substring(i - 3, i));
            }
            num.thous = [];
            for (let i = thousStr.length; i > split; i -= 3) {
                num.thous.unshift(thousStr.substring(Math.max(split, i - 3), i));
            }
            
            str +=
                numToText({
                    thous: thousL,
                    exp: 0n
                }, true) + ' ' +
                NAMES.googol +
                (thousStr.substr(split).match(/[^0]/) ? ', ' : '');
        }
    }
    
    // Thousands
    str += num.thous
        .map((t, i, ts) => {
            let tStr = [];
            t = parseInt(t);
        
            if (t === 0) {
                return;
            }
        
            // Add "and" to last term if not present within term
            if (
                i === ts.length - 1 &&
                (ts.length > 1 && !isGoogol) &&
                t < 100
            ) {
                tStr.push(NAMES.and);
            }
        
            if (t > 99) {
                tStr.push(
                    NAMES.units[Math.floor(t / 100)],
                    NAMES.suffixs[1]
                );
                t %= 100;
                if (t !== 0) {
                    tStr.push(NAMES.and);
                }
            }
            if (t > 19) {
                tStr.push(NAMES.tens[Math.floor(t / 10)]);
                t %= 10;
            }
            if (t > 0) {
                tStr.push(NAMES.units[t]);
            }
    
            tStr.push(getThousSuffix(BigInt(ts.length - i) + (num.exp / 3n)));
            return tStr.join(' ');
        })
        .filter(t => t)
        .join(', ');
    
    // Decimal
    if (num.dec) {
        str +=
            ' ' + NAMES.decimal + ' ' +
            num.dec
                .split('')
                .map(d => NAMES.units[parseInt(d)])
                .join(' ');
    }
    
    return str;
}

function getThousSuffix(order) {
    // No prefix for hundreds
    if (order < 2) {
        return '';
    }
    
    if (order < NAMES.suffixs.length) {
        return ' ' + NAMES.suffixs[order];
    }
    
    order -= 2n;
    order = order.toString();
    let str = [];
    for (let i = order.length, j = 1; i > 0; i -= 3, j += 1) {
        let n = parseInt(order.substring(i - 3, i));
        if (n === 0) {
            continue;
        }
        let sec = '';
        if (n > 99) {
            sec +=
                NAMES.latin_prefixs[Math.floor(n / 100)] +
                NAMES.latin_suffixs[1];
            n %= 100;
        }
        if (n > 9) {
            sec =
                NAMES.latin_units[Math.floor(n % 10)] +
                NAMES.latin_tens[Math.floor(n / 10)] + sec;
        } else if (n > 0) {
            sec = NAMES.latin_units[n] + sec;
        }

        str.push(
            (j > 1 && sec === NAMES.latin_units[1] ? '' : sec) +
            (j > 1 ? NAMES.latin_suffixs[j] : '')
        );
    }
    return ' ' + str.join('-') + NAMES.suffixs[0];
}

init();