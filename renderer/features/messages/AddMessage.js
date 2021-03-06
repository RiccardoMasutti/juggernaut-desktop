import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  CircularProgress,
  MenuSurfaceAnchor,
  Menu,
  MenuItem,
  ListItemGraphic
} from 'rmwc';
import { queue } from '../../dialogQueue';
import PaymentRequestIcon from '../images/icons/PaymentRequestIcon';
import PaymentIcon from '../images/icons/PaymentIcon';

const AddMessage = props => {
  const { balance, sendMessage } = props;
  const [state, setState] = useState({
    message: '',
    disabled: true,
    error: null,
    saving: false
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSendMessage = async messageParams => {
    setState({ ...state, saving: true });
    await sendMessage(messageParams);
    setState({ ...state, saving: false, message: '' });
  };

  const sendPaymentRequest = async () => {
    setMenuOpen(false);
    const paymentRequestResponse = await queue.promptForm({
      title: 'Request Payment',
      body:
        'Send a payment request by specifying how many sats you want them to pay and an optional memo.',
      inputs: [
        {
          name: 'amount',
          label: 'Amount'
        },
        {
          name: 'memo',
          label: 'Memo (Optional)'
        }
      ],
      acceptLabel: 'Send',
      cancelLabel: 'Cancel'
    });

    if (paymentRequestResponse) {
      const { amount, memo } = paymentRequestResponse;
      handleSendMessage({
        message: `${parseInt(amount, 10) * 1000},${memo}`,
        amount: balance,
        contentType: 'paymentrequest',
        requestIdentifier: ''
      });
    }
  };

  const attachPayment = async () => {
    setMenuOpen(false);

    const paymentAmountResponse = await queue.promptForm({
      title: 'Send Money',
      body: 'How many sats would you like to send?',
      inputs: [
        {
          name: 'amount',
          label: 'Amount'
        },
        {
          name: 'memo',
          label: 'Memo (Optional)'
        }
      ],
      acceptLabel: 'Send',
      cancelLabel: 'Cancel'
    });

    if (paymentAmountResponse) {
      const { amount, memo } = paymentAmountResponse;
      handleSendMessage({
        message: `${memo}`,
        amount: parseInt(amount, 10) * 1000,
        contentType: 'payment',
        requestIdentifier: ''
      });
    }
  };

  const saveMessage = async () => {
    if (state.message.length === 0) {
      return;
    }
    handleSendMessage({
      message: state.message,
      contentType: 'text',
      requestIdentifier: '',
      amount: balance
    });
  };

  return (
    <div className="addMessageWrapper">
      <MenuSurfaceAnchor>
        <Menu
          anchorCorner="bottomLeft"
          open={menuOpen}
          focusOnOpen={false}
          style={{ width: '225px', borderRadius: '10px' }}
          onMouseLeave={() => {
            setMenuOpen(false);
          }}
        >
          <MenuItem onClick={sendPaymentRequest}>
            <ListItemGraphic icon={<PaymentRequestIcon />} />
            Payment Request
          </MenuItem>
          <MenuItem onClick={attachPayment}>
            <ListItemGraphic icon={<PaymentIcon />} />
            Payment
          </MenuItem>
        </Menu>
        <IconButton
          icon="add"
          onMouseEnter={() => {
            setMenuOpen(true);
          }}
        />
      </MenuSurfaceAnchor>
      <input
        className="add-message"
        ref={input => input && input.focus()}
        disabled={state.saving}
        onChange={e => {
          setState({
            ...state,
            message: e.target.value
          });
        }}
        onKeyPress={e => {
          if (e.which === 13) {
            saveMessage();
          }
        }}
        value={state.message}
        type="text"
        name="message"
        placeholder="Write a message..."
      />
      {state.saving && <IconButton icon={<CircularProgress />} />}
      {!state.saving && (
        <IconButton
          icon="flash_on"
          disabled={state.message.length === 0}
          onClick={saveMessage}
          className="sendButton"
        />
      )}
    </div>
  );
};

AddMessage.propTypes = {
  balance: PropTypes.number.isRequired,
  sendMessage: PropTypes.func.isRequired
};

export default AddMessage;
