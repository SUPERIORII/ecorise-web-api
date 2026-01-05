export const obfuscateName = (length) => {
  // const otpNumber = Math.floor(100000 + Math.random() * 900000);
  const possibleString =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkamnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    const newString = possibleString.charAt(
      Math.floor(Math.random() * possibleString.length)
    );

    result += newString;
  }

  return result;
};

export const generateActivationCode = (length = 6) => {
  let result = "";
  const possibleNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < length; i++) {
    const newNumber =
      possibleNumber[Math.floor(Math.random() * possibleNumber.length)];

    result += newNumber;
  }

  return result;
};

export const activationExpiryTime = () => {
  const expireAt = new Date(Date.now() + 45 * 60 * 1000);

  return expireAt;
};
