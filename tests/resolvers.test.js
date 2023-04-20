import resolvers from "../src/resolvers";
import { users } from "../src/db";
import { getPaystackName } from "../src/resolvers"; // Assuming you export the getPaystackName function

describe("Resolvers", () => {
  const mockParent = {};
  const mockContext = {};
  const mockInfo = {};

  describe("Query", () => {
    describe("user", () => {
      it("should return user from database if account name is available", () => {
        const mockAccNumber = "1234567890";
        const mockBankCode = "012";
        const mockUser = {
          bankCode: mockBankCode,
          accountNumber: mockAccNumber,
          accountName: "John Doe",
        };
        const mockArgs = {
          bankCode: mockBankCode,
          accNumber: mockAccNumber,
        };
        const result = resolvers.Query.user(
          mockParent,
          mockArgs,
          mockContext,
          mockInfo
        );
        expect(result).toEqual(mockUser);
      });

      it("should call paystack API to get account name if account name is not available in database", () => {
        const mockAccNumber = "1234567890";
        const mockBankCode = "012";
        const mockArgs = {
          bankCode: mockBankCode,
          accNumber: mockAccNumber,
        };
        const result = resolvers.Query.user(
          mockParent,
          mockArgs,
          mockContext,
          mockInfo
        );
        // Assert that paystack API is called with the correct parameters
        expect(getPaystackName).toHaveBeenCalledWith(
          mockAccNumber,
          mockBankCode
        );
      });
    });
  });

  describe("Mutation", () => {
    describe("updateUser", () => {
      it("should update existing user with bank account details if account name matches with paystack API response", () => {
        const mockAccNumber = "1234567890";
        const mockBankCode = "012";
        const mockAccName = "John Doe";
        const mockUser = {
          bankCode: mockBankCode,
          accountNumber: mockAccNumber,
          accountName: mockAccName,
          isVerified: true,
        };
        const mockArgs = {
          accNumber: mockAccNumber,
          bankCode: mockBankCode,
          accName: mockAccName,
        };
        const result = resolvers.Mutation.updateUser(
          mockParent,
          mockArgs,
          mockContext,
          mockInfo
        );
        expect(result).toEqual(mockUser);
      });

      it("should not update existing user if account name does not match with paystack API response", () => {
        const mockAccNumber = "1234567890";
        const mockBankCode = "012";
        const mockAccName = "John Doe";
        const mockUser = {
          bankCode: mockBankCode,
          accountNumber: mockAccNumber,
          accountName: mockAccName,
          isVerified: true,
        };
        const mockArgs = {
          accNumber: mockAccNumber,
          bankCode: mockBankCode,
          accName: "Jane Smith",
        };
        const result = resolvers.Mutation.updateUser(
          mockParent,
          mockArgs,
          mockContext,
          mockInfo
        );
        expect(result).toEqual(mockUser);
      });
    });
  });
});
