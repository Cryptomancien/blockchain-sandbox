import { expect, describe, beforeEach, it } from 'bun:test'
import Transaction from './transaction'
import Wallet from './index'
import transaction from "./transaction";
import {MINING_REWARD} from "../crypto/config.mjs";

describe('Transaction', () => {
    let transaction,wallet, recipient, amount

    beforeEach(() => {
        wallet = new Wallet()
        amount = 50
        recipient = 'r3c1p13nt'
        transaction = Transaction.newTransaction(wallet, recipient, amount)
    })

    it('outputs the `amount` subtracted from the wallet balance', () => {
        const tx = transaction.outputs.find(
            output => output.address === wallet.publicKey
        )
        console.log(transaction)
        expect(
            transaction.outputs.find(
                output => output.address === wallet.publicKey
            ).amount
        ).toEqual(wallet.balance - amount)
    })

    it('outputs the `amount` added to the recipient', () => {
        expect(
            transaction.outputs.find(
                output => output.address === recipient
            ).amount
        ).toEqual(amount)
    })

    it('inputs the balance of the wallet', () => {
        expect(
            transaction.input.amount
        ).toEqual(wallet.balance)
    })

    it('validates a valid transaction', () => {
        expect(
            Transaction.verifyTransaction(transaction)
        ).toBe(true)
    })

    it('invalidates a invalid transaction',()=>{
        transaction.outputs[0].amount = 500000
        expect(
            Transaction.verifyTransaction(transaction)
        ).toBe(false)
    })

    describe('transaction with less balance', () => {
        beforeEach(() => {
            amount = 5000
            transaction = Transaction.newTransaction(wallet, recipient, amount)
        })

        it('does not create the transaction', () => {
            expect(
                transaction
            ).toEqual(undefined)
        })
    })

    describe('updated transaction', () => {
        let nextAmount, nextRecipient

        beforeEach(() => {
            nextAmount = 20
            nextRecipient = 'n3xt-4ddr355'
            transaction = transaction.update(wallet, nextRecipient, nextAmount)
        })

        it('subtracts the next amount from sender output', () => {
            expect(
                transaction.outputs.find(
                    output => output.address === wallet.publicKey
                ).amount
            ).toEqual(wallet.balance - amount - nextAmount)
        })

        it('outputs an amount for the next recipient', () => {
            expect(
                transaction.outputs.find(output =>
                    output.address === nextRecipient
                ).amount
            ).toEqual(nextAmount)
        })
    })

    describe('creating a reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(
                wallet,
                Wallet.blockchainWallet()
            )
        })

        it('reward the miners wallet', () => {
            expect(
                transaction.outputs.find(output => output.address === wallet.publicKey).amount
            ).toEqual(MINING_REWARD)
        })
    })
})

