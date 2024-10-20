import { expect, describe, beforeEach, it } from 'bun:test'
import Block from './block'
import BlockChain from './index.mjs'

describe('Blockchain', () => {
    let blockchain
    let blockchain2

    beforeEach(() => {
        blockchain = new BlockChain()
        blockchain2 = new BlockChain()
    })

    it('starts with the genesis block', () => {
        expect(blockchain.chain.at(0)).toEqual(Block.genesis())
    })

    it('add new block', () => {
        const data = 'foo'
        blockchain.addBlock(data)
        expect(blockchain.chain.at(-1).data).toEqual(data)
    })

    it('validates a valid chain', () => {
        blockchain2.addBlock('foo')
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(true)
    })

    it('invalidates a chain with a corrupt the genesis block', () => {
        blockchain2.chain.at(0).data = 'bad data'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    })

    it('invalidates a corrupt chain', () => {
        blockchain2.addBlock('foo')
        blockchain2.chain.at(1).data = 'not foo'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    })

    it('replaces the chain with a valid chain', () => {
        blockchain2.addBlock('goo')
        blockchain.replaceChain(blockchain2.chain)
        expect(blockchain.chain).toEqual(blockchain2.chain)
    })

    it('does not replaces the chain with a one with less than or equal to chain',()=>{
        blockchain.addBlock('foo')
        blockchain.replaceChain(blockchain2.chain)
        expect(blockchain.chain).not.toEqual(blockchain2.chain)
    })
})



