import AddressManager from './address-manager'
import {ByronAddressProvider} from './byron/byron-address-provider'
import {base58AddressToHex, bechAddressToHex, isShelleyFormat} from './shelley/helpers/addresses'
import {
  ShelleyBaseAddressProvider,
  ShelleyStakingAccountProvider,
} from './shelley/shelley-address-provider'
import {Account} from './account'
import BlockchainExplorer from './blockchain-explorer'

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

  const addressToHex = (
    address // TODO: move to addresses
  ) => (isShelleyFormat(address) ? bechAddressToHex(address) : base58AddressToHex(address))

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

  return {
    //   isHwWallet,
    //   getHwWalletName,
    //   getWalletSecretDef,
    //   submitTx,
    //   signTxAux,
    //   getBalance,
    //   getChangeAddress,
    //   getMaxSendableAmount,
    //   getMaxDonationAmount,
    //   getMaxNonStakingAmount,
    //   getTxPlan,
    //   getHistory,
    //   getVisibleAddresses,
    //   prepareTxAux,
    //   verifyAddress,
    //   fetchTxInfo,
    //   generateNewSeeds,
    //   getAccountInfo,
    //   getValidStakepools,
    //   getWalletInfo,
    //   getPoolInfo,
    //   checkCryptoProviderVersion,
    //   accountIndex,
  }
}

export {ShelleyWallet}
