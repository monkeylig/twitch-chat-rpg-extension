function getValue(value, defaultValue) {
    return value !== undefined ? value : defaultValue;
}

function damageText(value) {
    return !value ? '-' : value;
}

const utility = {
    getValue,
    damageText
}

export default utility;