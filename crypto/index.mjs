import {createHash} from 'node:crypto'

export function SHA256(data) {
    return createHash('sha256').update(data).digest('hex')
}