@preprocessor typescript

@{%
import type { Term, TermElement } from './atoms'
import * as atoms from './atoms'
import moo = require('moo')

const lexer: moo.Lexer = moo.compile({
    WS: /[ \t]+/,
    integer: /0|[1-9][0-9]*/,
    dice_d100: "d%",
    dice_fudge: "dF",
    dice: "d",
    keep_high: "kH",
    keep_mid: "kM",
    keep_low: "kL",
    keep: "k",
    lparen: "(",
    rparen: ")",
    oper_add: "+",
    oper_sub: "-",
    oper_mul: /[*x]/,
    oper_div: "/",
})

%}

@lexer lexer

main -> expression  {% (data: any[]) => data[0] as Term %}


expression -> term %WS:? %oper_add %WS:? term  {% (data: any[]) => {
    const term1 = data[0] as atoms.TermElement
    const term2 = data[4] as atoms.TermElement
    return new atoms.OperatorTerm(atoms.OperatorType.ADD, term1, term2)
} %}
    | term %WS:? %oper_sub %WS:? term  {% (data: any[]) => {
    const term1 = data[0] as atoms.TermElement
    const term2 = data[4] as atoms.TermElement
    return new atoms.OperatorTerm(atoms.OperatorType.SUB, term1, term2)
} %}
    | term  {% (data: any[]) => data[0] as Term %}


term -> factor %WS:? %oper_mul %WS:? term  {% (data: any[]) => {
    const term1 = data[0] as atoms.TermElement
    const term2 = data[4] as atoms.TermElement
    return new atoms.OperatorTerm(atoms.OperatorType.MUL, term1, term2)
} %}
    | factor %WS:? %oper_div %WS:? term  {% (data: any[]) => {
    const term1 = data[0] as atoms.TermElement
    const term2 = data[4] as atoms.TermElement
    return new atoms.OperatorTerm(atoms.OperatorType.DIV, term1, term2)
} %}
    | factor  {% (data: any[]) => data[0] as Term %}


factor -> %lparen expression %rparen  {% (data: any[]) => data[1] as Term %}
    | dice_term                       {% (data: any[]) => data[0] as atoms.DiceTerm %}
    | integer                         {% (data: any[]) => new atoms.IntegerTerm(data[0] as number) %}


dice_term -> fudge_dice_term       {% (data: any[]) => data[0] as Term %}
    | basic_dice_term keep_term:?  {% (data: any[]) => {
        const sides: number = data[0].sides as number
        const qty: number = data[0].qty as number
        const keep_mode: atoms.DiceKeepMode = (data[1]?.keep_mode as atoms.DiceKeepMode) || atoms.DiceKeepMode.KEEP_HIGHEST
        const keep_qty: number = (data[1]?.keep_qty as number) || qty
        return new atoms.DiceTerm(sides, qty, keep_mode, keep_qty)
    } %}


basic_dice_term -> integer dice_spec  {% (data: any[]) => ({qty: data[0] as number, sides: data[1] as number}) %}
    | dice_spec                       {% (data: any[]) => ({qty: 1, sides: data[0] as number})                %}


dice_spec -> %dice integer  {% (data: any[]) => data[1] as number %}
    | %dice_d100            {% () => 100 %}                          # Expands to "d100"


keep_term -> (%keep|%keep_high) integer  {% (data: any[]) => ({keep_mode:  1, keep_qty: data[1] as number}) %}  # Expands to "kH${integer}"
    | %keep_mid integer                  {% (data: any[]) => ({keep_mode:  0, keep_qty: data[1] as number}) %}  # keep mid
    | %keep_low integer                  {% (data: any[]) => ({keep_mode: -1, keep_qty: data[1] as number}) %}  # keep low


# Usable only for Fudge game. 4dF, for example, expands to 4d3-8 -- Generic: mdF = md3-(2*m)
fudge_dice_term -> integer %dice_fudge
    {% (data: any[]) => { 
        const i: number = data[0] as number
        return new atoms.OperatorTerm(
            atoms.OperatorType.SUB,
            new atoms.DiceTerm(i, 3, atoms.DiceKeepMode.KEEP_HIGHEST, i),
            new atoms.IntegerTerm(2 * i)
        )
    } %}


integer -> %integer      {% (data: any[]) => parseInt(data[0]) %}