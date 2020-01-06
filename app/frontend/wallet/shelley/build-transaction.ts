import {computeRequiredTxFee} from './helpers/chainlib-wrapper'
import _ from 'lodash'
// import {Input, Output, TxPlan} from '../cardano-wallet'
import {Lovelace} from '../../state'

import NamedError from '../../helpers/NamedError'

import {ADALITE_CONFIG} from '../../config'

type UTxOInput = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

type AccountInput = {
  address: string
  coins: Lovelace
  counter: number
}

export type Input = UTxOInput | AccountInput

export type Output = {
  address: string
  coins: Lovelace
}

export interface TxPlan {
  type: string
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  cert?: Array<{id: string; ratio: number}>
  fee: Lovelace
}

export function computeTxPlan(
  type,
  chainConfig,
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange?: Output,
  cert?: any
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0)

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(chainConfig)(inputs, outputs, cert)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  if (type === 'account') {
    const input = {
      ...inputs[0],
      coins: feeWithoutChange as Lovelace,
    }
    inputs[0] = input
    return {type, inputs, outputs, change: null, cert, fee: feeWithoutChange as Lovelace}
  }

  // No change necessary, perfect fit or a account tx
  if (totalOutput + feeWithoutChange === totalInput) {
    return {type, inputs, outputs, change: null, cert, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(chainConfig)(
    inputs,
    [...outputs, possibleChange],
    cert
  )

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // and jormungandr does check for strict fee equality
    return null
  }

  return {
    type,
    inputs,
    outputs,
    change: {
      address: possibleChange.address,
      coins: (totalInput - totalOutput - feeWithChange) as Lovelace,
    },
    cert,
    fee: feeWithChange as Lovelace,
  }
}

export function selectMinimalTxPlan(
  chainConfig,
  utxos: Array<any>,
  address,
  coins,
  donationAmount,
  changeAddress
): any {
  const profitableUtxos = utxos //utxos.filter(isUtxoProfitable)

  const inputs = []

  const outputs = [{address, coins}]
  if (donationAmount > 0) {
    outputs.push({address: ADALITE_CONFIG.ADA_DONATION_ADDRESS, coins: donationAmount})
  }

  const change = {address: changeAddress, coins: 0 as Lovelace}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan('utxo', chainConfig, inputs, outputs, change, null)
    if (plan) return plan
  }

  return {estimatedFee: computeRequiredTxFee(chainConfig)(inputs, outputs, null)}
}

export function computeDelegationTxPlan(chainConfig, address, pools, counter, value): any {
  const cert = {
    type: 'stake_delegation',
    pools,
  }
  const inputs = [
    {
      address,
      counter,
      coins: value,
    },
  ]
  const outputs = []
  return computeTxPlan('account', chainConfig, inputs, outputs, null, cert)
}
/*
export function buildTransactionFromAccount(account, destination) {
  const computedFee = calculateFee({
    chainConfig,
    inputCount: 1,
    outputCount: 1,
    certCount: 0,
  })
  const requiredAmount = destination.value + computedFee
  if (account.value < requiredAmount) {
    throw Error('Insufficient funds')
  }
  return buildTransaction({
    inputs: [
      {
        type: 'account',
        address: account.address,
        privkey: account.privkey_hex,
        accountCounter: account.counter,
        value: requiredAmount,
      },
    ],
    outputs: [destination],
    cert: null,
    chainConfig,
  })
}

export function buildTransactionFromUtxos(utxos, output, changeAddress) {
  // TODO: drop change if not needed
  const computedFee = calculateFee({
    chainConfig,
    inputCount: 1,
    outputCount: 2,
    certCount: 0,
  })
  const outputAmount = output.value
  const requiredAmount = outputAmount + computedFee

  const inputs = utxos.map((utxo) => ({type: 'utxo', ...utxo}))
  const selectedInputs = selectInputs(inputs, requiredAmount)
  const inputAmount = _.sumBy(selectedInputs, (inp) => inp.value)

  return buildTransaction({
    inputs: selectedInputs,
    outputs: [
      output,
      {
        address: changeAddress,
        value: inputAmount - outputAmount - computedFee,
      },
    ],
    cert: null,
    chainConfig,
  })
}
*/
