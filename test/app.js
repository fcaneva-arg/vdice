const dice = require('../lib').default

function main() {
    ['2d6', 'd%', '4d8+2', '3d6+2d8', '4dF'].forEach(input => {
        const query = dice(input)
        const result = query.roll()
        console.log({ input, result })
    })
}

main()