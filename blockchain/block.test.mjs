import { expect, describe, it, beforeEach } from 'bun:test'
import Block from './block'

describe('Block', () => {
    let data, lastBlock, block

    beforeEach(() => {
        data = 'Bar'
        lastBlock = Block.genesis()
        block = Block.mineBlock(lastBlock, data)
    })

    it('sets the `data` to match the input', () => {
        expect(block.data).toEqual(data)
    })

    it('sets the `lastHash` to match the hash of the last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash)
    })

    it('generates a hash that matches the difficutly', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty))
    })

    it('lower the difficulty for a slower generated block',()=>{
        expect(Block.adjustDifficulty(block,block.timestamp + 300000)).toEqual(block.difficulty - 1);
    })

    it('raise the difficulty for a faster generated block',()=>{
        expect(Block.adjustDifficulty(block,block.timestamp + 1)).toEqual(block.difficulty + 1)
    })
})










