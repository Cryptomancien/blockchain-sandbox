import WebSocket from 'ws'

const P2P_PORT = process.env.P2P_PORT || 5000

const peers = process.env.PEERS ? process.env.PEERS.split(',') : []

const MESSAGE_TYPE = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transaction: 'CLEAR TRANSACTION'
}

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain
        this.sockets = []
        this.transactionPool = transactionPool
    }

    listen() {
        const server = new WebSocket.Server({ port: parseInt(P2P_PORT) })

        server.on('connection', socket => this.connectSocket(socket))

        this.connectToPeers()

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`)
    }

    connectSocket(socket) {
        this.sockets.push(socket)
        console.log('Socket connected')
        this.messageHandler(socket)
        this.sendChain(socket)
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new WebSocket(peer)

            socket.on('open',() => this.connectSocket(socket))
        })
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message)
            console.log('data', data)

            switch (data.type) {
                case MESSAGE_TYPE.chain:
                    this.blockchain.replaceChain(data.chain)
                    break
                case MESSAGE_TYPE.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break
                case MESSAGE_TYPE.clear_transaction:
                    this.transactionPool.clear()
                    break
            }

            this.blockchain.replaceChain(data);

        })
    }

    sendChain(socket){
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPE.chain,
                chain: this.blockchain.chain
            })
        )
    }

    syncChain(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        })
    }

    sendTransaction(socket, transaction) {
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPE.transaction,
                transaction
            })
        )
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => {
            socket.send(
                JSON.stringify({
                    type: MESSAGE_TYPE.clear_transaction
                })
            )
        })
    }
}

export default P2pServer