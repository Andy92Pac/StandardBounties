const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

function encrypt(toEncrypt, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
  const publicKey = fs.readFileSync(absolutePath, 'utf8')
  const buffer = Buffer.from(toEncrypt, 'utf8')
  const encrypted = crypto.publicEncrypt(publicKey, buffer)
  return encrypted.toString('base64')
}

let test = require('./test.json')
const { codeReview } = test.payload
const codeReviewStr = JSON.stringify(codeReview)
const enc = encrypt(codeReviewStr, `public.pem`)

test.payload.codeReview = enc
fs.writeFile('testencrypted.json', JSON.stringify(test), (err) => {})