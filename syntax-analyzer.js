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
    return str.split(/(?<=[,=/*-+!])|(?=[,=/*-+!])|(?=&{2})|(?=\|{2})|(?=sin[0-7]+)|(?=cos[0-7]+)|(?=abs[0-7]+)|\s+/).map(function (token) {
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
    let error = '';
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
            error = `Ошибка в слове ${tokens[i]}, ожидался терминал "начало"`;
            break;
        } else if (lexemes.BEGIN === tokens[i] && flagBegin === false) {
            if (lexemes.MN.FIRST !== tokens[index] && lexemes.MN.SECOND !== tokens[index] && tokens[index-1] === lexemes.BEGIN) {
                error = `Ошибка, после 'начало' ожидалось либо "первое", либо "второе"`;
                break;
            }
            continue;
        }
        if (lexemes.MN.FIRST === tokens[i] && flagMn === false) {
            flagBegin = true;
            index = i;
            if(tokens[i+1] === lexemes.MN.FIRST || tokens[i+1] === lexemes.MN.SECOND) {
                error = 'Ошибка, два терминала идущих подряд';
                break;
            }
            if ((lexemes.MN.FIRST === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.FIRST === tokens[i] && !isValidPer(tokens[i+1]))) {
                error = `Ошибка, после ${tokens[index]} ожидалась переменная`;
                break;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.FIRST && flagMn === false) {
            flagBegin = true;
            if(tokens[i] === lexemes.BEGIN) {
                error = `Ошибка, из множества нельзя писать терминал "начало"`;
                break;
            }
            if((tokens[i] === 'конец' || tokens[i] === 'слагаемого') && !isValidCel(tokens[i-1])){
                error = `Ошибка, перед терминалом "конец слагаемого" должно идти хотя бы одно целое`;
                break;
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
                error = `Ошибка, переменные должны идти через запятую`;
                break;
            }
            if (!isValidPer(tokens[i]) && tokens[i] !== ',') {
                error = `Ошибка, неправильно написанная переменная`;
                break;
            }
            if (tokens[i] === ',' && tokens[i + 1] === undefined) {
                error = `Ошибка, после ${tokens[i]} ожидалась переменная`;
                break;
            }
            if (isValidPer(tokens[i]) && tokens[i+1] === undefined && tokens[i] !== lexemes.MN.SECOND) {
                error = `Ошибка, после переменной ожидалось либо целое, либо второе`;
                break;
            }
        }
        if (lexemes.MN.SECOND === tokens[i] && flagMn === false) {
            index = i;
            if ((lexemes.MN.SECOND === tokens[i] && tokens[i+1] === undefined) || (lexemes.MN.SECOND === tokens[i] && !isValidCel(tokens[i+1])) && tokens[index] !== 'slag') {
                error = `Ошибка, после ${tokens[index]} ожидалось целое`;
                break;
            }
            continue;
        }
        if(tokens[index] === lexemes.MN.SECOND && flagMn === false) {
            if(tokens[i] === lexemes.BEGIN) {
                error = `Ошибка, из множества нельзя писать терминал "начало"`;
                break;
            }
            if((tokens[i-1] === tokens[index]) && (tokens[i+1] === undefined || tokens[i+1] === ',')){
                error = `Ошибка, должно быть написано хотя бы ещё одно целое число`;
                break;
            }
            if((/[^0-9]/).test(tokens[i]) && (tokens[i] !== 'конец' || tokens[i] !== 'слагаемого' )) {
                error = `Ошибка, после целого не может идти какой-либо символ`;
                break;
            }
            if (isValidCel(tokens[i]) && (tokens[i+1]) === 'конец' && tokens[i-1] !== lexemes.MN.SECOND) {
                //i--;
                tokens[index] = 'slag';
                continue;
            }
            if(!isValidCel(tokens[i])) {
                error = `Ошибка, неправильно написано целое число`;
                break;
            }
            if (isValidCel(tokens[i]) && tokens[i+1] === undefined ) {
                error = `Ошибка, ожидался переход в слагаемое`;
                break;
            } else if (isValidCel(tokens[i]) && tokens[i+1] === ',' && tokens[i-1] !== tokens[index]) {
                tokens[index] = 'slag';
                continue;
            }
        }
        if(tokens[index] === 'slag') {
            flagMn = true;
            if (tokens[i] === 'первое' && tokens[i] === 'второе'){
                error = 'Ошибка, нельзя в пред блок';
                break;
            }
            if(tokens[i] === lexemes.BEGIN) {
                error = `Ошибка, из слагаемого нельзя писать терминал "начало"`;
                break;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error = `Ошибка, из слагаемого нельзя вернуться во множество`;
                break;
            }
            if (tokens[i] && isValidCel(tokens[i-1]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error = `Ошибка, между целыми должна стоять запятая`;
                break;
            }
            if (!isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i] !== 'конец'){
                error = `Ошибка, неправильно написано целое число`;
                break;
            } else if (isValidCel(tokens[i]) && tokens[i] !== ',' && tokens[i] !== 'конец') {
                error = `Ошибка, ожидался терминал "конец слагаемого"` // он будет всегда её выводить, так что пока всё работает нормально
                continue;
            }
            if(tokens[i] === ',' && !(/[0-9]/.test(tokens[i+1]))) {
                error = `Ошибка, после запятой должно идти целое`;
                break
            }
            if (tokens[i] === 'конец' && tokens[i+1] !== 'слагаемого') {
                error = `Ошибка, ожидался терминал "слагаемого"`
                break;
            }
            if(tokens[i] === 'конец' && tokens[i+1] === 'слагаемого'){
                tokens[index] = 'oper';
                continue;
            }
        }
        if(tokens[index] === 'oper') {
            if(tokens[i] === lexemes.BEGIN) {
                error = `Ошибка, из оператора нельзя писать терминал "начало"`;
                break;
            }
            if(tokens[i] === lexemes.MN.FIRST || tokens[i] === lexemes.MN.SECOND) {
                error = `Ошибка, из оператора нельзя вернуться во множество`;
                break;
            }
            if(tokens[i] === 'слагаемого' && tokens[i+1] === undefined){
                error = 'Ошибка, ожидалась либо метка, либо переменаня';
                break;
            } else if (tokens[i] === 'слагаемого' && tokens[i+1] !== undefined){
                continue;
            }
            if (/[0-7]:/.test(tokens[i]) && mark === true && tokens[i].length !== 1) {
                error = 'Ошибка, может быть только одна метка';
                break;
            }
            if (isValidCel(tokens[i]) && mark === true) {
                error = 'Ошибка, может быть только одна метка';
                break;
            }
            if(/[0-7]:/.test(tokens[i]) && tokens[i+1] === undefined){
                error = 'Ошибка, ожидалась переменная';
                break;
            }

            if(!isValidPer(tokens[i]) && !isValidCel(tokens[i]) && !(/[0-7]:/.test(tokens[i])) && per === false){
                error = 'Ошибка, некорректно написана переменная';
                break;
            }
            if(isValidPer(tokens[i]) && per === true ) {
                error = 'Ошибка, в данном выражении может быть только одна переменная';
                break;
            }
            if (isValidPer(tokens[i]) && per === false){
                per = true;
            }
            if(isValidPer(tokens[i])&&tokens[i+1] !=='='){
                error=`Ошибка, после переменной должен идти знак равно`;
                break
            }
            if (isValidCel(tokens[i]) && !(tokens[i]).includes(':') && mark === false) {
                error = 'Ошибка, после метки должно стоять двуеточие';
                break;
            } else if (tokens[i].includes(':') && tokens[i].length !== 1){
                mark = true;
                continue;
            }
            if(!isValidCel(tokens[i]) && tokens[i] !== '=' && !isValidPer(tokens[i]) && !(tokens[i]).includes(':') && !(tokens[i-1].includes(':'))){
                error = 'Ошибка, некорректно написана метка';
                break;
            }
            if(tokens[i] === '='){
                error = '';
                i--;
                tokens[index] = 'prav';
                continue;
            }
        }
        if (tokens[index] === 'prav') {
            if (tokens[i] === '=' && isValidPer(tokens[i-1])){
                variable = tokens[i-1];
            }
            if(/[0-9]:/.test(tokens[i+1]) && !operations.includes(tokens[i]) && !functions.includes(tokens[i])){
                mark = false;
                per = false;
                perem += `${tokens[i]}`;
                tokens[index] = 'oper';
                newPerems.set(variable,perem);
                perem = '';
                continue;
            }
            if(functions.includes(tokens[i]) && (isValidCel(tokens[i-1]) || isValidPer(tokens[i-1]))){
                error = `Ошибка, после ${tokens[i-1]} не может идти ${tokens[i]}`;
                break
            }
            if(/[а-я][а-я0-7]*/.test(tokens[i]) && tokens[i+1] === '=' && (operations.includes(tokens[i-1]) || !functions.includes(tokens[i-1]))){
                error = `Ошибка, после ${tokens[i-1]} должно идти либо целое, либо переменная`;
                break;
            }
            if(/[а-я][а-я0-7]*/.test(tokens[i+1]) && tokens[i+2] === '=' && !operations.includes(tokens[i]) && !functions.includes(tokens[i])){
                mark = false;
                per = false;
                perem += `${tokens[i]}`;
                newPerems.set(variable,perem);
                perem = '';
                tokens[index] = 'oper';
                continue;
            }
            if (tokens[i] === '=' && tokens[i+1] === undefined){
                error = 'Ошибка, после знака "=" ожидалось выражение';
                break
            } else if(tokens[i] === '=' && tokens[i+1] !== undefined){
                continue;
            }
            if (
                (operations.includes(tokens[i]) && operations.includes(tokens[i+1]))
                // ||
                //                 (operations.includes(tokens[i]) && functions.includes(tokens[i+1])) ||
                //                 (functions.includes(tokens[i]) && operations.includes(tokens[i+1]))
            ) {
                error = 'Ошибка, две операции не могут быть рядом друг с другом';
                break;
            }
            if((operations.includes(tokens[i]) && tokens[i+1] === undefined) || (functions.includes(tokens[i]) && tokens[i+1] === undefined)) {
                error = `После арифметической операции ${tokens[i]} должна идти или переменная, или целое`;
                break;
            }
            if ((isValidCel(tokens[i]) || isValidPer(tokens[i])) && (tokens[i+1] === undefined || !operations.includes(tokens[i+1]) && !functions.includes(tokens[i+1])) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец') {
                error = `Ошибка, после ${tokens[i]} ожидалось следующее выражение или "конец" `;
                break;
            }
            if(tokens[i] !== 'конец'){
                perem += `${tokens[i]} `;
            }
            if(tokens[i] === 'конец' && error === ''){
                tokens[index] = 'end';
                i--;
                continue
            }
            if((!isValidCel(tokens[i]) || !isValidPer(tokens[i])) && !operations.includes(tokens[i+1]) && !operations.includes(tokens[i]) && !functions.includes(tokens[i]) && !functions.includes(tokens[i+1]) && tokens[i] !== 'конец' && tokens[i+1] !== 'конец'){
                error = 'Ошибка, ожидалась либо переменная, либо целое';
                break;
            } else if (isValidCel(tokens[i]) || isValidPer(tokens[i])){
                continue;
            }
        }
        if (tokens[index] === 'end'){
            newPerems.set(variable,perem);
            error = newPerems;
            break;
        }
        console.clear();
    }
    return error;
}


$('#input').bind('input', function (event) {
    let tokens = tokenize(this.innerText);
    let expr = parse(tokens);
    let str = expr.get('пер');

    console.log(modify(str));

});

function modify(str) {
    const parser = new Parser();
    return parser.parse(str);
}






//начало первое пер 2 конец слагаемого пер = 1 + 2 cos sin 5

