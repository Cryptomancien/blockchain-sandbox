import EC from 'elliptic/lib/elliptic/ec'
const ec = new EC('secp256k1')
//import uuidV1 from 'uuid/dist/v1.js'

import {randomUUID} from 'node:crypto'
import {SHA256} from '../crypto'


class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair()
    }

    static id() {
        return randomUUID()
    }

    static hash(data) {
        return SHA256(JSON.stringify(data)).toString()
    }

    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }
}

export default ChainUtil