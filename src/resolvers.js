import { users } from "./db"
// Fetch data from postreSQL database

const resolvers = {
    Query: {
        user: (parent, { bankCode, accNumber }, context, info) => {
            return users.find(user => user.bankCode == bankCode && user.accountNumber == accNumber);
            //return user.accountName;
        }
    },
    Mutation: {
        createUser: (parent, { id, accNumber, bankCode, accName, isVerified }, context, info) => {
            // Creates a new user, saves to database
        },
        updateUser: (parent, { accNumber, bankCode, accName }, context, info) => {
            // calls paystack API to verify bank account information -- updates isVerified attribute
            // update existing user with bank account details
        },
        deleteUser: (parent, { id }, context, info) => {
            // Delete user from database
        }
    }
};

// write function to do the Levenshtein Distance calculation

export default resolvers;