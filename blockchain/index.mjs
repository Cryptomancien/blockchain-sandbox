import Block from './block'

class Index {
    constructor() {
        this.chain = [Block.genesis()]
    }

    addBlock(data) {
        const block = Block.mineBlock(
            this.chain.at(-1),
            data
        )
        this.chain.push(block)
        return block
    }


    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }

        for(let i = 1 ; i<chain.length; i++){
            const block = chain.at(i)
            const lastBlock = chain.at(i - 1)
            if(
                (block.lastHash !== lastBlock.hash) ||
                (block.hash !== Block.blockHash(block))
            ) {
                return false
            }
        }
        return true
    }

    replaceChain(newChain){
        if( newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain')
            return
        } else if ( ! this.isValidChain(newChain)){
            console.log('Received chain is invalid')
            return
        }

        console.log('Replacing the current chain with new chain')
        this.chain = newChain
    }
}

export default Index