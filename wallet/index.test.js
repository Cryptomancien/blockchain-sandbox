import { expect, describe, beforeEach, it } from 'bun:test'
import Wallet from './index'
import TransactionPool from './transaction-pool'
import Blockchain from '../blockchain/index'
import {INITIAL_BALANCE} from '../crypto/config'

describe('Wallet', () => {
    let wallet,transactionPool,blockchain

    wallet = new Wallet()
    transactionPool = new TransactionPool()

    beforeEach(() => {
        wallet = new Wallet()
        transactionPool = new TransactionPool()
        blockchain = new Blockchain()
    })

    describe('creating a transaction', () => {
        let transaction, sendAmount, recipient

        beforeEach(() => {
            sendAmount = 5
            recipient = 'r4nd-4ddr355'
            transaction = wallet.createTransaction(recipient,sendAmount,blockchain,transactionPool)

        })

        describe('and doing the same transaction', () => {

            beforeEach(() => {
               wallet.createTransaction(recipient,sendAmount,blockchain,transactionPool)
            })

            it('doubles the `sendAmount` subtracted from the wallet balance',()=> {
                expect(
                    transaction.outputs.find(output => output.address === wallet.publicKey).amount
                ).toEqual(
                    wallet.balance - sendAmount * 2
                )
            })

            it('clones the `sendAmount`output for the transaction', () => {
                expect(
                    transaction
                        .outputs
                        .filter(output => output.address === recipient)
                        .map(output => output.amount)
                ).toEqual([ sendAmount, sendAmount ])
            })
        })
    })

    describe('calculating the balance', () => {
        let addBalance, repeatAdd, senderWallet

        beforeEach(() => {
            senderWallet = new Wallet()
            addBalance = 100
            repeatAdd = 3

            for (let i = 0; i < repeatAdd; i++) {
                senderWallet.createTransaction(
                    wallet.publicKey,
                    addBalance,
                    blockchain,
                    transactionPool
                )
            }
            blockchain.addBlock(transactionPool.transactions)
        })

        it('calculates the balance for the blockchain transactions matching the recipient',()=> {
            expect(
                wallet.calculateBalance(blockchain)
            ).toEqual(
                INITIAL_BALANCE + (addBalance*repeatAdd)
            )
        })

        it('calculates the balance for the blockchain transactions matching the sender',()=>{
            expect(
                senderWallet.calculateBalance(blockchain)
            ).toEqual(
                INITIAL_BALANCE - (addBalance*repeatAdd)
            )
        })

        describe('and the recipient conducts a transaction', () => {
            let subtractBalance, recipientBalance

            beforeEach(()=>{
                transactionPool.clear()
                subtractBalance = 60
                recipientBalance = wallet.calculateBalance(blockchain)
                wallet.createTransaction(senderWallet.publicKey,subtractBalance,blockchain,transactionPool)
                blockchain.addBlock(transactionPool.transactions)
            })

            describe('and the sender sends another transaction to the recipient',()=>{
                beforeEach(()=>{
                    transactionPool.clear();
                    senderWallet.createTransaction(wallet.publicKey,addBalance,blockchain,transactionPool);
                    blockchain.addBlock(transactionPool.transactions);
                })

                it('calculate the recipient balance only us if transactions since its most recent one',()=>{
                    expect(
                        wallet.calculateBalance(blockchain)
                    ).toEqual(recipientBalance-subtractBalance + addBalance)
                })
            })
        })
    })
})