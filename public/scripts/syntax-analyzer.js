const lexemes = {
    BEGIN: 'начало',
    MN: {
        FIRST: 'первое',
        SECOND: 'второе'
    },
};
const operations = ['+','-','*','/','!','||','&&'];
const functions = ['sin','cos','abs']

function tokenize(str)
{
    str = str.replaceAll(/(:|=|sin|cos|abs|not|or|and|\+|-|\*|\/|,|[А-я]+[0-9]+|[0-9]+|[A-z]+[0-9]+)/g," $1 ");
    return str.split(/(?<=[,=/*\-+!])|(?=[,=/*\-+!])|(?=&{2})|(?=\|{2})|(?=sin[0-9]+)|(?=cos[0-9]+)|(?=abs[0-9]+)|(?=sin[А-я]+[0-9]+)|(?=cos[А-я]+[0-9]+)|(?=abs[А-я]+[0-9]+)|(?=sin[A-z]+[0-9]+)|(?=cos[A-z]+[0-9]+)|(?=abs[A-z]+[0-9]+)|\s+|\n/).map(function (token) {
        //("/:|=|sin|cos|abs|not|or|and|\+|-|\*|\/|,|[а-я]+[0-9]+|[0-9]+)\s?/")
        return token.trim().toLowerCase();
    }).filter(function (token) {
        return token !== '';
    });
}

function isValidPer(name){
    let result =  name.match(/[а-яё][а-яё0-7]*/);
    return !(result == null || result[0] !== name);

}

function isValidCel(number){
    let result = number.match(/[0-7]+/);
    if (result === null || result[0] !== number){
        return false;
    }
    return true;
}

function parse(tokens) {
    let index = 1;
    let error=[];
    let mark = false;
    let per = false;
    let flagMn = false;
    let perems = [];
    let perem = '';
    let flagBegin = false;
    const newPerems = new Map();
    let variable = '';
    for (let i = 0; i < tokens.length; i++) {
        // console.clear();
        if (i === 0 && lexemes.BEGIN !== tokens[0] && flagBegin === false) {
            error[0] = `Ошибка: Программа должна начинаться с "Начало"`;
            error[1] = tokens[i];
            return error;
        } else if (lexemes.BEGIN === tokens[i] && flagBegin === false) {
            if (lexemes.MN.FIRST !== tokens[index] && lexemes.MN.SECOND !== tokens[index] && tokens[index-1] === lexemes.BEGIN) {
                error[0] = `Ошибка: Ожидается "Первое" или "Второе"`;
                error[1] = tokens[index] ?? tokens[i];
                return error;
            }
            continue;
        }
        if (lexemes.MN.FIRST === tokens[i] && flagMn === false) {
            flagBegin = true;
            index = i;
            if(tokens[i+1] === lexemes.MN.FIRST || tokens[i+1] === lexemes.MN.SECOND) {
                error[0] = 'Ошибка, два терминала идущих подряд';
                error[1] = tokens[i+1];
                return error;
            }
            if ((lexemes.MN.FIRST === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.FIRST === tokens[i] && !isValidPer(tokens[i+1]))) {
                error[0] = `Ошибка: ожидалась переменная`;
                error[1] = tokens[i+1] || tokens[index];
                return error;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.FIRST && flagMn === false) {
            flagBegin = true;
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из множества нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                return error;
            }
            if((tokens[i] === 'конец' || tokens[i] === 'слагаемого') && !isValidCel(tokens[i-1])){
                error[0] = `Ошибка: в слагаемом должно быть хотя бы одно целое`;
                error[1] = tokens[i-1];
                return error;
            }
            if(isValidCel(tokens[i]) && isValidPer(tokens[i-1])){
                i--;
                tokens[index] = 'slag';
                continue;
            }
            if(tokens[i] === ',' && isValidCel(tokens[i-1]) && i-2 !== index){
                i--;
                tokens[index] = 'slag';
                continue;
            }
            if (tokens[i] !== ',' && isValidPer(tokens[i - 1]) && tokens[i].match(/.*/) && tokens[i - 1] !== tokens[index] && tokens[i] !== lexemes.MN.SECOND) {
                error[0] = `Ошибка: Между переменными ожидалась запятая`;
                error[1] = tokens[i];
                return error;
            }
            if (!isValidPer(tokens[i]) && tokens[i] !== ',') {
                error[0] = `Ошибка: Некорректный формат записи переменной`;
                error[1] = tokens[i];
                return error;
            }
            if (tokens[i] === ',' && tokens[i + 1] === undefined) {
                error[0] = `Ошибка: После запятой должна идти переменная`;
                error[1] = tokens[i];
                return error;
            }
            if (isValidPer(tokens[i]) && tokens[i+1] === undefined && tokens[i] !== lexemes.MN.SECOND) {
                error[0] = `Ошибка: Ожидалась запятая, либо второе, либо переход в слагаемое`;
                error[1] = tokens[i];
                return error;
            }
        }
        if (lexemes.MN.SECOND === tokens[i] && flagMn === false) {
            index = i;
            if ((lexemes.MN.SECOND === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.SECOND === tokens[i] && !isValidCel(tokens[i+1])) && tokens[index] !== 'slag') {
                error[0] = `Ошибка: Ожидалось целое`;
                error[1] = tokens[i+1] ?? tokens[index];
                return error;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.SECOND && flagMn === false) {
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из множества нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                return error;
            }
            if((tokens[i-1] === tokens[index]) && (tokens[i+1] === undefined || tokens[i+1] === ',')){
                error[0] = `Ошибка: До перехода в слагаемое ожидалась одно целое`;
                error[1] = tokens[i+1] ?? tokens[i];
                return error;
            }
            if((/[^0-9]/).test(tokens[i]) && (tokens[i] !== 'конец' || tokens[i] !== 'слагаемого' )) {
                error[0] = `Ошибка: После целого не может идти какое-либо выражение`;
                error[1] = tokens[i];
                return error;
            }
            if (isValidCel(tokens[i]) && (tokens[i+1]) === 'конец' && tokens[i-1] !== lexemes.MN.SECOND) {
                //i--;
                tokens[index] = 'slag';
                continue;
            }
            if(!isValidCel(tokens[i])) {
                error[0] = `Ошибка: некорректный формат записи целого числа`;
                error[1] = tokens[i];
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] === undefined ) {
                error[0] = `Ошибка, ожидался переход в слагаемое`;
                error[1] = tokens[i];
                return error;
            } else if (isValidCel(tokens[i]) && tokens[i+1] === ',' && tokens[i-1] !== tokens[index]) {
                tokens[index] = 'slag';
                continue;
            }
        }
        if(tokens[index] === 'slag') {
            flagMn = true;
            if (tokens[i] === 'первое' && tokens[i] === 'второе'){
                error[0] = 'Ошибка, нельзя вернуться из слагаемого во множество';
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из слагаемого нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND && flagMn === false) {
                error[0] = `Ошибка, из слагаемого нельзя вернуться во множество`;
                error[1] = tokens[i];
                return error;
            }
            if (tokens[i] && isValidCel(tokens[i-1]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error[0] = `Ошибка: Ожидалась запятая`;
                error[1] = tokens[i];
                return error;
            }
            if (tokens[i] && tokens[i+1] !== undefined && isValidCel(tokens[i+1]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error[0] = `Ошибка: Ожидалась запятая`;
                error[1] = tokens[i];
                return error;
            }
            if (!isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i] !== 'конец' && !isValidPer(tokens[i])){
                error[0] = `Ошибка: некорректный формат записи целого числа`;
                error[1] = tokens[i];
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i+1] !== ',' && tokens[i] !== 'конец' && tokens[i+1] !== 'конец') {
                error[0] = `Ошибка: Ожидался либо терминал "конец слагаемого", либо ","`;
                error[1] = tokens[i+1] || tokens[i] ;
                return error;
            } else if (isValidCel(tokens[i]) && tokens[i] !== ',' && (tokens[i] === 'конец' || tokens[i+1] === 'конец')){
                continue;
            }
            if(tokens[i] === ',' && !(/[0-9]/.test(tokens[i+1]))) {
                error[0] = `Ошибка: Ожидалось целое`;
                error[1] = tokens[i];
                return error;
            }
            if (tokens[i] === 'конец' && tokens[i+1] !== 'слагаемого') {
                error[0] = `Ошибка: Ожидался терминал "слагаемого"`
                error[1] = tokens[i+1] || tokens[i] ;
                return error;
            }
            if(tokens[i] === 'конец' && tokens[i+1] === 'слагаемого'){
                tokens[index] = 'oper';
                continue;
            }
        }
        if(tokens[index] === 'oper') {
            if (tokens[i] === ':' && isValidCel(tokens[i-1]) && tokens[i+1] === undefined){
                error[0] = `Ошибка, после метки ожидалась переменная`;
                error[1] = tokens[i-1]+tokens[i];
                return error;
            } else if (tokens[i] === ':' && isValidCel(tokens[i-1]) && tokens[i+1] !== undefined){
                mark = true;
                continue;
            }
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка: Из оператора нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error[0] = `Ошибка: Из оператора нельзя вернуться во множество`;
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === 'слагаемого' && tokens[i+1] === undefined){
                error[0] = 'Ошибка: Ожидалась либо метка, либо переменная';
                error[1] = tokens[i];
                return error;
            } else if (tokens[i] === 'слагаемого' && tokens[i+1] !== undefined){
                continue;
            }
            if (isValidCel(tokens[i]) && mark === true) {
                error[0] = 'Ошибка: Может быть только одна метка';
                error[1] = tokens[i];
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] === ':' && mark === true) {
                error[0] = 'Ошибка: Может быть только одна метка';
                error[1] = tokens[i];
                return error;
            }
            if(!isValidCel(tokens[i]) && !isValidPer(tokens[i]) && tokens[i] !== '='){
                error[0] = 'Ошибка: некорректный формат записи целого числа';
                error[1] = tokens[i];
                return error;
            } else if (isValidCel(tokens[i])){
                continue;
            }
            // if(/[0-7]:/.test(tokens[i]) && tokens[i+1] === undefined){
            //     error[0] = 'Ошибка: Ожидалась переменная';
            //     error[1] = tokens[i];
            //     return error;
            // }
            if(tokens[i] === 'конец' && tokens[i+1] === 'слагаемого'){
                error[0] = 'Ошибка: Из оператора нельзя вернуться в слагаемое';
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === 'конец'){
                error[0] = 'Ошибка: Терминал "конец" написан в операторе';
                error[1] = tokens[i];
                return error;
            }
            if(!isValidPer(tokens[i]) && !isValidCel(tokens[i]) && !(/[0-9]:/.test(tokens[i])) && per === false){
                error[0] = 'Ошибка: Ожидалась метка либо переменная';
                error[1] = tokens[i];
                return error;
            }
            if(isValidPer(tokens[i]) && per === true ) {
                error[0] = 'Ошибка: В данном выражении может быть только одна переменная';
                error[1] = tokens[i];
                return error;
            }
            if (isValidPer(tokens[i]) && per === false){
                per = true;
            }
            if(isValidPer(tokens[i]) && tokens[i+1] !=='='){
                error[0] = `Ошибка: Ожидался знак "="`;
                error[1] = tokens[i+1] ?? tokens[i];
                return error;
            }
            if (isValidCel(tokens[i]) && (tokens[i+1]) !== ":" && mark === false) {
                error[0] = 'Ошибка: Ожидалось ":"';
                error[1] = tokens[i];
                return error;
            } else if (isValidCel(tokens[i]) && tokens[i+1] === ":" ){
                mark = true;
                continue;
            }
            if(!isValidCel(tokens[i]) && tokens[i] !== '=' && !isValidPer(tokens[i]) && !(tokens[i]).includes(':') && !(tokens[i-1].includes(':'))){
                error[0] = 'Ошибка, некорректно написана метка';
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === '='){
                error[0] = '';
                i--;
                tokens[index] = 'prav';
                continue;
            }
        }
        if (tokens[index] === 'prav') {
            if(isValidCel(tokens[i]) && tokens[i+1] === ':' && !operations.includes(tokens[i]) && !functions.includes(tokens[i])){
                mark = false;
                per = false;
                perem += `${tokens[i]}`;
                tokens[index] = 'oper';
                newPerems.set(variable,perem);
                perem = '';
                continue;
            }
            if(/[а-я][а-я0-7]*/.test(tokens[i+1]) && tokens[i] !== '=' && tokens[i+2] === '=' && !operations.includes(tokens[i]) && !functions.includes(tokens[i])){
                mark = false;
                per = false;
                perem += `${tokens[i]}`;
                newPerems.set(variable,perem);
                perem = '';
                tokens[index] = 'oper';
                continue;
            }
            if (functions.includes(tokens[i]) && tokens[i+1] === '!'){
                continue;
            }
            if(functions.includes(tokens[i]) && (operations.includes(tokens[i+1]) || tokens[i+1] === '!')){
                error[0] = `Ошибка: После функций не могут идти операции`;
                error[1] = tokens[i+1];
                return error;

            }
            // if(tokens[i+1] !== undefined && tokens[i+2] !== undefined && functions.includes(tokens[i]) && !isValidCel(tokens[i+1]) && tokens[i+2] !== '!' && tokens[i+2] !== 'конец' && !operations.includes(tokens[i+2])){
            //     // /sin[0-9]+/.test(tokens[i]) && (functions.includes(tokens[i+1]) || tokens[i+1] === '!')
            //     error[0] = `Ошибка: После ${tokens[i+1]} не может идти ${tokens[i+2]}`;
            //     error[1] = tokens[i+2];
            //     return error;
            // }
            if(isValidCel(tokens[i]) && tokens[i+1] === '!'){
                error[0] = `Ошибка: После ${tokens[i]} не может идти ${tokens[i+1]}`;
                error[1] = tokens[i+1];
                return error;
            }
            // if(/cos[0-9]+/.test(tokens[i]) && (functions.includes(tokens[i+1]) || tokens[i+1] === '!' )){
            //     ///cos[0-9]+/.test(tokens[i]) && (functions.includes(tokens[i+1]) || tokens[i+1] === '!' )
            //     error[0] = `Ошибка, после ${tokens[i]} не может идти ${tokens[i+1]}`;
            //     error[1] = tokens[i+1];
            //     return error;
            // }
            // if(/abs[0-9]+/.test(tokens[i]) && (functions.includes(tokens[i+1]) || tokens[i+1] === '!')){
            //     error[0] = `Ошибка, после ${tokens[i]} не может идти ${tokens[i+1]}`;
            //     error[1] = tokens[i+1];
            //     return error;
            // }
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка: Из правой части нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error[0] = `Ошибка: Из правой части нельзя вернуться во множество`;
                error[1] = tokens[i];
                return error;
            }
            if (tokens[i] === '=' && isValidPer(tokens[i-1])){
                variable = tokens[i-1];
            }
            if (tokens[i] === '=' && operations.includes(tokens[i+1]) && tokens[i+1] !== '!' && tokens[i+1] !== '-'){
                error[0] = `Ошибка: После "=" не может идти операция`;
                error[1] = tokens[i+1];
                return error;
            }
            if(tokens[i-1] === '=' && tokens[i+1] === '='){
                error[0] = 'Ошибка, некорректное выражение ' + tokens[i-1] + ' ' + tokens[i] + ' ' + tokens[i+1];
                error[1] = tokens[i];
                return error;
            }
            if(functions.includes(tokens[i]) && (isValidCel(tokens[i-1]) || isValidPer(tokens[i-1]))){
                error[0] = `Ошибка, после ${tokens[i-1]} не может идти ${tokens[i]}`;
                error[1] = tokens[i];
                return error;
            }
            if(/[а-я][а-я0-7]*/.test(tokens[i]) && tokens[i+1] === '=' && (operations.includes(tokens[i-1]) || !functions.includes(tokens[i-1]))){
                error[0] = `Ошибка: Ожидалось целое либо переменная`;
                error[1] = tokens[i];
                return error;
            }
            if(isValidPer(tokens[i]) && !newPerems.has(tokens[i]) && tokens[i] !== 'конец'){
                error[0] = `Ошибка, ${tokens[i]} не была ещё объявлена`;
                error[1] = tokens[i];
                return error;
            }

            if (tokens[i] === '=' && tokens[i+1] === undefined){
                error[0] = 'Ошибка: Ожидалось выражение';
                error[1] = tokens[i];
                return error;
            } else if(tokens[i] === '=' && tokens[i+1] !== undefined){
                continue;
            }
            if (
                (operations.includes(tokens[i]) && operations.includes(tokens[i+1]) && tokens[i+1] !== '!' && tokens[i] !== '!')
                // ||
                //                 (operations.includes(tokens[i]) && functions.includes(tokens[i+1])) ||
                //                 (functions.includes(tokens[i]) && operations.includes(tokens[i+1]))
            ) {
                error[0] = 'Ошибка: Две операции не могут быть рядом друг с другом';
                error[1] = tokens[i+1];
                return error;
            }
            if((operations.includes(tokens[i]) && (tokens[i+1] === undefined || tokens[i+1] === 'конец')) || (functions.includes(tokens[i]) && (tokens[i+1] === undefined || tokens[i+1] === 'конец'))) {
                error[0] = `Ошибка: После операции может быть или переменная, или целое`;
                error[1] = tokens[i+1] ?? tokens[i];
                return error;
            }
            if ((isValidCel(tokens[i]) || isValidPer(tokens[i])) && (tokens[i+1] === undefined || !operations.includes(tokens[i+1])) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец') {
                //!functions.includes(tokens[i+1])
                error[0] = `Ошибка: Ожидалась либо операция, либо следующее выражение или "конец" `;
                error[1] = tokens [i+1] ?? tokens[i];
                return error;
            }
            if(tokens[i] !== 'конец'){
                perem += `${tokens[i]} `;
            }
            if(tokens[i] === 'конец' && tokens[i-1] === '='){
                error[0] = 'Ошибка: Перед терминалом "конец" не может стоять ' + tokens[i-1];
                error[1] = tokens[i-1];
                return error;
            }
            if(tokens[i] === 'конец' && !operations.includes(tokens[i-1]) && !functions.includes(tokens[i-1]) && tokens[i-1] !== '='){
                tokens[index] = 'end';
                i--;
                continue
            }

            if((!isValidCel(tokens[i]) || !isValidPer(tokens[i])) && !operations.includes(tokens[i+1]) && !operations.includes(tokens[i]) && !functions.includes(tokens[i]) && !functions.includes(tokens[i+1]) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец'){
                error[0] = 'Ошибка: Ожидалась либо переменная, либо целое';
                error[1] = tokens[i];
                return error;
            } else if (isValidCel(tokens[i]) || isValidPer(tokens[i])){
                continue;
            }
        }
        if (tokens[index] === 'end'){
            error = '';
            newPerems.set(variable,perem);
            // error = newPerems;
            // break;
            return newPerems;
        }
        // console.clear();
    }
}
$('#run-button').click(function () {
    $('#input').unmark();
    let text = $('#input').text();
    let tokens = tokenize(text);
    console.log(tokens);
    let expr = parse(tokens);
    if(Object.prototype.toString.call(expr) === '[object Map]'){
        $('#output').text('');
        $('#input').unmark();
        let json = JSON.stringify(Array.from(expr.entries()));
        fetch('http://localhost:3000/analyzeSyntax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression: json })
        })
            .then(response => response.json())
            .then(data => {
                const result = data.result;
                let output = '';
                result.forEach(([key, value]) => {
                    output += key + ' = ' + value + '\n';
                });
                $('#output').text('Результат:\n' + output);
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    } else {
        $('#output').text('');
        let options = {};
        if (expr[1] === ',' || expr[1] ==='=' || expr[1] === '@' || expr[1] === '+' || expr[1] === '-' || expr[1] === '/' || expr[1] === '*' ||
            expr[1] === '!' || expr[1] === '' || expr[1] === '$' || expr[1] === '&&' || expr[1] === '||' || expr[1] === ':'){
            options = {
                "accuracy": {
                    "value": "partially",
                    "limiters": ["'", "`"],
                },
            };
        } else {
            options = {
                "accuracy": {
                    "value": "exactly",
                    "limiters": [",", "=",'+','*','!','/','-'],

                },
            };
        }
        $('#input').unmark();
        $('#input').mark(expr[1],options);
        for (let i = 0; i < countWords($('#input').text(),expr[1])-1;i++){
            let inputText = $('#input').html();
            let match = /<mark data-markjs="true">/.exec(inputText);
            if (match !== null && match[0] !== undefined) {
                let endIndex = match.index + match[0].length;
                let newText = inputText.substring(0, endIndex).replace('<mark data-markjs="true">', '') +
                    inputText.substring(endIndex);
                $('#input').html(newText);
            }
            match = /<mark data-markjs="true">/.exec($('#input').text());
        }
        $('#output').text(expr[0]);
    }
});

function countWords(text, word) {
    const wordsArray = tokenize(text);
    let count = 0;
    for (let i = 0; i < wordsArray.length; i++) {
        if (wordsArray[i] === word) {
            count++;
        }
    }

    return count;
}
