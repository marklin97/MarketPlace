import React from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { API } from 'aws-amplify'
// import { Notification, Message } from "element-react";
const stripeConfig = {
  currency: 'AUD',
  publishableAPIKey:
    'pk_test_51GxjHsCAROxSgNpY5T4OMgOpssqVRzb84JbOGcwpPcflVwPDShlhTqs2ffqviEkkHgasxKqCVQzoa6ljfoBBCbL400pg4WqYEe'
}
const PayButton = ({ user, product }) => {
  const handleCharge = async token => {
    try {
      const result = await API.post('order', '/order', {
        body: {
          token,
          order: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          }
        }
      })
      console.log(result)
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <StripeCheckout
      //if the credential inputs are valid, a token will be returned
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      locale='auto'
      // allowRememberMe={false}
    ></StripeCheckout>
  )
}

export default PayButton
