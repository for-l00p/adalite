import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import SendAdaPage from '../sendAda/sendAdaPage'

const SendTrasactionModal = ({closeSendTransactionModal}) => (
  <Modal onRequestClose={closeSendTransactionModal}>
    <SendAdaPage showDonationFields={false} />
  </Modal>
)

export default connect(
  (state) => ({}),
  actions
)(SendTrasactionModal)
