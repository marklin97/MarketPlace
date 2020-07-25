import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
// import { Notification, Message } from "element-react";
const stripeConfig = {
  currency: 'AU',
  publishableAPIKey:
    'pk_test_51GxjHsCAROxSgNpY5T4OMgOpssqVRzb84JbOGcwpPcflVwPDShlhTqs2ffqviEkkHgasxKqCVQzoa6ljfoBBCbL400pg4WqYEe'
}
const PayButton = () => {
  return (
    <StripeCheckout
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
    ></StripeCheckout>
  )
}

export default PayButton
