import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio
} from 'element-react'
import { S3Image } from 'aws-amplify-react'
import React, { useEffect, useState } from 'react'
import { Icon } from 'react-icons-kit'
import { ic_email } from 'react-icons-kit/md/ic_email'
import { updateProduct, deleteProduct } from '../graphql/mutations'
import { API, graphqlOperation } from 'aws-amplify'
import { convertCentsToDollars, convertDollarsToCents } from '../utils/index'
import { UserContext } from '../App'

import PayButton from './PayButton'
const Product = ({ product }) => {
  const [form, setForm] = useState({
    updatedProductDialog: false,
    deleteProductDiaglog: false,
    description: '',
    price: 0,
    shipped: false
  })
  const handleUpdateProduct = async productId => {
    try {
      setForm({ ...form, updatedProductDialog: false })
      const { description, price, shipped } = form
      const input = {
        id: productId,
        description,
        shipped,
        price: price
      }
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      )
      console.log({ result })
      Notification({
        title: 'Success',
        message: 'Product successfully updated',
        type: 'success'
      })
    } catch (err) {
      Notification({
        title: 'Unsuccess',
        message: 'Failed to update the product',
        type: 'failure'
      })
    }
  }
  const handleDeleteProduct = async productId => {
    try {
      setForm({ ...form, deleteProductDiaglog: false })
      const input = {
        id: productId
      }
      const result = await API.graphql(
        graphqlOperation(deleteProduct, { input })
      )
      Notification({
        title: 'Success',
        message: 'Product successfully deleted',
        type: 'success'
      })
    } catch (err) {
      Notification({
        title: 'Unsuccessful',
        message: 'Failed to delete product',
        type: 'success'
      })
    }
  }
  useEffect(() => {
    // console.log(product.owner)
  }, [])
  return (
    <UserContext.Consumer>
      {({ user }) => {
        // display the paybutton is not the product owner
        const {
          updatedProductDialog,
          deleteProductDiaglog,
          description,
          price,
          shipped
        } = form

        const isProductOwner = user && user.attributes.sub === product.owner

        return (
          <div className='card-container'>
            <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
              <S3Image
                imgKey={product.file.key}
                theme={{
                  photoImg: { maxWidth: '100%', maxHeight: '100%' }
                }}
              />
              <div className='card-body'>
                <h3 className='m-0'>{product.description}</h3>
                <div className='items-center'>
                  <Icon size={28} icon={ic_email} />
                  {product.shipped ? 'Shipped' : 'Emailed'}
                </div>
                <div className='text-right'>
                  <span className='mx-1'>
                    ${convertCentsToDollars(product.price)}
                  </span>
                  {!isProductOwner && (
                    <PayButton product={product} user={user} />
                  )}
                </div>
              </div>
            </Card>
            <div className='text-center'>
              {isProductOwner && (
                <>
                  <Button
                    type='warning'
                    icon='edit'
                    className='m-1'
                    onClick={() =>
                      setForm({
                        ...form,
                        updatedProductDialog: true,
                        description: product.description,
                        price: convertCentsToDollars(product.price),
                        shipped: product.shipped
                      })
                    }
                  />
                  <Popover
                    placement='top'
                    width='160'
                    trigger='click'
                    visible={deleteProductDiaglog}
                    content={
                      <>
                        <p>Do you want to delete this? </p>
                        <div className='text-right'>
                          <Button
                            size='mini'
                            type='text'
                            className='m-1'
                            onClick={() => {
                              setForm({ ...form, deleteProductDiaglog: false })
                            }}
                          >
                            Cancle
                          </Button>
                          <Button
                            type='primary'
                            size='mini'
                            className='m-1'
                            onClick={() => {
                              handleDeleteProduct(product.id)
                            }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      type='danger'
                      icon='delete'
                      onClick={() =>
                        setForm({ ...form, deleteProductDiaglog: true })
                      }
                    />
                  </Popover>
                </>
              )}
            </div>
            <Dialog
              title='Update Product'
              size='large'
              customClass='dialog'
              visible={updatedProductDialog}
              onCancel={() => setForm({ ...form, updatedProductDialog: false })}
            >
              <Dialog.Body>
                <Form labelPosition='top'>
                  <Form.Item label='Update Product Description'>
                    <Input
                      icon='information'
                      placeholder='Product Description'
                      trim={true}
                      value={description}
                      onChange={description =>
                        setForm({ ...form, description: description })
                      }
                    ></Input>
                  </Form.Item>
                  <Form.Item label='Update Product Price'>
                    <Input
                      type='number'
                      value={price}
                      icon='Price ($USD)'
                      placeholder='Price'
                      onChange={price => setForm({ ...form, price: price })}
                    ></Input>
                  </Form.Item>
                  <Form.Item label='Update shipping '>
                    <div className='text center'>
                      <Radio
                        value='true'
                        checked={shipped === true}
                        onChange={() => setForm({ ...form, shipped: true })}
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value='false'
                        checked={shipped === false}
                        onChange={() => setForm({ ...form, shipped: false })}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() =>
                    setForm({ ...form, updatedProductDialog: false })
                  }
                >
                  Cancle
                </Button>
                <Button
                  type='primary'
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        )
      }}
    </UserContext.Consumer>
  )
}

export default Product
