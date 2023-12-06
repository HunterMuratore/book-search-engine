const jwt = require('jsonwebtoken');

const User = require('../../models/User');

const { signToken } = require('../../utils/auth');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

const user_resolvers = {
    Query: {
        // Get a single user by either their id or username
        async getSingleUser(_, { id, username }, context) {
            try {
                const { user } = context;

                const foundUser = await User.findOne({
                    $or: [{ _id: user ? user._id : id }, { username }]
                });

                if (!foundUser) {
                    throw new Error('User not found');
                }

                return foundUser;
            }
            catch (err) {
                throw new Error(`Error finding user: ${err.message}`);
            }
        }
    },

    Mutation: {
        // Create a user, sign a token and return it back to the SignUpForm.js
        async createUser(_, { input }) {
            try {
                const user = User.create(input);

                if (!user) {
                    throw new Error('Something is wrong!');
                }

                const token = signToken(user);

                return { token, user };
            } catch (err) {
                throw new Error(`Error creating user: ${err.message}`);
            }
        },
        // Login user, sign a token, and return it back to the LoginForm.js
        async login(_, { input }) {
            try {
                const { usernameOrEmail, password} = input;
                const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]});

                if (!user || !(await user.isCorrectPassword(password))) {
                    throw new Error('Invalid credentials');
                }

                const token = signToken(user);

                return { token, user };
            } catch (err) {
                throw new Error(`Error logging in: ${err.message}`);
            }
        },
        // Save a book to a user's `savedBooks` field by adding it to the set
        async saveBook(_, { input }, context) {
            try {
                const { token } = context;
                const { data } = jwt.verify(token, secret, { maxAge: expiration });
                const user = data;

                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id},
                    { $addToSet: { savedBooks: input.book } },
                    { new: true, runValidators: true }
                );

                if (!updatedUser) {
                    throw new Error('Could not find user with this id');
                }

                return updatedUser;
            } catch (err) {
                throw new Error(`Error updating book: ${err.message}`);
            }
        },
        // remove a book from `savedBooks`
        async deleteBook(_, { bookId }, context) {
            try {
                const { token } = context;
                const { data } = jwt.verify(token, secret, { maxAge: expiration });
                const user = data;

                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id},
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                if (!updatedUser) {
                    throw new Error('Could not find user with this id');
                }

                return updatedUser;
            } catch (err) {
                throw new Error(`Error deleting book: ${err.message}`);
            }
        },
    }
};

module.exports = user_resolvers;