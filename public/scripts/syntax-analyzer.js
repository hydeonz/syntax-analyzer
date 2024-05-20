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
    str = str.replaceAll(/(=|sin|cos|abs|not|or|and|\+|-|\*|\/|,|[А-я]+[0-9]+|[0-9]+|[A-z]+[0-9]+)/g," $1 ");
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
        console.clear();
        if (i === 0 && lexemes.BEGIN !== tokens[0] && flagBegin === false) {
            error[0] = `Ошибка в слове ${tokens[i]}, ожидался терминал "начало"`;
            error[1] = tokens[i];
            error[2] = i;
            return error;
        } else if (lexemes.BEGIN === tokens[i] && flagBegin === false) {
            if (lexemes.MN.FIRST !== tokens[index] && lexemes.MN.SECOND !== tokens[index] && tokens[index-1] === lexemes.BEGIN) {
                error[0] = `Ошибка: Ожидалось либо "первое", либо "второе"`;
                error[1] = tokens[index] ?? tokens[i];
                error[2] = i;
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
                error[2] = i+1;
                return error;
            }
            if ((lexemes.MN.FIRST === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.FIRST === tokens[i] && !isValidPer(tokens[i+1]))) {
                error[0] = `Ошибка: Ожидалась переменная`;
                error[1] = tokens[i+1] ?? tokens[i];
                error[2] = i;
                return error;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.FIRST && flagMn === false) {
            flagBegin = true;
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из множества нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if((tokens[i] === 'конец' || tokens[i] === 'слагаемого') && !isValidCel(tokens[i-1])){
                error[0] = `Ошибка, перед терминалом "конец слагаемого" должно идти хотя бы одно целое`;
                error[1] = tokens[i-1];
                error[2] = i-1;
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
                error[0] = `Ошибка: Ожидалась запятая`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (!isValidPer(tokens[i]) && tokens[i] !== ',') {
                error[0] = `Ошибка: Неправильный формат записи переменной`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (tokens[i] === ',' && tokens[i + 1] === undefined) {
                error[0] = `Ошибка: Ожидалась переменная`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidPer(tokens[i]) && tokens[i+1] === undefined && tokens[i] !== lexemes.MN.SECOND) {
                error[0] = `Ошибка: Ожидалось либо ",", либо целое, либо второе", либо "первое"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
        }
        if (lexemes.MN.SECOND === tokens[i] && flagMn === false) {
            index = i;
            if ((lexemes.MN.SECOND === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.SECOND === tokens[i] && !isValidCel(tokens[i+1])) && tokens[index] !== 'slag') {
                error[0] = `Ошибка: Ожидалось целое`;
                error[1] = tokens[i+1] ?? tokens[index];
                error[2] = i;
                return error;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.SECOND && flagMn === false) {
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка: Из множества нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if((tokens[i-1] === tokens[index]) && (tokens[i+1] === undefined || tokens[i+1] === ',')){
                error[0] = `Ошибка: Должно быть написано хотя бы ещё одно целое число`;
                error[1] = tokens[i+1] ?? tokens[i];
                error[2] = i;
                return error;
            }
            if((/[^0-9]/).test(tokens[i]) && (tokens[i] !== 'конец' || tokens[i] !== 'слагаемого' )) {
                error[0] = `Ошибка: Ожидалось целое`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidCel(tokens[i]) && (tokens[i+1]) === 'конец' && tokens[i-1] !== lexemes.MN.SECOND) {
                //i--;
                tokens[index] = 'slag';
                continue;
            }
            if(!isValidCel(tokens[i])) {
                error[0] = `Ошибка: Неправильный формат записи целого числа`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] === undefined ) {
                error[0] = `Ошибка, ожидался переход в слагаемое`;
                error[1] = tokens[i];
                error[2] = i;
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
                error[2] = i;
                return error;
            }
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из слагаемого нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND && flagMn === false) {
                error[0] = `Ошибка, из слагаемого нельзя вернуться во множество`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (tokens[i] && isValidCel(tokens[i-1]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error[0] = `Ошибка: Ожидалась запятая`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (tokens[i] && tokens[i+1] !== undefined && isValidCel(tokens[i+1]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error[0] = `Ошибка: Ожидалась запятая`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (!isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error[0] = `Ошибка: неправильный формат записи целого числа`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i+1] !== ',' && tokens[i] !== 'конец' && tokens[i+1] !== 'конец') {
                error[0] = `Ошибка:Оожидался либо терминал "конец слагаемого", либо ","`;
                error[1] = tokens[i+1] || tokens[i] ;
                error[2] = i;
                return error;
            } else if (isValidCel(tokens[i]) && tokens[i] !== ',' && (tokens[i] === 'конец' || tokens[i+1] === 'конец')){
                continue;
            }
            if(tokens[i] === ',' && !(/[0-9]/.test(tokens[i+1]))) {
                error[0] = `Ошибка: Ожидалось целое`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (tokens[i] === 'конец' && tokens[i+1] !== 'слагаемого') {
                error[0] = `Ошибка: Ожидался терминал "слагаемого"`
                error[1] = tokens[i+1] || tokens[i] ;
                error[2] = i;
                return error;
            }
            if(tokens[i] === 'конец' && tokens[i+1] === 'слагаемого'){
                tokens[index] = 'oper';
                continue;
            }
        }
        if(tokens[index] === 'oper') {
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из оператора нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error[0] = `Ошибка, из оператора нельзя вернуться во множество`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === 'слагаемого' && tokens[i+1] === undefined){
                error[0] = 'Ошибка: Ожидалась либо метка, либо переменная';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            } else if (tokens[i] === 'слагаемого' && tokens[i+1] !== undefined){
                continue;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] === ':' && mark === true && tokens[i].length !== 1) {
                error[0] = 'Ошибка: Может быть только одна метка';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidCel(tokens[i]) && mark === true) {
                error[0] = 'Ошибка: Может быть только одна метка';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            } else if (isValidCel(tokens[i]) && tokens[i+1] === ':'){
                continue;
            }
            if(tokens[i] === ':' && tokens[i+1] === undefined){
                error[0] = 'Ошибка: Ожидалась переменная';
                error[1] = tokens[i-1] + tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === 'конец' && tokens[i+1] === 'слагаемого'){
                error[0] = 'Ошибка: Из оператора нельзя вернуться в слагаемое';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === 'конец'){
                error[0] = 'Ошибка, терминал "конец" написан в операторе';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(!isValidPer(tokens[i]) && !isValidCel(tokens[i]) && tokens[i] !== ':' && per === false){
                error[0] = 'Ошибка: Неправильынй формат записи переменной';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(isValidPer(tokens[i]) && per === true ) {
                error[0] = 'Ошибка, в данном выражении может быть только одна переменная';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidPer(tokens[i]) && per === false){
                per = true;
            }
            if(isValidPer(tokens[i]) && tokens[i+1] !== '='){
                error[0] = `Ошибка: Ожидался знак "="`;
                error[1] = tokens[i+1] ?? tokens[i];
                error[2] = i;
                return error;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] !== ':' && mark === false) {
                error[0] = 'Ошибка: Ожидалось ":"';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            } else if (isValidCel(tokens[i-1]) && tokens[i] === ':' && mark === false){
                mark = true;
                continue;
            }
            if(!isValidCel(tokens[i]) && tokens[i] !== '=' && !isValidPer(tokens[i]) && tokens[i+1] !== ':'){
                error[0] = 'Ошибка: Некорректно написана метка';
                error[1] = tokens[i];
                error[2] = i;
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
            if (tokens[i-1] === '=' && tokens[i] === '-'){
                continue;
            }
            if (tokens[i-1] === '=' && (tokens[i] === '/' || tokens[i] === '*' || tokens[i] === '&&' || tokens[i] === '||' || tokens[i] === '+')){
                error[0] = "Ошибка: Ожидалась переменная, либо целое, либо функция, либо '!'";
                error[1] = tokens[i+1];
                error[2] = i;
                return error;
            }
            if((isValidCel(tokens[i]) || isValidPer(tokens[i])) && tokens[i+1] === '!'){
                error[0] = "Ошибка: ожидалась операция, кроме '!' ";
                error[1] = tokens[i+1];
                error[2] = i;
                return error;
            }
            if (functions.includes(tokens[i]) && operations.includes(tokens[i+1]) && tokens[i+1] !== '!'){
                error[0] = `После функций не могут идти операции`;
                error[1] = tokens[i+1];
                error[2] = i+1;
                return error;
            }
            if(tokens[i] === lexemes.BEGIN) {
                error[0] = `Ошибка, из правой части нельзя писать терминал "начало"`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error[0] = `Ошибка, из правой части нельзя вернуться во множество`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if (tokens[i] === '=' && isValidPer(tokens[i-1])){
                variable = tokens[i-1];
                error[2] = i;
            }
            if(tokens[i-1] === '=' && tokens[i+1] === '='){
                error[0] = 'Ошибка, некорректное выражение ' + tokens[i-1] + ' ' + tokens[i] + ' ' + tokens[i+1];
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if( tokens[i+1] !== undefined && tokens[i+2] !== undefined && isValidCel(tokens[i+1]) && tokens[i+2] === ':' && !operations.includes(tokens[i]) && !functions.includes(tokens[i])){
                mark = false;
                per = false;
                perem += `${tokens[i]}`;
                tokens[index] = 'oper';
                newPerems.set(variable,perem);
                perem = '';
                continue;
            }
            if(functions.includes(tokens[i]) && (isValidCel(tokens[i-1]) || isValidPer(tokens[i-1]))){
                error[0] = `Ошибка: Ожидалась операция`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(/[а-я][а-я0-7]*/.test(tokens[i]) && tokens[i+1] === '=' && (operations.includes(tokens[i-1]) || !functions.includes(tokens[i-1]))){
                error[0] = `Ошибка: Ожидалась либо переменная, либо целое`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
            }
            if(isValidPer(tokens[i]) && !newPerems.has(tokens[i]) && tokens[i] !== 'конец'){
                error[0] = `Ошибка, ${tokens[i]} не была ещё объявлена`;
                error[1] = tokens[i];
                error[2] = i;
                return error;
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
            if (tokens[i] === '=' && tokens[i+1] === undefined){
                error[0] = 'Ошибка: После "=" ожидалось выражение';
                error[1] = tokens[i];
                error[2] = i;
                return error;
            } else if(tokens[i] === '=' && tokens[i+1] !== undefined){
                continue;
            }
            if (
                (operations.includes(tokens[i]) && operations.includes(tokens[i+1]) && tokens[i+1] !=='!')
                // ||
                //                 (operations.includes(tokens[i]) && functions.includes(tokens[i+1])) ||
                //                 (functions.includes(tokens[i]) && operations.includes(tokens[i+1]))
            ) {
                error[0] = 'Ошибка: Две операции не могут быть рядом друг с другом';
                error[1] = tokens[i+1];
                error[2] = i+1;
                return error;
            }
            if((operations.includes(tokens[i]) && (tokens[i+1] === undefined || tokens[i+1] === 'конец')) || (functions.includes(tokens[i]) && (tokens[i+1] === undefined || tokens[i+1] === 'конец'))) {
                error[0] = `Ошибка: После ${tokens[i]} ожидалась либо переменная, либо целое`;
                error[1] = tokens[i+1] ?? tokens[i];
                error[2] = i;
                return error;
            }
            if ((isValidCel(tokens[i]) || isValidPer(tokens[i])) && (tokens[i+1] === undefined || !operations.includes(tokens[i+1]) && !functions.includes(tokens[i+1])) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец') {
                error[0] = `Ошибка: После ${tokens[i]} ожидалась либо операция, либо метка, либо целое, либо конец`;
                error[1] = tokens[i+1] ?? tokens[i];
                if(tokens[i+1] !== undefined){
                    error[2] = i+1;
                } else {
                    error[2] = i;
                }
                return error;
            }
            if(tokens[i] !== 'конец'){
                perem += `${tokens[i]} `;
            }
            if(tokens[i] === 'конец' && tokens[i-1] === '='){
                error[0] = 'Ошибка, перед концом не может стоять ' + tokens[i-1];
                error[1] = tokens[i-1];
                error[2] = i;
                return error;
            }
            if(tokens[i] === 'конец' && !operations.includes(tokens[i-1]) && !functions.includes(tokens[i-1]) && tokens[i-1] !== '='){
                tokens[index] = 'end';
                i--;
                continue
            }

            if((!isValidCel(tokens[i]) || !isValidPer(tokens[i])) && !operations.includes(tokens[i+1]) && !operations.includes(tokens[i]) && !functions.includes(tokens[i]) && !functions.includes(tokens[i+1]) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец'){
                error[0] = `Ошибка: ожидалось либо целое, либо переменная`;
                error[1] = tokens[i];
                error[2] = i;
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
        console.clear();
    }
}
$('#run-button').click(function () {
    clean();
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
        clean();
        let divContent = $('#input').text();
        let errorIndex = expr[2];
        divContent = divContent.replaceAll(/(=|sin|cos|abs|not|or|and|\+|-|\*|\/|,|[А-я]+[0-9]+|[0-9]+|[A-z]+[0-9]+)/g," $1 ")
        let wordsArray = divContent.match(/\S+|\s+|u{a0}/g);
        wordsArray = wordsArray.map(word => word === "" ? " " : word);
        console.log(wordsArray);
        let index = 0;
        for (let i = 0; i < wordsArray.length; i++) {
            if (/^\s*$/.test(wordsArray[i])) {
                continue;
            }
            if (index === errorIndex) {
                wordsArray[i] = "<span class='highlight'>" + wordsArray[i] + "</span>";
                break;
            }
            index++;
        }
        let modifiedString = wordsArray.join("");
        $('#output').text(expr[0]);
        $('#input').html(modifiedString);
        console.log(tokens);
    }
});

function clean(){
    $('#input').find('span.highlight').contents().unwrap();
}
$('#input').click(function () {
   clean();
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