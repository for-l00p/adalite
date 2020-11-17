import BlockchainExplorer from './blockchain-explorer'

const Wallet = ({config, cryptoProvider, isShelleyCompatible}) => {
  const blockchainExplorer = BlockchainExplorer(config)

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

  function getBalance() {
    return 0
  }

  return {
    isHwWallet,
    getHwWalletName,
    submitTx,
    getWalletSecretDef,
    fetchTxInfo,
    checkCryptoProviderVersion,
    getBalance,
  }
}

export {Wallet}