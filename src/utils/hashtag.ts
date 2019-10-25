export const hashtagRegex = /(\#[a-zA-Záéúőóüö_0-9]+\b)(?!;)/gm;

export function processHashtagList(list: string): Array<string> {
    let array;
    if (typeof list === 'string' && list.match(/([a-zA-Záéúőóüö_]+,)*[a-zA-Záéúőóüö_]+/g)) {
        array = list.split(',');
    }
    return array ? array.map(tag => `#${tag.toLowerCase()}`) : undefined;
}
