import {Fragment, h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import range from '../../../../frontend/wallet/helpers/range'
import printAda from '../../../helpers/printAda'
import {Lovelace} from '../../../state'
import {AdaIcon} from '../../common/svg'
import {UNKNOWN_POOL_NAME} from '../../../../frontend/wallet/constants'

const Account = ({i, account, setAccount, selectedAccount, toggleDisplayStakingPage}) => {
  return (
    <div key={i} className="card account" style={'width: 75%;'}>
      <div className="card-column" style="align-self: center;">
        <button
          className="button primary"
          disabled={false} //{selectedAccount === i}
          onClick={() => {
            setAccount(i)
            toggleDisplayStakingPage('Sending')
            window.scrollTo({top: 0, behavior: 'smooth'})
          }}
        >
          Account {i}
        </button>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Available balance</h2>
        <div className="balance-amount small">
          {printAda(
            account
              ? account.shelleyBalances.stakingBalance + account.shelleyBalances.nonStakingBalance
              : 0
          )}
          <AdaIcon />
        </div>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Rewards balance</h2>
        <div className="balance-amount small">
          {printAda(account ? account.shelleyBalances.rewardsAccountBalance : 0)}
          <AdaIcon />
        </div>
      </div>
      <div className="card-column">
        <h2 className="card-title small-margin">Delegation</h2>
        <div>
          {account
            ? account.shelleyAccountInfo.delegation.name || UNKNOWN_POOL_NAME
            : 'Not delegated'}
        </div>
      </div>
    </div>
  )
}

const Accounts = ({accounts, setAccount, selectedAccount, toggleDisplayStakingPage}) => {
  const accountInfos = Object.values(accounts)
  const totalBalance = accountInfos.reduce(
    (a, {shelleyBalances}) =>
      shelleyBalances.stakingBalance + shelleyBalances.nonStakingBalance + a,
    0
  )
  const totalRewardBalance = accountInfos.reduce(
    (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a,
    0
  )
  return (
    <Fragment>
      <div className="dashboard-column account">
        <div className="card account" style={'width: 100%;'}>
          <div>
            <h2 className="card-title small-margin">Total balance</h2>
            <div className="balance-amount">
              {printAda(totalBalance as Lovelace)}
              <AdaIcon />
            </div>
          </div>
          <div>
            <h2 className="card-title small-margin">Total rewards balance</h2>
            <div className="balance-amount">
              {printAda(totalRewardBalance as Lovelace)}
              <AdaIcon />
            </div>
          </div>
        </div>
        <div className="dashboard-column account wide">
          <div>
            {range(0, Object.keys(accounts).length + 1).map((i) => (
              <Account
                key={i}
                i={i}
                account={accounts[i]}
                setAccount={setAccount}
                selectedAccount={selectedAccount}
                toggleDisplayStakingPage={toggleDisplayStakingPage}
              />
            ))}
          </div>
          <div className="dashboard-column account narrow"> </div>
        </div>
      </div>
    </Fragment>
  )
}

export default connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    accounts: state.accounts,
    selectedAccount: state.selectedAccount,
  }),
  actions
)(Accounts)
