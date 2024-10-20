import {SHA256} from '../crypto'
import {DIFFICULTY, MINE_RATE} from '../crypto/config'
import ChainUtil from '../wallet/chain-util'

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.nonce = nonce
        this.difficulty = difficulty || DIFFICULTY
    }

    toString(){
        return `Block - 
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Data      : ${this.data}
        Difficulty: ${this.difficulty}`
    }

    static genesis() {
        return new this('Genesis time','----','genesis-hash',[], 0, DIFFICULTY)
    }

    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString()
    }

    static mineBlock(lastBlock, data) {
        let hash
        let timestamp
        const lastHash = lastBlock.hash

        let {difficulty} = lastBlock
        let nonce = 0

        do {
            nonce++
            timestamp = Date.now()
            difficulty = Block.adjustDifficulty(lastBlock, timestamp)
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty)
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this(timestamp, lastHash, hash, data, nonce, difficulty)
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce,difficulty } = block
        return Block.hash(timestamp,lastHash,data,nonce,difficulty)
    }

    static adjustDifficulty(lastBlock, currenTime) {
        let {difficulty} = lastBlock
        difficulty = lastBlock.timestamp + MINE_RATE > currenTime ? difficulty + 1 : difficulty - 1
        return difficulty
    }


}

export default Block