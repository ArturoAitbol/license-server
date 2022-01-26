import { Action } from 'src/app/model/action';

export class AddComment {
    public static generateQuery(data: Action): string {
        const commentedString = data.value;
        // const result = [];
        // let resultStr = '';
        // const max = Math.round(commentedString.length / 100);
        // for (let index = 0; index < max; index++) {
        //     const startValue = index * 100;
        //     const endValue = 100 * (index + 1);
        //     if (index < max - 1)
        //         result.push(commentedString.substring(startValue, endValue));
        //     else {
        //         result.push(commentedString.substring(startValue));
        //     }
        // }

        // result.forEach((str: string, index: number) => {
        //     resultStr += '// ' + str;
        //     // resultStr +=;
        //     if (index < result.length - 1) {
        //         resultStr += '\n';
        //     }
        // });
        return '// ' + commentedString;
    }
}
