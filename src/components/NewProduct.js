import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress
} from 'element-react'
import React, { useState } from 'react'
import { PhotoPicker } from 'aws-amplify-react'
import { Storage, Auth, API, graphqlOperation } from 'aws-amplify'
import { createProduct } from '../graphql/mutations'
import { convertDollarsToCents } from '../utils/index'
import aws_exports from '../aws-exports'
const initialState = {
  description: '',
  price: 0,
  shipped: false,
  imagePreview: ''
}

const NewProduct = ({ marketId }) => {
  const [product, setProduct] = useState({
    description: '',
    price: 0,
    shipped: false,
    imagePreview: ''
  })
  const [imageFile, setImageFile] = useState({
    file: '',
    isUploading: false,
    percentUploaded: 0
  })
  const handleAddProduct = async () => {
    try {
      const visibility = 'public'
      // retrieve user's identity
      const { identityId } = await Auth.currentCredentials()
      const fileName = `/${visibility}/${identityId}/${Date.now()}-${
        imageFile.file.name
      }`

      const uploadedFile = await Storage.put(fileName, imageFile.file.file, {
        contentType: imageFile.file.type,
        progressCallback: progress => {
          console.log(`Uploaded:${progress.loaded} /${progress.total}`)
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          )

          setImageFile({ ...imageFile, percentUploaded: percentUploaded })
        }
      })

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region
      }
      const input = {
        productMarketId: marketId,
        description: product.description,
        shipped: product.shipped,
        price: convertDollarsToCents(price),
        file
      }

      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      )

      console.log('Created product', result)
      Notification({
        title: 'Success',
        message: 'Product successfully created',
        type: 'success'
      })
      setImageFile({ isUploading: false, percentUploaded: 0 })
      setProduct(initialState)
    } catch (err) {
      console.error('Error adding product', err)
    }
  }
  const { description, price, shipped, imagePreview } = product
  const { file, isUploading, percentUploaded } = imageFile
  return (
    <div className='flex-center'>
      <h2 className='header'>Add New Product</h2>
      <div>
        <Form className='market-header'>
          <Form.Item label='Add Product Description'>
            <Input
              type='text'
              icon='information'
              placeholder='Description'
              value={description}
              onChange={description =>
                setProduct({ ...product, description: description })
              }
            ></Input>
          </Form.Item>
          <Form.Item label='Set Product Price'>
            <Input
              type='number'
              value={price}
              icon='Price ($USD)'
              placeholder='Price'
              onChange={price => setProduct({ ...product, price: price })}
            ></Input>
          </Form.Item>
          <Form.Item label='Is the Product Shipped or Emailed to the Customer ? '>
            <div className='text center'>
              <Radio
                value='true'
                checked={shipped === true}
                onChange={() => setProduct({ ...product, shipped: true })}
              >
                Shipped
              </Radio>
              <Radio
                value='false'
                checked={shipped === false}
                onChange={() => setProduct({ ...product, shipped: false })}
              >
                Emailed
              </Radio>
            </div>
          </Form.Item>
          {imagePreview && (
            <img
              className='image-preview'
              src={imagePreview}
              alt='Product Preview'
            ></img>
          )}
          {percentUploaded > 0 && (
            <Progress
              type='circle'
              className='progress'
              status='success'
              percentage={percentUploaded}
            ></Progress>
          )}
          <PhotoPicker
            title='Product Image'
            preview='hidden'
            onLoad={url => setProduct({ ...product, imagePreview: url })}
            onPick={file => setImageFile({ ...imageFile, file: file })}
            theme={{
              formContainer: { margin: 0, padding: '0.8em' },
              formSection: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)'
              },
              sectionBody: { margin: 0, width: '250px' },
              photoPickerButton: {
                display: 'none'
              }
            }}
          />
          <Button
            type='primary'
            onClick={handleAddProduct}
            disabled={!imageFile || !description || !price || isUploading}
            loading={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Product'}
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default NewProduct
