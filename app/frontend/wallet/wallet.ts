import AddressManager from './address-manager'
import {ByronAddressProvider} from './byron/byron-address-provider'
import {base58AddressToHex, bechAddressToHex, isShelleyFormat} from './shelley/helpers/addresses'
import {
  ShelleyBaseAddressProvider,
  ShelleyStakingAccountProvider,
} from './shelley/shelley-address-provider'
import {Account} from './account'
import BlockchainExplorer from './blockchain-explorer'
import {TxAux} from './byron/byron-transaction'
import NamedError from '../helpers/NamedError'

const ShelleyWallet = ({
  config,
  randomInputSeed,
  randomChangeSeed,
  cryptoProvider,
  isShelleyCompatible,
  accountIndex,
}: any) => {
  const blockchainExplorer = BlockchainExplorer(config)

  const account = Account({
    config,
    randomInputSeed,
    randomChangeSeed,
    cryptoProvider,
    isShelleyCompatible,
    accountIndex,
  })

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getHwWalletName() {
    return isHwWallet ? (cryptoProvider as any).getHwWalletName() : undefined
  }

  function submitTx(signedTx): Promise<any> {
    const {txBody, txHash} = signedTx
    return blockchainExplorer.submitTxRaw(txHash, txBody)
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
  }

  async function getWalletInfo() {
    const {validStakepools} = await getValidStakepools()
    return {
      validStakepools,
      ...account.getWalletAccountInfo(validStakepools),
    }
  }

  function getBalance() {
    return account.getBalance()
  }

  function getValidStakepools(): Promise<any> {
    return blockchainExplorer.getValidStakepools()
  }

  async function fetchTxInfo(txHash) {
    return await blockchainExplorer.fetchTxInfo(txHash)
  }

  function checkCryptoProviderVersion() {
    try {
      cryptoProvider.checkVersion(true)
    } catch (e) {
      return {code: e.name, message: e.message}
    }
    return null
  }

  function signTxAux(txAux) {
    return account.signTxAux(txAux)
  }

  function getChangeAddress() {
    return account.getChangeAddress()
  }

  function getHistory() {
    return account.getHistory()
  }

  function getMaxSendableAmount(
    address: string,
    hasDonation: boolean,
    donationAmount: number, //TODO: lovelace
    donationType: any // TODO: wut?
  ): Promise<any> {
    return account.getMaxSendableAmount(address, hasDonation, donationAmount, donationType)
  }

  function getMaxNonStakingAmount(address: string) {
    return account.getMaxNonStakingAmount(address)
  }

  function getMaxDonationAmount() {}

  function getTxPlan(args) {
    return account.getTxPlan(args)
  }

  function getVisibleAddresses() {
    return account.getVisibleAddresses()
  }

  function prepareTxAux(plan) {
    return account.prepareTxAux(plan)
  }

  async function verifyAddress(addr: string) {
    // TODO: fix this so it can by in wallet
    if (!('displayAddressForPath' in cryptoProvider)) {
      throw NamedError('UnsupportedOperationError', {
        message: 'unsupported operation: verifyAddress',
      })
    }
    const absDerivationPath = account.myAddresses.getAddressToAbsPathMapper()(addr)
    const stakingAddress = await account.myAddresses.accountAddrManager._deriveAddress(accountIndex)
    const stakingPath = account.myAddresses.getAddressToAbsPathMapper()(stakingAddress)
    return await cryptoProvider.displayAddressForPath(absDerivationPath, stakingPath)
  }

  function getAccountInfo() {
    return account.getAccountInfo()
  }

  function getPoolInfo(url) {
    return account.getPoolInfo(url)
  }

  return {
    isHwWallet,
    getHwWalletName,
    getWalletSecretDef,
    submitTx,
    signTxAux,
    getBalance,
    getChangeAddress,
    getMaxSendableAmount,
    getMaxDonationAmount,
    getMaxNonStakingAmount,
    getTxPlan,
    getHistory,
    getVisibleAddresses,
    prepareTxAux,
    verifyAddress,
    fetchTxInfo,
    getAccountInfo,
    getValidStakepools,
    getWalletInfo,
    getPoolInfo,
    checkCryptoProviderVersion,
    accountIndex,
  }
}

export {ShelleyWallet}
