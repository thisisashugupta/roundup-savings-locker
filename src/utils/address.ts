export const minifyAddress = (address: string, chars = 9) => {
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
};
