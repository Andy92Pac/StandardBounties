const axios = require('axios');
const bs58 = require('bs58');

exports.catFromIpfs = async (hash) => {
	const url = 'https://gateway.pinata.cloud/ipfs/' + hash;
	try {
		response = await axios.get(url)
		return response.data;
	} catch (error) {
		console.log(error);
		return false;
	}
}

exports.getBytes32FromIpfsHash = function(ipfsListing) {
	return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
}