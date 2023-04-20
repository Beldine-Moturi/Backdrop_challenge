import { users } from "./db"
// TODO: Fetch data from postreSQL database instead
const request = require('request');
const levenshtein = require('fast-levenshtein');
const fs = require('fs');

const resolvers = {
    Query: {
        user: async (parent, { bankCode, accNumber }, context, info) => {
            // call paystack API to get account name -- return this if accName not in our database
            const user = users.find(user => user.bankCode == bankCode && user.accountNumber == accNumber);
            if (user && user['accountName']) {
                // return user['accountName'];
                return user;
            } else {
                const accName = await getPaystackName(accNumber, bankCode);

                if (user && user['isVerified'] && levenshtein(user['accountName'], accName) <= 2) {
                    // return user['accountName'];
                    return user;
                } else {
                    // return accName;
                    user.accountName = accName;
                    return user;
                }
            }
        }
    },
    Mutation: {
        createUser: (parent, { id, accNumber, bankCode, accName, isVerified }, context, info) => {
            // Creates a new user, saves to database
        },
        updateUser: async (parent, { accNumber, bankCode, accName }, context, info) => {
            const user = users.find(user => user.accountName == accName);
            const paystackAccName = await getPaystackName(accNumber, bankCode);

            if (paystackAccName && levenshtein(accName, paystackAccName) <= 2) {
                // update existing user with bank account details
                user.accountNumber = accNumber;
                user.bankCode = bankCode;
                user.isVerified = true;
                fs.writeFile('/.db.js', users, (err) => {
                    if (err) {
                        console.log(`Files to write to file: ${err}`);
                        return;
                    }
                });
                return user;
            } else {
                return user;
            }
        },
        deleteUser: (parent, { id }, context, info) => {
            // Delete user from database
        }
    }
};

// write function that makes the paystack API calls and returns account name
function getPaystackName(accNumber, bankCode) {
    return new Promise(async (resolve, reject) => {
        const paystackAPIKey = process.env.PAYSTACK_API_KEY;
        const options = {
            url: `https://api.paystack.co/bank/resolve?account_number=${accNumber}&bank_code=${bankCode}`,
            headers: {
                "Authorization": `Bearer ${paystackAPIKey}`
            }
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                resolve(data['data']['account_name']);
            } else {
                reject(null);
            }
        });
    });
}



export default resolvers;