import cloudinary from '../config/cloudinary'
import streamifier from 'streamifier'

export function uploadStream(buffer: Buffer, folder = 'ecommerce/products') {
  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
      },
      (err, result) => {
        if (err) return reject(err)
        if (!result) return reject(new Error('Upload failed'))

        resolve({
          url: result.secure_url!,
          public_id: result.public_id!
        })
      }
    )

    streamifier.createReadStream(buffer).pipe(upload)
  })
}

export default uploadStream
