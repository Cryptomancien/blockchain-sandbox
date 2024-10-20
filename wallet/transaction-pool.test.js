import { expect, describe, beforeEach, it } from 'bun:test'
import TransactionPool from './transaction-pool'
import Wallet from './index'
import Transaction from './transaction'
import Blockchain from '../blockchain/index'

describe('Transaction Pool', () => {
    let transactionPool, wallet, transaction, blockchain

    beforeEach(() => {
        transactionPool = new TransactionPool()
        wallet = new Wallet()
        blockchain = new Blockchain()
        transaction = wallet.createTransaction('r4nd-addr355',30, blockchain, transactionPool)
    })

    it('adds a transaction to the pool', () => {
        expect(
            transactionPool.transactions.find(t => t.id === transaction.id)
        ).toEqual(transaction)
    })

    it('update a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction)
        const newTransaction = transaction.update(wallet, 'foo-4dr355', 40)
        transactionPool.updateOrAddTransaction(newTransaction)

        expect(
            JSON.stringify(
                transactionPool.transactions.find(t => t.id === transaction.id)
            )
        ).not.toEqual(oldTransaction)
    })

    it('clear transactions', () => {
        transactionPool.clear()
        expect(
            transactionPool.transactions
        ).toEqual([])

        describe('mix valid and corrupt transactions', () => {
            let validTransactions

            beforeEach(() => {
                validTransactions = [...transactionPool.transactions]

                for (let i = 0; i < 2; i++){
                    wallet = new Wallet()
                    transaction = wallet.createTransaction('r4nd-addr355', 30, blockchain, transactionPool)

                    if (i & 1) {
                        transaction.input.amount = 9999
                    } else {
                        validTransactions.push(transaction)
                    }
                }
            })

            it('shows a difference between valid and corrupt transactions', () => {
                expect(
                    JSON.stringify(transactionPool.transactions)
                ).not.toEqual(
                    JSON.stringify(validTransactions)
                )
            })

            // it('grabs valid transactions', () => {
            //     const tx = transactionPool.validTransaction()
            //    // console.log(tx)
            //     console.log('--')
            //     console.log(validTransactions)
            //     // expect(
            //     //     transactionPool.validTransaction()
            //     // ).toEqual(validTransactions)
            // })

            // it('grabs valid transactions',()=>{
            //     expect(transactionPool.validateTransaction()).toEqual(validTransactions);
            // })
        })
    })
})
