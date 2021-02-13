const { dice } = require('../lib')
const util = require('util')

function main() {
    ['2d6', 'd%', '4d8+2', '3d6+2d8', '4dF', '2d20kH1+7'].forEach(input => {
        const query = dice(input)
        const result = query.roll()
        const fullResult = query.fullResult()
        console.log(util.inspect({ input, result, fullResult }, false, null, true /* enable colors */ ))
    })
}

main()