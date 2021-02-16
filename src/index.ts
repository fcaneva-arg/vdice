import * as nearley from 'nearley'
import { Term } from './atoms'
import grammar from './grammar'

function vdice(query: string): Term {
    const parser: nearley.Parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    parser.feed(query)
    return parser.results[0]
}

export { vdice }