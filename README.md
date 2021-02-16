# vdice

A small Typescript library for simulating dice rolls. It was specifically designed for games that require special dice, such as Dungeons and Dragons™ and Fudge™ (Freeform Universal Do-it-yourself Gaming Engine)

_If you want to see the changelog, [enter here](CHANGELOG.md)_

## How does it work?

This library relies on [nearley](https://nearley.js.org/), a parser designed in Javascript; and [moo](https://github.com/no-context/moo), a blazingly fast tokenizer.

The functionality is super simple: you enter a query, the library rolls the dice and you can obtain either the final result or the intermediate results of every roll. The query language is based on the typical expressions you may find in may game books; here are some examples for you to illustrate it:

- `2d6`: Roll two six-sided dice
- `4d8`: Roll four eight-sided dice
- `d20`: Roll a single twenty-sided dice *(note that we can omit the quantity if it is one dice)*
- `d%`: Roll a one-hundred-sided dice *(a percentage dice)*
- `1d20+4`: Roll a single twenty-sided dice, then add 4 to the result
- `4d6kH3` or `4d6k3`: Roll four six-sided dice, then keep the highest three rolls *(for high rolls, we can omit the `H`)*
- `2d20kL1`: Roll two twenty-sided dice, then keep the lowest roll *(important: the letter after the `k` is **always** uppercase)*
- `6d12kM3`: Roll six twelve-sided dice, then keep the three middle rolls.
- `(2d10kH1+5)*3`: Mutliply per 3 the best roll of two ten-sided dice with 5 extra points
- `<Insert your roll here>`

# How do I use it?

Simply `require` or `import` it and you're ready to go:

```javascript
const { vdice } = require('vdice')
//or
import vdice from vdice;
```

Then, use the imported module as a function for making your queries:

```javascript
const savingThrow = vdice('1d20')
const result = savingThrow.roll()
console.log(`Saving throw ${result >= 10 ? ' succeded' : 'failed'}`)
```

After your query completes (after `roll`ing your dice), you can also get in-depth results: by using the function `fullResult` you can unravel the result of each rolled dice:

```javascript
const advantageThrow = dice('2d20kH1')
/*
 * If you forget to roll(), don't worry; fullResult() does take care of
 * rolling before showing the in-depth results
 */
console.log(advantageThrow.fullResult())
```

And it will print something like this:

```javascript
{
    query: '2d20kH1',
    rolledDice: [ 10, 12 ],
    filteredDice: [ 12 ],
    result: 12
}
```

**Note:** Whenever you roll Fudge™ dice, you may see that the results of the dice are `1`, `2` and `3` instead of their respective `-` (failure, or `-1`), `0` (neutral, or `0`) and `+` (success, or `+1`), respectively. This _modus operandi_ has a reason: it enhaces parsing, AST-building and execution by simply rolling `n` three-sided dice and then substracting `2*n` to the roll result, which mathematically yields the same result. If you're curious to see this in action, here's an example roll:

```javascript
const fudgeRoll = dice('2d20kH1')
console.log(fudgeRoll.fullResult())
```

```javascript
{
    oper: 'sub',
    term1: {
      query: '4d3',
      rolledDice: [ 1, 1, 1, 3 ],
      filteredDice: [ 1, 1, 1, 3 ],
      result: 6
    },
    term2: { value: 8 },
    result: -2
}
```

*As you may see, I rolled three failures and one success. If I take a calculator and input `-1-1-1+1`, it'll return `-2`; same result as the roll up here.*

# How do I build it?

1. Clone this repository (`git clone https://...`)
2. Install all dependencies (`npm i`)
3. Build the library (`npm run lib`)

And, that's it! You're now ready to use it in your apps
