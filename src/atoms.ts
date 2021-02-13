import * as _ from 'underscore'

interface Term {
    roll(): number
    fullResult(): object
}

interface TermElement extends Term { }

class IntegerTerm implements TermElement {
    private _value: number

    constructor(value: number) {
        this._value = value
    }

    roll(): number {
        return this._value
    }

    fullResult(): object {
        return {value: this._value}
    }
}

enum DiceKeepMode {
    KEEP_LOWEST = -1,
    KEEP_MID = 0,
    KEEP_HIGHEST = 1
}

class DiceTerm implements TermElement {
    private _sides: number
    private _quantity: number
    private _keepMode: DiceKeepMode
    private _keepQuantity: number
    private _rolledDice: Array<number>
    private _filteredDice: Array<number>
    private _result: number

    constructor(
        sides: number,
        quantity: number = 1,
        keepMode: DiceKeepMode = DiceKeepMode.KEEP_HIGHEST,
        keepQuantity: number = quantity
    ) {
        this._sides = sides
        this._quantity = quantity
        this._keepMode = keepMode
        this._keepQuantity = keepQuantity
        this._rolledDice = new Array<number>(0)
        this._filteredDice = new Array<number>(0)
        this._result = 0
    }

    get sides(): number { return this._sides }

    get quantity():number { return this._sides }

    get keepMode(): DiceKeepMode { return this._sides }

    get keepQuantity(): number { return this._sides }

    get rolledDice(): Array<number> { return this._rolledDice }

    get filteredDice(): Array<number> { return this._filteredDice }

    roll(): number {
        //If already rolled, prevent re-rolling and directly return result
        if (this._rolledDice.length > 0) {
            return this._result
        }

        //Roll die
        _.range(this._quantity).forEach(() => {
            this._rolledDice.push(Math.floor(Math.random() * this._sides + 1))
        })

        //Sort array
        this._rolledDice.sort((a: number, b: number) => a - b)

        //Copy rolled die to filtered die
        this._filteredDice = this._rolledDice.slice()

        //If quantities to roll and to keep differ, eliminate die until we are even
        if (this._quantity !== this._keepQuantity) {
            const remCount: number = this._quantity - this._keepQuantity
            switch (this._keepMode) {
                case DiceKeepMode.KEEP_HIGHEST:
                    _.range(remCount).forEach(() => this._filteredDice.shift())
                    break
                case DiceKeepMode.KEEP_LOWEST:
                    _.range(remCount).forEach(() => this._filteredDice.pop())
                    break
                case DiceKeepMode.KEEP_MID:
                    _.range(remCount).forEach(i => {
                        if (i % 2 == 0) {
                            this._filteredDice.shift()
                        } else {
                            this._filteredDice.pop()
                        }
                    })
                    break
            }
        }

        //Sum filtered die and cache the result
        this._result = this._filteredDice.reduce(
            (total, current) => total + current,
            0
        )

        //Return result
        return this._result
    }

    fullResult(): object {
        //If not rolled previously, roll it first
        if (this._rolledDice.length == 0) {
            this.roll()
        }
        return {
            rolledDice: this._rolledDice.slice(),
            filteredDice: this._filteredDice.slice(),
            result: this._result
        }
    }
}

enum OperatorType {
    ADD,
    SUB,
    MUL,
    DIV
}

class OperatorTerm implements Term {
    private operator: OperatorType
    private termElm1: TermElement
    private termElm2: TermElement

    constructor(operator: OperatorType, termElm1: TermElement, termElm2: TermElement) {
        this.operator = operator
        this.termElm1 = termElm1
        this.termElm2 = termElm2
    }

    roll(): number {
        switch (this.operator) {
            case OperatorType.ADD:
                return this.termElm1.roll() + this.termElm2.roll()
            case OperatorType.SUB:
                return this.termElm1.roll() - this.termElm2.roll()
            case OperatorType.MUL:
                return this.termElm1.roll() * this.termElm2.roll()
            case OperatorType.DIV:
                return this.termElm1.roll() / this.termElm2.roll()
            default:
                throw 'OperatorTerm::eval : Invalid OperatorType'
        }
    }
    
    fullResult(): object {
        let oper: string
        switch (this.operator) {
            case OperatorType.ADD:
                oper = 'add'
                break
            case OperatorType.SUB:
                oper = 'sub'
                break
            case OperatorType.MUL:
                oper = 'mul'
                break
            case OperatorType.DIV:
                oper = 'div'
                break
            default:
                throw 'OperatorTerm::eval : Invalid OperatorType'
        }
        return {
            oper,
            term1: this.termElm1.fullResult(),
            term2: this.termElm2.fullResult()
        }
    }
}

export type {
    Term,
    TermElement
}
export {
    IntegerTerm,
    DiceKeepMode,
    DiceTerm,
    OperatorTerm,
    OperatorType
}