import { users } from "./db"
// Fetch data from postreSQL database
const request = require('request');

const resolvers = {
    Query: {
        user: (parent, { bankCode, accNumber }, context, info) => {
            // call paystack API to get account name -- return this if accName not in our database
            const user = users.find(user => user.bankCode == bankCode && user.accountNumber == accNumber);
            if (user && user['accountName']) {
                // return user['accountName'];
                return user;
            } else {
                const accName = getPaystackName(accNumber, bankCode);

                if (user && user['isVerified'] && levenshteinDistance(user['accountName'], accName) <= 2) {
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
        updateUser: (parent, { accNumber, bankCode, accName }, context, info) => {
            const user = users.find(user => user.accountName == accName);
            const paystackAccName = getPaystackName(accNumber, bankCode);

            if (paystackAccName && levenshteinDistance(accName, paystackAccName) <= 2) {
                // update existing user with bank account details
                user.accountNumber = accNumber;
                user.bankCode = bankCode;
                user.isVerified = true;
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

// write function to do the Levenshtein Distance calculation
function levenshteinDistance(userName, accName) {
    // TODO
}

// write function that makes the paystack API calls and returns account name
function getPaystackName(accNumber, bankCode) {
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
            return data['data']['account_name'];
        } else {
            return null;
        }
    });

}


export default resolvers;