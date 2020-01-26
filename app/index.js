const crypto  = require('crypto')
const path    = require('path')
const ethers  = require('ethers')
const fs      = require('fs')
const utils   = require('./utils')
const Octokit = require("@octokit/rest");

const octokit = Octokit({
	auth: process.env.GITHUB_KEY,
	userAgent: 'codereview v1.2.3'
}) 

const root                = 'iexec_out';
const determinismFilePath = `${root}/determinism.iexec`;
const callbackFilePath    = `${root}/callback.iexec`;
const errorFilePath       = `${root}/error.iexec`;

const [ ipfsHash ] = process.argv.slice(2).map(s => s);

(async () => {
	try {
		const args = process.argv.slice(2)
		const ipfsHash = args[0]

		const data = await utils.catFromIpfs(ipfsHash)

		const { requestId } = data.payload

		const { codeReview } = data.payload

		const absolutePath = path.resolve('private.pem')
		const privateKey = fs.readFileSync(absolutePath, 'utf8')
		const buffer = Buffer.from(codeReview, 'base64')
		const decrypted = crypto.privateDecrypt({
			key: privateKey.toString(),
			passphrase: '',
		}, buffer)
		const decryptedCodeReviewStr = decrypted.toString('utf8')
		const decryptedCodeReview = JSON.parse(decryptedCodeReviewStr)

		const { owner, repo, pullNumber } = data.payload

		const res = await octokit.pulls.createReview({
			owner, 
			repo, 
			pull_number: pullNumber, 
			...decryptedCodeReview
		})

		let status;

		if (res.status === 200) {
			status = 1
		}
		else {
			status = 0
		}

		const ipfsHashBytes32 = utils.getBytes32FromIpfsHash(ipfsHash)

		console.log(res)

		const iexeccallback = ethers.utils.defaultAbiCoder.encode(
			['uint256', 'bytes32', 'uint256'], 
			[requestId, ipfsHashBytes32, status]);
		const iexecconsensus = ethers.utils.keccak256(iexeccallback);
		fs.writeFile(callbackFilePath,    iexeccallback , (err) => {});
		fs.writeFile(determinismFilePath, iexecconsensus, (err) => {});
	} catch (err) {
		console.log(err)
		fs.writeFile(
			errorFilePath,
			err.toString(),
			(error) => {}
			);
		fs.writeFile(
			determinismFilePath,
			ethers.utils.solidityKeccak256(['string'],[err.toString()]),
			(error) => {}
			);
		throw new Error(err);
	}
})()