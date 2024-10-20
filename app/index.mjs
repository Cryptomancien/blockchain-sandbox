import express from 'express'
import Blockchain from '../blockchain'
import P2pServer from './p2p-server.mjs'
import Wallet from '../wallet/index'
import Miner from './miner'
import TransactionPool from '../wallet/transaction-pool'


const blockchain = new Blockchain()
const wallet = new Wallet()
const transactionPool = new TransactionPool()
const p2pServer = new P2pServer(blockchain, transactionPool)
const miner = new Miner(
    blockchain,
    transactionPool,
    wallet,
    p2pServer
)

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())




app.get('/blocks', (request, response) => {
    response.json(blockchain.chain)
})

app.post('/mine', (request, response) => {
    const block = blockchain.addBlock(request.body.data)
    console.log(`New block added: ${block.toString()}`)

    p2pServer.syncChain()
    response.json(blockchain.chain)
})

app.get('/transactions', (request, response) => {
    response.json(transactionPool.transactions)
})

app.post('/transact', (request, response) => {
    const {recipient, amount} = request.body
    const transaction = wallet.createTransaction(
        recipient,
        amount,
        blockchain,
        transactionPool
    )

    p2pServer.broadcastTransaction(transaction)

    response.json(transactionPool.transactions)
})

app.get('/public-key', (request, response) => {
    response.json({
        publicKey: wallet.publicKey
    })
})

app.get('/mine-transactions', (request, response) => {
    const block = miner.mine()
    console.log(`New block added: ${block.toString()}`)
    response.json(blockchain.chain)
})

let HTTP_PORT = process.env.HTTP_PORT || 3000

p2pServer.listen()
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})

